# Portfolio de Saúl Alejandro Rendón Cocom

Portfolio bilingüe ES/EN con Next.js, React, TypeScript y una escena espacial con React Three Fiber.

## Desarrollo

Requiere Node.js 22 o superior.

```sh
npm ci
npm run dev
```

## Validación

```sh
npm test
npm run build
npm run check:glsl
npx playwright install --with-deps chromium
npm run test:e2e
```

Los 7 tests de contrato de eventos se ejecutan con `npm test`, sin navegador.

Las pruebas de navegador levantan automáticamente el servidor de producción en `127.0.0.1:3102`. Es necesario generar el build antes. Para usar un servidor existente, configura `PORTFOLIO_TEST_URL`; para usar un Chromium instalado, configura `PLAYWRIGHT_EXECUTABLE_PATH`.

GitHub Actions ejecuta estos controles en cada push y pull request. `check:glsl` verifica el balance de sintaxis de los shaders; no sustituye la compilación de GLSL en una GPU real.

## Navegación y accesibilidad

- Los paneles conservan su desplazamiento interno. Un gesto que termina de desplazar un panel no cambia de sección al alcanzar el borde.
- Rueda vertical, flechas, Page Up/Down y gestos táctiles permiten cambiar de sección. Los controles interactivos conservan sus teclas nativas; Ctrl + rueda conserva el zoom del navegador.
- Anterior/Siguiente están disponibles también en móvil.
- Los proyectos se pueden abrir con Enter o Espacio. Los modales retienen el foco, bloquean el fondo y devuelven el foco al cerrar con Escape.
- `prefers-reduced-motion` muestra un fondo estático y evita montar WebGL. Un error de creación o pérdida del contexto gráfico conserva el contenido y la navegación con ese fondo.
- El idioma actualiza `html[lang]`; el sitio sigue funcionando si el navegador bloquea `localStorage`.
- El audio requiere activación explícita. Si el navegador rechaza activarlo, el control permanece silenciado.

## Contenido

Datos profesionales en `src/data/`, traducciones en `src/locales/` y metadatos en `src/app/layout.tsx`. Antes de publicar, verificar el dominio canónico, el perfil de LinkedIn y el respaldo de las métricas de proyectos. La configuración de metadatos no implica que el dominio esté registrado o conectado.

La telemetría gráfica se puede abrir con `/?debug=1`.
