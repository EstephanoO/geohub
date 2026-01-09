"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { 
  Globe, 
  Github, 
  Mail, 
  MapPin,
  Shield,
  Heart
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Plataforma",
      links: [
        { name: "Explorar Mapas", href: "/" },
        { name: "Crear Mapa", href: "/admin/map/new" },
        { name: "Panel Admin", href: "/admin" },
      ]
    },
    {
      title: "Recursos",
      links: [
        { name: "Documentación", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "Tutoriales", href: "#" },
      ]
    },
    {
      title: "Empresa",
      links: [
        { name: "Sobre Nosotros", href: "#" },
        { name: "Contacto", href: "#" },
        { name: "Privacidad", href: "#" },
      ]
    }
  ];

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Globe className="h-8 w-8 text-accent" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></div>
              </div>
              <span className="text-xl font-bold text-foreground">GeoHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma avanzada para la gestión y visualización de mapas geográficos con tecnología de vanguardia.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon-sm" className="hover:bg-accent">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="hover:bg-accent">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="hover:bg-accent">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 border-border/20" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© {currentYear} GeoHub v4</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Seguro y Confiable</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Heart className="h-3 w-3 text-accent" />
              <span>Hecho con</span>
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>Next.js 16 + shadcn/ui</span>
          </div>
        </div>
      </div>
    </footer>
  );
}