
export function getFriendlyError(error: any): string {
  const msg = error?.message || "";
  
  if (msg.includes("infinite recursion")) return "Access temporarily restricted. Please log out and back in.";
  if (msg.includes("schema cache")) return "System update in progress. Please refresh.";
  if (msg.includes("JWT")) return "Session expired. Please sign in again.";
  
  return "Something went wrong. Please try again or contact support.";
}
