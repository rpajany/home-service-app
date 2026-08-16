export function getAppUrl() {
  // Production on Vercel
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development
  return "http://localhost:3000";
}