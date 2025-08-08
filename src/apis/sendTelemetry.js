import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/telemetry";

export async function sendTelemetry(telemetryData) {
  console.log("Sending telemetryData:", telemetryData);

  if (Array.isArray(telemetryData) && telemetryData.length > 0) {
    const payload = telemetryData[0]; 

    const queryParams = {
      ns: payload.ns || 'yt',
      el: payload.el || 'home',
      docid: payload.docid,
      st: payload.st,
      et: payload.et,
      cmt: payload.cmt,
      volume: payload.volume,
      state: payload.state,
      muted: payload.muted,
      len: payload.len,
      cpn: payload.cpn,
      subscribed: payload.subscribed,
      c: 'WEB',
      cver: '2.0',
      source: payload.source,
      final: payload.final || 0,
      t: Date.now()
    };

    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== null)
    );

    try {
      const { data } = await axios.get(`${BASE_URL}/stats`, {
        params: cleanParams,
        timeout: 5000,
        withCredentials: true,
        headers: {
          'X-YouTube-Client': 'web',
          'X-Telemetry-Source': 'yt-clone'
        }
      });

      console.log("✅ Telemetry sent successfully");

  
      if (data?.data?.guestTimestamps) {
        Object.entries(data.data.guestTimestamps).forEach(([videoId, time]) => {
          sessionStorage.setItem(`resumeTime:${videoId}`, String(time));
        });
      }

    } catch (error) {
      console.warn("⚠️ Telemetry failed:", error.message);
    }
  }
}


export async function sendTelemetryBeacon(telemetryData) {
  if (Array.isArray(telemetryData) && telemetryData.length > 0) {
    const payload = telemetryData[0];
    
    const params = new URLSearchParams({
      ns: payload.ns || 'yt',
      el: payload.el || 'home',
      docid: payload.docid,
      st: payload.st,
      et: payload.et,
      cmt: payload.cmt,
      volume: payload.volume,
      state: payload.state,
      len: payload.len,
      cpn: payload.cpn,
      t: Date.now()
    });
    
    const img = new Image();
    img.src = `${BASE_URL}/stats?${params.toString()}`;
    
    console.log("Telemetry sent via image beacon (YouTube fallback method)");
  }
}