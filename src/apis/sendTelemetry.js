import axios from "axios";
const BASE_URL = "http://localhost:3000/api/v1/telemetry";

export async function sendTelemetry(telemetryData) {
  console.log("📤 Sending telemetryData:", telemetryData);
  
  // YouTube-style: Convert array to single object with proper query params
  if (Array.isArray(telemetryData) && telemetryData.length > 0) {
    const payload = telemetryData[0]; // Take first telemetry object
    
    // Build YouTube-style query parameters
    const queryParams = {
      // Core YouTube parameters (exactly like YouTube does)
      ns: payload.ns || 'yt',
      el: payload.el || 'home', 
      docid: payload.docid,
      st: payload.st, // Comma-separated string: "0,1.5,3.2"
      et: payload.et, // Comma-separated string: "1.5,3.2,5.1" 
      cmt: payload.cmt, // Current media time
      volume: payload.volume, // Comma-separated volumes: "100,80,100"
      
      // Player state
      state: payload.state,
      muted: payload.muted,
      len: payload.len,
      
      // Session & user info
      cpn: payload.cpn, // Client playback nonce (session ID)
      c: 'WEB', // Client name
      cver: '2.0', // Client version
      
      // Additional context
      source: payload.source,
      final: payload.final || 0,
      seeked: payload.seeked || 0,
      
      // Timestamp
      t: Date.now()
    };
    
    // Remove undefined values (YouTube doesn't send empty params)
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    try {
      // YouTube-style: Simple GET with clean query params
      await axios.get(`${BASE_URL}/stats`, {
        params: cleanParams,
        timeout: 5000, // Quick timeout for telemetry
        withCredentials: true,
        headers: {
          'X-YouTube-Client': 'web',
          'X-Telemetry-Source': 'yt-clone'
        }
      });
      
      console.log("✅ YouTube-style telemetry sent successfully");
      
    } catch (error) {
      // YouTube-style: Silent failures for telemetry
      console.warn("⚠️ Telemetry failed (silent):", error.message);
      // Don't throw - telemetry failures shouldn't break user experience
    }
  }
}

// YouTube also uses image beacon for reliability
export async function sendTelemetryBeacon(telemetryData) {
  if (Array.isArray(telemetryData) && telemetryData.length > 0) {
    const payload = telemetryData[0];
    
    // Build query string manually
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
    
    // YouTube fallback: Use image beacon for guaranteed delivery
    const img = new Image();
    img.src = `${BASE_URL}/stats?${params.toString()}`;
    
    console.log("📡 Telemetry sent via image beacon (YouTube fallback method)");
  }
}