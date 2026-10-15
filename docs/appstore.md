# Publicar en la App Store

Todo lo que se puede preparar sin la cuenta de Apple ya está en el repo. Lo que queda necesita tu Apple ID y tu cuenta de desarrollador, así que lo haces tú.

## Ya preparado

| Qué | Dónde |
|---|---|
| Bundle ID `com.alejandrorodriguez.silencegame`, versión 1.0.0 (build 1) | `app.json` |
| Icono 1024×1024 sin transparencia (Xcode genera el resto de tamaños) | `assets/icon.png` |
| Pantalla de arranque (búho sobre fondo noche) | `expo-splash-screen` en `app.json` |
| Texto del permiso de micrófono en inglés y español | `app.json` (plugin `expo-audio`) y `languages/*.json` |
| `ITSAppUsesNonExemptEncryption = false` (no hay que rellenar la exportación de cifrado) | `app.json` |
| Privacy manifest (`PrivacyInfo.xcprivacy`): sin tracking, sin datos recogidos, motivos de las API usadas | `app.json` → `ios.privacyManifests` |
| Ciclo de vida UIScene, obligatorio con el SDK de iOS 27 | `plugins/withSceneLifecycle.js` |
| Ficha en inglés y español: nombre, subtítulo, descripción, keywords, texto promocional, novedades, URLs | `fastlane/metadata/` |
| Notas para el revisor de Apple | `fastlane/metadata/review_information/notes.txt` |
| Capturas 6,9" (1320×2868) y 6,5" (1284×2778) en los dos idiomas | `fastlane/screenshots/` |
| Web de ayuda y política de privacidad | `docs/` (para GitHub Pages) |

## Lo que tienes que hacer tú

1. **Cuenta de desarrollador.** Apple Developer Program (99 €/año) con tu Apple ID.La app es gratuita, así que no hace falta el acuerdo de apps de pago ni datos bancarios.

2. **Publicar la web.** En GitHub → Settings → Pages del repo: *Deploy from a branch*, rama `main`, carpeta `/docs`. Comprueba que abren:
   - https://alejandrorodriguezalvarez884-dot.github.io/silence-game/privacy.html
   - https://alejandrorodriguezalvarez884-dot.github.io/silence-game/support.html

3. **Crear la app en App Store Connect** (Mis apps → +): plataforma iOS, nombre `Silence Game: Sleepy Owl` (o el que esté libre), idioma principal Español (España) o Inglés, bundle ID `com.alejandrorodriguez.silencegame`, SKU `silencegame`. Si el nombre está cogido, cambia `fastlane/metadata/*/name.txt`.

4. **Compilar y subir el binario.** Con EAS (no necesita Xcode, gestiona los certificados por ti):

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest build --platform ios --profile production
   npx eas-cli@latest submit --platform ios --latest
   ```

   O en local con Xcode: `npx expo prebuild --platform ios`, abre `ios/SilenceGame.xcworkspace`, en *Signing & Capabilities* elige tu equipo, y luego *Product → Archive → Distribute App → App Store Connect*. La versión ya se compila y archiva sin firmar con:

   ```bash
   cd ios && xcodebuild -workspace SilenceGame.xcworkspace -scheme SilenceGame -configuration Release \
     -destination 'generic/platform=iOS' -archivePath build/SilenceGame.xcarchive archive DEVELOPMENT_TEAM=<TU_TEAM_ID>
   ```

5. **Ficha.** Copia los textos de `fastlane/metadata/` y sube las capturas de `fastlane/screenshots/` (o, con fastlane instalado, `fastlane deliver` desde la raíz del repo).
   - Categoría: Juegos → Familia (secundaria: Entretenimiento).
   - Precio: Gratis, disponible en todos los países.
   - Clasificación por edades: responde «No» a todo → 4+.
   - Privacidad de la app: **No se recogen datos**.
   - Notas de revisión: pega `review_information/notes.txt`. No hace falta cuenta de prueba.

6. **Enviar a revisión** desde App Store Connect cuando el build aparezca procesado.

## Puntos de las App Review Guidelines revisados

- **2.1 Completitud:** sin pantallas vacías ni enlaces rotos (siempre que la web de `docs/` esté publicada).
- **2.3 Metadatos:** las capturas son de la app real; el nombre y subtítulo no repiten keywords.
- **5.1.1 Permisos:** el micrófono se pide solo al empezar una partida y con un texto que explica para qué; si se deniega, la app lo explica y ofrece abrir Ajustes.
- **5.1.2 Datos:** la app no recoge nada; coincide con la etiqueta de privacidad y el privacy manifest.
- **1.3 Categoría Niños:** no se ha elegido la categoría *Kids* (obligaría a una barrera parental en los enlaces). Si la quieres, la app ya cumple el resto: sin anuncios, sin analítica y sin compras.
- **4.2 Funcionalidad mínima:** juego completo con dos modos, sonidos, voz y récord.
