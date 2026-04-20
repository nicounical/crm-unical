# CRM Unical

CRM propio para prospección B2B de agencias de eventos y empresas MICE en Europa.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Desplegar en Vercel (paso a paso)

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "CRM Unical inicial"
git branch -M main
# Crea un repo vacío en github.com (sin README, sin .gitignore)
git remote add origin https://github.com/TU_USUARIO/crm-unical.git
git push -u origin main
```

### 2. Desplegar

1. Entra en https://vercel.com y loguéate con GitHub
2. Click en "Add New..." → "Project"
3. Importa el repo `crm-unical`
4. Vercel detecta Vite automáticamente, deja todo por defecto
5. Click "Deploy"

En 1-2 minutos tendrás una URL tipo `crm-unical-TU_USUARIO.vercel.app`.

### 3. Actualizar

Cada vez que hagas `git push`, Vercel redespliega solo.

## Datos

Los prospects, plantillas y recordatorios viven en `localStorage` de tu navegador.
No hay backend, no hay base de datos — todo es local a tu Chrome.

**Importante**: si cambias de navegador o borras datos de Chrome, pierdes los prospects.
Usa el botón "Exportar" en Pipeline para sacar CSV de backup.
