import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { registrarDeteccion, buscarViajePorPlaca } from "../services/monitoreoApi";

type ModalType = "confirm" | "cancel" | null;

export default function RegistroManualPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const placaParam = searchParams.get("placa") || "";
  const capturaParam = searchParams.get("captura") || "";

  const [placa, setPlaca] = useState(placaParam);
  const [modelo, setModelo] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [guia, setGuia] = useState("");
  const [mercancia, setMercancia] = useState("");
  const [peso, setPeso] = useState("");
  const [conductor, setConductor] = useState("");
  const [dni, setDni] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [tipoEvento, setTipoEvento] = useState("ENTRADA");
  const [observaciones, setObservaciones] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viajeInfo, setViajeInfo] = useState<string>("");

  useEffect(() => {
    if (!placaParam) return;
    buscarViajePorPlaca(placaParam)
      .then((res) => {
        if (res.data.id_viaje) {
          setViajeInfo(`Viaje ${res.data.codigo_reserva} encontrado`);
        } else if (res.data.id_camion) {
          setViajeInfo("Camión registrado — sin viaje activo");
        } else {
          setViajeInfo("Placa no registrada en el sistema");
        }
      })
      .catch(() => {});
  }, [placaParam]);

  async function handleConfirmAccess() {
    if (!placa.trim()) return;
    setSubmitting(true);
    try {
      await registrarDeteccion({
        placa_detectada_alpr: placa,
        confianza_alpr: 100,
        tipo_evento: tipoEvento,
        decision_acceso: "AUTORIZADO",
        estado_barrera: "ABIERTO",
        latencia_ms: 0,
        nivel_iluminacion: "NORMAL",
        nivel_obstruccion: "NINGUNA",
      });
      setModal("confirm");
      setTimeout(() => setShowToast(true), 300);
      setTimeout(() => setShowToast(false), 5000);
    } catch {
      alert("Error al registrar acceso");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelAccess() {
    setModal("cancel");
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8faff]">
      <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-xl font-black text-[#002b32] uppercase tracking-tighter">
            Registrar Datos de Entrada / Salida
          </h2>
          {viajeInfo && (
            <p className={`text-xs font-bold mt-0.5 ${viajeInfo.includes("encontrado") ? "text-[#006d33]" : "text-amber-600"}`}>
              {viajeInfo}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/camara")} className="text-xs text-slate-400 hover:text-primary font-bold">
            ← Volver a Cámara
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex gap-6">
          <div className="w-[360px] flex flex-col shrink-0">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <h3 className="text-5xl font-black text-[#002b32] tracking-tighter mb-1">{placa || "—"}</h3>
              <p className="text-sm font-semibold text-slate-500 mb-3">{modelo || "Sin modelo"}</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Evento</p>
                  <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} className="text-xs font-bold text-[#002b32] bg-transparent w-full outline-none mt-0.5">
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>
                  </select>
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Barrera</p>
                  <p className="text-xs font-bold text-amber-600">● MANUAL</p>
                </div>
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

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">inventory_2</span> Información de Carga
              </h4>
              <div className="space-y-4">
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Placa</label><input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="input-custom" placeholder="ABC-123" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Guía Remisión</label><input value={guia} onChange={(e) => setGuia(e.target.value)} className="input-custom" placeholder="GRR-2025-..." /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Tipo Mercancía</label><input value={mercancia} onChange={(e) => setMercancia(e.target.value)} className="input-custom" placeholder="Materiales" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Peso Total (kg)</label><input value={peso} onChange={(e) => setPeso(e.target.value)} className="input-custom" placeholder="40000" /></div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">person</span> Datos del Conductor
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Nombre Completo</label><input value={conductor} onChange={(e) => setConductor(e.target.value)} className="input-custom" placeholder="Ricardo Mendoza" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">DNI</label><input value={dni} onChange={(e) => setDni(e.target.value)} className="input-custom" placeholder="72839405" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Empresa</label><input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="input-custom" placeholder="Logística Express" /></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">local_shipping</span> Datos del Vehículo
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Modelo</label><input value={modelo} onChange={(e) => setModelo(e.target.value)} className="input-custom" placeholder="Volvo FH16" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Tipo Vehículo</label><input value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)} className="input-custom" placeholder="Carga Pesada" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Capacidad (T)</label><input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="input-custom" placeholder="40" /></div>
                <div><label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Observaciones</label><input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="input-custom" placeholder="Registro manual ALPR" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 p-4 px-8 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-[#002b32] uppercase tracking-widest">Acción Requerida</h4>
            <p className="text-[11px] text-slate-400 italic">Confirmando el acceso se activará el registro automático.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleCancelAccess} className="btn-cancel"><span className="material-symbols-outlined">block</span> Cancelar Acceso</button>
            <button onClick={handleConfirmAccess} disabled={submitting || !placa.trim()} className="btn-confirm disabled:opacity-50">
              <span className="material-symbols-outlined">{submitting ? "progress_activity" : "lock_open"}</span>
              {submitting ? "Registrando..." : "Confirmar Acceso"}
            </button>
          </div>
        </div>
      </footer>

      {modal === "confirm" && <ConfirmModal placa={placa} onClose={() => setModal(null)} />}
      {modal === "cancel" && <CancelModal onClose={() => setModal(null)} />}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#001e23] text-white px-6 py-4 rounded-xl flex items-center gap-4 z-50 border border-[#0a3a40] shadow-xl animate-slide-up">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 text-xl font-bold">check</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Base de Datos Actualizada</p>
            <p className="text-sm text-slate-400">El registro {placa} ha sido sincronizado.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ placa, onClose }: { placa: string; onClose: () => void }) {
  const now = new Date();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[850px] rounded-2xl overflow-hidden flex shadow-2xl">
        <div className="bg-[#065f24] text-white w-[450px] p-12 relative">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Acceso Confirmado</h2>
          <p className="text-green-100 text-lg leading-relaxed mb-12">
            La solicitud de ingreso para <strong className="text-white">{placa}</strong> ha sido procesada.
          </p>
          <div className="bg-black/20 p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-xs">sensors</span><span className="text-[10px] font-bold uppercase tracking-widest">Señal de Apertura Enviada</span></div>
            <p className="text-sm text-green-50 font-medium">Barrera Norte respondiendo en tiempo real...</p>
          </div>
        </div>
        <div className="flex-1 p-10 bg-[#fcfcfc] flex flex-col">
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
              Ver Detalles del acceso <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button onClick={onClose} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors">
              Cerrar Notificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[800px] max-w-[90%] bg-white rounded-[20px] overflow-hidden shadow-2xl border-4 border-[#bc1c1c]">
        <div className="bg-[#fee2e2] px-7 py-[18px] text-[#991b1b] font-black text-xl uppercase border-b-2 border-[#fecaca]">
          ACCESO DENEGADO POR ADMINISTRADOR
        </div>
        <div className="px-10 py-[25px]">
          <div className="flex gap-8 mb-6 items-center">
            <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-red-200">
              <span className="material-symbols-outlined text-red-600 text-6xl font-bold">priority_high</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 flex items-center gap-5">
                <span className="text-[11px] font-black text-slate-500 uppercase w-20">Motivo:</span>
                <span className="text-xl font-extrabold text-slate-800">Anomalía Detectada (Placa no coincide)</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 flex items-center gap-5">
                <span className="text-[11px] font-black text-slate-500 uppercase w-20">Barrera:</span>
                <span className="text-xl font-extrabold text-red-700 flex items-center gap-2"><span className="material-symbols-outlined text-2xl">lock</span> BLOQUEADA</span>
              </div>
            </div>
          </div>
          <div className="border-2 border-[#fee2e2] rounded-xl p-[14px] text-[#bc1c1c] font-black text-base flex items-center justify-center gap-2.5 uppercase bg-[#fffcfc]">
            <span className="material-symbols-outlined text-2xl">cancel</span> ALERTA DE SEGURIDAD PERIMETRAL ACTIVADA
          </div>
        </div>
        <div className="bg-[#bc1c1c] px-10 py-5 flex justify-between items-center">
          <div className="text-white"><p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Protocolo de Seguridad</p><p className="text-2xl font-black">ACTIVADO</p></div>
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
        <p className="font-bold text-[#002b32] text-lg">{value}</p>
      </div>
    </div>
  );
}
