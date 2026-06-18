/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ViajeWizardData {
  id_pedido: number | null;
  codigo_reserva_patio: string;
  tipo_operacion: string;
  guia_remision_ransa: string;
  fecha_hora_estimada: string;
  fecha_limite_entrega: string;
  hora_recogida_inicio: string;
  hora_recogida_fin: string;
  id_camiones_seleccionados: number[];
}

interface ViajeWizardContextValue {
  data: ViajeWizardData;
  setData: (data: ViajeWizardData) => void;
  updateData: (partial: Partial<ViajeWizardData>) => void;
  resetData: () => void;
}

const initialState: ViajeWizardData = {
  id_pedido: null,
  codigo_reserva_patio: "",
  tipo_operacion: "DESPACHO",
  guia_remision_ransa: "",
  fecha_hora_estimada: "",
  fecha_limite_entrega: "",
  hora_recogida_inicio: "08:00",
  hora_recogida_fin: "12:00",
  id_camiones_seleccionados: [],
};

export const ViajeWizardContext = createContext<ViajeWizardContextValue | null>(null);

export function ViajeWizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ViajeWizardData>(initialState);

  const updateData = useCallback((partial: Partial<ViajeWizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialState);
  }, []);

  return (
    <ViajeWizardContext.Provider
      value={{ data, setData, updateData, resetData }}
    >
      {children}
    </ViajeWizardContext.Provider>
  );
}

export function useViajeWizard() {
  const context = useContext(ViajeWizardContext);
  if (!context) {
    throw new Error(
      "useViajeWizard debe usarse dentro de ViajeWizardProvider"
    );
  }
  return context;
}
