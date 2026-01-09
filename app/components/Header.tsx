"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { 
  Globe, 
  MapPin, 
  Shield, 
  Menu, 
  X, 
  LogIn,
  User,
  Settings
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
  isAdmin?: boolean;
}

export function Header({ isAuthenticated = false, onMenuToggle, isAdmin = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Explorar Mapas", href: "/", icon: Globe },
    { name: "Crear Mapa", href: "/admin/map/new", icon: MapPin, admin: true },
    { name: "Panel Admin", href: "/admin", icon: Settings, admin: true },
  ];

  const filteredNavigation = navigation.filter(item => !item.admin || isAdmin);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo y Brand */}
        <Link href="/" className="flex items-center space-x-3 transition-transform hover:scale-105">
          <div className="relative">
            <Globe className="h-8 w-8 text-accent" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">GeoHub</span>
            <Badge variant="secondary" className="ml-2 text-xs">v4</Badge>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/auth/logout">
                  <Shield className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Link>
              </Button>
            </div>
          ) : (
            <Button variant="gold" size="sm" asChild>
              <Link href="/admin/login">
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-3">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 p-2 rounded-lg hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}