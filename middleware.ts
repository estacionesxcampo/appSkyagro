import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get('session_token')?.value;

  // Rutas que no requieren autenticación
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/registro');

  // Si no hay token y no está en una ruta de auth, redirigir a /login
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token y está intentando acceder a /login o /registro, redirigir al inicio
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar el middleware a todas las rutas excepto las de la API, archivos estáticos, manifest de PWA, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
