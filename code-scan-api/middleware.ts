import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(_request: NextRequest) {
  // Auth is handled client-side via Zustand + localStorage
  // The middleware just passes through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|icon-light-32x32.png|icon-dark-32x32.png|icon.svg|apple-icon.png|api).*)",
  ],
}
