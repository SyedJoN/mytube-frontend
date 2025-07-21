import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/telemetry";

export async function sendTelemetry(telemetryData) {
  console.log("📤 Sending telemetryData:", telemetryData);

  try {
    await axios.post(
      `${BASE_URL}/stats`,
      {
        telemetryData,
      },
    );
  } catch (error) {
    console.error("❌ Telemetry failed:", error.response?.data);
  }
}
