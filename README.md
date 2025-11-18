# TyFlow - Gestor de Tickets

TyFlow es una aplicación sencilla para gestionar y asignar tickets de manera aleatoria entre los miembros del equipo.

## Características
- Asignación aleatoria de tickets.
- Registro de actividades.
- Integración con Supabase para autenticación y almacenamiento.

## Estructura del Proyecto
```
TyFlow/
│
├── index.html                # Página principal
├── styles/
│   ├── main.css              # Estilos generales
├── scripts/
│   ├── main.js               # Lógica principal del sistema
│   ├── supabaseClient.js     # Configuración y conexión con Supabase
├── assets/
│   ├── images/               # Carpeta para imágenes
│   ├── icons/                # Carpeta para íconos
├── logs/
│   └── activity.log          # Archivo para guardar logs locales (opcional)
└── README.md                 # Documentación del proyecto
```

## Configuración
1. Clona este repositorio.
2. Configura tu proyecto de Supabase y actualiza `supabaseClient.js` con tu URL y clave pública.
3. Abre `index.html` en tu navegador.

## Tecnologías
- HTML, CSS, JavaScript
- [Supabase](https://supabase.com/)