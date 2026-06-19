import { useState, useEffect, useCallback } from "react";
import { generarReporte, type ReporteData } from "../services/kpiApi";
import ReportePrint from "../components/ReportePrint";

const NOMBRES_SECCION: Record<string, string> = {
  disponibilidad: "Disponibilidad de Flota",
  utilizacion: "Utilización de Flota",
  conversion: "Conversión de Viajes",
  prevencion: "Prevención de Mantenimiento",
  clientes: "Desempeño por Cliente",
  carga: "Distribución por Tipo de Carga",
  resumen: "Resumen del Período",
};

const TIPOS_REPORTE: Record<string, string> = {
  completo: "Reporte Completo",
  flota: "Estado de Flota",
  carga: "Operaciones y Carga",
  viajes: "Gestión de Viajes",
};

const SECCIONES_POR_TIPO: Record<string, string[]> = {
  completo: ["disponibilidad", "utilizacion", "conversion", "prevencion", "clientes", "carga", "resumen"],
  flota: ["disponibilidad", "utilizacion", "prevencion"],
  carga: ["clientes", "carga", "resumen"],
  viajes: ["conversion", "resumen"],
};

type Formato = "pdf" | "excel" | "csv";

export default function GenerarReportePage() {
  const [tipo, setTipo] = useState("completo");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [zona, setZona] = useState("");
  const [tipoUnidad, setTipoUnidad] = useState("");
  const [secciones, setSecciones] = useState<string[]>([...SECCIONES_POR_TIPO.completo]);
  const [formato, setFormato] = useState<Formato>("pdf");
  const [nombre, setNombre] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [stepState, setStepState] = useState<Record<string, "pending" | "done" | "active">>({});
  const [reporteData, setReporteData] = useState<ReporteData | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const handlePrintReady = useCallback(() => {
    window.print();
    setTimeout(() => setShowPrintReport(false), 1000);
  }, []);

  useEffect(() => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    setFechaInicio(haceUnMes.toISOString().slice(0, 10));
    setFechaFin(hoy.toISOString().slice(0, 10));
    setNombre(`Reporte_${hoy.toISOString().slice(0, 7).replace("-", "_")}`);
  }, []);

  useEffect(() => {
    setSecciones(SECCIONES_POR_TIPO[tipo] || []);
  }, [tipo]);

  function toggleSeccion(val: string) {
    setSecciones(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  }

  function todasSeleccionadas() {
    return secciones.length === Object.keys(NOMBRES_SECCION).length;
  }

  function toggleTodas() {
    if (todasSeleccionadas()) {
      setSecciones([]);
    } else {
      setSecciones(Object.keys(NOMBRES_SECCION));
    }
  }

  function formatearFecha(dateStr: string) {
    if (!dateStr) return "--";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  }

  const steps = [
    { id: "data", label: "Consultando datos operativos", pct: 20 },
    { id: "kpis", label: "Calculando indicadores", pct: 50 },
    { id: "charts", label: "Generando contenido del reporte", pct: 80 },
    { id: "export", label: "Preparando archivo para descarga", pct: 100 },
  ];

  async function handleGenerar() {
    if (secciones.length === 0) {
      alert("Selecciona al menos una sección para generar el reporte.");
      return;
    }

    setModalVisible(true);
    setReporteData(null);
    setProgressPct(0);
    setProgressLabel("Consultando datos operativos…");
    setStepState({});

    await runSteps(0);
  }

  async function runSteps(i: number) {
    if (i >= steps.length) {
      setProgressLabel("¡Reporte listo!");
      return;
    }

    const s = steps[i];
    if (i > 0) {
      setStepState(prev => ({ ...prev, [steps[i - 1].id]: "done" }));
    }
    setStepState(prev => ({ ...prev, [s.id]: "active" }));
    setProgressPct(s.pct);
    setProgressLabel(`${s.label}…`);

    if (i === 1) {
      try {
        const res = await generarReporte({
          secciones,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
          zona: zona || undefined,
          tipo_unidad: tipoUnidad || undefined,
        });
        setReporteData(res.data);
      } catch (e) {
        console.error("Error al generar reporte", e);
      }
    }

    if (i === steps.length - 1 && reporteData) {
      descargarReporte();
    }

    setTimeout(() => runSteps(i + 1), 400);
  }

  function descargarReporte() {
    if (formato === "pdf") {
      setShowPrintReport(true);
      return;
    }
    const csv = generarCSV();
    const fileName = (nombre || "Reporte") + ".csv";
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generarCSV(): string {
    const lineas: string[] = [];
    const sep = ";";

    lineas.push("SecGuard Logistics - Reporte de KPIs");
    lineas.push(`Tipo;${TIPOS_REPORTE[tipo] || tipo}`);
    lineas.push(`Período;${fechaInicio || ""} - ${fechaFin || ""}`);
    lineas.push(`Generado;${new Date().toLocaleString("es-PE")}`);
    lineas.push("");

    for (const sec of secciones) {
      const d = reporteData;
      switch (sec) {
        case "disponibilidad":
          if (d?.disponibilidad) {
            lineas.push("DISPONIBILIDAD DE FLOTA");
            lineas.push("Indicador;Valor");
            lineas.push(`Porcentaje Disponible;${d.disponibilidad.porcentaje || 0}%`);
            lineas.push(`Vehículos Disponibles;${d.disponibilidad.disponibles || 0}`);
            lineas.push(`Total Flota;${d.disponibilidad.total || 0}`);
            lineas.push("");
          }
          break;
        case "utilizacion":
          if (d?.utilizacion) {
            lineas.push("UTILIZACIÓN DE FLOTA");
            lineas.push("Indicador;Valor");
            lineas.push(`Porcentaje Activos;${d.utilizacion.porcentaje || 0}%`);
            lineas.push(`Vehículos Activos;${d.utilizacion.activos || 0}`);
            lineas.push(`Total Flota;${d.utilizacion.total || 0}`);
            lineas.push("");
          }
          break;
        case "conversion":
          if (d?.conversion) {
            lineas.push("CONVERSIÓN DE VIAJES");
            lineas.push("Indicador;Valor");
            lineas.push(`Porcentaje Activos;${d.conversion.porcentaje || 0}%`);
            lineas.push(`Viajes Activos;${d.conversion.activos || 0}`);
            lineas.push(`Total Viajes;${d.conversion.total || 0}`);
            lineas.push("");
          }
          break;
        case "prevencion":
          if (d?.prevencion) {
            lineas.push("PREVENCIÓN DE MANTENIMIENTO");
            lineas.push("Indicador;Valor");
            lineas.push(`Porcentaje Preventivos;${d.prevencion.porcentaje || 0}%`);
            lineas.push(`Mant. Preventivos;${d.prevencion.preventivos || 0}`);
            lineas.push(`Mant. Correctivos;${d.prevencion.correctivos || 0}`);
            lineas.push(`Total Mantenimientos;${d.prevencion.total || 0}`);
            lineas.push("");
          }
          break;
        case "clientes":
          if (d?.clientes && d.clientes.length > 0) {
            lineas.push("DESEMPEÑO POR CLIENTE");
            lineas.push("Cliente;Pedidos;Peso Total (kg);Bultos Totales;Estado Principal");
            for (const c of d.clientes) {
              lineas.push(`${c.cliente || ""}${sep}${c.pedidos || 0}${sep}${c.peso_total || 0}${sep}${c.bultos_totales || 0}${sep}${c.estado_principal || ""}`);
            }
            lineas.push("");
          }
          break;
        case "carga":
          if (d?.carga && d.carga.length > 0) {
            lineas.push("DISTRIBUCIÓN POR TIPO DE CARGA");
            lineas.push("Tipo de Carga;Total;Porcentaje");
            for (const c of d.carga) {
              lineas.push(`${c.tipo_carga || ""}${sep}${c.total || 0}${sep}${c.porcentaje || 0}%`);
            }
            lineas.push("");
          }
          break;
        case "resumen":
          if (d?.resumen) {
            lineas.push("RESUMEN DEL PERÍODO");
            lineas.push("Indicador;Valor");
            lineas.push(`Total Pedidos;${d.resumen.total_pedidos || 0}`);
            lineas.push(`Total Viajes;${d.resumen.total_viajes || 0}`);
            lineas.push(`Peso Total (kg);${d.resumen.peso_total || 0}`);
            lineas.push(`Bultos Totales;${d.resumen.bultos_totales || 0}`);
            lineas.push("");
          }
          break;
      }
    }

    return lineas.join("\n");
  }

  function closeModal() {
    setModalVisible(false);
    setTimeout(resetSteps, 200);
  }

  function resetSteps() {
    setProgressPct(0);
    setProgressLabel("Consultando datos operativos…");
    setStepState({});
  }

  const nSecciones = secciones.length;

  return (
    <div className="p-lg overflow-y-auto overflow-x-hidden bg-surface h-full">
      <div className="flex flex-col gap-lg max-w-full">
        <div className="grid grid-cols-3 gap-md">
          <div className="col-span-2 flex flex-col gap-md">
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">description</span>
                </div>
                <h2 className="font-headline text-[16px] font-semibold text-on-surface">Tipo de Reporte y Período</h2>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Seleccionar Tipo</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "completo", icon: "summarize", label: "Reporte Completo", desc: "Todos los KPIs operativos" },
                      { value: "flota", icon: "local_shipping", label: "Estado de Flota", desc: "Disponibilidad y mantenimiento" },
                      { value: "carga", icon: "inventory_2", label: "Operaciones y Carga", desc: "Clientes y tipo de carga" },
                      { value: "viajes", icon: "route", label: "Gestión de Viajes", desc: "Conversión y resumen" },
                    ].map(opt => (
                      <label key={opt.value} className="relative cursor-pointer group">
                        <input type="radio" name="report_type" value={opt.value} className="sr-only peer" checked={tipo === opt.value} onChange={() => setTipo(opt.value)} />
                        <div className="peer-checked:border-primary-container peer-checked:bg-primary-fixed/10 border-2 border-surface-variant rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-outline-variant transition-colors">
                          <span className="material-symbols-outlined text-primary-container text-[28px]">{opt.icon}</span>
                          <span className="text-[12px] font-semibold text-on-surface">{opt.label}</span>
                          <span className="text-[11px] font-medium text-on-surface-variant">{opt.desc}</span>
                        </div>
                        <div className="absolute top-2 right-2 hidden peer-checked:flex w-5 h-5 rounded-full bg-primary-container items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Fecha Inicio</label>
                    <input type="date" className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Fecha Fin</label>
                    <input type="date" className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Zona / Distrito</label>
                    <select className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" value={zona} onChange={e => setZona(e.target.value)}>
                      <option value="">Todas las Zonas</option>
                      <option>Callao</option>
                      <option>Huachipa</option>
                      <option>San Juan de Lurigancho</option>
                      <option>Ate Vitarte</option>
                      <option>Villa El Salvador</option>
                      <option>Santa Anita</option>
                      <option>Lurín</option>
                      <option>Ventanilla</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Tipo de Vehículo</label>
                    <select className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" value={tipoUnidad} onChange={e => setTipoUnidad(e.target.value)}>
                      <option value="">Todos los Vehículos</option>
                      <option value="TRACTO_CAMION">Tracto Camión</option>
                      <option value="CAMION_RIGIDO">Camión Rígido</option>
                      <option value="FURGON">Furgón</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">checklist</span>
                  </div>
                  <h2 className="font-headline text-[16px] font-semibold text-on-surface">Secciones a Incluir</h2>
                </div>
                <button className="text-[12px] font-semibold text-primary-container hover:underline" onClick={toggleTodas}>
                  {todasSeleccionadas() ? "Deseleccionar todo" : "Seleccionar todo"}
                </button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(NOMBRES_SECCION).map(([key, label]) => (
                    <label key={key} className="flex items-start gap-3 p-3 rounded-lg border border-surface-variant hover:bg-surface-container cursor-pointer transition-colors">
                      <input type="checkbox" className="report-checkbox mt-0.5 w-4 h-4 rounded border-outline-variant" checked={secciones.includes(key)} onChange={() => toggleSeccion(key)} />
                      <div>
                        <div className="text-[12px] font-semibold text-on-surface">{label}</div>
                        <div className="text-[11px] font-medium text-on-surface-variant">
                          {key === "disponibilidad" ? "% vehículos disponibles" :
                           key === "utilizacion" ? "% vehículos activos" :
                           key === "conversion" ? "% viajes activos" :
                           key === "prevencion" ? "% preventivos vs correctivos" :
                           key === "clientes" ? "Pedidos, peso y bultos" :
                           key === "carga" ? "% REFRIGERADA, SECA, MATPEL, GENERAL" :
                           "Pedidos, viajes, peso, bultos"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">send</span>
                </div>
                <h2 className="font-headline text-[16px] font-semibold text-on-surface">Formato y Entrega</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Formato de Salida</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "pdf" as Formato, icon: "picture_as_pdf", color: "#ba1a1a", label: "PDF", desc: "Documento para imprimir" },
                      { value: "excel" as Formato, icon: "table_chart", color: "#009A3F", label: "CSV (Excel)", desc: "Datos separados por comas" },
                      { value: "csv" as Formato, icon: "data_array", color: "#70787b", label: "CSV", desc: "Datos en texto plano" },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-surface-variant hover:bg-surface-container cursor-pointer transition-colors">
                        <input type="radio" name="format" value={opt.value} className="w-4 h-4" style={{ accentColor: "#00333c" }} checked={formato === opt.value} onChange={() => setFormato(opt.value)} />
                        <span className="material-symbols-outlined text-[20px]" style={{ color: opt.color }}>{opt.icon}</span>
                        <div>
                          <div className="text-[12px] font-semibold text-on-surface">{opt.label}</div>
                          <div className="text-[11px] font-medium text-on-surface-variant">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Método de Entrega</p>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="report-checkbox w-4 h-4 rounded border-outline-variant" checked readOnly />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">download</span>
                        <span className="text-[14px] text-on-surface">Descargar directamente</span>
                      </div>
                    </label>
                    <div className="pt-2 border-t border-border-subtle">
                      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Nombre del archivo</p>
                      <input type="text" className="w-full bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-2">
              <a href="/analitica" className="text-outline hover:text-on-surface-variant text-[12px] font-semibold px-4 py-2 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Cancelar
              </a>
              <div className="flex gap-3">
                <button className="bg-white border border-outline-variant text-primary-container px-5 py-2 rounded text-[12px] font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors" onClick={() => {}}>
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Vista Previa
                </button>
                <button onClick={handleGenerar} className="bg-primary-container text-on-primary px-6 py-2 rounded text-[12px] font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">summarize</span>
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col gap-md">
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">preview</span>
                </div>
                <h2 className="font-headline text-[16px] font-semibold text-on-surface">Resumen del Reporte</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="bg-primary-fixed/10 border border-primary-fixed/30 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-medium text-on-surface-variant">Tipo</span>
                    <span className="text-[11px] font-medium text-on-surface">{TIPOS_REPORTE[tipo]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-medium text-on-surface-variant">Período</span>
                    <span className="text-[11px] font-medium text-on-surface">{fechaInicio ? `${formatearFecha(fechaInicio)} — ${formatearFecha(fechaFin)}` : "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-medium text-on-surface-variant">Secciones</span>
                    <span className="text-[11px] font-medium text-on-surface">{nSecciones} seleccionada{nSecciones !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-medium text-on-surface-variant">Formato</span>
                    <span className="text-[11px] font-medium text-on-surface">{formato.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-medium text-on-surface-variant">Nombre</span>
                    <span className="text-[11px] font-medium text-on-surface">{nombre || "Sin nombre"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Secciones incluidas</p>
                  <div className="flex flex-wrap gap-1">
                    {nSecciones === 0 ? (
                      <span className="text-[11px] text-on-surface-variant">Ninguna sección seleccionada</span>
                    ) : (
                      secciones.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container text-[10px] font-medium border border-primary-container/20">
                          {NOMBRES_SECCION[s] || s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-border-subtle shadow-xl w-[420px] overflow-hidden">
            <div className="bg-primary-container px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[22px]">
                  {reporteData ? "check_circle" : "summarize"}
                </span>
              </div>
              <div>
                <div className="font-headline text-[18px] font-semibold text-on-primary">
                  {reporteData ? "Reporte Generado" : "Generando Reporte…"}
                </div>
                <div className="text-[11px] font-medium text-on-primary/70">
                  {reporteData ? nombre || "reporte" : "Procesando datos del período seleccionado"}
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] font-medium text-on-surface-variant">{progressLabel}</span>
                  <span className="text-[12px] font-semibold text-primary-container">{progressPct}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {steps.map(s => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]" style={{
                      color: stepState[s.id] === "done" ? "#009A3F" : stepState[s.id] === "active" ? "#00333c" : undefined,
                    }}>
                      {stepState[s.id] === "done" ? "check_circle" : stepState[s.id] === "active" ? "pending" : "radio_button_unchecked"}
                    </span>
                    <span className={`text-[14px] ${stepState[s.id] === "active" ? "text-primary-container font-medium" : stepState[s.id] === "done" ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {reporteData && (
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={closeModal} className="flex-1 bg-white border border-outline-variant text-primary-container py-2 rounded text-[12px] font-semibold hover:bg-surface-container transition-colors">
                  Cerrar
                </button>
                <button onClick={descargarReporte} className="flex-1 bg-primary-container text-on-primary py-2 rounded text-[12px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar {formato === "pdf" ? "PDF" : "CSV"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPrintReport && reporteData && (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
          <ReportePrint
            data={reporteData}
            secciones={secciones}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            zona={zona}
            tipoUnidad={tipoUnidad}
            onReady={handlePrintReady}
          />
        </div>
      )}

      <style>{`
        .report-checkbox:checked { accent-color: #00333c; }
        @media print {
          body * { visibility: hidden; }
          .print-report, .print-report * { visibility: visible; }
          .print-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
