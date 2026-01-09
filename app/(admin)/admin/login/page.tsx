"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!res.ok) {
        setError("Credenciales inválidas");
        return;
      }

      router.push("/admin");
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-foreground">GeoHub</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Panel Admin</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para administrar mapas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales de administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}