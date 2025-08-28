export function useMobileOS() {
  const ua = navigator.userAgent.toLowerCase();

  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";


  return "unknown";
}
