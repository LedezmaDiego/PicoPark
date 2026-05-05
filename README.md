# PicoPark — Videojuego multijugador local

Un clon de Pico Park jugable desde el navegador, donde cada jugador usa su celular como gamepad físico. Colaboración obligatoria: si no trabajan en equipo, no pasan el nivel.

---

## ¿Qué es esto?

El proyecto tiene dos partes:

- **Game** — el videojuego que corre en una computadora y se ve en pantalla
- **GamePad** — la app para Android que convierte el celular en un control

Los jugadores se conectan a la misma red que la computadora y controlan sus personajes desde el celular en tiempo real.

---

## Requisitos

### Para la computadora (servidor del juego)
- [Bun](https://bun.sh/) instalado
- Estar conectado a una red local

### Para los jugadores (gamepad)
- Un celular Android
- Estar conectado a la **misma red** que la computadora

---

## Cómo jugar

### 1. Instalar la APK en los celulares

Descargá la APK desde la sección de releases:

[**Descargar Gamepad-v1.0.0.apk**](https://github.com/LedezmaDiego/PicoPark/releases/download/v1.0.0/Gamepad-v1.0.0.apk)

> En Android, al instalar una APK externa puede aparecer una advertencia de seguridad. Aceptá "Instalar de todas formas" o habilitá la opción **"Instalar apps de orígenes desconocidos"** en los ajustes del celular.

---

### 2. Iniciar el servidor del juego

En la computadora, abrí una terminal en la carpeta `Game` y ejecutá:

```bash
cd Game
bun install
bun run dev
```

La terminal va a mostrar algo así:

```
videojuego funcionando en 192.168.X.X:3000
conectar gamepads a 192.168.X.X:3000
```

Anotá esa IP — la vas a necesitar para conectar los celulares.

---

### 3. Abrir el juego en el navegador

En la misma computadora (o en cualquier dispositivo de la red), abrí el navegador y entrá a:

```
http://192.168.X.X:3000
```

> Reemplazá `192.168.X.X` con la IP que mostró la terminal.

El juego va a aparecer en pantalla y esperar que se conecten los jugadores.

---

### 4. Conectar los gamepads

Abrí la app **GamePad** en cada celular. Vas a ver dos opciones:

#### Opción A — Vincular con QR
Hacé clic en **"Vincular con QR"** y apuntá la cámara al código QR que aparece en la pantalla del juego.

#### Opción B — Vincular con IP
Escribí la dirección IP manualmente (por ejemplo: `192.168.1.39:3000`) y tocá **"Vincular con IP"**.

Una vez conectado, el gamepad muestra los controles y aparece un punto verde de conexión.

---

## Controles

| Botón | Acción |
|---|---|
| D-Pad (izquierda / derecha) | Mover el personaje |
| D-Pad arriba (cerca de la puerta) | Entrar a la puerta |
| D-Pad abajo | Nada solo por motivos esteticos |
| Boton A | Saltar |

---

## Mecánicas del juego

- Hasta **4 jugadores** simultáneos
- Hay que conseguir la llave y llevarla hasta la puerta para abrirla
- Todos los jugadores deben entrar a la puerta para completar el nivel
- Si alguno cae al agua, el equipo vuelve al inicio
- Hay botones que activan puentes o trampolines — la colaboración es clave

### Nivel 1
Encontrá la llave, cruzá usando los botones para activar los puentes y entrá todos por la puerta.

### Nivel 2
Los botones activan trampolines con cuenta regresiva. Coordiná quién pisa el botón y quién espera en el trampolín.

---

## Solución de problemas

**El celular no puede conectarse**
- Verificá que el celular y la computadora estén en la misma red local
- Desactivá el firewall de Windows o creá una excepción para el puerto 3000

**La APK no se instala**
- Habilitá "Instalar aplicaciones de orígenes desconocidos" en Ajustes > Seguridad del celular

**El juego no aparece en el navegador**
- Asegurate de usar la IP local que muestra la terminal, no `localhost`

**Se desconectó un jugador**
- El personaje desaparece automáticamente; el jugador puede volver a conectarse desde la app

---

## Tecnologías usadas

- **Phaser 3** — motor del videojuego
- **Socket.IO** — comunicación en tiempo real entre gamepads y juego
- **Express** — servidor web
- **React Native + Expo** — app de gamepad para Android

---

## Releases

| Version | Descarga |
|---|---|
| v1.0.0 | [Gamepad-v1.0.0.apk](https://github.com/LedezmaDiego/PicoPark/releases/download/v1.0.0/Gamepad-v1.0.0.apk) |
