import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";
import { ViajeWizardProvider } from "./modules/flota/context/ViajeWizardContext";
import { Layout } from "./shared/components/Layout";
import LoginPage from "./modules/auth/pages/LoginPage";
import GestionFlotaPage from "./modules/flota/pages/GestionFlotaPage";
import RutasPage from "./modules/flota/pages/RutasPage";
import CamaraPage from "./modules/camara/pages/CamaraPage";
import FallaPlacaPage from "./modules/camara/pages/FallaPlacaPage";
import AccesosPage from "./modules/camara/pages/AccesosPage";
import RegistroManualPage from "./modules/camara/pages/RegistroManualPage";
import ConsultarMetricasPage from "./modules/kpi/pages/ConsultarMetricasPage";
import GenerarReportePage from "./modules/kpi/pages/GenerarReportePage";
import DashboardPage from "./modules/dashboard/pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/flota" element={<GestionFlotaPage />} />
            <Route
              path="/rutas"
              element={
                <ViajeWizardProvider>
                  <RutasPage />
                </ViajeWizardProvider>
              }
            />
            <Route path="/camara" element={<CamaraPage />} />
            <Route path="/camara/falla" element={<FallaPlacaPage />} />
            <Route path="/camara/accesos" element={<AccesosPage />} />
            <Route
              path="/camara/registro-manual"
              element={<RegistroManualPage />}
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analitica" element={<ConsultarMetricasPage />} />
            <Route
              path="/analitica/generar-reporte"
              element={<GenerarReportePage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/flota" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
