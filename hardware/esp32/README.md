# DHIYA ESP32-S3 firmware

Arduino sketch for the DHIYA solar tracker prototype. It reads four light sensors (LDRs) and the solar panel voltage, drives the two tracking servos and the cleaning servo, and serves a small JSON HTTP API. The dashboard's **Solar Hardware** panel uses that API over the local network.

```
hardware/esp32/
  README.md                       this file
  DHIYA_ESP32_S3/
    DHIYA_ESP32_S3.ino            the sketch
    secrets_example.h             Wi-Fi configuration template (placeholders only)
    secrets.h                     your real Wi-Fi settings: you create this, and Git ignores it
```

The sketch lives in its own `DHIYA_ESP32_S3/` folder because the Arduino IDE requires a sketch folder to have the same name as its `.ino` file.

> **Local network only.** The firmware and dashboard talk over your Wi-Fi network. The public GitHub Pages site is static and **cannot** reach or control the ESP32. Run the dashboard locally (`npm run dev`) on the same network to use the hardware controls.

## Hardware

| Item | Details |
|---|---|
| Board | ESP32-S3 development board |
| Light sensors | 4 × LDR (top-left, top-right, bottom-left, bottom-right) on analog inputs |
| Panel voltage | Solar panel voltage through a 10 kΩ / 10 kΩ voltage divider |
| Servos | Horizontal (pan) tracking, vertical (tilt) tracking, and cleaning servo; 50 Hz, 500–2400 µs pulses |

### Pin assignments

| Function | GPIO | Notes |
|---|---|---|
| LDR top-left (`LDR_TL`) | 1 | ADC1 |
| LDR top-right (`LDR_TR`) | 2 | ADC1 |
| LDR bottom-left (`LDR_BL`) | 3 | ADC1 |
| LDR bottom-right (`LDR_BR`) | 4 | ADC1 |
| Solar voltage (`SOLAR_VOLTAGE_PIN`) | 8 | ADC1, through the divider |
| Horizontal servo (`SERVO_H_PIN`) | 15 | limits 5–175°, starts at 90° |
| Vertical servo (`SERVO_V_PIN`) | 16 | limits 1–100°, starts at 45° |
| Cleaning servo (`SERVO_C_PIN`) | 9 | 0° at rest, 90° during the first half of a cleaning cycle |

