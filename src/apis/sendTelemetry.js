import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/telemetry"

export async function sendTelemetry(data) {
  try {
    await axios.post(`${BASE_URL}/telemetry`, data);
  } catch (error) {
    console.error("❌ Telemetry failed:", error);
  }
}
