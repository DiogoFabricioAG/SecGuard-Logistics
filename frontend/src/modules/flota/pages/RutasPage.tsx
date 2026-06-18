import { useState, useEffect } from "react";
import { WizardStepper } from "../components/WizardStepper";
import { ViajesTable } from "../components/ViajesTable";
import { Step1DatosRecogida } from "../components/Step1DatosRecogida";
import { Step2FechaHora } from "../components/Step2FechaHora";
import { Step3SeleccionFlota } from "../components/Step3SeleccionFlota";
import { Step4Confirmacion } from "../components/Step4Confirmacion";
import { useViajeWizard } from "../context/ViajeWizardContext";
import { getViajes, type Viaje } from "../services/viajesApi";
import {
  getPedidos as fetchPedidos,
  type Pedido as PedidoType,
} from "../services/pedidosApi";

export default function RutasPage() {
  const { data, updateData, resetData } = useViajeWizard();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [selectedViajeId, setSelectedViajeId] = useState<number | null>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [serverPagination, setServerPagination] = useState({
    page: 1,
    limit: 8,
    totalRegistros: 0,
    totalPaginas: 1,
  });
  const limit = 8;

  function fetchViajes(p: number) {
    setLoadingViajes(true);
    getViajes({ page: p, limit })
      .then((res) => {
        setViajes(res.data);
        setServerPagination(
          res.pagination ?? { page: p, limit, totalRegistros: 0, totalPaginas: 1 }
        );
        setLoadingViajes(false);
      })
      .catch(() => setLoadingViajes(false));
  }

  useEffect(() => {
    fetchViajes(page);
  }, [page]);

  function openWizard() {
    resetData();
    setCurrentStep(1);
    setSelectedPedidoId(null);
    setWizardOpen(true);
    setLoadingPedidos(true);
    fetchPedidos({ page: 1, limit: 20 })
      .then((res) => setPedidos(res.data))
      .catch(() => setPedidos([]))
      .finally(() => setLoadingPedidos(false));
  }

  function closeWizard() {
    setWizardOpen(false);
    resetData();
    setCurrentStep(1);
  }

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  function handleViajeSelect(viaje: Viaje) {
    setSelectedViajeId(viaje.id_viaje);
  }

  function handleSelectPedido(pedido: PedidoType) {
    setSelectedPedidoId(pedido.id_pedido);
    updateData({
      id_pedido: pedido.id_pedido,
      codigo_reserva_patio: pedido.nro_orden_origen,
      guia_remision_ransa: "",
    });
  }

  function onViajeCreated() {
    closeWizard();
    setPage(1);
    fetchViajes(1);
  }

  const viajesFiltrados = searchQuery.trim()
    ? viajes.filter(
        (v) =>
          v.codigo_reserva_patio.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.nombre_cliente.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : viajes;

  return (
    <div className="flex-1 flex flex-row overflow-hidden relative bg-background">
      <div className="flex-1 flex flex-col h-full overflow-hidden p-lg">
        <section className="flex-1 bg-surface-lowest rounded-xl border border-surface-variant flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-lowest">
            <div className="flex items-center gap-4">
              <h2 className="font-headline-sm text-on-surface">Viajes Programados</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  className="pl-9 pr-4 py-1.5 border border-outline-variant bg-surface text-on-surface rounded-lg text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none w-64 placeholder:text-outline"
                  placeholder="Buscar viajes..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <button
              onClick={openWizard}
              className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Registrar Viaje
            </button>
          </div>
          <ViajesTable
            viajes={viajesFiltrados}
            selectedId={selectedViajeId}
            onSelect={handleViajeSelect}
            loading={loadingViajes}
            pagination={serverPagination}
            onPageChange={setPage}
          />
        </section>
      </div>

      <div
        className={`absolute top-0 right-0 h-full w-[55%] bg-surface-lowest border-l border-surface-variant shadow-2xl flex flex-col z-30 transition-transform duration-300 ease-in-out ${
          wizardOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-lg border-b border-surface-variant bg-surface-lowest flex items-center justify-between shrink-0">
          <h2 className="font-headline-md text-on-surface">Registrar viaje esperado</h2>
          <button
            onClick={closeWizard}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-lg border-b border-surface-variant bg-surface-lowest">
          <WizardStepper currentStep={currentStep} />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!data.id_pedido ? (
            <div className="flex-1 overflow-auto p-lg bg-surface">
              <h3 className="font-headline-sm text-on-surface mb-4">Seleccione un pedido</h3>
              {loadingPedidos ? (
                <div className="flex items-center justify-center py-20">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary-container">
                    progress_activity
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {pedidos.map((p) => (
                    <div
                      key={p.id_pedido}
                      onClick={() => handleSelectPedido(p)}
                      className={`p-lg rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                        selectedPedidoId === p.id_pedido
                          ? "border-primary-container bg-primary-fixed/20 shadow-sm"
                          : "border-surface-variant bg-surface-lowest hover:border-primary-container"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-headline-sm text-primary-container">
                            {p.nro_orden_origen}
                          </p>
                          <p className="font-label-md text-on-surface mt-0.5">
                            {p.nombre_cliente}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-[#009A3F]/10 text-[#009A3F] font-label-sm text-label-sm border border-[#009A3F]/20">
                          {p.estado_pedido}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-outline mt-px">
                            inventory_2
                          </span>
                          <div>
                            <span className="font-label-sm text-on-surface-variant block">
                              Carga
                            </span>
                            <span className="font-body-md text-on-surface font-medium">
                              {p.total_peso_kg.toLocaleString()} kg
                            </span>
                            <span className="font-label-sm text-on-surface-variant">
                              {p.total_bultos} bultos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 col-span-2">
                          <span className="material-symbols-outlined text-[18px] text-outline mt-px">
                            location_on
                          </span>
                          <div>
                            <span className="font-label-sm text-on-surface-variant block">
                              Dirección
                            </span>
                            <span className="font-body-md text-on-surface line-clamp-2">
                              {p.direccion_entrega}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          calendar_today
                        </span>
                        <span className="font-label-sm text-on-surface-variant">
                          {new Date(p.fecha_recepcion_pedido).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {selectedPedidoId === p.id_pedido && (
                          <span className="ml-auto font-label-sm text-primary-container font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Seleccionado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentStep === 1 ? (
            <>
              <Step1DatosRecogida pedidoId={data.id_pedido} />
              <WizardFooter
                currentStep={currentStep}
                onCancel={closeWizard}
                onBack={() => {
                  updateData({ id_pedido: null, id_camiones_seleccionados: [] });
                  setCurrentStep(1);
                  setSelectedPedidoId(null);
                }}
                onNext={() => goToStep(2)}
                nextLabel="Siguiente Paso"
              />
            </>
          ) : currentStep === 2 ? (
            <>
              <Step2FechaHora data={data} onChange={updateData} />
              <WizardFooter
                currentStep={currentStep}
                onCancel={closeWizard}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
                nextLabel="Siguiente Paso"
              />
            </>
          ) : currentStep === 3 ? (
            <>
              <Step3SeleccionFlota data={data} onChange={updateData} />
              <WizardFooter
                currentStep={currentStep}
                onCancel={closeWizard}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
                nextLabel="Siguiente Paso"
              />
            </>
          ) : (
            <>
              <Step4Confirmacion data={data} onSuccess={onViajeCreated} />
              <WizardFooter
                currentStep={currentStep}
                onCancel={closeWizard}
                onBack={() => goToStep(3)}
                nextLabel=""
                hideNext
              />
            </>
          )}
        </div>
      </div>

      {wizardOpen && (
        <div
          className="absolute inset-0 bg-black/20 z-20 transition-opacity duration-300"
          onClick={closeWizard}
        />
      )}
    </div>
  );
}

function WizardFooter({
  onCancel,
  onBack,
  onNext,
  nextLabel,
  hideNext,
}: {
  currentStep: number;
  onCancel: () => void;
  onBack: () => void;
  onNext?: () => void;
  nextLabel: string;
  hideNext?: boolean;
}) {
  return (
    <div className="p-4 border-t border-surface-variant bg-surface-lowest flex justify-between items-center shrink-0">
      <button
        onClick={onCancel}
        className="text-outline hover:text-on-surface-variant font-label-md px-4 py-2 transition-colors"
      >
        Cancelar
      </button>
      <div className="space-x-3 flex">
        <button
          onClick={onBack}
          className="bg-surface-lowest border border-surface-variant text-primary-container px-6 py-2 rounded font-label-md hover:bg-slate-50 transition-colors flex items-center"
        >
          Atrás
        </button>
        {!hideNext && (
          <button
            onClick={onNext!}
            className="bg-primary-container text-on-primary px-6 py-2 rounded font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
          >
            {nextLabel}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
