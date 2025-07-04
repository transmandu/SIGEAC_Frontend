import { NextRequest, NextResponse } from "next/server";

// 1. Definición centralizada de rutas protegidas
const PROTECTED_ROUTES = [
  '/inicio',
  '/transmandu',
  '/hangar74',
  '/ajustes',
  '/planificacion',
  '/administracion'
];


export default async function middleware(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  // 3. Verificación más eficiente de rutas
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    currentPath.startsWith(route)
  );


  // 4. Redirección si está en ruta protegida sin autenticación
  if (isProtectedRoute) {
    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken) {
      // 5. Guardar la URL solicitada para redirigir después del login
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('from', currentPath);

      return NextResponse.redirect(loginUrl);
    }

    // 6. Verificación adicional del token si es necesario
    try {
      // Aquí podrías validar el token con una API
      // const isValid = await verifyToken(authToken);
      // if (!isValid) throw new Error('Invalid token');
    } catch (error) {
      // 7. Limpiar cookie inválida
      const response = NextResponse.redirect(new URL('/login', req.nextUrl));
      response.cookies.delete('auth_token');

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // 9. Configuración optimizada del matcher
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
