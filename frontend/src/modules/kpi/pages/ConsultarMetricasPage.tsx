import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getDisponibilidadFlota,
  getUtilizacionFlota,
  getConversionViajes,
  getPrevencionMantenimiento,
  getDesempenoClientes,
  getDistribucionCarga,
  getResumenPeriodo,
  type FlotaKpi,
  type ConversionKpi,
  type PrevencionKpi,
  type ClienteRow,
  type CargaRow,
  type ResumenPeriodo,
} from "../services/kpiApi";

function formatearNumero(n: number) {
  return n.toLocaleString("es-PE");
}

export default function ConsultarMetricasPage() {
  const [zona, setZona] = useState("");
  const [vehiculo, setVehiculo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<FlotaKpi | null>(null);
  const [utilizacion, setUtilizacion] = useState<FlotaKpi | null>(null);
  const [conversion, setConversion] = useState<ConversionKpi | null>(null);
  const [prevencion, setPrevencion] = useState<PrevencionKpi | null>(null);
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [carga, setCarga] = useState<CargaRow[]>([]);
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);

  useEffect(() => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    setFechaInicio(haceUnMes.toISOString().slice(0, 10));
    setFechaFin(hoy.toISOString().slice(0, 10));
  }, []);

  const cargarTodo = useCallback(async () => {
    const fInicio = fechaInicio;
    const fFin = fechaFin;
    const v = vehiculo;
    const z = zona;

    const [d, u, c, p, cl, ca, r] = await Promise.all([
      getDisponibilidadFlota(v || undefined).then(r => r.data).catch(() => null),
      getUtilizacionFlota(v || undefined).then(r => r.data).catch(() => null),
      getConversionViajes(fInicio || undefined, fFin || undefined, v || undefined).then(r => r.data).catch(() => null),
      getPrevencionMantenimiento(fInicio || undefined, fFin || undefined, v || undefined).then(r => r.data).catch(() => null),
      getDesempenoClientes(fInicio || undefined, fFin || undefined, z || undefined).then(r => r.data).catch(() => [] as ClienteRow[]),
      getDistribucionCarga(fInicio || undefined, fFin || undefined).then(r => r.data).catch(() => [] as CargaRow[]),
      getResumenPeriodo(fInicio || undefined, fFin || undefined, z || undefined).then(r => r.data).catch(() => null),
    ]);
    setDisponibilidad(d);
    setUtilizacion(u);
    setConversion(c);
    setPrevencion(p);
    setClientes(cl);
    setCarga(ca);
    setResumen(r);
  }, [fechaInicio, fechaFin, vehiculo, zona]);

  useEffect(() => {
    if (fechaInicio && fechaFin) cargarTodo();
  }, [fechaInicio, fechaFin, cargarTodo]);

  function kpiBarColor(pct: number) {
    return pct >= 70 ? "bg-[#009A3F]" : pct >= 40 ? "bg-[#F39200]" : "bg-error";
  }

  function cargaColor(tipo: string) {
    const map: Record<string, string> = {
      REFRIGERADA: "#4FC3F7",
      SECA: "#F39200",
      MATPEL: "#ba1a1a",
      GENERAL: "#2a6673",
    };
    return map[tipo] || "#70787b";
  }

  const cargaMap = new Map(carga.map(c => [c.tipo_carga, c]));

  return (
    <div className="p-lg overflow-y-auto flex flex-col gap-lg h-full">
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm shrink-0">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Zona / Distrito</label>
            <select
              className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
              value={zona}
              onChange={e => setZona(e.target.value)}
            >
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
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Tipo de Vehículo</label>
            <select
              className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
              value={vehiculo}
              onChange={e => setVehiculo(e.target.value)}
            >
              <option value="">Todos los Vehículos</option>
              <option value="TRACTO_CAMION">Tracto Camión</option>
              <option value="CAMION_RIGIDO">Camión Rígido</option>
              <option value="FURGON">Furgón</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Fecha Inicio</label>
            <input
              type="date"
              className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Fecha Fin</label>
            <input
              type="date"
              className="bg-surface border border-outline-variant text-on-surface rounded text-[14px] px-3 py-2 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/analitica/generar-reporte"
              className="bg-white border border-border-subtle text-primary-container px-4 py-2 rounded text-[12px] font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Exportar
            </Link>
            <button
              className="bg-primary-container text-white px-5 py-2 rounded text-[12px] font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-sm"
              onClick={cargarTodo}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtrar Datos
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-md shrink-0">
        <KpiCard
          title="Disponibilidad de Flota"
          icon="local_shipping"
          value={disponibilidad ? `${disponibilidad.porcentaje}%` : "--"}
          label={disponibilidad ? `${disponibilidad.disponibles} disponibles / ${disponibilidad.total} total` : "--"}
          pct={disponibilidad?.porcentaje ?? 0}
          barColor={kpiBarColor(disponibilidad?.porcentaje ?? 0)}
          status={disponibilidad && disponibilidad.porcentaje >= 70 ? "Flota con buena disponibilidad" : "Baja disponibilidad de flota"}
        />
        <KpiCard
          title="Utilización de Flota"
          icon="local_shipping"
          value={utilizacion ? `${utilizacion.porcentaje}%` : "--"}
          label={utilizacion ? `${utilizacion.activos} activos / ${utilizacion.total} total` : "--"}
          pct={utilizacion?.porcentaje ?? 0}
          barColor={kpiBarColor(utilizacion?.porcentaje ?? 0)}
          status={utilizacion ? `${utilizacion.activos} camiones activos hoy` : "--"}
        />
        <KpiCard
          title="Conversión de Viajes"
          icon="route"
          iconColor="#F39200"
          value={conversion ? `${conversion.porcentaje}%` : "--"}
          label={conversion ? `${conversion.activos} activos / ${conversion.total} total` : "--"}
          pct={conversion?.porcentaje ?? 0}
          barColor="#F39200"
          status={conversion && conversion.porcentaje >= 60 ? "Ritmo operativo saludable" : "Muchos viajes pendientes de confirmar"}
        />
        <KpiCard
          title="Prevención de Mantenimiento"
          icon="build"
          value={prevencion ? `${prevencion.porcentaje}%` : "--"}
          label={prevencion ? `${prevencion.preventivos} preventivos / ${prevencion.total} total` : "--"}
          pct={prevencion?.porcentaje ?? 0}
          barColor={kpiBarColor(prevencion?.porcentaje ?? 0)}
          status={prevencion && prevencion.porcentaje >= 70 ? "Buena cultura de prevención" : "Exceso de mantenimientos correctivos"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border-subtle flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-white">
            <div>
              <h2 className="font-headline text-[20px] font-semibold text-on-surface">Desempeño por Cliente</h2>
              <p className="text-[14px] text-on-surface-variant mt-0.5">Últimos 30 días · {zona || "Todas las zonas"}</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr>
                  <th className="p-3 pl-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle">Cliente</th>
                  <th className="p-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle text-right">Pedidos</th>
                  <th className="p-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle text-right">Peso Total (kg)</th>
                  <th className="p-3 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle text-right">Bultos Totales</th>
                  <th className="p-3 pr-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle text-center">Estado Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-[14px]">
                {clientes.length === 0 ? (
                  <tr>
                    <td className="p-3 pl-4 text-center text-on-surface-variant" colSpan={5}>Sin datos</td>
                  </tr>
                ) : (
                  clientes.map(c => (
                    <tr key={c.cliente} className="hover:bg-surface-container transition-colors">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-container text-[18px]">business</span>
                          <div>
                            <div className="font-semibold text-on-surface">{c.cliente}</div>
                            <div className="text-[11px] text-on-surface-variant">{c.estado_principal}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold text-on-surface">{c.pedidos}</td>
                      <td className="p-3 text-right text-on-surface">{formatearNumero(c.peso_total)}</td>
                      <td className="p-3 text-right text-on-surface">{formatearNumero(c.bultos_totales)}</td>
                      <td className="p-3 pr-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${c.color_badge} text-[11px] font-medium border`}>
                          {c.estado_principal}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-center border-t border-border-subtle bg-white hover:bg-surface-container cursor-pointer transition-colors">
            <span className="text-[12px] font-semibold text-primary-container">Ver todos los clientes →</span>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-border-subtle flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border-subtle">
            <h2 className="font-headline text-[20px] font-semibold text-on-surface">Distribución por Tipo de Carga</h2>
            <p className="text-[14px] text-on-surface-variant mt-0.5">Volumen por tipo · período seleccionado</p>
          </div>
          <div className="p-4 flex flex-col gap-5 overflow-y-auto flex-1">
            {["REFRIGERADA", "SECA", "MATPEL", "GENERAL"].map(tipo => {
              const item = cargaMap.get(tipo);
              const pct = item?.porcentaje ?? 0;
              const color = cargaColor(tipo);
              return (
                <div key={tipo} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ color, fontSize: 18 }}>{tipo === "REFRIGERADA" ? "ac_unit" : tipo === "SECA" ? "dry" : tipo === "MATPEL" ? "warning" : "inventory_2"}</span>
                      <span className="text-[12px] font-semibold text-on-surface">{tipo}</span>
                    </div>
                    <span className="font-headline text-[20px] font-semibold" style={{ color }}>{item ? `${pct}%` : "--"}</span>
                  </div>
                  <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                    <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {tipo === "REFRIGERADA" ? "Carga que requiere cadena de frío activa" :
                     tipo === "SECA" ? "Productos secos, no perecibles, temperatura ambiente" :
                     tipo === "MATPEL" ? "Materiales peligrosos: pinturas, solventes, adhesivos" :
                     "Carga general, limpieza, higiene, bebidas estándar"}
                  </p>
                </div>
              );
            })}
            <div className="border-t border-border-subtle pt-4 mt-2">
              <h3 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider mb-3">Resumen del Período</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Total pedidos</span>
                  <span className="text-[12px] font-semibold text-on-surface">{resumen ? formatearNumero(resumen.total_pedidos) : "--"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Total viajes</span>
                  <span className="text-[12px] font-semibold text-on-surface">{resumen ? formatearNumero(resumen.total_viajes) : "--"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Peso total</span>
                  <span className="text-[12px] font-semibold text-on-surface">{resumen ? `${formatearNumero(resumen.peso_total)} kg` : "--"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Bultos totales</span>
                  <span className="text-[12px] font-semibold text-on-surface">{resumen ? formatearNumero(resumen.bultos_totales) : "--"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  icon,
  iconColor,
  value,
  label,
  pct,
  barColor,
  status,
}: {
  title: string;
  icon: string;
  iconColor?: string;
  value: string;
  label: string;
  pct: number;
  barColor: string;
  status: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{title}</span>
        <span className="material-symbols-outlined text-[20px]" style={{ color: iconColor || "#00333c" }}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-headline text-[32px] font-bold text-primary-container">{value}</span>
      </div>
      <p className="text-[12px] font-semibold text-on-surface">{label}</p>
      <div className="mt-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-on-surface-variant">{label}</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
        </div>
      </div>
      <p className="text-[11px] text-on-surface-variant">{status}</p>
    </div>
  );
}
