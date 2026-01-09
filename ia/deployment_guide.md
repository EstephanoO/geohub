# 🚀 Deployment Guide - Map Catalog API

## 📋 **Resumen de Implementación**

He completado exitosamente la implementación de las mejoras de producción para el despliegue intranet:

---

## ✅ **Mejoras Implementadas**

### **1. PM2 Configuration**
- ✅ Archivo `ecosystem.config.js` configurado
- ✅ Cluster mode para máxima performance
- ✅ Auto-restart y monitoreo de memoria
- ✅ Logs rotativos y estructurados

### **2. Environment Management**
- ✅ Archivo `.env.production` optimizado
- ✅ Validación de configuración
- ✅ Variables de entorno seguras

### **3. Scripts de Deploy**
- ✅ Script `scripts/deploy.sh` automatizado
- ✅ Health checks integrados
- ✅ Backup automático de base de datos
- ✅ Rollback automático en caso de error

### **4. Package.json Enhanced**
- ✅ Scripts de producción completos
- ✅ Comandos PM2 integrados
- ✅ Scripts de backup y deploy

---

## 🚀 **Comandos de Despliegue**

### **Desarrollo**
```bash
# Iniciar desarrollo con PM2
npm run start:dev

# Ver logs
npm run logs

# Monitoreo
npm run monit
```

### **Producción**
```bash
# Despliegue completo (automático)
npm run deploy

# O paso a paso:
npm run config:prod    # Configurar entorno producción
npm run test:ci        # Ejecutar tests
npm run start:prod     # Iniciar producción

# Gestión PM2
npm run status         # Ver estado
npm run restart        # Reiniciar
npm run stop          # Detener
```

### **Deploy Automático**
```bash
# Development deployment
./scripts/deploy.sh development

# Production deployment (con backup automático)
./scripts/deploy.sh production
```

---

## 📊 **Arquitectura de Producción**

```
🖥️  Clientes LAN (192.168.18.x)
    │ HTTP/HTTPS
    ▼
🌐 Next.js Frontend (IP:3000)
    │ API Calls
    ▼
⚡ PM2 Cluster - Fastify API
    ├── Worker 1 (Core 1)
    ├── Worker 2 (Core 2)
    ├── Worker 3 (Core 3)
    └── Worker 4 (Core 4)
    │
    ▼
🐘 PostgreSQL + PostGIS (192.168.18.246:5434)
```

---

## 🔐 **Seguridad en Producción**

### **Configuración Implementada**
```env
# Security headers
HELMET_ENABLED=true
TRUST_PROXY=true

# Rate limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=1m

# File security
MAX_FILE_SIZE=52428800
MAX_FEATURES=10000
```

### **Monitoreo y Logs**
- ✅ Logs estructurados con timestamp
- ✅ Rotación automática de logs
- ✅ Health checks cada 10 segundos
- ✅ Métricas de performance en `/metrics`

---

## 📈 **Performance Optimizations**

### **PM2 Cluster Mode**
- ✅ Múltiples workers para máxima CPU
- ✅ Auto-restart en caso de crash
- ✅ Memory limit monitoring
- ✅ Graceful shutdown

### **Database Connection**
- ✅ Connection pooling automático
- ✅ Queries optimizadas con PostGIS
- ✅ Índices GIST para performance espacial

---

## 🎯 **URLs de Producción**

Una vez desplegado, los endpoints serán accesibles en:

```bash
# Principal (intranet)
http://192.168.18.246:3000

# Health check
http://192.168.18.246:3000/health

# Métricas del sistema
http://192.168.18.246:3000/metrics

# API endpoints
http://192.168.18.246:3000/api/upload/geojson
http://192.168.18.246:3000/api/maps
```

---

## 🛠️ **Troubleshooting**

### **Verificar Estado**
```bash
# Estado de PM2
npm run status

# Logs recientes
npm run logs

# Logs de error específicos
pm2 logs map-catalog-api --err --lines 50
```

### **Restart Limpio**
```bash
# Reinicio completo
npm run stop
sleep 2
npm run start:prod
```

### **Backup y Restore**
```bash
# Backup manual
npm run backup:db

# Ver backups
ls -la backups/
```

---

## 🎉 **Next Steps: Frontend Implementation**

Con el backend listo para producción, el siguiente paso es implementar el frontend Next.js 16 siguiendo el informe `informe_conexion_nextjs16.md`.

### **Comando para crear frontend:**
```bash
# Desde fuera del directorio actual
cd ../
npx create-next-app@16 map-catalog-frontend --typescript --tailwind --eslint --app
cd map-catalog-frontend
```

---

## ✅ **CONCLUSIÓN**

**🚀 La API está 100% lista para producción con:**

- ✅ **Despliegue automatizado** con backup
- ✅ **Monitoreo profesional** con PM2
- ✅ **Seguridad enterprise** con rate limiting
- ✅ **Performance óptima** con clustering
- ✅ **Logs estructurados** para debugging
- ✅ **Health checks** automáticos

**El sistema está preparado para el frontend y uso en producción inmediata.**