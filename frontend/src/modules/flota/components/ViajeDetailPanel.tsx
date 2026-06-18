import { useEffect, useState } from "react";
import { getViajeById, type ViajeDetail } from "../services/viajesApi";

interface Props {
  viajeId: number;
}

export function ViajeDetailPanel({ viajeId }: Props) {
  const [viaje, setViaje] = useState<ViajeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getViajeById(viajeId)
      .then((res) => {
        if (!cancelled) {
          setViaje(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViaje(null);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [viajeId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-on-surface-variant">
        Cargando...
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="p-4 text-center text-on-surface-variant">
        Seleccione un viaje
      </div>
    );
  }

  return (
    <div className="space-y-4 p-lg">
      <div className="bg-surface-lowest rounded-lg border border-surface-variant p-lg">
        <h4 className="text-label-md text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">
            location_on
          </span>
          Dirección de entrega
        </h4>
        <p className="font-medium text-body-md text-on-surface">{viaje.direccion_entrega}</p>
      </div>

      <div className="bg-surface-lowest rounded-lg border border-surface-variant p-lg">
        <h4 className="text-label-md text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">
            person
          </span>
          Contacto
        </h4>
        <p className="font-medium text-body-md text-on-surface">{viaje.contacto_nombre}</p>
        <p className="text-on-surface-variant text-body-md">
          {viaje.contacto_telefono}
        </p>
        <p className="text-on-surface-variant text-body-md">
          {viaje.contacto_correo}
        </p>
      </div>

      <div className="bg-surface-lowest rounded-lg border border-surface-variant p-lg">
        <h4 className="text-label-md text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">
            inventory
          </span>
          Carga
        </h4>
        <div className="flex justify-between text-body-md">
          <span>Bultos</span>
          <span className="font-medium">{viaje.total_bultos}</span>
        </div>
        <div className="flex justify-between text-body-md">
          <span>Peso total</span>
          <span className="font-medium">
            {viaje.total_peso_kg.toLocaleString()} kg
          </span>
        </div>
      </div>
    </div>
  );
}
