import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePeerCamera, type BroadcastMessage } from "../hooks/usePeerCamera";
import { detectPlate, type AlprResult } from "../services/alprService";
import { getCompletadosPesados, registrarDeteccion, buscarViajePorPlaca, uploadCaptura, type DeteccionCompletada } from "../services/monitoreoApi";

function normalizarPlaca(raw: string): string {
  const limpia = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (limpia.length >= 4) return limpia.slice(0, 3) + "-" + limpia.slice(3);
  return limpia;
}

export default function CamaraPage() {
  const navigate = useNavigate();
  const [deteccion, setDeteccion] = useState<DeteccionCompletada | null>(null);
  const [alpr, setAlpr] = useState<AlprResult | null>(null);
  const [alprLoading, setAlprLoading] = useState(false);
  const [toast, setToast] = useState<{ plate: string; action: string; requiereManual?: boolean; capturaUrl?: string } | null>(null);
  const [alertModal, setAlertModal] = useState<{ plate: string; capturaUrl?: string; reason: "desconocida" | "sin_viaje" } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const alprInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastResult = useRef<AlprResult | null>(null);
  const lastCapturaUrl = useRef<string | null>(null);

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString("es-PE");
    setLogs((prev) => [...prev.slice(-19), `[${ts}] ${msg}`]);
  }

  function showToast(plate: string, action: string, capturaUrl?: string | null) {
    setToast({ plate, action, requiereManual: action.includes("Sin viaje") || action.includes("desconocida"), capturaUrl: capturaUrl ?? undefined });
    setTimeout(() => setToast(null), 8000);
  }

  const onData = useCallback((msg: BroadcastMessage) => {
    if (msg.type === "plate-detected") {
      setAlpr({ plate: msg.plate, confidence: msg.confidence });
      if (msg.desconocida) {
        setAlertModal({ plate: msg.plate, capturaUrl: msg.capturaUrl ?? undefined, reason: "desconocida" });
      } else if (msg.requiereManual) {
        setAlertModal({ plate: msg.plate, capturaUrl: msg.capturaUrl ?? undefined, reason: "sin_viaje" });
      } else {
        showToast(msg.plate, `Viaje ${msg.codigoReserva || ""}`, msg.capturaUrl);
      }
    }
  }, []);

  const {
    videoRef, status: camStatus, isSender,
    startSender, stopSender, disconnect, captureFrame, broadcast,
  } = usePeerCamera(onData);

  useEffect(() => {
    document.body.style.overflow = isSender ? "hidden" : "";
    addLog(isSender ? "Modo cámara activado" : "Modo cámara desactivado");
    return () => { document.body.style.overflow = ""; };
  }, [isSender]);

  useEffect(() => {
    addLog(`Conexión: ${camStatus} ${isSender ? "(sender)" : "(receiver)"}`);
    if (isSender && camStatus === "connected" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [camStatus, isSender]);

  const pollBackend = useCallback(() => {
    getCompletadosPesados()
      .then((res) => { if (res.data.length > 0) setDeteccion(res.data[0]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    pollBackend();
    const t = setInterval(pollBackend, 3000);
    return () => clearInterval(t);
  }, [pollBackend]);

  useEffect(() => {
    if (camStatus !== "connected" || !isSender) {
      if (alprInterval.current) clearInterval(alprInterval.current);
      return;
    }
    addLog("ALPR iniciado — capturando cada 4s");
    alprInterval.current = setInterval(async () => {
      if (alprLoading) return;
      setAlprLoading(true);
      const frame = captureFrame();
      if (!frame) { addLog("ALPR: frame vacío — video no listo"); setAlprLoading(false); return; }
      addLog("ALPR: enviando frame a Plate Recognizer...");
      const result = await detectPlate(frame);
      if (!result) { addLog("ALPR: sin placa detectada"); setAlprLoading(false); return; }
      addLog(`ALPR: placa=${result.plate} conf=${result.confidence}% last=${lastResult.current?.plate || "null"}`);
      if (result.plate === lastResult.current?.plate) {
        addLog("ALPR: misma placa, omitiendo");
        setAlprLoading(false);
        return;
      }
      addLog("ALPR: nueva placa detectada, procesando...");
      lastResult.current = result;
      const placaNormalizada = normalizarPlaca(result.plate);
      setAlpr({ plate: placaNormalizada, confidence: result.confidence });
      addLog(`Placa normalizada: ${placaNormalizada}`);

      if (placaNormalizada.length < 6) {
        addLog(`ALPR: placa "${placaNormalizada}" ignorada — menos de 6 caracteres`);
        setAlprLoading(false);
        return;
      }

      const viaje = await buscarViajePorPlaca(placaNormalizada).then((r) => r.data).catch(() => ({ id_camion: null, id_viaje: null, codigo_reserva: null }));
      addLog(`Viaje lookup: camion=${viaje.id_camion} viaje=${viaje.id_viaje}`);

      addLog("Llamando uploadCaptura...");
      const upload = await uploadCaptura(placaNormalizada, frame).then((r) => r.data).catch(() => ({ url: null }));
      addLog(upload.url ? "S3 upload OK" : "S3 upload FAILED");
      lastCapturaUrl.current = upload.url;
      addLog(`Captura URL: ${upload.url}`);

      const esDesconocida = !viaje.id_camion;

      broadcast({ type: "plate-detected", plate: placaNormalizada, confidence: result.confidence, timestamp: new Date().toISOString(), requiereManual: !viaje.id_viaje, desconocida: esDesconocida, codigoReserva: viaje.codigo_reserva ?? undefined, capturaUrl: upload.url });

      if (esDesconocida) {
        addLog("ALPR: placa desconocida — esperando registro manual, no se auto-registra");
      } else {
        addLog("ALPR: camion conocido — registrando automáticamente");
        registrarDeteccion({ placa_detectada_alpr: placaNormalizada, confianza_alpr: result.confidence, tipo_evento: "ENTRADA", decision_acceso: "AUTORIZADO", estado_barrera: "ABIERTO", latencia_ms: 0, nivel_iluminacion: "NORMAL", nivel_obstruccion: "NINGUNA", id_viaje: viaje.id_viaje, id_camion: viaje.id_camion, url_foto_captura: upload.url })
          .then(() => addLog("Backend: registro OK"))
          .catch((e: Error) => addLog(`Backend ERROR: ${e.message}`));
      }
      setAlprLoading(false);
    }, 4000);
    return () => { if (alprInterval.current) clearInterval(alprInterval.current); };
  }, [camStatus, isSender, captureFrame, alprLoading, broadcast]);

  function handleDisconnect() { disconnect(); setAlpr(null); lastResult.current = null; }

  const statusConfig = {
    idle: { dot: "bg-slate-400", text: "Buscando cámara activa...", label: "ESPERANDO" },
    connecting: { dot: "bg-yellow-500 animate-pulse", text: "Conectando a la cámara...", label: "CONECTANDO" },
    connected: { dot: "bg-green-500 animate-pulse", text: "Transmisión en vivo activa", label: isSender ? "TRANSMITIENDO" : "CONECTADO" },
    error: { dot: "bg-error animate-pulse", text: "Error de conexión — reintentando...", label: "ERROR" },
  }[camStatus];

  if (isSender) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
        <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${camStatus === "connected" ? "" : "hidden"}`} autoPlay playsInline muted />
        {camStatus === "connected" ? (
          <>
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <div className="bg-black/60 px-2.5 py-1 rounded-md flex items-center gap-2 backdrop-blur-md">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[9px] text-white font-bold uppercase tracking-widest">TRANSMITIENDO</span>
              </div>
              <button onClick={stopSender} className="bg-error/90 hover:bg-error text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">stop_circle</span>
                Detener
              </button>
            </div>
            {alpr && (
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 border border-green-400 bg-black/80 px-8 py-1.5 rounded-md backdrop-blur-sm z-10">
                <span className="text-white font-black tracking-[0.2em] text-xl">{alpr.plate}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-white z-10 relative">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-5xl text-white/40">videocam</span>
            </div>
            <p className="font-bold text-lg">Cámara de Vigilancia</p>
            <p className="text-sm text-white/50 text-center max-w-xs">
              {camStatus === "error" ? "No se pudo acceder a la cámara" : "Presione para iniciar la transmisión"}
            </p>
            <button onClick={startSender} disabled={camStatus === "connecting"} className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm transition-all disabled:opacity-50 mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined">{camStatus === "connecting" ? "progress_activity" : "videocam"}</span>
              {camStatus === "connecting" ? "Iniciando..." : "Activar Cámara"}
            </button>
            {camStatus === "error" && (
              <button onClick={startSender} className="text-white/60 text-sm underline">Reintentar</button>
            )}
          </div>
        )}
        <DebugLogs logs={logs} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#f8f9ff]">
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">Detección y Captura de Placa</h2>
            <p className="text-xs text-slate-500 font-medium">Punto de Control Norte - Real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{statusConfig.label}</span>
            </div>
            {camStatus !== "connected" && (
              <button onClick={startSender} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">videocam</span> Activar Cámara
              </button>
            )}
            {camStatus === "connected" && (
              <button onClick={handleDisconnect} className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors">
                Desconectar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col flex-1 shadow-sm min-h-0">
          <div className="px-5 py-2.5 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xs text-primary">
              <span className="material-symbols-outlined text-primary text-lg">videocam</span> Captura en Vivo — Cámara 04
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${camStatus === "connected" ? "bg-error animate-pulse" : "bg-slate-300"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${camStatus === "connected" ? "text-error" : "text-slate-400"}`}>En Vivo</span>
            </div>
          </div>

          <div className="p-4 flex gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex-[1.2] relative bg-black rounded-lg overflow-hidden border border-slate-200">
              <video ref={videoRef} className={`w-full h-full object-cover ${camStatus === "connected" ? "" : "hidden"}`} autoPlay playsInline muted />
              <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1000" className={`w-full h-full object-cover opacity-70 ${camStatus === "connected" ? "hidden" : ""}`} alt="Camera feed" />
              <div className="scan-line" />
              {alpr && (
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 border border-green-400 bg-black/80 px-8 py-1.5 rounded-md backdrop-blur-sm z-10">
                  <span className="text-white font-black tracking-[0.2em] text-xl">{alpr.plate}</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/60 px-2.5 py-1 rounded-md flex items-center gap-2 backdrop-blur-md">
                <div className={`w-1.5 h-1.5 rounded-full ${camStatus === "connected" ? "bg-red-600 animate-pulse" : "bg-slate-500"}`} />
                <span className="text-[9px] text-white font-bold uppercase tracking-widest">Live Feed 04</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-[350px]">
              {deteccion ? (
                <>
                  <DataCard label="Placa Detectada">
                    <p className="text-3xl font-black text-primary leading-none py-1">{alpr?.plate || deteccion.placa_detectada_alpr}</p>
                  </DataCard>
                  <DataCard>
                    <div className="flex justify-between text-[9px] font-bold mb-1">
                      <span className="text-slate-400 uppercase">Confianza ALPR</span>
                      <span className="text-[#006d33]">{alpr ? `${alpr.confidence}%` : `${deteccion.confianza_alpr}%`}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-[#006d33] h-full rounded-full transition-all" style={{ width: `${alpr ? alpr.confidence : deteccion.confianza_alpr}%` }} />
                    </div>
                  </DataCard>
                  <div className="grid grid-cols-2 gap-2">
                    <DataCard label="Vehículo"><p className="text-[10px] text-slate-500">ID: VH-{deteccion.id_camion}</p></DataCard>
                    <DataCard label="Modelo"><p className="font-bold text-[11px] text-primary">{deteccion.modelo}</p></DataCard>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <DataCard label="Tipo / Cap"><p className="font-bold text-[11px]">{deteccion.tipo_vehiculo} / {deteccion.capacidad_toneladas}T</p></DataCard>
                    <DataCard label="Estado"><span className="bg-[#75f999] text-[#007236] font-black text-[9px] px-2 py-0.5 rounded-full inline-block">COMPLETADO</span></DataCard>
                    <DataCard label="Fecha / Hora"><p className="font-bold text-[10.5px]">{new Date(deteccion.timestamp_evento).toLocaleDateString("es-PE")} · {new Date(deteccion.timestamp_evento).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</p></DataCard>
                    <DataCard label="Latencia"><p className="font-bold text-[11px]">{deteccion.latencia_ms}ms</p></DataCard>
                    <DataCard label="Iluminación"><p className="font-bold text-[11px]">{deteccion.nivel_iluminacion}</p></DataCard>
                    <DataCard label="Obstrucción"><p className="font-bold text-[11px] text-[#006d33]">{deteccion.nivel_obstruccion}</p></DataCard>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  {camStatus === "connected" ? (
                    <div className="text-center"><p className="font-bold text-sm mb-1">Analizando transmisión...</p><p className="text-xs">{alprLoading ? "Detectando placa..." : "Esperando detección"}</p></div>
                  ) : (
                    <div className="text-center"><span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">videocam_off</span><p className="text-sm font-medium mb-1">Sin transmisión activa</p><p className="text-xs">{camStatus === "connecting" ? "Conectando..." : "Active la cámara desde un celular para iniciar"}</p></div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border-t border-outline-variant px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 border-2 rounded-full ${camStatus === "connected" ? "border-primary/20 border-t-primary animate-spin" : "border-slate-300"}`} />
              <p className="text-[11px] font-bold text-primary/80">{statusConfig.text}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/camara/accesos" className="text-[9px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">Ver registros de acceso →</Link>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{camStatus === "connected" ? "ALPR: Activo" : "ALPR: En espera"}</span>
            </div>
          </div>
        </div>
      </div>

      {toast && !isSender && (
        <div className="fixed bottom-6 right-6 bg-[#001e23] border border-[#0a3a40] text-white px-6 py-4 rounded-xl flex items-center gap-4 z-50 shadow-xl animate-slide-up">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Placa Detectada: <span className="text-green-400">{toast.plate}</span></p>
            <p className="text-sm opacity-70">{toast.action} — {new Date().toLocaleTimeString("es-PE")}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-white/50 hover:text-white ml-2"><span className="material-symbols-outlined text-xl">close</span></button>
        </div>
      )}

      {alertModal && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`rounded-2xl p-8 sm:p-10 max-w-lg min-w-[320px] w-full text-center shadow-2xl animate-scale-in ${alertModal.reason === "desconocida" ? "bg-[#1a0a00] border-2 border-amber-500/50" : "bg-[#0a1a0a] border-2 border-yellow-500/50"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse ${alertModal.reason === "desconocida" ? "bg-amber-500/15" : "bg-yellow-500/15"}`}>
              <span className={`material-symbols-outlined text-5xl ${alertModal.reason === "desconocida" ? "text-amber-400" : "text-yellow-400"}`}>warning</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">
              {alertModal.reason === "desconocida" ? "¡Placa Desconocida!" : "¡Camión sin Viaje!"}
            </h3>
            <p className="text-3xl font-black text-amber-400 tracking-[0.15em] mb-6 break-all">{alertModal.plate}</p>
            <p className="text-sm text-slate-400 mb-8 break-words max-w-[380px] mx-auto leading-relaxed">
              {alertModal.reason === "desconocida"
                ? "Esta placa no está registrada en el sistema. Se requiere registro manual por un administrador."
                : "El camión está registrado pero no tiene un viaje activo. Confirme o cancele el acceso manualmente."}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { navigate(`/camara/registro-manual?placa=${alertModal.plate}${alertModal.capturaUrl ? `&captura=${encodeURIComponent(alertModal.capturaUrl)}` : ""}`); setAlertModal(null); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined">edit_note</span>
                Registrar Manualmente
              </button>
              <button onClick={() => setAlertModal(null)} className="w-full bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-3 rounded-xl text-sm transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <DebugLogs logs={logs} />
    </div>
  );
}

function DataCard({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#eff4ff] p-2 rounded-[0.6rem] border border-[#e2e8f0]">
      {label && <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>}
      {children}
    </div>
  );
}

function DebugLogs({ logs }: { logs: string[] }) {
  return (
    <div className={`fixed bottom-2 left-2 z-[9998] bg-black/80 backdrop-blur-sm text-[10px] text-green-400 font-mono rounded-lg p-2 max-h-[180px] overflow-y-auto max-w-[420px] leading-relaxed ${logs.length === 0 ? "hidden" : ""}`}>
      {logs.map((l, i) => <div key={i} className="whitespace-nowrap">{l}</div>)}
    </div>
  );
}
