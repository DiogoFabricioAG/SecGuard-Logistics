import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WizardStepper } from "../components/WizardStepper";
import { ViajesTable } from "../components/ViajesTable";
import { Step1DatosRecogida } from "../components/Step1DatosRecogida";
import { Step2FechaHora } from "../components/Step2FechaHora";
import { Step3SeleccionFlota } from "../components/Step3SeleccionFlota";
import { Step4Confirmacion } from "../components/Step4Confirmacion";
import { useViajeWizard } from "../context/ViajeWizardContext";
import { getViajes, type Viaje } from "../services/viajesApi";
import { getPedidos as fetchPedidos, type Pedido as PedidoType } from "../services/pedidosApi";

const STEP_ROUTES: Record<number, string> = {
  1: "/flota/registrar-viaje",
  2: "/flota/registrar-viaje/fecha",
  3: "/flota/registrar-viaje/flota",
  4: "/flota/registrar-viaje/confirm",
};

function getStepFromPath(path: string): number {
  if (path.includes("/confirm")) return 4;
  if (path.includes("/flota")) return 3;
  if (path.includes("/fecha")) return 2;
  return 1;
}

export default function RegistrarViajeWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentStep = getStepFromPath(location.pathname);
  const { data, updateData } = useViajeWizard();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [selectedViajeId, setSelectedViajeId] = useState<number | null>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [showPedidoSelector, setShowPedidoSelector] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getViajes({ page: 1, limit: 8 })
      .then((res) => {
        if (!cancelled) {
          setViajes(res.data);
          setLoadingViajes(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingViajes(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (showPedidoSelector) {
      fetchPedidos({ page: 1, limit: 8 }).then((res) => setPedidos(res.data));
    }
  }, [showPedidoSelector]);

  function goToStep(step: number) {
    navigate(STEP_ROUTES[step] || STEP_ROUTES[1]);
  }

  function handleViajeSelect(viaje: Viaje) {
    setSelectedViajeId(viaje.id_viaje);
    setSelectedPedidoId(null);
  }

  function handleSelectPedido(pedido: PedidoType) {
    setSelectedPedidoId(pedido.id_pedido);
    updateData({
      id_pedido: pedido.id_pedido,
      codigo_reserva_patio: pedido.nro_orden_origen,
      guia_remision_ransa: "",
    });
    setShowPedidoSelector(false);
  }

  return (
    <div className="flex-1 p-lg overflow-hidden flex space-x-lg bg-background">
      <section className="w-[40%] bg-surface-lowest rounded-xl border border-surface-variant flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-lowest">
          <h2 className="font-headline-sm text-on-surface">Viajes Programados</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              className="pl-9 pr-4 py-1.5 border border-outline-variant bg-surface text-on-surface rounded-lg text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none w-64 placeholder:text-outline"
              placeholder="Buscar viajes..."
              type="text"
            />
          </div>
        </div>
        <ViajesTable
          viajes={viajes}
          selectedId={selectedViajeId}
          onSelect={handleViajeSelect}
          loading={loadingViajes}
        />
      </section>

      <section className="w-[60%] bg-surface-lowest rounded-xl border border-surface-variant flex flex-col overflow-hidden relative shadow-sm">
        <div className="p-lg border-b border-surface-variant bg-surface-lowest">
          <h2 className="font-headline-md text-on-surface mb-6">Registrar viaje esperado</h2>
          <WizardStepper currentStep={currentStep} />
        </div>

        {!data.id_pedido && !showPedidoSelector ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-lg bg-surface">
            <p className="text-on-surface-variant text-body-md">
              Seleccione un pedido para iniciar el registro del viaje.
            </p>
            <button
              onClick={() => setShowPedidoSelector(true)}
              className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
            >
              Seleccionar Pedido
            </button>
          </div>
        ) : showPedidoSelector ? (
          <div className="flex-1 overflow-auto p-lg bg-surface">
            <h3 className="font-headline-sm text-on-surface mb-4">Seleccione un pedido</h3>
            <div className="space-y-3">
              {pedidos.map((p) => (
                <div
                  key={p.id_pedido}
                  onClick={() => handleSelectPedido(p)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPedidoId === p.id_pedido
                      ? "border-primary-container bg-primary-fixed/20"
                      : "border-surface-variant bg-surface-lowest hover:border-primary-container"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-on-surface">{p.nro_orden_origen}</p>
                      <p className="text-on-surface-variant text-body-md">{p.nombre_cliente}</p>
                      <p className="text-on-surface-variant text-body-md">{p.direccion_entrega}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-on-surface">
                        {p.total_peso_kg.toLocaleString()} kg
                      </p>
                      <p className="text-on-surface-variant text-body-md">{p.total_bultos} bultos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : currentStep === 1 ? (
          <>
            {data.id_pedido && <Step1DatosRecogida pedidoId={data.id_pedido} />}
            <div className="p-4 border-t border-surface-variant bg-surface-lowest flex justify-between items-center shrink-0">
              <a
                href="/flota"
                onClick={(e) => { e.preventDefault(); navigate("/flota"); }}
                className="text-outline hover:text-on-surface-variant font-label-md px-4 py-2 transition-colors"
              >
                Cancelar
              </a>
              <div className="space-x-3 flex">
                <a
                  href="/flota"
                  onClick={(e) => { e.preventDefault(); navigate("/flota"); }}
                  className="bg-surface-lowest border border-surface-variant text-primary-container px-6 py-2 rounded font-label-md hover:bg-slate-50 transition-colors flex items-center"
                >
                  Atrás
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(2); }}
                  className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
                >
                  Siguiente Paso
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </>
        ) : currentStep === 2 ? (
          <>
            <Step2FechaHora data={data} onChange={updateData} />
            <div className="p-4 border-t border-surface-variant bg-surface-lowest flex justify-between items-center shrink-0">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); goToStep(1); }}
                className="text-outline hover:text-on-surface-variant font-label-md px-4 py-2 transition-colors"
              >
                Cancelar
              </a>
              <div className="space-x-3 flex">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(1); }}
                  className="bg-surface-lowest border border-surface-variant text-primary-container px-6 py-2 rounded font-label-md hover:bg-slate-50 transition-colors flex items-center"
                >
                  Atrás
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(3); }}
                  className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
                >
                  Siguiente Paso
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </>
        ) : currentStep === 3 ? (
          <>
            <Step3SeleccionFlota data={data} onChange={updateData} />
            <div className="p-4 border-t border-surface-variant bg-surface-lowest flex justify-between items-center shrink-0">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); goToStep(2); }}
                className="text-outline hover:text-on-surface-variant font-label-md px-4 py-2 transition-colors"
              >
                Cancelar
              </a>
              <div className="space-x-3 flex">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(2); }}
                  className="bg-surface-lowest border border-surface-variant text-primary-container px-6 py-2 rounded font-label-md hover:bg-slate-50 transition-colors flex items-center"
                >
                  Atrás
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(4); }}
                  className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
                >
                  Siguiente Paso
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <Step4Confirmacion data={data} />
            <div className="p-4 border-t border-surface-variant bg-surface-lowest flex justify-between items-center shrink-0">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); goToStep(3); }}
                className="text-outline hover:text-on-surface-variant font-label-md px-4 py-2 transition-colors"
              >
                Cancelar
              </a>
              <div className="space-x-3 flex">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); goToStep(3); }}
                  className="bg-surface-lowest border border-surface-variant text-primary-container px-6 py-2 rounded font-label-md hover:bg-slate-50 transition-colors flex items-center"
                >
                  Atrás
                </a>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
