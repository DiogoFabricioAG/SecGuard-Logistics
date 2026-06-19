import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePeerCamera } from "../hooks/usePeerCamera";
import { detectPlate, type AlprResult } from "../services/alprService";
import { getCompletadosPesados, registrarDeteccion, buscarViajePorPlaca, type DeteccionCompletada } from "../services/monitoreoApi";

interface BroadcastMessage {
  type: "plate-detected"; plate: string; confidence: number; timestamp: string;
  requiereManual?: boolean; desconocida?: boolean; codigoReserva?: string;
}

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
  const [toast, setToast] = useState<{ plate: string; action: string; requiereManual?: boolean } | null>(null);
  const alprInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastResult = useRef<AlprResult | null>(null);

  function showToast(plate: string, action: string) {
    setToast({ plate, action, requiereManual: action.includes("Sin viaje") || action.includes("desconocida") });
    setTimeout(() => setToast(null), 5000);
  }

  const onData = useCallback((msg: BroadcastMessage) => {
    if (msg.type === "plate-detected") {
      setAlpr({ plate: msg.plate, confidence: msg.confidence });
      const action = msg.desconocida
        ? "Placa desconocida"
        : msg.requiereManual
          ? "Sin viaje asociado"
          : `Viaje ${msg.codigoReserva || ""}`;
      showToast(msg.plate, action);
    }
  }, []);

  const {
    videoRef, status: camStatus, isSender,
    startSender, stopSender, disconnect, captureFrame, broadcast,
  } = usePeerCamera(onData);

  useEffect(() => {
    document.body.classList.toggle("camara-sender", isSender);
    return () => document.body.classList.remove("camara-sender");
  }, [isSender]);

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
    alprInterval.current = setInterval(async () => {
      if (alprLoading) return;
      setAlprLoading(true);
      const frame = captureFrame();
      if (frame) {
        const result = await detectPlate(frame);
        if (result && result.plate !== lastResult.current?.plate) {
          lastResult.current = result;
          const placaNormalizada = normalizarPlaca(result.plate);
          setAlpr({ plate: placaNormalizada, confidence: result.confidence });

          const viaje = await buscarViajePorPlaca(placaNormalizada).then((r) => r.data).catch(() => ({ id_camion: null, id_viaje: null, codigo_reserva: null }));

          const msg: BroadcastMessage = {
            type: "plate-detected", plate: placaNormalizada, confidence: result.confidence,
            timestamp: new Date().toISOString(), requiereManual: !viaje.id_viaje,
            desconocida: !viaje.id_camion, codigoReserva: viaje.codigo_reserva ?? undefined,
          };
          broadcast(msg);

          registrarDeteccion({
            placa_detectada_alpr: placaNormalizada, confianza_alpr: result.confidence,
            tipo_evento: "ENTRADA", decision_acceso: "AUTORIZADO", estado_barrera: "ABIERTO",
            latencia_ms: 0, nivel_iluminacion: "NORMAL", nivel_obstruccion: "NINGUNA",
            id_viaje: viaje.id_viaje, id_camion: viaje.id_camion,
          }).catch(() => {});
        }
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
      <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
        {camStatus === "connected" ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
            <div className="absolute top-4 left-4 bg-black/60 px-2.5 py-1 rounded-md flex items-center gap-2 backdrop-blur-md z-10">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-bold uppercase tracking-widest">TRANSMITIENDO</span>
            </div>
            {alpr && (
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 border border-green-400 bg-black/80 px-8 py-1.5 rounded-md backdrop-blur-sm z-10">
                <span className="text-white font-black tracking-[0.2em] text-xl">{alpr.plate}</span>
              </div>
            )}
            <button onClick={stopSender} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-error/90 hover:bg-error text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm z-20 flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">stop_circle</span>
              Detener Cámara
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-white">
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
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl flex items-center gap-4 z-50 border shadow-xl animate-slide-up ${toast.requiereManual ? "bg-[#3d1c00] border-[#5c3100] text-white" : "bg-[#001e23] border-[#0a3a40] text-white"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toast.requiereManual ? "bg-amber-500/20" : "bg-green-500/20"}`}>
            <span className={`material-symbols-outlined text-2xl ${toast.requiereManual ? "text-amber-400" : "text-green-400"}`}>{toast.requiereManual ? "warning" : "check_circle"}</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Placa Detectada: <span className={toast.requiereManual ? "text-amber-400" : "text-green-400"}>{toast.plate}</span></p>
            <p className="text-sm opacity-70">{toast.action} — {new Date().toLocaleTimeString("es-PE")}</p>
          </div>
          {toast.requiereManual && (
            <button onClick={() => navigate(`/camara/registro-manual?placa=${toast.plate}`)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
              Registrar Manual
            </button>
          )}
          <button onClick={() => setToast(null)} className="text-white/50 hover:text-white ml-2"><span className="material-symbols-outlined text-xl">close</span></button>
        </div>
      )}
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
