import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://api.infra.testnet.somnia.network wss://api.infra.testnet.somnia.network/ws *; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  return response;
}

export const config = {
  matcher: '/:path*',
};
