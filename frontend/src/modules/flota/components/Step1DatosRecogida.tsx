import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getPedidoById,
  getMercanciaPedido,
  type PedidoDetail,
  type Mercancia,
} from "../services/pedidosApi";

interface Props {
  pedidoId: number;
}

export function Step1DatosRecogida({ pedidoId }: Props) {
  const [pedido, setPedido] = useState<PedidoDetail | null>(null);
  const [mercancia, setMercancia] = useState<Mercancia[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getPedidoById(pedidoId), getMercanciaPedido(pedidoId)])
      .then(([pRes, mRes]) => {
        if (!cancelled) {
          setPedido(pRes.data);
          setMercancia(mRes.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pedidoId]);

  useEffect(() => {
    if (!pedido || !mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    const map = L.map(mapRef.current).setView([pedido.latitud, pedido.longitud], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([pedido.latitud, pedido.longitud])
      .addTo(map)
      .bindPopup(`<b>${pedido.direccion_entrega}</b>`)
      .openPopup();

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [pedido]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary-container">
          progress_activity
        </span>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant">
        No se encontró el pedido
      </div>
    );
  }

  const totalKg = mercancia.reduce((s, m) => s + Number(m.peso_subtotal_kg), 0);

  return (
    <div className="flex-1 overflow-auto p-lg bg-surface flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-headline-sm text-on-surface">Datos de recogida</h3>
          <p className="font-body-md text-on-surface-variant mt-1">
            Revise los detalles del pedido y la ubicación de recogida.
          </p>
        </div>
        <div className="text-right">
          <span className="font-label-sm text-on-surface-variant uppercase">Pedido</span>
          <div className="font-headline-md text-on-surface">{pedido.nro_orden_origen}</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 flex-1">
        <div className="col-span-2 space-y-4">
          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">location_on</span>
              Dirección de recogida
            </h4>
            <div className="font-body-md text-on-surface-variant space-y-1">
              <p className="text-on-surface font-medium">{pedido.direccion_entrega}</p>
            </div>
          </div>

          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">person</span>
              Contacto
            </h4>
            <div className="font-body-md text-on-surface-variant space-y-1">
              <p className="text-on-surface font-medium">{pedido.contacto_nombre}</p>
              <p>{pedido.contacto_telefono}</p>
              <p>{pedido.contacto_correo}</p>
            </div>
          </div>

          <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
            <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">inventory</span>
              Mercancía a recoger
            </h4>
            <ul className="divide-y divide-surface-variant">
              {mercancia.map((m) => (
                <li key={m.id_detalle} className="py-2 flex justify-between font-body-md">
                  <span>{m.descripcion_mercancia}</span>
                  <span className="font-medium">{m.peso_subtotal_kg.toLocaleString()} kg</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-surface-variant mt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>{totalKg.toLocaleString()} kg</span>
            </div>
          </div>

          {pedido.descripcion_restricciones && (
            <div className="bg-surface-lowest rounded-lg border border-surface-variant p-4">
              <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">description</span>
                Restricciones
              </h4>
              <p className="font-body-md text-on-surface-variant">{pedido.descripcion_restricciones}</p>
            </div>
          )}
        </div>

        <div className="col-span-3 flex flex-col">
          <div className="bg-surface-lowest rounded-lg border border-surface-variant flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-surface-variant flex items-center justify-between">
              <h4 className="font-label-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">map</span>
                Ubicación de recogida
              </h4>
              <span className="font-body-md text-on-surface-variant">{pedido.direccion_entrega}</span>
            </div>
            <div ref={mapRef} className="flex-1 min-h-[400px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
