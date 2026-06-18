import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/context/AuthContext";

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="fixed left-0 top-0 w-[220px] h-screen bg-white flex flex-col py-lg z-50 shadow-lg">
      <div className="px-md mb-xl">
        <div className="flex items-center gap-sm mb-1">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: "#00333c" }}
          >
            local_shipping
          </span>
          <div className="flex flex-col">
            <span className="font-headline text-[13px] font-bold text-primary-container leading-none">
              SecGuard
            </span>
            <span className="font-headline text-[13px] font-bold text-primary-container leading-none">
              Logistics
            </span>
          </div>
        </div>
        <p className="text-[10px] font-normal text-outline pl-[32px]">
          Centro Logístico Global
        </p>
      </div>

      <nav className="flex-1 px-sm space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-[10px] rounded-[6px] text-on-surface-variant hover:bg-surface-container transition-colors ${
              isActive ? "bg-primary-container text-white" : ""
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">
            dashboard
          </span>
          <span className="text-[13px] font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/flota"
          end
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-[10px] text-on-surface-variant hover:bg-surface-container transition-colors rounded-[6px] ${
              isActive ? "bg-primary-container text-white" : ""
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">
            local_shipping
          </span>
          <span className="text-[13px] font-medium">Flota</span>
        </NavLink>
        <NavLink
          to="/rutas"
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-[10px] transition-colors rounded-[6px] ${
              isActive
                ? "bg-primary-container text-white"
                : "text-on-surface-variant hover:bg-surface-container"
            }`
          }
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            route
          </span>
          <span className="text-[13px] font-medium">Rutas</span>
        </NavLink>
        <NavLink
          to="/analitica"
          className={({ isActive }) =>
            `flex items-center gap-md px-md py-[10px] text-on-surface-variant hover:bg-surface-container transition-colors rounded-[6px] ${
              isActive ? "bg-primary-container text-white" : ""
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">
            analytics
          </span>
          <span className="text-[13px] font-medium">Analítica</span>
        </NavLink>
        <span className="flex items-center gap-md px-md py-[10px] text-on-surface-variant/40 rounded-[6px] cursor-not-allowed select-none">
          <span className="material-symbols-outlined text-[20px]">
            videocam
          </span>
          <span className="text-[13px] font-medium">Cámara</span>
          <span className="ml-auto text-[10px] text-outline/60">
            Próximamente
          </span>
        </span>
      </nav>

      <div className="px-sm mt-auto space-y-1">
        <a
          className="flex items-center gap-md px-md py-[10px] text-on-surface-variant hover:bg-surface-container transition-colors rounded-[6px]"
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            help_outline
          </span>
          <span className="text-[13px] font-medium">Soporte</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-md px-md py-[10px] text-error hover:bg-error/5 transition-colors rounded-[6px]"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[13px] font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
