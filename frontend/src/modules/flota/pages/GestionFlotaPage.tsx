import { useState, useEffect, useRef } from "react";
import { CamionesTable } from "../components/CamionesTable";
import { CamionDetailPanel } from "../components/CamionDetailPanel";
import {
  getCamiones,
  type Camion,
} from "../services/camionesApi";

const FILTROS_ESTADO = [
  { label: "Todos los Vehículos", value: "" },
  { label: "Disponible", value: "DISPONIBLE" },
  { label: "En Ruta", value: "EN_RUTA" },
  { label: "Mantenimiento", value: "EN_MANTENIMIENTO" },
];

const FILTROS_TIPO = [
  { label: "Tipo de Vehículo", value: "" },
  { label: "Carga Pesada", value: "CARGA_PESADA" },
  { label: "Carga Media", value: "CARGA_MEDIA" },
  { label: "Comercial Ligero", value: "COMERCIAL_LIGERO" },
];

export default function GestionFlotaPage() {
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getCamiones({
      page,
      limit: 8,
      estado_operativo: estadoFilter || undefined,
      clasificacion_peso: tipoFilter || undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setCamiones(res.data);
          setTotalPaginas(res.pagination?.totalPaginas ?? 1);
          setTotalRegistros(res.pagination?.totalRegistros ?? 0);
          if (res.data.length > 0 && selectedIdRef.current === null) {
            setSelectedId(res.data[0].id_camion);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setCamiones([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, estadoFilter, tipoFilter]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  function handleEstadoClick(valor: string) {
    setEstadoFilter(valor);
    setPage(1);
    setSelectedId(null);
  }

  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      <div className="flex-1 flex flex-col h-full bg-background border-r border-surface-variant overflow-y-auto">
        <div className="p-lg">
          <div className="flex items-center justify-between mb-lg bg-surface-lowest p-4 rounded-xl border border-surface-variant shadow-sm">
            <div className="flex gap-4">
              {FILTROS_ESTADO.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleEstadoClick(f.value)}
                  className={`px-4 py-2 rounded font-label-md text-label-md shadow-sm transition-colors ${
                    estadoFilter === f.value
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface text-on-surface border border-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <select
                value={tipoFilter}
                onChange={(e) => {
                  setTipoFilter(e.target.value);
                  setPage(1);
                  setSelectedId(null);
                }}
                className="bg-surface text-on-surface border border-surface-variant rounded pr-10 py-2 font-label-md text-label-md focus:border-primary-container focus:ring-0"
              >
                {FILTROS_TIPO.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-surface-variant hover:bg-surface-variant rounded font-label-md text-label-md transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filtrar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary-container">
                progress_activity
              </span>
            </div>
          ) : (
            <CamionesTable
              camiones={camiones}
              selectedId={selectedId}
              onSelect={(c) => setSelectedId(c.id_camion)}
              pagination={{
                page,
                totalPaginas,
                totalRegistros,
                limit: 8,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {selectedId && <CamionDetailPanel camionId={selectedId} />}
    </div>
  );
}
