# Silence Game / El juego del silencio

App móvil (iOS y Android) para jugar al juego del silencio con niños, pensada para el coche. Un búho dormido escucha con el micrófono: si alguien hace ruido, se despierta, suena un trombón triste y el que ha hecho ruido queda fuera. Español e inglés según el idioma del dispositivo, nombre de la app incluido.

## Cómo se juega

- **Sin nombres (o con uno):** todos juntos contra el reloj. Si se oye un ruido, se acaba la partida y se ve cuánto aguantasteis.
- **Con dos o más nombres:** eliminatoria. Al oír un ruido la app pregunta «¿Quién ha sido?»; el elegido queda fuera (la app dice su nombre en voz alta) y el resto sigue. Gana el último en silencio, o los que queden cuando se acabe el tiempo. «Nadie, seguir jugando» sirve para las falsas alarmas.
- Duración: 1, 3, 5 o 10 minutos. Se guarda el récord de silencio.

## Detección de ruido

1. Al empezar (y tras cada eliminación) hay una cuenta atrás de 3 s en la que se mide el ruido de fondo (motor del coche, carretera).
2. Después, un sonido cuenta como ruido si supera ese fondo en un margen durante varias lecturas seguidas (cada 100 ms):

| Oído del búho | Para | Margen | Lecturas |
|---|---|---|---|
| Fino | Coche, ruido de fondo | +16 dB | 3 |
| Muy fino | Casa | +11 dB | 2 |
| Finísimo | Habitación en silencio | +7 dB | 1 |

3. El fondo se reajusta poco a poco (unos 10 s) para seguir cambios lentos, como acelerar en la autopista, sin aprender de los gritos.

Los valores están en `src/game.ts` (`SENSITIVITY`) y `src/useNoiseMonitor.ts`. Solo se usa el nivel de volumen en directo; la grabación temporal se borra al parar.

## Desarrollo

```bash
npm install
npx expo start          # escanea el QR con Expo Go
npx expo start --web    # vista rápida en el navegador (pide el micrófono)
npx tsc --noEmit && npx expo lint && npm test
npx expo run:ios        # build nativa en el simulador (necesita Xcode y CocoaPods)
```

Los tests (`src/__tests__/`, Jest con `jest-expo`) cubren las reglas de la partida con el micrófono simulado, la pantalla de ajustes, el guardado y los textos.

## Estructura

- `App.tsx`: carga fuentes y ajustes, alterna entre ajustes y partida
- `src/useNoiseMonitor.ts`: micrófono, calibración y detección de ruido
- `src/useSilenceGame.ts`: reglas de la partida, reloj, sonidos, voz y pantalla siempre encendida
- `src/screens/`: ajustes, partida y resultado
- `src/components/`: búho en SVG, anillo de ruido, cielo estrellado, botones
- `src/i18n.ts`: textos en español e inglés
- `languages/`: nombre de la app y texto del permiso de micrófono traducidos
- `scripts/generate-sounds.mjs`: genera `assets/sounds/eliminated.wav` y `win.wav`
- `scripts/generate-icons.mjs`: genera el icono, el splash y el favicon
- `plugins/withSceneLifecycle.js`: adopta el ciclo de vida UIScene, obligatorio con el SDK de iOS 27 (sin él la app se cierra al abrir)
- `docs/`: web de la app para GitHub Pages (inicio, ayuda y política de privacidad)
- `fastlane/metadata/`: ficha de App Store en español e inglés; `fastlane/screenshots/`: capturas de 6,9" y 6,5"

## Publicación

Las builds se compilan en la nube con EAS (`npx eas-cli@latest build`), así que no hace falta un Mac para iOS. El identificador del paquete es `com.alejandrorodriguez.silencegame`. La app es gratuita, sin anuncios ni compras dentro de la app.

Los pasos que faltan para la App Store están en [docs/appstore.md](docs/appstore.md).
