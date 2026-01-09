"use client";

import { useState, useEffect } from "react";
import MapWithSidebar from "@/src/components/MapWithSidebar";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          window.location.href = "/admin/login";
          return;
        }

        const data = await res.json();
        if (data) {
          setUser(data.user);
        }
        setLoading(false);
      } catch (error) {
        window.location.href = "/admin/login";
      }
    };

    verifyAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      {/* Simple Header */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-foreground">GeoHub</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a 
              href="/admin/map/new"
              className="text-sm text-foreground hover:text-accent transition-colors"
            >
              Nuevo Mapa
            </a>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Map Viewer */}
      <div className="h-[calc(100vh-3.5rem)]">
        <MapWithSidebar showAdminControls={true} />
      </div>
    </div>
  );
}