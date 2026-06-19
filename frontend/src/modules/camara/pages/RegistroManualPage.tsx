import { useEffect, useState } from "react";
import { getSalidasCerradas, type SalidaCerrada } from "../services/monitoreoApi";

type ModalType = "confirm" | "cancel" | null;

export default function RegistroManualPage() {
  const [registro, setRegistro] = useState<SalidaCerrada | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    Promise.all([getSalidasCerradas()])
      .then(([salidasRes]) => {
        if (salidasRes.data.length > 0) {
          setRegistro(salidasRes.data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleConfirmAccess() {
    setModal("confirm");
    setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 500);
  }

  function handleCancelAccess() {
    setModal("cancel");
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8faff]">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8faff]">
      <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
        <h2 className="text-xl font-black text-[#002b32] uppercase tracking-tighter">
          Registrar Datos de Entrada / Salida
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined text-slate-500 text-2xl cursor-pointer">notifications</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white">3</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 text-2xl cursor-pointer">settings</span>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Administrador</p>
              <p className="text-sm font-bold text-[#002b32]">ID_Admin01</p>
            </div>
            <div className="w-9 h-9 bg-[#001e23] rounded-[10px] flex items-center justify-center text-white">
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex gap-6">
          <div className="w-[360px] flex flex-col shrink-0">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <h3 className="text-5xl font-black text-[#002b32] tracking-tighter mb-1">
                {registro?.placa_detectada_alpr || "—"}
              </h3>
              <p className="text-sm font-semibold text-slate-500 mb-3">
                {registro?.modelo || "—"} - {registro?.tipo_vehiculo || "—"}
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Estado</p>
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                    ● {registro?.estado_barrera || "CERRADA"}
                  </p>
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Prioridad</p>
                  <p className="text-xs font-bold text-[#002b32]">{registro?.prioridad_envio || "—"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">inventory_2</span>
                Información de Carga
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Guía Remisión</label>
                  <input type="text" value={registro?.guia_remision_ransa || ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Tipo de Mercancía</label>
                  <input type="text" value={registro?.tipo_mercancia || ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Peso Total</label>
                  <input type="text" value={registro?.total_peso_kg ? `${registro.total_peso_kg} kg` : ""} readOnly className="input-custom" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 mb-3 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">person</span> Datos del Conductor
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Nombre Completo</label>
                  <input type="text" value={registro ? `${registro.nombres} ${registro.apellidos}` : ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">DNI</label>
                  <input type="text" value={registro?.dni || ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Empresa</label>
                  <input type="text" value={registro?.empresa_transportista || ""} readOnly className="input-custom" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
              <h4 className="flex items-center gap-2 text-[#002b32] font-extrabold text-xs uppercase border-b border-[#f1f5f9] pb-2 mb-3">
                <span className="material-symbols-outlined">local_shipping</span> Datos del Vehículo
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Placa</label>
                  <input type="text" value={registro?.placa_detectada_alpr || ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Modelo</label>
                  <input type="text" value={registro?.modelo || ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Capacidad</label>
                  <input type="text" value={registro?.capacidad_toneladas ? `${registro.capacidad_toneladas}T` : ""} readOnly className="input-custom" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-0.5">Observaciones</label>
                  <input type="text" value={registro?.observaciones || ""} readOnly className="input-custom" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 p-4 px-8 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-[#002b32] uppercase tracking-widest">Acción Requerida</h4>
            <p className="text-[11px] text-slate-400 italic">
              Confirmando el acceso se activará el registro automático en el Dock 04.
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleCancelAccess} className="btn-cancel">
              <span className="material-symbols-outlined">block</span> Cancelar Acceso
            </button>
            <button onClick={handleConfirmAccess} className="btn-confirm">
              <span className="material-symbols-outlined">lock_open</span> Confirmar Acceso
            </button>
          </div>
        </div>
      </footer>

      {modal === "confirm" && <ConfirmModal onClose={() => setModal(null)} placa={registro?.placa_detectada_alpr || ""} />}
      {modal === "cancel" && <CancelModal onClose={() => setModal(null)} />}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#001e23] text-white px-6 py-4 rounded-xl flex items-center gap-4 z-50 border border-[#0a3a40] shadow-xl">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 text-xl font-bold">check</span>
          </div>
          <div>
            <p className="font-bold text-base leading-tight">Base de Datos Actualizada</p>
            <p className="text-sm text-slate-400">El registro ha sido sincronizado.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ onClose, placa }: { onClose: () => void; placa: string }) {
  const now = new Date();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[850px] rounded-2xl overflow-hidden flex shadow-2xl">
        <div className="bg-[#065f24] text-white w-[450px] p-12 relative">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Acceso Confirmado</h2>
          <p className="text-green-100 text-lg opacity-90 leading-relaxed mb-12">
            La solicitud de ingreso para el vehículo <strong className="text-white">{placa}</strong> ha sido procesada exitosamente.
          </p>
          <div className="bg-black/20 p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xs">sensors</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Señal de Apertura Enviada</span>
            </div>
            <p className="text-sm text-green-50 font-medium">Barrera Norte (Acceso A-4) respondiendo en tiempo real...</p>
          </div>
        </div>

        <div className="flex-1 p-10 bg-[#fcfcfc] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Resumen del Evento</span>
            <span className="bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-full">REGISTRO ACTIVO</span>
          </div>
          <div className="space-y-6 flex-1">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#002b32] rounded flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-xl">tag</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Estado del Vehículo</p>
                <p className="font-bold text-[#002b32] text-lg">Ingreso Registrado</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#002b32] rounded flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-xl">schedule</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Fecha / Hora</p>
                <p className="font-bold text-[#002b32] text-lg">
                  {now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}, {now.toLocaleTimeString("es-PE")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#002b32] rounded flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Ubicación Actual</p>
                <p className="font-bold text-[#002b32] text-lg">En Patio - Zona de Carga B</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <button className="w-full bg-[#001e23] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#002b32] transition-colors">
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
                <span className="text-xl font-extrabold text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">lock</span> BLOQUEADA
                </span>
              </div>
            </div>
          </div>
          <div className="border-2 border-[#fee2e2] rounded-xl p-[14px] text-[#bc1c1c] font-black text-base flex items-center justify-center gap-2.5 uppercase bg-[#fffcfc]">
            <span className="material-symbols-outlined text-2xl">cancel</span>
            ALERTA DE SEGURIDAD PERIMETRAL ACTIVADA
          </div>
        </div>
        <div className="bg-[#bc1c1c] px-10 py-5 flex justify-between items-center">
          <div className="text-white">
            <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Protocolo de Seguridad</p>
            <p className="text-2xl font-black">ACTIVADO</p>
          </div>
          <button onClick={onClose} className="bg-[#001e23] text-white px-8 py-3 rounded-xl font-black text-base shadow-lg hover:bg-black transition-colors">
            Volver al Panel
          </button>
        </div>
      </div>
    </div>
  );
}
