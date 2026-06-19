import { useEffect, useState } from "react";
import { getAccesosDecision, type AccesoDecision } from "../services/monitoreoApi";

type FilterEvento = "TODOS" | "ENTRADA" | "SALIDA";

export default function AccesosPage() {
  const [accesos, setAccesos] = useState<AccesoDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEvento, setFilterEvento] = useState<FilterEvento>("TODOS");
  const [filterModelo, setFilterModelo] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const tipoEvento = filterEvento === "TODOS" ? "ENTRADA,SALIDA" : filterEvento;
    getAccesosDecision({
      decision_acceso: "AUTORIZADO",
      tipo_evento: tipoEvento,
      estado_barrera: "ABIERTO",
    })
      .then((res) => {
        const data = filterModelo
          ? res.data.filter((a) => a.modelo.toLowerCase().includes(filterModelo.toLowerCase()))
          : res.data;
        setAccesos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterEvento, filterModelo]);

  const selected = accesos.find((a) => a.id_acceso === selectedId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9ff]">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-primary">Aceptar Acceso Vehicular</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Gestión de Puntos de Control / Registro de Entradas
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#007236] font-bold text-[9px] bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-[#007236] rounded-full animate-pulse" />
              SISTEMA ACTIVO
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-white border border-slate-100 rounded-lg p-1">
              {(["TODOS", "ENTRADA", "SALIDA"] as FilterEvento[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterEvento(f)}
                  className={`px-4 py-1.5 text-[10px] font-bold transition-colors rounded-md ${
                    filterEvento === f
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {f === "TODOS" ? "Todos" : f === "ENTRADA" ? "Entrada" : "Salida"}
                </button>
              ))}
            </div>
            <select
              value={filterModelo}
              onChange={(e) => setFilterModelo(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-bold"
            >
              <option value="">Filtrar por Modelo</option>
              {[...new Set(accesos.map((a) => a.modelo))].map((m) => (
                <option key={m} value={m} className="text-slate-800">{m}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  {["VEHÍCULO / ID", "MODELO", "PLACA", "TIPO / CAP", "DIRECCIÓN", "ESTADO", "FECHA / HORA", "ACCIÓN"].map((h) => (
                    <th key={h} className="text-[10px] text-slate-500 uppercase tracking-wider px-2.5 py-3 text-left border-b border-slate-100 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">Cargando...</td></tr>
                ) : accesos.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">No hay registros</td></tr>
                ) : (
                  accesos.map((a) => (
                    <tr
                      key={`acc-${a.id_acceso}`}
                      onClick={() => setSelectedId(selectedId === a.id_acceso ? null : a.id_acceso)}
                      className={`cursor-pointer transition-colors ${
                        selectedId === a.id_acceso
                          ? "bg-[#f1f9f4] border-l-4 border-l-[#007236]"
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="px-2.5 py-3 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#f0f4ff] rounded-md flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">local_shipping</span>
                          </div>
                          <div>
                            <div className="font-bold text-[#007236] text-[12px]">{a.modelo || "—"}</div>
                            <div className="text-[9px] text-slate-400 font-bold">{a.id_camion ? `VH-${a.id_camion}` : "Manual"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-3 border-b border-slate-50 font-bold text-slate-600 text-[11px]">{a.modelo || "—"}</td>
                      <td className="px-2.5 py-3 border-b border-slate-50 font-black text-primary text-[12px]">{a.placa_detectada_alpr}</td>
                      <td className="px-2.5 py-3 border-b border-slate-50 text-slate-400 font-bold text-[11px]">
                        {a.tipo_vehiculo ? `${a.tipo_vehiculo} / ${a.capacidad_toneladas}T` : "—"}
                      </td>
                      <td className="px-2.5 py-3 border-b border-slate-50 text-slate-500 font-bold text-[11px]">{a.tipo_evento}</td>
                      <td className="px-2.5 py-3 border-b border-slate-50">
                        <span className="bg-[#75f999] text-[#007236] font-black text-[8px] px-3 py-1 rounded-full">
                          {a.estado_registro}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 border-b border-slate-50 text-slate-400 font-bold text-[10px]">
                        {new Date(a.fecha_hora_registro).toLocaleDateString("es-PE")}
                        <br />
                        <span className="font-medium">
                          {new Date(a.fecha_hora_registro).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 border-b border-slate-50 text-center">
                        <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">visibility</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="p-4 border-t border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                Sincronizado con el sistema
              </div>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                Mostrando {accesos.length} registros
              </p>
            </div>
          </div>
        </main>

        {selected && (
          <aside className="w-[320px] bg-white border-l border-slate-100 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-primary text-sm">Detalle de Ingreso</h3>
              <button onClick={() => setSelectedId(null)} className="material-symbols-outlined text-slate-300 cursor-pointer">close</button>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-video shadow-sm border border-slate-100">
              {selected.url_foto_captura ? (
                <img src={selected.url_foto_captura} alt="Captura ALPR" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-3xl text-slate-300">no_photography</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Sin captura</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[8px] px-2 py-1 rounded font-bold">
                {selected.modelo || "Sin modelo"} · {selected.tipo_vehiculo || "Sin clasificación"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Placa</p>
                <p className="text-sm font-black text-primary">{selected.placa_detectada_alpr}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Modelo</p>
                <p className="text-[11px] font-black text-primary">{selected.modelo}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">Flujo de Acción</p>
              <div className="space-y-8 relative ml-2">
                <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-slate-100" />
                <div className="flex gap-5 relative">
                  <div className="w-5 h-5 rounded-full bg-[#007236] flex items-center justify-center z-10 shadow-sm">
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary leading-tight">Control de Seguridad</p>
                    <p className="text-[11px] text-[#007236] font-semibold">Validado por Biométrica</p>
                  </div>
                </div>
                <div className="flex gap-5 relative">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center z-10 shadow-sm">
                    <span className="material-symbols-outlined text-amber-600 text-[12px] font-bold">bolt</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary leading-tight">Acción Ejecutada</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Apertura de barrera · Exitosa</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <button className="w-full bg-primary text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                <span className="material-symbols-outlined text-sm">print</span> Imprimir Ticket
              </button>
              <button className="w-full border border-slate-100 text-slate-400 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50">
                Ver Registro Completo
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
