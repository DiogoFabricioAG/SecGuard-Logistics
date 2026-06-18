import { useLocation } from "react-router-dom";
import { useAuth } from "../../modules/auth/context/AuthContext";

function getTitle(path: string): string {
  if (path.includes("/rutas")) return "Rutas";
  if (path.includes("/flota")) return "Gestión de Flota";
  if (path.includes("/dashboard")) return "Dashboard";
  if (path.includes("/analitica")) return "Analítica";
  return "SecGuard Logistics";
}

export function TopNavBar() {
  const location = useLocation();
  const { admin } = useAuth();
  const title = getTitle(location.pathname);

  return (
    <header className="bg-white font-headline text-sm font-medium border-b border-slate-200 flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center gap-4 w-1/2">
        <h1 className="text-teal-900 font-headline-md text-headline-md">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-md">
        <button className="relative w-8 h-8 flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            3
          </span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ backgroundColor: "#00333c" }}
          title={admin ? `${admin.nombres} ${admin.apellidos}` : ""}
        >
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="40" height="40" fill="#00333c" />
            <path d="M20 21C23.866 21 27 17.866 27 14C27 10.134 23.866 7 20 7C16.134 7 13 10.134 13 14C13 17.866 16.134 21 20 21ZM20 24C14.66 24 4 26.67 4 32V35H36V32C36 26.67 25.34 24 20 24Z" fill="white" />
          </svg>
        </div>
      </div>
    </header>
  );
}
