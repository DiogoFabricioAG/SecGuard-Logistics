import { useEffect, useState } from "react";
import {
  getCamionesDisponibles,
  type CamionDisponible,
} from "../services/viajesApi";
import { getCapacidadPedido, type CapacidadPedido } from "../services/pedidosApi";
import { type ViajeWizardData } from "../context/ViajeWizardContext";

interface Props {
  data: ViajeWizardData;
  onChange: (data: Partial<ViajeWizardData>) => void;
}

export function Step3SeleccionFlota({ data, onChange }: Props) {
  const [camiones, setCamiones] = useState<CamionDisponible[]>([]);
  const [capacidad, setCapacidad] = useState<CapacidadPedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data.id_pedido) { setLoading(false); return; }

    let cancelled = false;
    const fecha = data.fecha_hora_estimada
      ? new Date(data.fecha_hora_estimada).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    Promise.all([getCamionesDisponibles(fecha), getCapacidadPedido(data.id_pedido)])
      .then(([cRes, capRes]) => {
        if (!cancelled) { setCamiones(cRes.data); setCapacidad(capRes.data); setLoading(false); }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [data.id_pedido, data.fecha_hora_estimada]);

  function toggleCamion(id: number) {
    const current = data.id_camiones_seleccionados;
    const exists = current.includes(id);
    onChange({
      id_camiones_seleccionados: exists
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary-container">
          progress_activity
        </span>
      </div>
    );
  }

  const capacidadTotal = capacidad?.total_peso_kg ?? 0;
  const seleccionados = data.id_camiones_seleccionados.length;
  const capacidadSeleccionada = camiones
    .filter((c) => data.id_camiones_seleccionados.includes(c.id_camion))
    .reduce((s, c) => s + Number(c.capacidad_toneladas), 0);

  return (
    <div className="flex-1 overflow-auto p-lg bg-surface flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-headline-sm text-on-surface">Selección de flota</h3>
          <p className="font-body-md text-on-surface-variant mt-1">
            Seleccione uno o más camiones disponibles para cumplir con la capacidad requerida.
          </p>
        </div>
        <div className="text-right">
          <span className="font-label-sm text-on-surface-variant uppercase">Capacidad Requerida</span>
          <div className="font-headline-md text-on-surface">
            {(capacidadTotal / 1000).toFixed(1)}
            <span className="text-lg font-normal text-on-surface-variant"> Tons</span>
          </div>
          {seleccionados > 0 && (
            <div className="mt-1">
              <span className="text-xs text-primary-container font-medium">
                {seleccionados} seleccionado{seleccionados > 1 ? "s" : ""} · {capacidadSeleccionada.toFixed(1)} T
              </span>
            </div>
          )}
        </div>
      </div>

      {camiones.length === 0 && (
        <div className="bg-[#F39200]/10 border border-[#F39200]/20 rounded-lg p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#F39200] mt-0.5">warning</span>
          <div>
            <h4 className="font-label-md text-[#F39200]">No hay camiones disponibles para esta fecha</h4>
            <p className="font-body-md text-[#653a00] mt-1">
              Considere modificar la fecha o dividir la carga.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {camiones.map((camion) => {
          const isSelected = data.id_camiones_seleccionados.includes(camion.id_camion);
          return (
            <label key={camion.id_camion} className="relative block cursor-pointer group">
              <input checked={isSelected} onChange={() => toggleCamion(camion.id_camion)} className="peer sr-only" type="checkbox" />
              <div
                className={`rounded-lg border-2 p-4 shadow-sm transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary-container bg-primary-fixed/20"
                    : "border-surface-variant bg-surface-lowest peer-checked:border-primary-container peer-checked:bg-primary-fixed/20"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-headline-sm text-primary-container">{camion.placa_matricula}</span>
                  <span className={`material-symbols-outlined ${isSelected ? "text-primary-container filled" : "text-outline"}`}>
                    {isSelected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 mt-3 font-body-md text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-outline">Modelo</span>
                    {camion.modelo}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-outline">Capacidad</span>
                    {camion.capacidad_toneladas} Tons
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-outline">Estado</span>
                    <span className="text-[#009A3F] font-medium">
                      {camion.estado_operativo === "DISPONIBLE" ? "Disponible" : camion.estado_operativo}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-outline">Clasificación</span>
                    {camion.clasificacion_peso}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
