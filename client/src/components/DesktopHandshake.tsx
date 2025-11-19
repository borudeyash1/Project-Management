import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { clearDesktopFlowIntent, DESKTOP_PROTOCOL_URL, isDesktopRuntime } from "../constants/desktop";

const DesktopHandshake: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [status, setStatus] = useState<"preparing" | "success" | "error">("preparing");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const openDesktopApp = useCallback((handshakeToken?: string) => {
    if (!handshakeToken) return;
    const desktopUrl = `${DESKTOP_PROTOCOL_URL}?token=${handshakeToken}`;
    try {
      window.location.href = desktopUrl;
    } catch (err) {
      console.error("Failed to open Sartthi Desktop", err);
    }
  }, []);

  const fetchDesktopToken = useCallback(async () => {
    const hasAccessToken = Boolean(localStorage.getItem("accessToken"));
    if (!hasAccessToken) {
      navigate(`/login?source=desktop&redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    setStatus("preparing");
    setError(null);

    try {
      const response = await apiService.createDesktopSessionToken();
      setToken(response.token);
      setStatus("success");
    } catch (err: any) {
      const message = err?.message || "Failed to prepare desktop session";
      setError(message);
      setStatus("error");
    }
  }, [navigate, location.pathname, openDesktopApp]);

  useEffect(() => {
    fetchDesktopToken();
  }, [fetchDesktopToken]);

  useEffect(() => {
    if (status !== "success" || !token || isDesktopRuntime()) return;
    const timeout = setTimeout(() => openDesktopApp(token), 600);
    return () => clearTimeout(timeout);
  }, [status, token, openDesktopApp]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900"
          : "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl border px-10 py-12 text-center ${
          isDarkMode ? "bg-gray-900/80 border-yellow-500/30 text-white" : "bg-white border-yellow-200 text-gray-900"
        }`}
      >
        <div className="text-4xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold mb-3">Finishing Desktop Sign-in</h1>
        <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Hold tight while we connect this browser session with the Sartthi Desktop app.
        </p>

        {status === "preparing" && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Preparing secure desktop session…</div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse delay-150" />
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse delay-300" />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-sm">
              We’ve sent the session to Sartthi Desktop. If you don’t see the OS prompt, click the button below to open it manually.
            </p>
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg"
              onClick={() => openDesktopApp(token || undefined)}
            >
              Open Sartthi Desktop
            </button>
            <button
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold border ${
                isDarkMode ? "border-gray-700 text-gray-200" : "border-gray-200 text-gray-700"
              }`}
              onClick={() => {
                clearDesktopFlowIntent();
                navigate("/home");
              }}
            >
              Continue in Browser
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-500/90 hover:bg-red-500"
              onClick={fetchDesktopToken}
            >
              Try Again
            </button>
            <button
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold border ${
                isDarkMode ? "border-gray-700 text-gray-200" : "border-gray-200 text-gray-700"
              }`}
              onClick={() => navigate("/login?source=desktop")}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopHandshake;
