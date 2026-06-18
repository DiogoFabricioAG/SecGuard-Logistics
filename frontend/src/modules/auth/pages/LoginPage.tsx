import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../../../shared/api/client";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Complete todos los campos");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/flota", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error de conexión. Intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full bg-background overflow-hidden flex items-center justify-center p-md">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-login-hero" />
        <div className="absolute inset-0 bg-primary opacity-[0.55]" />
      </div>

      <main className="relative z-10 w-full flex justify-center items-center">
        <div className="w-full max-w-[420px] rounded-lg shadow-xl p-xl flex flex-col items-center bg-white/95 border border-surface-variant">
          <header className="text-center w-full">
            <div className="mb-md">
              <span className="material-symbols-outlined text-[40px] text-primary-fixed-dim">
                shield
              </span>
            </div>
            <h1 className="font-bold text-[28px] font-manrope text-primary-container leading-tight">
              SecGuard Logistics
            </h1>
            <p className="font-semibold text-body-md text-on-surface-variant mt-xs">
              Control de acceso vehicular
            </p>
            <p className="font-normal text-[13px] text-outline mt-xs">
              Ingrese sus credenciales
            </p>
          </header>

          <hr className="w-full border-t border-outline-variant my-lg" />

          <form onSubmit={handleSubmit} className="w-full space-y-md">
            <div>
              <label
                className="block font-semibold text-label-md text-on-surface-variant mb-xs"
                htmlFor="username"
              >
                Usuario
              </label>
              <input
                className="w-full h-[40px] bg-surface-container-lowest border border-outline-variant rounded-lg px-md text-on-surface text-body-md input-focus transition-all"
                id="username"
                name="username"
                placeholder="ej. JuanPerez"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                className="block font-semibold text-label-md text-on-surface-variant mb-xs"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                className="w-full h-[40px] bg-surface-container-lowest border border-outline-variant rounded-lg px-md text-on-surface text-body-md input-focus transition-all"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container text-body-md p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              className="w-full h-[44px] bg-primary-container hover:bg-primary text-on-primary font-semibold text-body-md rounded-lg transition-colors active:scale-[0.98] mt-lg disabled:opacity-80"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-md text-center">
            <a
              className="text-[13px] text-on-primary-fixed-variant hover:underline transition-all"
              href="#"
            >
              Crear cuenta
            </a>
          </div>

          <footer className="mt-lg pt-md text-center">
            <p className="font-normal text-label-sm text-outline leading-normal">
              © 2026 SecGuard Logistics.
              <br />
              Secure Global Supply Chain Management.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
