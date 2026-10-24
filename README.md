# Mi Primera IA

Taller y presentación para el **Día OV · IEST Anáhuac**.

> Le enseñas a una máquina a reconocer tu mano con piedra, papel y tijera.
> Tú pones las etiquetas; ella aprende de tus ejemplos.

## Rutas

| Ruta | Contenido |
|---|---|
| `/presentacion` | La charla (8 slides, teclado, notas, imprimible a PDF) |
| `/taller` | La app: captura, entrenamiento, juego y evaluación |

La raíz redirige a `/presentacion`. El QR apunta a `/taller`.

## Cómo funciona

1. **Captura**: 8 fotos por gesto. Cada foto son 63 números (21 puntos de la mano × x, y, z),
   normalizados respecto a la muñeca y al tamaño de la palma.
2. **Entrenamiento**: se guardan los ejemplos por clase y se calcula la distancia entre vectores.
3. **Juego**: la app compara tu mano con tus ejemplos (vecinos más cercanos) y muestra la etiqueta
   más parecida junto con su confianza. Si duda, dice «no estoy seguro».
4. **Evaluación**: 5 fotos nuevas por gesto, que no se usaron para aprender, para medir precisión.

Todo ocurre en el dispositivo. No hay backend, no hay cuentas y no se sube nada a internet.
Después de la primera carga funciona sin conexión.

## Correr en local

```bash
cd public
python -m http.server 8080
```

Abre `http://localhost:8080/taller`. La cámara funciona en `localhost` (contexto seguro).
Las rutas limpias (`/presentacion`, `/taller`) solo existen en Cloudflare por el archivo `_redirects`;
en local usa `/presentacion/` y `/taller/`.

## Desplegar

Cloudflare Pages → *Direct Upload* o conexión al repo:

- Build command: *(vacío)*
- Build output directory: `public`

HTTPS es obligatorio para que el navegador permita la cámara en celular.

## Estructura

```
public/
├── presentacion/     slides
├── taller/           app
├── css/              tokens (identidad Día OV) + estilos
├── js/
│   ├── presentacion/
│   └── taller/       visión, clasificador, almacenamiento, teatro
├── assets/           fuentes e imágenes
└── vendor/           MediaPipe + modelo de mano (local)
```

## Créditos

- Identidad visual: sistema de **«¡OV! Arcade Edition»** de Hannia Pérez Trejo
  (paleta, tipografías, grano y stickers del Día OV).
- Detección de mano: [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe) (Apache 2.0).
- Tipografías: **Bangers** y **Kalam** (SIL Open Font License).

## Licencia

Código bajo MIT. Los recursos de terceros conservan sus licencias.
