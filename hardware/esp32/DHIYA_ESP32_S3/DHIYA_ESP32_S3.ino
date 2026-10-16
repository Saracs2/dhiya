#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include <math.h>

// ==========================================
// 1. Wi-Fi
// ==========================================
// WIFI_SSID and WIFI_PASSWORD are defined in secrets.h, which is git-ignored.
// Copy secrets_example.h to secrets.h in this folder and fill in your network.
#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "secrets.h not found: copy secrets_example.h to secrets.h and set WIFI_SSID and WIFI_PASSWORD."
#endif

// ==========================================
// 2. GPIO Pins - Existing DHIYA Wiring
// ==========================================
const int LDR_TL = 1;
const int LDR_TR = 2;
const int LDR_BL = 3;
const int LDR_BR = 4;

const int SOLAR_VOLTAGE_PIN = 8;

const int SERVO_H_PIN = 15;
const int SERVO_V_PIN = 16;
const int SERVO_C_PIN = 9;

// ==========================================
// 3. Voltage Divider
// ==========================================
const float R1 = 10000.0;
const float R2 = 10000.0;
const float ADC_REFERENCE = 3.3;

// ==========================================
// 4. Servo Limits and Tracking Settings
// ==========================================
const int SERVO_H_MIN = 5;
const int SERVO_H_MAX = 175;

const int SERVO_V_MIN = 1;
const int SERVO_V_MAX = 100;

const int SERVO_H_START = 90;
const int SERVO_V_START = 45;

const int LDR_TOLERANCE = 90;

const unsigned long TRACK_INTERVAL = 100;
const unsigned long SERIAL_INTERVAL = 500;
const unsigned long CLEAN_DURATION = 2500;

// Set these to -1 if your LDR readings decrease
// when the light becomes brighter.
const int H_DIRECTION = 1;
const int V_DIRECTION = 1;

// ==========================================
// 5. Objects and State
// ==========================================
WebServer server(80);

Servo servoH;
Servo servoV;
Servo servoClean;

int angleH = SERVO_H_START;
int angleV = SERVO_V_START;
int angleClean = 0;

bool trackingEnabled = true;
bool cleaning = false;

unsigned long cleanStarted = 0;
unsigned long lastTracking = 0;
unsigned long lastSerialPrint = 0;

// ==========================================
// 6. Read LDR Sensors
// ==========================================
int readLDR(int pin) {
  return analogRead(pin);
}

void readAllLDR(int &tl, int &tr, int &bl, int &br) {
  tl = readLDR(LDR_TL);
  tr = readLDR(LDR_TR);
  bl = readLDR(LDR_BL);
  br = readLDR(LDR_BR);
}

// ==========================================
// 7. Read Solar Voltage
// ==========================================
float readSolarVoltage() {
  uint32_t total = 0;

  for (int i = 0; i < 16; i++) {
    total += analogRead(SOLAR_VOLTAGE_PIN);
    delayMicroseconds(200);
  }

  float raw = total / 16.0;
  float adcVoltage = raw * (ADC_REFERENCE / 4095.0);

  return adcVoltage * (R1 + R2) / R2;
}

// ==========================================
// 8. API Helpers
// ==========================================
void addCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.sendHeader("Cache-Control", "no-store");
}

void sendJSON(int code, const String &body) {
  addCORS();
  server.send(code, "application/json", body);
}

void handleOptions() {
  addCORS();
  server.send(204);
}

// ==========================================
// 9. GET /api/status
// ==========================================
void handleStatus() {
  int tl, tr, bl, br;
  readAllLDR(tl, tr, bl, br);

  float solarVoltage = readSolarVoltage();

  String json = "{";
  json += "\"connected\":true,";
  json += "\"solarVoltage\":" + String(solarVoltage, 2) + ",";

  json += "\"ldr\":{";
  json += "\"tl\":" + String(tl) + ",";
  json += "\"tr\":" + String(tr) + ",";
  json += "\"bl\":" + String(bl) + ",";
  json += "\"br\":" + String(br);
  json += "},";

  json += "\"angleH\":" + String(angleH) + ",";
  json += "\"angleV\":" + String(angleV) + ",";
  json += "\"angleClean\":" + String(angleClean) + ",";

  json += "\"trackingEnabled\":";
  json += trackingEnabled ? "true" : "false";
  json += ",";

  json += "\"cleaning\":";
  json += cleaning ? "true" : "false";

  json += "}";

  sendJSON(200, json);
}

// ==========================================
// 10. GET /api/clean
// ==========================================
void handleClean() {
  if (cleaning) {
    sendJSON(409, "{\"error\":\"Cleaning in progress\"}");
    return;
  }

  cleaning = true;
  cleanStarted = millis();

  angleClean = 90;
  servoClean.write(angleClean);

  Serial.println("Cleaning started");

  sendJSON(200, "{\"message\":\"Cleaning started\"}");
}

