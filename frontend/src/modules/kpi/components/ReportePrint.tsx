import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { ReporteData } from "../services/kpiApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const TIPOS_CARGA_META = ["REFRIGERADA", "SECA", "MATPEL", "GENERAL"];
const CARGA_COLORS = ["#4FC3F7", "#F39200", "#ba1a1a", "#2a6673"];

function formatearNumero(n: number) {
  return n.toLocaleString("es-PE");
}

function formatearFecha(dateStr: string) {
  if (!dateStr) return "--";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReportePrint({
  data,
  secciones,
  fechaInicio,
  fechaFin,
  zona,
  tipoUnidad,
  onReady,
}: {
  data: ReporteData;
  secciones: string[];
  fechaInicio: string;
  fechaFin: string;
  zona: string;
  tipoUnidad: string;
  onReady: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onReady();
    }, 500);
    return () => clearTimeout(timer);
  }, [onReady]);

  const kpiNombres = ["Disponibilidad", "Utilización", "Conversión", "Prevención"];
  const kpiPorcentajes = [
    data.disponibilidad?.porcentaje ?? 0,
    data.utilizacion?.porcentaje ?? 0,
    data.conversion?.porcentaje ?? 0,
    data.prevencion?.porcentaje ?? 0,
  ];
  const kpiColores = kpiPorcentajes.map(p =>
    p >= 70 ? "#009A3F" : p >= 40 ? "#F39200" : "#ba1a1a"
  );

  const barData = {
    labels: kpiNombres,
    datasets: [
      {
        label: "%",
        data: kpiPorcentajes,
        backgroundColor: kpiColores,
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: "#e2e2e3" } },
      x: { grid: { display: false } },
    },
  };

  const cargaItems = TIPOS_CARGA_META.map(t => {
    const item = data.carga?.find(c => c.tipo_carga === t);
    return item?.porcentaje ?? 0;
  });

  const doughnutData = {
    labels: TIPOS_CARGA_META,
    datasets: [
      {
        data: cargaItems,
        backgroundColor: CARGA_COLORS,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
      },
    },
  };

  return (
    <div ref={printRef} className="print-report">
      <div className="max-w-[210mm] mx-auto bg-white">
        <div className="text-center border-b-2 border-primary-container pb-4 mb-6">
          <h1 className="text-[22px] font-bold text-primary-container font-headline">
            SecGuard Logistics
          </h1>
          <p className="text-[13px] text-on-surface-variant">Reporte de KPIs Operativos</p>
          <p className="text-[11px] text-on-surface-variant">
            {formatearFecha(fechaInicio)} — {formatearFecha(fechaFin)}
            {zona ? ` · ${zona}` : ""}
            {tipoUnidad ? ` · ${tipoUnidad}` : ""}
          </p>
        </div>

        {secciones.some(s => ["disponibilidad", "utilizacion", "conversion", "prevencion"].includes(s)) && (
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold text-primary-container font-headline mb-3 uppercase tracking-wider">
              Indicadores Generales
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Disponibilidad", value: data.disponibilidad?.porcentaje ?? "--", detalle: data.disponibilidad ? `${data.disponibilidad.disponibles}/${data.disponibilidad.total}` : "" },
                { label: "Utilización", value: data.utilizacion?.porcentaje ?? "--", detalle: data.utilizacion ? `${data.utilizacion.activos}/${data.utilizacion.total}` : "" },
                { label: "Conversión", value: data.conversion?.porcentaje ?? "--", detalle: data.conversion ? `${data.conversion.activos}/${data.conversion.total}` : "" },
                { label: "Prevención", value: data.prevencion?.porcentaje ?? "--", detalle: data.prevencion ? `${data.prevencion.preventivos}/${data.prevencion.total}` : "" },
              ].map(k => (
                <div key={k.label} className="bg-surface rounded-lg border border-border-subtle p-3 text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{k.label}</p>
                  <p className="text-[24px] font-bold text-primary-container font-headline mt-1">
                    {typeof k.value === "number" ? `${k.value}%` : k.value}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">{k.detalle}</p>
                </div>
              ))}
            </div>
            <div className="h-[200px]">
              <Bar data={barData} options={barOptions} />
            </div>
            <style>{`
              @media print {
                .print-report { margin: 0; padding: 20px; }
                .print-report .grid { break-inside: avoid; }
              }
            `}</style>
          </div>
        )}

        {secciones.includes("clientes") && data.clientes && data.clientes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold text-primary-container font-headline mb-3 uppercase tracking-wider">
              Desempeño por Cliente
            </h2>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-surface-container">
                  <th className="p-2 border border-border-subtle">Cliente</th>
                  <th className="p-2 border border-border-subtle text-right">Pedidos</th>
                  <th className="p-2 border border-border-subtle text-right">Peso (kg)</th>
                  <th className="p-2 border border-border-subtle text-right">Bultos</th>
                  <th className="p-2 border border-border-subtle text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.clientes.map(c => (
                  <tr key={c.cliente}>
                    <td className="p-2 border border-border-subtle font-medium">{c.cliente}</td>
                    <td className="p-2 border border-border-subtle text-right">{formatearNumero(c.pedidos)}</td>
                    <td className="p-2 border border-border-subtle text-right">{formatearNumero(c.peso_total)}</td>
                    <td className="p-2 border border-border-subtle text-right">{formatearNumero(c.bultos_totales)}</td>
                    <td className="p-2 border border-border-subtle text-center">{c.estado_principal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {secciones.includes("carga") && data.carga && data.carga.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold text-primary-container font-headline mb-3 uppercase tracking-wider">
              Distribución por Tipo de Carga
            </h2>
            <div className="flex items-center gap-8">
              <div className="w-[220px] h-[220px]">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex-1 space-y-2">
                {TIPOS_CARGA_META.map((tipo, i) => {
                  const item = data.carga?.find(c => c.tipo_carga === tipo);
                  return (
                    <div key={tipo} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CARGA_COLORS[i] }} />
                      <span className="text-[12px] flex-1 text-on-surface">{tipo}</span>
                      <span className="text-[12px] font-semibold text-on-surface">{item ? `${item.porcentaje}%` : "0%"}</span>
                      <span className="text-[11px] text-on-surface-variant">({item ? formatearNumero(item.total) : "0"})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {secciones.includes("resumen") && data.resumen && (
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold text-primary-container font-headline mb-3 uppercase tracking-wider">
              Resumen del Período
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Pedidos", value: formatearNumero(data.resumen.total_pedidos) },
                { label: "Total Viajes", value: formatearNumero(data.resumen.total_viajes) },
                { label: "Peso Total (kg)", value: formatearNumero(data.resumen.peso_total) },
                { label: "Bultos Totales", value: formatearNumero(data.resumen.bultos_totales) },
              ].map(r => (
                <div key={r.label} className="bg-surface rounded-lg border border-border-subtle p-3 text-center">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{r.label}</p>
                  <p className="text-[18px] font-bold text-primary-container font-headline mt-1">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-outline border-t border-border-subtle pt-3 mt-6">
          Generado el {new Date().toLocaleString("es-PE")} · SecGuard Logistics
        </div>
      </div>
    </div>
  );
}
