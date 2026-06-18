import { useState, useMemo } from "react";
import { type ViajeWizardData } from "../context/ViajeWizardContext";
import { crearViaje, asignarCamion } from "../services/viajesApi";

function pickRandomConductors(count: number, poolSize = 15): number[] {
  const pool = Array.from({ length: poolSize }, (_, i) => i + 1);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

interface Props {
  data: ViajeWizardData;
  onSuccess?: () => void;
}

export function Step4Confirmacion({ data, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const conductors = useMemo(
    () => pickRandomConductors(data.id_camiones_seleccionados.length),
    [data.id_camiones_seleccionados.length]
  );

  async function handleConfirmar() {
    if (!data.id_pedido) { setError("Falta seleccionar un pedido"); return; }
    if (data.id_camiones_seleccionados.length === 0) { setError("Seleccione al menos un camión"); return; }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await crearViaje({
        id_pedido: data.id_pedido,
        codigo_reserva_patio: data.codigo_reserva_patio || `RSV-${Date.now()}`,
        tipo_operacion: data.tipo_operacion || "DESPACHO",
        fecha_hora_estimada: data.fecha_hora_estimada || new Date().toISOString(),
        guia_remision_ransa: data.guia_remision_ransa || `GRR-${Date.now()}`,
        fecha_limite_entrega: data.fecha_limite_entrega || new Date().toISOString(),
        hora_recogida_inicio: data.hora_recogida_inicio || "08:00",
        hora_recogida_fin: data.hora_recogida_fin || "12:00",
      });

      const idViaje = res.data.id_viaje;

      const conductoresAsignados = pickRandomConductors(data.id_camiones_seleccionados.length);

      for (let i = 0; i < data.id_camiones_seleccionados.length; i++) {
        await asignarCamion(idViaje, {
          id_camion: data.id_camiones_seleccionados[i],
          id_conductor: conductoresAsignados[i],
        });
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar viaje");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="bg-surface-lowest rounded-xl p-6 max-w-[420px] w-full text-center space-y-4 shadow-2xl border border-surface-variant">
          <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
          <h3 className="text-xl font-bold font-headline text-teal-900">¡Viaje Registrado Exitosamente!</h3>
          <p className="text-on-surface-variant font-body-md">
            El viaje ha sido guardado en la programación logística global.
          </p>
          <button
            onClick={() => onSuccess?.()}
            className="w-full bg-primary-container text-on-primary py-2.5 rounded-lg font-label-md hover:bg-on-primary-fixed-variant transition-colors"
          >
            Ir al Panel de Flotas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-lg bg-surface flex flex-col gap-6">
      <div>
        <h3 className="font-headline-sm text-on-surface">Resumen y Confirmación</h3>
        <p className="font-body-md text-on-surface-variant mt-1">
          Confirme que toda la información para el viaje es correcta.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4 space-y-3">
          <h4 className="font-label-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">info</span>
            Detalles del Pedido
          </h4>
          <div className="space-y-2 font-body-md text-on-surface-variant text-sm">
            <p><strong className="text-on-surface">Pedido:</strong> {data.id_pedido ? `#${data.id_pedido}` : "—"}</p>
            <p><strong className="text-on-surface">Tipo operación:</strong> {data.tipo_operacion || "—"}</p>
            <p><strong className="text-on-surface">Guía remisión:</strong> {data.guia_remision_ransa || "—"}</p>
          </div>
        </div>

        <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4 space-y-3">
          <h4 className="font-label-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">local_shipping</span>
            Fecha y Flota
          </h4>
          <div className="space-y-2 font-body-md text-on-surface-variant text-sm">
            <p>
              <strong className="text-on-surface">Fecha estimada:</strong>{" "}
              {data.fecha_hora_estimada ? new Date(data.fecha_hora_estimada).toLocaleString("es-PE") : "—"}
            </p>
            <p>
              <strong className="text-on-surface">Horario recogida:</strong>{" "}
              {data.hora_recogida_inicio || "—"} - {data.hora_recogida_fin || "—"}
            </p>
            <p>
              <strong className="text-on-surface">Límite entrega:</strong>{" "}
              {data.fecha_limite_entrega ? new Date(data.fecha_limite_entrega).toLocaleString("es-PE") : "—"}
            </p>
          </div>
        </div>
      </div>

      {data.id_camiones_seleccionados.length > 0 && (
        <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4 space-y-3">
          <h4 className="font-label-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">engineering</span>
            Camiones y Conductores Asignados
          </h4>
          <div className="divide-y divide-surface-variant">
            {data.id_camiones_seleccionados.map((idCamion, i) => (
              <div key={idCamion} className="py-2 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline text-[18px]">local_shipping</span>
                  <span className="font-medium text-on-surface text-body-md">
                    Camión #{idCamion}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-outline">person</span>
                  <span>Conductor #{conductors[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-primary-fixed/20 border border-primary-container/20 rounded-lg p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary-container mt-0.5">verified_user</span>
        <div>
          <h4 className="font-label-md text-primary-container font-semibold">Validación de Seguridad Aprobada</h4>
          <p className="font-body-md text-on-surface-variant mt-1 text-sm">
            Se asignarán {data.id_camiones_seleccionados.length} camión(es) con conductores de forma automática.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container font-body-md p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-auto">
        <button
          onClick={handleConfirmar}
          disabled={isSubmitting}
          className="bg-[#009A3F] text-white px-6 py-2 rounded font-label-md hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? "Registrando..." : "Confirmar y Registrar"}
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
        </button>
      </div>
    </div>
  );
}
