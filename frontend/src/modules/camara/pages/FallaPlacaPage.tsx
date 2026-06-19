import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErroresLectura, type ErrorLectura } from "../services/monitoreoApi";

export default function FallaPlacaPage() {
  const [error, setError] = useState<ErrorLectura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getErroresLectura()
      .then((res) => {
        if (res.data.length > 0) setError(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#f8f9ff]">
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">
              Error de Identificación de Placa
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Monitoreo de accesos en tiempo real - Punto de Control Norte
            </p>
          </div>
          <Link
            to="/camara/registro-manual"
            className="bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span> Nuevo Registro
          </Link>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col flex-1 shadow-sm min-h-0">
          <div className="px-5 py-2.5 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xs text-primary">
              <span className="material-symbols-outlined text-primary text-lg">videocam</span>
              Captura en Vivo — Cámara 04
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="text-[10px] font-bold text-error uppercase tracking-wider">En Vivo</span>
            </div>
          </div>

          <div className="p-4 flex gap-6 flex-1 min-h-0">
            <div className="flex-[1.2] relative rounded-xl overflow-hidden border-[3px] border-error shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop')" }}
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-[100px] text-white/50 border-4 border-dashed border-white/20 rounded-full p-5 select-none">
                  no_photography
                </span>
              </div>
              <div className="relative z-20 w-full mt-auto">
                <div className="w-full bg-error py-3 px-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-xl">warning</span>
                  <span className="text-[11px] text-white font-bold uppercase tracking-widest">
                    Lectura Fallida — No se detecta objetivo
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-w-[320px]">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-error mb-2">
                  <span className="material-symbols-outlined text-xl">memory</span>
                  <h3 className="font-bold text-sm">Diagnóstico IA</h3>
                </div>
                <p className="text-primary font-bold text-sm mb-1">Error en motor de detección</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Baja visibilidad detectada. El sistema no pudo encontrar un área de placa válida en
                  el cuadro actual. Por favor, verifique la posición del vehículo.
                </p>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-1">
                Métricas de Fallo
              </h4>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">
                    progress_activity
                  </span>
                </div>
              ) : error ? (
                <div className="grid grid-cols-2 gap-3">
                  <ErrorDataCard label="Confianza OpenALPR">
                    <p className="text-2xl font-black text-error">{error.confianza_alpr}%</p>
                  </ErrorDataCard>
                  <ErrorDataCard label="Iluminación">
                    <p className="text-xl font-bold text-primary">{error.nivel_iluminacion}</p>
                  </ErrorDataCard>
                  <ErrorDataCard label="Obstrucción">
                    <p className="text-xl font-bold text-primary">{error.nivel_obstruccion}</p>
                  </ErrorDataCard>
                  <ErrorDataCard label="Latencia">
                    <p className="text-xl font-bold text-primary">{error.latencia_ms}ms</p>
                  </ErrorDataCard>
                </div>
              ) : (
                <p className="text-slate-400 text-sm px-1">Sin métricas disponibles</p>
              )}

              <Link
                to="/camara"
                className="w-full mt-auto bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                Reiniciar Escaneo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDataCard({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#eff4ff] p-3 rounded-[0.6rem] border border-[#e2e8f0]">
      {label && (
        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{label}</p>
      )}
      {children}
    </div>
  );
}
