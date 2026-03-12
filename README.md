# 🌱 Ecosistema Personal · Paola Zerpa

App personal de gestión de hábitos, semana y reflexión — con identidad de marca completa.

---

## Deploy en Vercel (5 minutos)

### Opción A — Desde GitHub (recomendada)

1. Subí esta carpeta a un repositorio en [github.com](https://github.com)
   - Creá repo nuevo → subí todos los archivos
   
2. Entrá a [vercel.com](https://vercel.com) → **Add New Project**

3. Conectá tu repo de GitHub

4. Vercel detecta Vite automáticamente. Sin tocar nada → **Deploy**

5. Tu URL queda como: `ecosistema-paola.vercel.app` (o el nombre que elijas)

---

### Opción B — Desde Vercel CLI

```bash
npm install -g vercel
cd ecosistema-paola
npm install
vercel
```

---

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`

---

## Estructura

```
ecosistema-paola/
├── index.html          # Entry point
├── vite.config.js      # Vite config
├── vercel.json         # SPA routing
├── public/
│   └── favicon.svg     # Ícono de marca
└── src/
    ├── main.jsx        # Bootstrap + storage shim
    └── App.jsx         # App completa
```

## Notas

- Los datos se guardan en `localStorage` del navegador → persisten entre sesiones
- El storage shim en `main.jsx` traduce la API de Claude al localStorage estándar
- Fuentes cargadas desde Google Fonts (requiere conexión)

---

*Paola Zerpa · Diseño & Sistemas · 2025*
