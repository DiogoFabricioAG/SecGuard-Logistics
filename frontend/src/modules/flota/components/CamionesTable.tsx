import { type Camion } from "../services/camionesApi";

interface Props {
  camiones: Camion[];
  selectedId: number | null;
  onSelect: (camion: Camion) => void;
  pagination?: {
    page: number;
    totalPaginas: number;
    totalRegistros: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
}

function estadoBadge(estado: string) {
  switch (estado) {
    case "DISPONIBLE":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#009A3F]/10 text-[#009A3F] font-label-sm text-label-sm border border-[#009A3F]/20">
          Disponible
        </span>
      );
    case "EN_RUTA":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-surface-variant text-on-surface font-label-sm text-label-sm border border-outline-variant">
          En Ruta
        </span>
      );
    case "EN_MANTENIMIENTO":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#F39200]/10 text-[#F39200] font-label-sm text-label-sm border border-[#F39200]/20">
          Mantenimiento
        </span>
      );
    case "INACTIVO":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-surface-variant text-on-surface-variant font-label-sm text-label-sm border border-outline-variant">
          Inactivo
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-surface-variant text-on-surface font-label-sm text-label-sm border border-outline-variant">
          {estado}
        </span>
      );
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CamionesTable({
  camiones,
  selectedId,
  onSelect,
  pagination,
  onPageChange,
}: Props) {
  const start = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 1;
  const end = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.totalRegistros)
    : camiones.length;
  const total = pagination?.totalRegistros ?? camiones.length;

  return (
    <div className="bg-surface-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-surface-variant">
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-4">
              Vehículo
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Placa
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Modelo
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Tipo / Cap
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Estado
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pr-4">
              Próx. Mantenimiento
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
          {camiones.map((camion) => (
            <tr
              key={camion.id_camion}
              onClick={() => onSelect(camion)}
              className={`hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                selectedId === camion.id_camion
                  ? "border-l-primary-container bg-primary-fixed/20"
                  : "border-l-transparent"
              }`}
            >
              <td className="p-sm pl-4">
                <div className="w-12 h-12 bg-surface-variant rounded flex items-center justify-center overflow-hidden">
                  <img
                    alt={camion.placa_matricula}
                    className="object-cover w-full h-full"
                    src={camion.url_foto_vehiculo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/48";
                    }}
                  />
                </div>
              </td>
              <td className="p-sm font-label-md text-label-md text-on-surface">
                {camion.placa_matricula}
              </td>
              <td className="p-sm text-on-surface-variant">{camion.modelo}</td>
              <td className="p-sm text-on-surface-variant">
                {camion.tipo_capacidad_display}
              </td>
              <td className="p-sm">{estadoBadge(camion.estado_operativo)}</td>
              <td className="p-sm text-on-surface-variant pr-4">
                {formatDate(camion.fecha_proximo_mantenimiento)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t border-surface-variant flex justify-between items-center bg-surface">
        <span className="font-body-md text-body-md text-on-surface-variant">
          Mostrando {start}-{end} de {total} vehículos
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange?.(Math.max(1, (pagination?.page ?? 1) - 1))}
            disabled={(pagination?.page ?? 1) <= 1}
            className="p-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={() =>
              onPageChange?.(Math.min(pagination?.totalPaginas ?? 1, (pagination?.page ?? 1) + 1))
            }
            disabled={(pagination?.page ?? 1) >= (pagination?.totalPaginas ?? 1)}
            className="p-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