All analog inputs are on ADC1, which keeps working while Wi-Fi is active. (ADC2 pins can't be read reliably while Wi-Fi is on.)

## Software requirements

| Requirement | Version used for the compile check |
|---|---|
| [Arduino IDE 2](https://www.arduino.cc/en/software) or `arduino-cli` | arduino-cli 1.5.1 |
| **esp32** board package by Espressif (Boards Manager) | 3.3.12 |
| **ESP32Servo** library by Kevin Harrington and John K. Bennett (Library Manager) | 3.2.1 |

`WiFi.h` and `WebServer.h` come with the esp32 board package, and `math.h` is part of the standard C library. ESP32Servo is the only library you need to install.

## Wi-Fi setup

Wi-Fi credentials are kept out of the repository:

1. In `hardware/esp32/DHIYA_ESP32_S3/`, copy `secrets_example.h` to **`secrets.h`**.
2. Edit `secrets.h` and set your network name and password:

   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```

`secrets.h` is listed in the repository's `.gitignore`, so Git won't commit it. If it's missing, compilation stops with the message `secrets.h not found: copy secrets_example.h to secrets.h ...`.

The ESP32 needs a 2.4 GHz network; the ESP32-S3 doesn't support 5 GHz Wi-Fi.

## Upload

### Arduino IDE

1. Install the **esp32** board package (**Tools → Board → Boards Manager**, search "esp32") and the **ESP32Servo** library (**Tools → Manage Libraries**).
2. Open `hardware/esp32/DHIYA_ESP32_S3/DHIYA_ESP32_S3.ino`.
3. Choose **Tools → Board → esp32 → ESP32S3 Dev Module** (or your exact board model) and the board's serial port.
4. Click **Upload**.
5. Open the **Serial Monitor** at **115200 baud**. The sketch prints `ESP32-S3 IP: ...` once connected, then sensor readings every 0.5 s.

If the Serial Monitor stays empty with the board connected through its native USB port, set **Tools → USB CDC On Boot → Enabled** and upload again.

### arduino-cli

```bash
arduino-cli core install esp32:esp32
arduino-cli lib install ESP32Servo
arduino-cli compile --fqbn esp32:esp32:esp32s3 hardware/esp32/DHIYA_ESP32_S3
arduino-cli upload  --fqbn esp32:esp32:esp32s3 -p <PORT> hardware/esp32/DHIYA_ESP32_S3
arduino-cli monitor -p <PORT> -c baudrate=115200
```

## Connecting the dashboard

1. Note the IP address printed in the Serial Monitor.
2. In the project root, copy `.env.example` to `.env.local` and set `ESP32_URL=http://<that IP>`.
3. Run `npm run dev` on a computer on the **same Wi-Fi network**, then open the **Soiling & Cleaning** section. See [Connecting the ESP32](../../README.md#connecting-the-esp32) in the main README.

## HTTP API

The server listens on port 80. All responses are JSON and include `Access-Control-Allow-Origin: *` and `Cache-Control: no-store`. Each route also answers `OPTIONS` with `204` for CORS preflight requests.

### `GET /api/status`

Current sensor readings and state. These fields match the `SolarStatus` type the dashboard expects ([`src/services/esp32.ts`](../../src/services/esp32.ts)).

```json
{
  "connected": true,
  "solarVoltage": 5.12,
  "ldr": { "tl": 2100, "tr": 2050, "bl": 1980, "br": 1990 },
  "angleH": 90,
  "angleV": 45,
  "angleClean": 0,
  "trackingEnabled": true,
  "cleaning": false
}
```

(Example values; LDR readings are raw 12-bit ADC values from 0 to 4095.)

### `GET /api/clean`

Starts a cleaning cycle: the cleaning servo goes to 90° for 1.25 s, then back to 0° for another 1.25 s (`CLEAN_DURATION` = 2.5 s). Tracking pauses while cleaning.

| Response | When |
|---|---|
| `200 {"message":"Cleaning started"}` | Cycle started |
| `409 {"error":"Cleaning in progress"}` | A cycle is already running |

### `GET /api/tracking?enabled=1` and `GET /api/tracking?enabled=0`

Turns automatic solar tracking on (`1`) or off (`0`). Tracking is on at boot.

| Response | When |
|---|---|
| `200 {"trackingEnabled":true}` or `200 {"trackingEnabled":false}` | Updated |
| `400 {"error":"Missing enabled parameter"}` | No `enabled` parameter |
| `400 {"error":"enabled must be 0 or 1"}` | Any other value |

Any other path returns `404 {"error":"Endpoint not found"}`.

## How tracking works

Every 100 ms, the sketch compares the average of the top LDRs with the bottom pair, and the left pair with the right pair. When a difference exceeds `LDR_TOLERANCE` (90), the matching servo moves 1° toward the brighter side, within its limits. If a servo moves the wrong way on your build, set `H_DIRECTION` or `V_DIRECTION` to `-1`.

## Security and limitations

- **No authentication.** Anyone on the same network can read the status and trigger cleaning or tracking changes. The API also allows cross-origin requests and changes state with `GET`, so a web page opened on a device on the same network could send these commands. Use the board only on a trusted network, and never expose it to the internet through port forwarding.
- **Startup waits for Wi-Fi.** `setup()` keeps retrying until Wi-Fi connects, so the API and tracking don't start without a network.
- **Approximate voltage reading.** The conversion assumes a 3.3 V full scale. With 11 dB attenuation, the ESP32-S3's usable ADC range is a little lower and not perfectly linear, so treat `solarVoltage` as an estimate. With the 10 kΩ / 10 kΩ divider, keep the panel voltage within about twice the ADC input range (roughly 6 V). The GPIO pin itself must never see more than 3.3 V.

## Testing status

The sketch was **compile-checked only**: arduino-cli 1.5.1, esp32 board package 3.3.12, ESP32Servo 3.2.1, board `esp32:esp32:esp32s3`, with placeholder credentials. It compiled with no warnings from the sketch. It has **not** been tested on hardware as part of adding it to this repository. The firmware logic and pin assignments are unchanged from the working sketch; the only change is that the Wi-Fi credentials moved to `secrets.h`.
