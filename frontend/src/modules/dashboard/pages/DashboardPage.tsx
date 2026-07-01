import { useEffect, useState, useCallback } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  getKpiCabecera,
  getActividadSemanal,
  getMotivosDenegacion,
  getUltimosEventos,
  getEstadoSistema,
  type KpiCabecera,
  type ActividadSemanal,
  type MotivoDenegacion,
  type UltimoEvento,
  type EstadoSistema,
} from "../services/dashboardApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

function formatClock(now: Date) {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days[now.getDay()]}, ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()} — ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const DENEGACION_COLORS = ["#ba1a1a", "#fd9a12", "#96d0de", "#2a6673", "#F39200"];

function badgeClass(resultado: string) {
  if (resultado === "AUTORIZADO" || resultado === "Autorizado") return "bg-[#009a3f]/10 text-[#009a3f] border-[#009a3f]/20";
  if (resultado === "DENEGADO" || resultado === "Denegado") return "bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20";
  return "bg-[#96d0de]/10 text-[#2a6673] border-[#96d0de]/30";
}

export default function DashboardPage() {
  const [clock, setClock] = useState(formatClock(new Date()));

  const [kpi, setKpi] = useState<KpiCabecera | null>(null);
  const [actividad, setActividad] = useState<ActividadSemanal[]>([]);
  const [motivos, setMotivos] = useState<MotivoDenegacion[]>([]);
  const [eventos, setEventos] = useState<UltimoEvento[]>([]);
  const [sistema, setSistema] = useState<EstadoSistema | null>(null);

  useEffect(() => {
    const tick = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(tick);
  }, []);

  const cargarTodo = useCallback(async () => {
    const [k, a, m, e, s] = await Promise.all([
      getKpiCabecera().then(r => r.data).catch(() => null),
      getActividadSemanal().then(r => r.data).catch(() => []),
      getMotivosDenegacion().then(r => r.data).catch(() => []),
      getUltimosEventos().then(r => r.data).catch(() => []),
      getEstadoSistema().then(r => r.data).catch(() => null),
    ]);
    setKpi(k);
    setActividad(a);
    setMotivos(m);
    setEventos(e);
    setSistema(s);
  }, []);

  useEffect(() => {
    cargarTodo();
    const interval = setInterval(cargarTodo, 30000);
    return () => clearInterval(interval);
  }, [cargarTodo]);

  const barData = {
    labels: actividad.map(a => a.dia_semana),
    datasets: [
      {
        label: "Autorizados",
        data: actividad.map(a => a.total_autorizados),
        backgroundColor: "#00333c",
        borderRadius: 2,
        maxBarThickness: 24,
      },
      {
        label: "Denegados",
        data: actividad.map(a => a.total_denegados),
        backgroundColor: "#ba1a1a",
        borderRadius: 2,
        maxBarThickness: 24,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, datalabels: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#F1F5F9" }, ticks: { stepSize: 50 } },
      x: { grid: { display: false } },
    },
  };

  const doughnutData = {
    labels: motivos.map(m => m.tipo_motivo),
    datasets: [
      {
        data: motivos.map(m => m.porcentaje),
        backgroundColor: DENEGACION_COLORS.slice(0, motivos.length),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw}%` } },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" as const, size: 14 },
        formatter: (value: number) => `${value}%`,
        anchor: "center" as const,
        align: "center" as const,
      },
    },
  };

  return (
    <div className="p-lg overflow-y-auto flex flex-col gap-lg flex-1 min-h-0">
      <div className="flex items-center gap-lg">
        <h1 className="font-headline text-[20px] font-semibold text-on-surface">Dashboard Inicial</h1>
        <div className="flex items-center gap-1 text-on-surface-variant border border-border-subtle rounded-lg px-3 py-[5px] bg-surface">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span className="text-[13px] font-medium tabular-nums">{clock}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        <div className="bg-white p-lg rounded-xl border border-border-subtle">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Vehículos Hoy</span>
            {kpi && (
              <span className={`text-[10px] px-2 py-[2px] rounded-full font-bold ${kpi.var_pct_vehiculos >= 0 ? "bg-[#009a3f]/10 text-[#009a3f]" : "bg-error/10 text-error"}`}>
                {kpi.var_pct_vehiculos >= 0 ? "+" : ""}{kpi.var_pct_vehiculos}%
              </span>
            )}
          </div>
          <div className="font-headline text-[32px] font-bold text-primary-container">{kpi?.total_vehiculos ?? "--"}</div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-border-subtle">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Accesos Autorizados</span>
            {kpi && (
              <span className={`text-[10px] px-2 py-[2px] rounded-full font-bold ${kpi.var_pct_autorizados >= 0 ? "bg-[#009a3f]/10 text-[#009a3f]" : "bg-error/10 text-error"}`}>
                {kpi.var_pct_autorizados >= 0 ? "+" : ""}{kpi.var_pct_autorizados}%
              </span>
            )}
          </div>
          <div className="font-headline text-[32px] font-bold text-primary-container">{kpi?.total_autorizados ?? "--"}</div>
          <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="bg-[#009a3f] h-full rounded-full transition-all duration-700" style={{ width: kpi ? `${Math.min((kpi.total_autorizados / Math.max(kpi.total_vehiculos, 1)) * 100, 100)}%` : "0%" }} />
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-border-subtle">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Accesos Denegados</span>
            {kpi && (
              <span className={`text-[10px] px-2 py-[2px] rounded-full font-bold ${kpi.var_pct_denegados <= 0 ? "bg-[#009a3f]/10 text-[#009a3f]" : "bg-error/10 text-error"}`}>
                {kpi.var_pct_denegados >= 0 ? "+" : ""}{kpi.var_pct_denegados}%
              </span>
            )}
          </div>
          <div className="font-headline text-[32px] font-bold text-error">{kpi?.total_denegados ?? "--"}</div>
          <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="bg-error h-full rounded-full transition-all duration-700" style={{ width: kpi ? `${Math.min((kpi.total_denegados / Math.max(kpi.total_vehiculos, 1)) * 100, 100)}%` : "0%" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-8 bg-white p-lg rounded-xl border border-border-subtle">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-[20px] font-semibold">Actividad de Accesos — Últimos 7 días</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary-container" />
                <span className="text-[11px]">Autorizados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-[11px]">Denegados</span>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            {actividad.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-[13px]">Sin datos</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-lg rounded-xl border border-border-subtle flex flex-col">
          <h3 className="font-headline text-[20px] font-semibold mb-4">Motivos de Denegación</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {motivos.length > 0 ? (
              <>
                <div className="w-48 h-48">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <div className="mt-4 w-full space-y-3">
                  {motivos.map((m, i) => (
                    <div key={m.tipo_motivo} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DENEGACION_COLORS[i] }} />
                        <span className="text-[13px]">{m.tipo_motivo}</span>
                      </div>
                      <span className="text-[12px] font-semibold">{m.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-on-surface-variant text-[13px]">Sin datos</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle">
        <div className="px-lg py-md border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-headline text-[20px] font-semibold">Últimos Eventos de Acceso</h3>
          <span className="text-primary-container text-[12px] font-semibold flex items-center gap-1 cursor-pointer">
            Ver todo
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
        <div className="overflow-y-auto max-h-[340px]" style={{ overflowX: "auto" }}>
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] sticky top-0">
              <tr>
                <th className="px-lg py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Punto de Control</th>
                <th className="px-lg py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Placa</th>
                <th className="px-lg py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Empresa/Cliente</th>
                <th className="px-lg py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Fecha/Hora</th>
                <th className="px-lg py-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {eventos.length === 0 ? (
                <tr>
                  <td className="px-lg py-md text-center text-on-surface-variant" colSpan={5}>Sin datos</td>
                </tr>
              ) : (
                eventos.map((e, i) => (
                  <tr key={i} className="hover:bg-surface-container transition-colors">
                    <td className="px-lg py-3 text-[14px]">{e.punto_de_control}</td>
                    <td className="px-lg py-3 font-headline font-bold text-primary-container">{e.placa}</td>
                    <td className="px-lg py-3 text-[14px]">{e.empresa_cliente}</td>
                    <td className="px-lg py-3 text-[14px] text-on-surface-variant">
                      {new Date(e.fecha_hora).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-lg py-3">
                      <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${badgeClass(e.resultado)}`}>
                        {e.resultado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sistema && (
        <div className="bg-white rounded-xl border border-border-subtle p-lg">
          <h3 className="font-headline text-[20px] font-semibold mb-3">Estado del Sistema</h3>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#009a3f]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#009a3f]">check_circle</span>
              </div>
              <div>
                <p className="text-[12px] text-on-surface-variant">Uptime</p>
                <p className="font-headline text-[18px] font-bold text-primary-container">{sistema.uptime_pct}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">notifications_active</span>
              </div>
              <div>
                <p className="text-[12px] text-on-surface-variant">Alertas Activas</p>
                <p className="font-headline text-[18px] font-bold text-error">{sistema.alertas_activas}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