// ==========================================
// 11. GET /api/tracking?enabled=1 or 0
// ==========================================
void handleTracking() {
  if (!server.hasArg("enabled")) {
    sendJSON(400, "{\"error\":\"Missing enabled parameter\"}");
    return;
  }

  String value = server.arg("enabled");

  if (value != "0" && value != "1") {
    sendJSON(400, "{\"error\":\"enabled must be 0 or 1\"}");
    return;
  }

  trackingEnabled = (value == "1");

  if (!trackingEnabled) {
    Serial.println("Solar tracking disabled");
  } else {
    Serial.println("Solar tracking enabled");
  }

  String json = trackingEnabled
    ? "{\"trackingEnabled\":true}"
    : "{\"trackingEnabled\":false}";

  sendJSON(200, json);
}

// ==========================================
// 12. Solar Tracking - Integrated Reference Logic
// ==========================================
void updateTracking() {
  if (!trackingEnabled || cleaning) return;
  if (millis() - lastTracking < TRACK_INTERVAL) return;

  lastTracking = millis();

  int tl, tr, bl, br;
  readAllLDR(tl, tr, bl, br);

  // Averages from the reference algorithm
  int avt = (tl + tr) / 2;  // Top
  int avd = (bl + br) / 2;  // Bottom
  int avl = (tl + bl) / 2;  // Left
  int avr = (tr + br) / 2;  // Right

  int dvert = avt - avd;
  int dhoriz = avl - avr;

  // Vertical tracking
  if (abs(dvert) > LDR_TOLERANCE) {
    // Reference behavior: brighter top moves angle upward.
    // Adjust V_DIRECTION if the physical servo is reversed.
    if (dvert > 0) {
      angleV += V_DIRECTION;
    } else {
      angleV -= V_DIRECTION;
    }

    angleV = constrain(angleV, SERVO_V_MIN, SERVO_V_MAX);
    servoV.write(angleV);
  }

  // Horizontal tracking
  if (abs(dhoriz) > LDR_TOLERANCE) {
    // Reference behavior: brighter left decrements horizontal angle.
    // Adjust H_DIRECTION if the physical servo is reversed.
    if (dhoriz > 0) {
      angleH -= H_DIRECTION;
    } else {
      angleH += H_DIRECTION;
    }

    angleH = constrain(angleH, SERVO_H_MIN, SERVO_H_MAX);
    servoH.write(angleH);
  }
}

// ==========================================
// 13. Cleaning Cycle - Preserved
// ==========================================
void updateCleaning() {
  if (!cleaning) return;

  unsigned long elapsed = millis() - cleanStarted;

  if (elapsed < CLEAN_DURATION / 2) {
    angleClean = 90;
  } else if (elapsed < CLEAN_DURATION) {
    angleClean = 0;
  } else {
    angleClean = 0;
    cleaning = false;
    Serial.println("Cleaning finished");
  }

  servoClean.write(angleClean);
}

// ==========================================
// 14. Serial Diagnostics
// ==========================================
void printReadings() {
  if (millis() - lastSerialPrint < SERIAL_INTERVAL) return;

  lastSerialPrint = millis();

  int tl, tr, bl, br;
  readAllLDR(tl, tr, bl, br);

  int avt = (tl + tr) / 2;
  int avd = (bl + br) / 2;
  int avl = (tl + bl) / 2;
  int avr = (tr + br) / 2;

  Serial.printf(
    "TL:%d TR:%d BL:%d BR:%d | dH:%d dV:%d | "
    "H:%d V:%d | Tracking:%s | Solar:%.2f V\n",
    tl, tr, bl, br,
    avl - avr, avt - avd,
    angleH, angleV,
    trackingEnabled ? "ON" : "OFF",
    readSolarVoltage()
  );
}

// ==========================================
// 15. Setup
// ==========================================
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  analogSetPinAttenuation(SOLAR_VOLTAGE_PIN, ADC_11db);

  analogSetPinAttenuation(LDR_TL, ADC_11db);
  analogSetPinAttenuation(LDR_TR, ADC_11db);
  analogSetPinAttenuation(LDR_BL, ADC_11db);
  analogSetPinAttenuation(LDR_BR, ADC_11db);

  servoH.setPeriodHertz(50);
  servoV.setPeriodHertz(50);
  servoClean.setPeriodHertz(50);

  servoH.attach(SERVO_H_PIN, 500, 2400);
  servoV.attach(SERVO_V_PIN, 500, 2400);
  servoClean.attach(SERVO_C_PIN, 500, 2400);

  servoH.write(angleH);
  servoV.write(angleV);
  servoClean.write(angleClean);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected!");
  Serial.print("ESP32-S3 IP: ");
  Serial.println(WiFi.localIP());

  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/clean", HTTP_GET, handleClean);
  server.on("/api/tracking", HTTP_GET, handleTracking);

  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  server.on("/api/clean", HTTP_OPTIONS, handleOptions);
  server.on("/api/tracking", HTTP_OPTIONS, handleOptions);

  server.onNotFound([]() {
    sendJSON(404, "{\"error\":\"Endpoint not found\"}");
  });

  server.begin();
  Serial.println("DHIYA API server started");
}

// ==========================================
// 16. Main Loop
// ==========================================
void loop() {
  server.handleClient();
  updateCleaning();
  updateTracking();
  printReadings();
}
