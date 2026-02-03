# Guía de Desarrollo - Aziende Platform

## Estructura del Proyecto

Este es un proyecto de micro-frontends que consiste en:

- **Starterkit - ts** (Puerto 5000): Aplicación host principal
- **AziendePlatformEditor** (Puerto 5021): Microservicio del editor y viewer

## Requisitos Previos

- Node.js v20.x o superior
- npm v10.x o superior

## Instalación Inicial

Cuando clones el proyecto por primera vez, debes instalar las dependencias en **3 ubicaciones**:

```bash
# 1. En la raíz del proyecto
npm install

# 2. En el Starterkit
cd "Starterkit - ts"
npm install

# 3. En el Editor
cd ../AziendePlatformEditor
npm install
```

## Cómo Ejecutar el Proyecto en Desarrollo

### ✅ Método Recomendado (desde la raíz)

Desde la carpeta raíz `Aziende/`, ejecuta:

```bash
npm run dev
```

Este comando:
1. Inicia automáticamente el AziendePlatformEditor en el puerto 5021
2. Espera 3 segundos para que el editor esté listo
3. Inicia el Starterkit en el puerto 5000
4. El Starterkit tiene un proxy configurado que redirige `/editor` y `/viewer` al puerto 5021

**URLs disponibles:**
- 🌐 App principal: http://localhost:5000
- 📝 Editor: http://localhost:5000/editor/?pageId=1
- 👁️ Viewer: http://localhost:5000/viewer/[id]

### ⚠️ Método Manual (NO recomendado)

Si necesitas ejecutar los servidores manualmente en terminales separadas:

```bash
# Terminal 1 - IMPORTANTE: Ejecutar PRIMERO
cd AziendePlatformEditor
npm run dev

# Terminal 2 - Ejecutar DESPUÉS (espera 3-5 segundos)
cd "Starterkit - ts"
npm run dev
```

**Orden importante:** El editor DEBE iniciar antes que el host para que el proxy funcione correctamente.

## Solución de Problemas Comunes

### Error: "concurrently no se reconoce como un comando"

**Causa:** Las dependencias no están instaladas en la raíz del proyecto.

**Solución:**
```bash
# Desde la raíz del proyecto Aziende/
npm install
```

### Error 404 al acceder a /editor o /viewer

**Causa:** El servidor del AziendePlatformEditor (puerto 5021) no está corriendo.

**Solución:**
1. Verifica que ambos servidores estén corriendo
2. Si ejecutas manualmente, asegúrate de iniciar el editor PRIMERO
3. Reinicia usando el método recomendado: `npm run dev` desde la raíz

### La página del Starterkit no carga

**Causa:** Probablemente iniciaste el host antes que el editor, o el editor no está corriendo.

**Solución:**
1. Detén todos los servidores (Ctrl+C)
2. Ejecuta `npm run dev` desde la raíz del proyecto
3. Espera a ver los mensajes de confirmación de ambos servidores

### Assets dan error 404 (src/Index.jsx, @react-refresh, etc)

**Causa:** El proxy no está funcionando correctamente.

**Solución:**
1. Verifica que el AziendePlatformEditor esté corriendo en el puerto 5021
2. Verifica que el proxy esté configurado en `Starterkit - ts/vite.config.ts`:
   ```typescript
   proxy: {
     '^/(editor|viewer|src|@|node_modules)': {
       target: 'http://localhost:5021',
       changeOrigin: true,
       ws: true,
     },
   }
   ```
3. Reinicia ambos servidores

## Configuración del Proxy

El Starterkit tiene configurado un proxy que redirige al AziendePlatformEditor:

| Ruta solicitada | Redirige a |
|----------------|------------|
| /editor/* | http://localhost:5021/editor/* |
| /viewer/* | http://localhost:5021/viewer/* |
| /src/* | http://localhost:5021/src/* |
| /@* | http://localhost:5021/@* |
| /node_modules/* | http://localhost:5021/node_modules/* |

Esto permite que todas las rutas y assets del editor funcionen correctamente a través del puerto 5000.

## Scripts Disponibles

Desde la **raíz** del proyecto:

```bash
npm run dev          # Inicia ambos servidores (recomendado)
npm run dev:host     # Solo el Starterkit
npm run dev:editor   # Solo el AziendePlatformEditor
npm run build        # Build de ambos proyectos
```

Desde **Starterkit - ts**:

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
```

Desde **AziendePlatformEditor**:

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
```

## Notas Importantes

1. **Siempre usa `npm run dev` desde la raíz** para desarrollo normal
2. El editor DEBE estar corriendo para que /editor y /viewer funcionen
3. Los puertos 5000 y 5021 deben estar libres
4. Si cambias la configuración de Vite, reinicia los servidores
