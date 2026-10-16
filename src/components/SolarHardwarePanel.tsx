
import { useEffect, useState } from "react";
import {
  getSolarStatus,
  startCleaning,
  setTracking,
  type SolarStatus,
} from "../services/esp32";

export default function SolarHardwarePanel() {
  const [data, setData] = useState<SolarStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    const refresh = async () => {
      // Skip a tick rather than stacking requests on the single-client ESP32.
      if (inFlight) return;
      inFlight = true;

      try {
        const status = await getSolarStatus();

        if (active) {
          setData(status);
          setError("");
        }
      } catch (err) {
        console.error("ESP32 status request failed:", err);
        if (active) {
          const reason = err instanceof Error ? ` (${err.message})` : "";
          setError(
            `Cannot connect to ESP32. Check Wi-Fi and IP address.${reason}`
          );
        }
      } finally {
        inFlight = false;
      }
    };

    void refresh();

    const timer = window.setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  async function handleCleaning() {
    setBusy(true);
    setError("");

    try {
      await startCleaning();
      setData(await getSolarStatus());
    } catch {
      setError("Unable to start cleaning.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTracking(enabled: boolean) {
    setError("");

    try {
      await setTracking(enabled);
      setData(await getSolarStatus());
    } catch {
      setError("Unable to change tracking mode.");
    }
  }

  const cardStyle = {
    border: "1px solid #333",
    borderRadius: 12,
    padding: 16,
    background: "#171717",
    color: "#f5f5f5",
  } as const;

  const buttonStyle = {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #555",
    cursor: "pointer",
  } as const;

  return (
    <section style={{ display: "grid", gap: 16, color: "inherit" }}>
      <div style={cardStyle}>
        <h2>Solar Hardware</h2>
        <p>
          Connection:{" "}
          <strong>
            {data ? "Connected" : "Waiting for ESP32"}
          </strong>
        </p>
        <p>
          Solar Panel Voltage:{" "}
          <strong>
            {data ? `${data.solarVoltage.toFixed(2)} V` : "--"}
          </strong>
        </p>
        <p>
          Horizontal Angle: {data ? `${data.angleH}°` : "--"}
        </p>
        <p>
          Vertical Angle: {data ? `${data.angleV}°` : "--"}
        </p>
        <p>
          Cleaning Servo Angle:{" "}
          {data ? `${data.angleClean}°` : "--"}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Light Sensors (LDR)</h3>
        <p>Top left: {data?.ldr.tl ?? "--"}</p>
        <p>Top right: {data?.ldr.tr ?? "--"}</p>
        <p>Bottom left: {data?.ldr.bl ?? "--"}</p>
        <p>Bottom right: {data?.ldr.br ?? "--"}</p>
      </div>

      <div style={cardStyle}>
        <h3>Controls</h3>

        <p>
          Tracking:{" "}
          {data?.trackingEnabled ? "Automatic ON" : "OFF"}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            style={buttonStyle}
            disabled={!data || busy}
            onClick={() => void handleTracking(true)}
          >
            Enable Tracking
          </button>

          <button
            style={buttonStyle}
            disabled={!data || busy}
            onClick={() => void handleTracking(false)}
          >
            Disable Tracking
          </button>

          <button
            style={buttonStyle}
            disabled={!data || busy || data.cleaning}
            onClick={() => void handleCleaning()}
          >
            {data?.cleaning
              ? "Cleaning in progress..."
              : "Start Cleaning"}
          </button>
        </div>

        <p>
          Cleaning status:{" "}
          {data?.cleaning ? "In progress" : "Idle"}
        </p>

        {error && (
          <p role="alert" style={{ color: "#ff8080" }}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
