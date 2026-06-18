import { useEffect, useState } from "react";
import {
  getCamionById,
  getEventosProximos,
  getMantenimientos,
  type CamionDetail,
  type EventoProximo,
  type Mantenimiento,
} from "../services/camionesApi";

interface Props {
  camionId: number;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getBarColor(event: EventoProximo | undefined): string {
  if (!event) return "bg-surface-variant border border-outline-variant";
  switch (event.tipo_evento) {
    case "VIAJE":
      return "bg-[#009A3F]";
    case "MANTENIMIENTO":
      return "bg-[#3b82f6]";
    default:
      return "bg-surface-variant";
  }
}

export function CamionDetailPanel({ camionId }: Props) {
  const [camion, setCamion] = useState<CamionDetail | null>(null);
  const [eventos, setEventos] = useState<EventoProximo[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCamionById(camionId),
      getEventosProximos(camionId),
      getMantenimientos(camionId),
    ])
      .then(([cRes, eRes, mRes]) => {
        if (!cancelled) {
          setCamion(cRes.data);
          setEventos(eRes.data);
          setMantenimientos(mRes.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCamion(null);
          setEventos([]);
          setMantenimientos([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [camionId]);

  if (loading) {
    return (
      <div className="w-[400px] bg-surface-lowest h-full overflow-y-auto border-l border-surface-variant flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary-container">
          progress_activity
        </span>
      </div>
    );
  }

  if (!camion) {
    return (
      <div className="w-[400px] bg-surface-lowest h-full overflow-y-auto border-l border-surface-variant flex items-center justify-center shrink-0">
        <p className="text-on-surface-variant">Seleccione un vehículo</p>
      </div>
    );
  }

  const estadoLabel =
    camion.estado_operativo === "DISPONIBLE"
      ? "Disponible"
      : camion.estado_operativo === "EN_RUTA"
        ? "En Ruta"
        : camion.estado_operativo === "EN_MANTENIMIENTO"
          ? "Mantenimiento"
          : camion.estado_operativo;

  return (
    <div className="w-[400px] bg-surface-lowest h-full overflow-y-auto border-l border-surface-variant flex flex-col shrink-0">
      <div className="p-lg border-b border-surface-variant flex justify-between items-start sticky top-0 bg-surface-lowest z-10">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Camión {camion.placa_matricula}
          </h2>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#009A3F]/10 text-[#009A3F] font-label-sm text-label-sm border border-[#009A3F]/20">
            {estadoLabel}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-surface-variant rounded hover:bg-surface transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="p-2 border border-surface-variant rounded hover:bg-surface transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      <div className="p-lg flex-1 flex flex-col gap-lg">
        <div className="w-full aspect-video bg-surface-variant rounded-xl overflow-hidden border border-surface-variant relative">
          <img
            alt={camion.modelo}
            className="object-cover w-full h-full"
            src={camion.url_foto_vehiculo}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x225";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded font-label-sm text-label-sm">
            {camion.modelo}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-surface-variant p-4">
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4 border-b border-surface-variant pb-2">
            Especificaciones Técnicas
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Tipo Unidad
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium">
                {camion.tipo_unidad}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Capacidad
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium">
                {camion.tipo_capacidad_display}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                SOAT vigente
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium">
                {new Date(camion.vigencia_soat).toLocaleDateString("es-PE")}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Tarj. Propiedad
              </span>
              <span className="font-body-md text-body-md text-on-surface font-medium">
                {new Date(camion.vigencia_tarjeta_propiedad).toLocaleDateString(
                  "es-PE",
                )}
              </span>
            </div>
          </div>
          {camion.observaciones && (
            <div className="mt-4 pt-3 border-t border-surface-variant">
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Observaciones
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                {camion.observaciones}
              </span>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-surface-variant p-4">
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4 border-b border-surface-variant pb-2 flex justify-between items-center">
            Pronóstico 7 Días
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              calendar_month
            </span>
          </h3>
          <div className="flex justify-between items-end h-20 gap-1 mt-2">
            {DIAS.map((dia, i) => {
              const today = new Date();
              const todayDay = today.getDay();
              const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay;
              const monday = new Date(today);
              monday.setDate(today.getDate() + mondayOffset);
              monday.setHours(0, 0, 0, 0);

              const targetDate = new Date(monday);
              targetDate.setDate(monday.getDate() + i);

              const ev = eventos.find((e) => {
                const eventDate = new Date(e.fecha_evento);
                return (
                  eventDate.getFullYear() === targetDate.getFullYear() &&
                  eventDate.getMonth() === targetDate.getMonth() &&
                  eventDate.getDate() === targetDate.getDate()
                );
              });
              return (
                <div
                  key={dia}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className={`w-full rounded-sm opacity-80 hover:opacity-100 transition-opacity h-[62.5px] ${getBarColor(ev)}`}
                    title={
                      ev ? `${ev.tipo_evento}: ${ev.detalle}` : "Disponible"
                    }
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-surface-variant p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-variant bg-surface">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
              Registro de Mantenimiento
            </h3>
          </div>
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
              {mantenimientos.map((m) => (
                <tr
                  key={m.id_mantenimiento}
                  className="hover:bg-surface-variant transition-colors"
                >
                  <td className="p-3 pl-4">
                    <div className="font-label-md text-label-md text-on-surface">
                      {new Date(m.fecha_mantenimiento).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">
                      {m.tipo_mantenimiento}
                    </div>
                  </td>
                  <td className="p-3 text-right pr-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#009A3F]/10 text-[#009A3F] font-label-sm text-label-sm border border-[#009A3F]/20">
                      Completado
                    </span>
                  </td>
                </tr>
              ))}
              {mantenimientos.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-on-surface-variant">
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-3 text-center border-t border-surface-variant bg-surface hover:bg-surface-variant cursor-pointer transition-colors">
            <span className="font-label-md text-label-md text-primary-container">
              Ver Historial Completo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
