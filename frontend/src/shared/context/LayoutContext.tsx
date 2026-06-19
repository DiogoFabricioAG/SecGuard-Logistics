import { createContext, useContext, useState, type ReactNode } from "react";

interface LayoutContextValue {
  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue>({ fullscreen: false, setFullscreen: () => {} });

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <LayoutContext.Provider value={{ fullscreen, setFullscreen }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
