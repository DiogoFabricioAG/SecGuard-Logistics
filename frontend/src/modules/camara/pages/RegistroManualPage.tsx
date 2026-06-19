import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { registrarDeteccion, buscarViajePorPlaca } from "../services/monitoreoApi";
import { getCamionById, type CamionDetail } from "../../flota/services/camionesApi";

type ModalType = "confirm" | "cancel" | null;

export default function RegistroManualPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const placaParam = searchParams.get("placa") || "";
  const capturaParam = searchParams.get("captura") || "";

  const [placa, setPlaca] = useState(placaParam);
  const [camion, setCamion] = useState<CamionDetail | null>(null);
  const [viajeInfo, setViajeInfo] = useState<{ id_viaje: number | null; codigo_reserva: string | null }>({ id_viaje: null, codigo_reserva: null });
  const [loading, setLoading] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!placaParam) return;
    buscarCamion(placaParam);
  }, [placaParam]);

  async function buscarCamion(p: string) {
    if (p.length < 4) return;
    setLoading(true);
    setLookupDone(false);
    try {
      const viaje = await buscarViajePorPlaca(p);
      setViajeInfo({ id_viaje: viaje.data.id_viaje, codigo_reserva: viaje.data.codigo_reserva });
      if (viaje.data.id_camion) {
        const c = await getCamionById(viaje.data.id_camion);
        setCamion(c.data);
      } else {
        setCamion(null);
      }
    } catch {
      setCamion(null);
    } finally {
      setLoading(false);
      setLookupDone(true);
    }
  }

  async function handleConfirm() {
    if (!placa.trim()) return;
    setSubmitting(true);
    try {
      await registrarDeteccion({
        placa_detectada_alpr: placa,
        confianza_alpr: 100,
        tipo_evento: "ENTRADA",
        decision_acceso: "AUTORIZADO",
        estado_barrera: "ABIERTO",
        latencia_ms: 0,
        nivel_iluminacion: "NORMAL",
        nivel_obstruccion: "NINGUNA",
        id_viaje: viajeInfo.id_viaje,
        id_camion: camion?.id_camion ?? null,
      });
      setModal("confirm");
    } catch {
      alert("Error al registrar acceso");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8faff]">
      <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-xl font-black text-[#002b32] uppercase tracking-tighter">Registrar Datos de Entrada / Salida</h2>
          {camion && (
            <p className={`text-xs font-bold mt-0.5 ${viajeInfo.codigo_reserva ? "text-[#006d33]" : "text-amber-600"}`}>
              {viajeInfo.codigo_reserva ? `Viaje ${viajeInfo.codigo_reserva}` : "Camión encontrado — sin viaje activo"}
            </p>
          )}
          {lookupDone && !camion && (
            <p className="text-xs font-bold text-amber-600 mt-0.5">Placa no registrada en el sistema</p>
          )}
        </div>
        <button onClick={() => navigate("/camara")} className="text-xs text-slate-400 hover:text-primary font-bold">
          ← Volver a Cámara
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex gap-6">
          <div className="w-[380px] flex flex-col shrink-0">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-1 block">Placa del Vehículo</label>
              <div className="flex gap-2">
                <input value={placa} onChange={(e) => { setPlaca(e.target.value.toUpperCase()); setCamion(null); setLookupDone(false); }} onKeyDown={(e) => e.key === "Enter" && buscarCamion(placa)} className="input-custom flex-1" placeholder="ABC-123" />
                <button onClick={() => buscarCamion(placa)} disabled={loading || placa.length < 4} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                  <span className="material-symbols-outlined text-sm">{loading ? "progress_activity" : "search"}</span>
                  Buscar
                </button>
              </div>
            </div>

            {capturaParam && (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 mb-3 shadow-sm">
                <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-[10px] uppercase mb-2">
                  <span className="material-symbols-outlined text-base">photo_camera</span> Captura ALPR
                </h4>
                <img src={capturaParam} alt="Captura placa" className="w-full rounded-lg border border-slate-200" />
              </div>
            )}

            {!lookupDone && placa.length >= 4 && (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 text-center text-slate-400 text-sm">Presione Buscar o Enter para verificar la placa</div>
            )}
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              </div>
            ) : camion ? (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm space-y-4">
                <div className="flex gap-4">
                  <div className="w-40 h-28 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                    <img src={camion.url_foto_vehiculo} alt={camion.modelo} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/160x112"; }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-[#002b32]">{camion.placa_matricula}</h3>
                    <p className="text-sm font-bold text-slate-500 mb-2">{camion.modelo}</p>
                    <div className="flex gap-2">
                      <span className="bg-[#e6f4ea] text-[#006d33] font-black text-[9px] px-2 py-0.5 rounded-full">{camion.estado_operativo}</span>
                      <span className="bg-slate-100 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full">{camion.tipo_unidad}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-[10px] font-extrabold text-slate-400 uppercase">Capacidad</p><p className="font-bold text-[#002b32]">{camion.tipo_capacidad_display}</p></div>
                  <div><p className="text-[10px] font-extrabold text-slate-400 uppercase">SOAT</p><p className="font-bold text-[#002b32]">{new Date(camion.vigencia_soat).toLocaleDateString("es-PE")}</p></div>
                  <div><p className="text-[10px] font-extrabold text-slate-400 uppercase">Tarj. Prop.</p><p className="font-bold text-[#002b32]">{new Date(camion.vigencia_tarjeta_propiedad).toLocaleDateString("es-PE")}</p></div>
                </div>
                {camion.observaciones && <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-3">{camion.observaciones}</p>}
              </div>
            ) : lookupDone ? (
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">search_off</span>
                <p className="font-bold text-slate-500 mb-1">Placa no encontrada</p>
                <p className="text-sm text-slate-400">La placa <strong className="text-slate-600">{placa}</strong> no está registrada en la base de datos de camiones.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 p-4 px-8 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-[#002b32] uppercase tracking-widest">Acción Requerida</h4>
            <p className="text-[11px] text-slate-400 italic">Verifique la placa y confirme o cancele el acceso.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setModal("cancel")} className="btn-cancel"><span className="material-symbols-outlined">block</span> Cancelar Acceso</button>
            <button onClick={handleConfirm} disabled={submitting || !camion} className="btn-confirm disabled:opacity-50">
              <span className="material-symbols-outlined">{submitting ? "progress_activity" : "lock_open"}</span>
              {submitting ? "Registrando..." : "Confirmar Acceso"}
            </button>
          </div>
        </div>
      </footer>

      {modal === "confirm" && <ConfirmModal placa={placa} onClose={() => { setModal(null); navigate("/camara/accesos"); }} />}
      {modal === "cancel" && <CancelModal onClose={() => setModal(null)} />}
    </div>
  );
}

function ConfirmModal({ placa, onClose }: { placa: string; onClose: () => void }) {
  const now = new Date();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-[850px] max-w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#065f24] text-white sm:w-[450px] p-8 sm:p-12 shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">Acceso Confirmado</h2>
          <p className="text-green-100 text-base sm:text-lg leading-relaxed mb-12">
            La solicitud de ingreso para <strong className="text-white">{placa}</strong> ha sido procesada.
          </p>
          <div className="bg-black/20 p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-xs">sensors</span><span className="text-[10px] font-bold uppercase tracking-widest">Señal de Apertura Enviada</span></div>
            <p className="text-sm text-green-50 font-medium">Barrera Norte respondiendo en tiempo real...</p>
          </div>
        </div>
        <div className="flex-1 p-6 sm:p-10 bg-[#fcfcfc] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Resumen del Evento</span>
            <span className="bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-full">REGISTRO ACTIVO</span>
          </div>
          <div className="space-y-6 flex-1">
            <EventRow icon="tag" label="Estado del Vehículo" value="Ingreso Registrado" />
            <EventRow icon="schedule" label="Fecha / Hora" value={`${now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("es-PE")}`} />
            <EventRow icon="location_on" label="Ubicación Actual" value="En Patio - Zona de Carga B" />
          </div>
          <div className="mt-8 space-y-3">
            <button onClick={onClose} className="w-full bg-[#001e23] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#002b32] transition-colors">
              Ver Registro de Accesos <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button onClick={onClose} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-[800px] max-w-full bg-white rounded-[20px] overflow-hidden shadow-2xl border-4 border-[#bc1c1c]">
        <div className="bg-[#fee2e2] px-7 py-[18px] text-[#991b1b] font-black text-lg sm:text-xl uppercase border-b-2 border-[#fecaca]">ACCESO DENEGADO POR ADMINISTRADOR</div>
        <div className="px-6 sm:px-10 py-[25px]">
          <div className="flex flex-col sm:flex-row gap-8 mb-6 items-center">
            <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-red-200">
              <span className="material-symbols-outlined text-red-600 text-6xl font-bold">priority_high</span>
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4"><span className="text-[11px] font-black text-slate-500 uppercase">Motivo: </span><span className="text-lg sm:text-xl font-extrabold text-slate-800">Anomalía Detectada (Placa no coincide)</span></div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4"><span className="text-[11px] font-black text-slate-500 uppercase">Barrera: </span><span className="text-lg sm:text-xl font-extrabold text-red-700 flex items-center gap-2"><span className="material-symbols-outlined text-2xl">lock</span> BLOQUEADA</span></div>
            </div>
          </div>
          <div className="border-2 border-[#fee2e2] rounded-xl p-4 text-[#bc1c1c] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 uppercase bg-[#fffcfc]">
            <span className="material-symbols-outlined text-2xl">cancel</span> ALERTA DE SEGURIDAD PERIMETRAL ACTIVADA
          </div>
        </div>
        <div className="bg-[#bc1c1c] px-6 sm:px-10 py-5 flex justify-between items-center flex-wrap gap-3">
          <div className="text-white"><p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Protocolo de Seguridad</p><p className="text-xl sm:text-2xl font-black">ACTIVADO</p></div>
          <button onClick={onClose} className="bg-[#001e23] text-white px-8 py-3 rounded-xl font-black text-base shadow-lg hover:bg-black transition-colors">Volver al Panel</button>
        </div>
      </div>
    </div>
  );
}

function EventRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-[#002b32] rounded flex items-center justify-center text-white shrink-0">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-extrabold text-slate-400 uppercase">{label}</p>
        <p className="font-bold text-[#002b32] text-base sm:text-lg">{value}</p>
      </div>
    </div>
  );
}
