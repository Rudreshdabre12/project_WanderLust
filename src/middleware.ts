import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token');
  
  // Allow access to login and signup pages without a token
  if (path === '/login' || path === '/signup') {
    return NextResponse.next();
  }

  // Redirect to /login if there's no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to /home if the user tries to access the root /
  if (path === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Proceed with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico).*)', // Match all paths except for API routes, Next.js internals, and favicon.ico
  ],
};
