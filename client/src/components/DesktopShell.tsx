import React, { useCallback, useEffect, useState } from "react";
import { clearDesktopFlowIntent, getDesktopRedirect } from "../constants/desktop";

type ShellStatus = "waiting" | "injecting" | "redirecting" | "error";

const DesktopShell: React.FC = () => {
  const [status, setStatus] = useState<ShellStatus>("waiting");
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback((session?: { accessToken?: string; refreshToken?: string; redirect?: string } | null) => {
    if (!session) return false;

    setStatus("injecting");

    if (session.accessToken) {
      localStorage.setItem("accessToken", session.accessToken);
    }
    if (session.refreshToken) {
      localStorage.setItem("refreshToken", session.refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }

    clearDesktopFlowIntent();
    setStatus("redirecting");
    const redirect = session.redirect || getDesktopRedirect();
    window.location.replace(redirect);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      const electronAPI = (window as any)?.electronAPI;
      if (!electronAPI?.getDesktopSession) {
        setStatus("error");
        setError("Not running inside Sartthi Desktop.");
        return;
      }

      try {
        const session = await electronAPI.getDesktopSession();
        if (cancelled) return;
        const applied = applySession(session);
        if (!applied && !cancelled) {
          setTimeout(hydrateSession, 400);
        }
      } catch (err) {
        console.error("DesktopShell hydration failed", err);
        if (!cancelled) {
          setStatus("error");
          setError("Failed to hydrate Sartthi Desktop session.");
        }
      }
    };

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  useEffect(() => {
    const electronAPI = (window as any)?.electronAPI;
    if (!electronAPI?.onDesktopSession) {
      return;
    }

    const unsubscribe = electronAPI.onDesktopSession((session: { accessToken?: string; refreshToken?: string; redirect?: string }) => {
      applySession(session);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [applySession]);

  const statusMessage = (() => {
    switch (status) {
      case "waiting":
        return "Waiting for secure desktop session…";
      case "injecting":
        return "Injecting secure session…";
      case "redirecting":
        return "Opening Sartthi Desktop…";
      default:
        return error || "Unable to continue inside Sartthi Desktop.";
    }
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border border-yellow-200 bg-white px-10 py-12 text-center">
        <div className="text-4xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold mb-3">Preparing Sartthi Desktop</h1>
        <p className="text-sm text-gray-600">{statusMessage}</p>
      </div>
    </div>
  );
};

export default DesktopShell;
