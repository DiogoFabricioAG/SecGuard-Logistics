import { type Viaje } from "../services/viajesApi";

interface Props {
  viajes: Viaje[];
  selectedId: number | null;
  onSelect: (viaje: Viaje) => void;
  loading?: boolean;
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
    case "PENDIENTE":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-surface-variant text-on-surface font-label-sm text-label-sm border border-outline-variant">
          Pendiente
        </span>
      );
    case "CONFIRMADO":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#009A3F]/10 text-[#009A3F] font-label-sm text-label-sm border border-[#009A3F]/20">
          Confirmado
        </span>
      );
    case "EN_TRANSITO":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#F39200]/10 text-[#F39200] font-label-sm text-label-sm border border-[#F39200]/20">
          En Tránsito
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

export function ViajesTable({
  viajes,
  selectedId,
  onSelect,
  loading,
  pagination,
  onPageChange,
}: Props) {
  const start = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 1;
  const end = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.totalRegistros)
    : viajes.length;
  const total = pagination?.totalRegistros ?? viajes.length;

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface sticky top-0 border-b border-surface-variant z-10">
          <tr>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-4">
              Código
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Cliente
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Fecha/Hora
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Camiones
            </th>
            <th className="p-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pr-4">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="p-sm pl-4">
                    <div className="h-5 bg-surface-variant animate-pulse rounded" />
                  </td>
                </tr>
              ))
            : viajes.map((viaje) => (
                <tr
                  key={viaje.id_viaje}
                  onClick={() => onSelect(viaje)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                    selectedId === viaje.id_viaje
                      ? "border-l-primary-container bg-primary-fixed/20"
                      : "border-l-transparent"
                  }`}
                >
                  <td className="p-sm pl-4 font-label-md text-label-md text-on-surface">
                    {viaje.codigo_reserva_patio}
                  </td>
                  <td className="p-sm text-on-surface-variant">{viaje.nombre_cliente}</td>
                  <td className="p-sm text-on-surface-variant">
                    <div className="flex flex-col">
                      <span>
                        {new Date(viaje.fecha_hora_estimada).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(viaje.fecha_hora_estimada).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="p-sm text-on-surface-variant">{viaje.cantidad_camiones}</td>
                  <td className="p-sm pr-4">{estadoBadge(viaje.estado_viaje)}</td>
                </tr>
              ))}
          {!loading && viajes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-lg text-center text-on-surface-variant">
                No se encontraron viajes
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && total > 0 && (
        <div className="p-4 border-t border-surface-variant flex justify-between items-center bg-surface mt-auto">
          <span className="font-body-md text-body-md text-on-surface-variant">
            Mostrando {start}-{end} de {total} viajes
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={() =>
                onPageChange?.(Math.min(pagination.totalPaginas, pagination.page + 1))
              }
              disabled={pagination.page >= pagination.totalPaginas}
              className="p-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
