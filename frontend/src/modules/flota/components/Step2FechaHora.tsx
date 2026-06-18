import { type ViajeWizardData } from "../context/ViajeWizardContext";

interface Props {
  data: ViajeWizardData;
  onChange: (data: Partial<ViajeWizardData>) => void;
}

export function Step2FechaHora({ data, onChange }: Props) {
  return (
    <div className="flex-1 overflow-auto p-lg bg-surface flex flex-col gap-6">
      <div>
        <h3 className="font-headline-sm text-on-surface">Programación de Fecha y Hora</h3>
        <p className="font-body-md text-on-surface-variant mt-1">
          Establezca el rango de tiempo de la recogida y entrega.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <label className="block font-label-md text-on-surface mb-2">Fecha del viaje</label>
            <input
              type="date"
              value={
                data.fecha_hora_estimada
                  ? new Date(data.fecha_hora_estimada).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                const date = e.target.value;
                if (!date) return;
                const time = data.fecha_hora_estimada
                  ? new Date(data.fecha_hora_estimada).toISOString().split("T")[1].slice(0, 5)
                  : "08:00";
                onChange({ fecha_hora_estimada: new Date(`${date}T${time}:00.000Z`).toISOString() });
              }}
              className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>

          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <label className="block font-label-md text-on-surface mb-2">
              Rango horario estimado de recogida
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-outline font-label-sm block mb-1">Desde</span>
                <input
                  type="time"
                  value={data.hora_recogida_inicio || ""}
                  onChange={(e) => onChange({ hora_recogida_inicio: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface p-2 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>
              <div>
                <span className="text-xs text-outline font-label-sm block mb-1">Hasta</span>
                <input
                  type="time"
                  value={data.hora_recogida_fin || ""}
                  onChange={(e) => onChange({ hora_recogida_fin: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface p-2 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <label className="block font-label-md text-on-surface mb-2">Límite de entrega pactado</label>
            <input
              type="datetime-local"
              value={
                data.fecha_limite_entrega
                  ? new Date(data.fecha_limite_entrega).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) return;
                onChange({ fecha_limite_entrega: new Date(e.target.value).toISOString() });
              }}
              className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>

          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F39200]">schedule</span>
              Resumen del viaje
            </h4>
            <div className="space-y-2 font-body-md text-on-surface-variant">
              <p>
                <strong className="text-on-surface">Tipo operación:</strong> {data.tipo_operacion || "—"}
              </p>
              <p>
                <strong className="text-on-surface">Guía remisión:</strong> {data.guia_remision_ransa || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
