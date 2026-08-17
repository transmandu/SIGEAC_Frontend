'use client'

import Cookies from 'js-cookie'

const AUTH_COOKIE = 'auth_token'

// Vence junto con el token de Sanctum para que no quede una cookie muerta que
// el middleware siga leyendo como sesión válida.
const AUTH_COOKIE_DAYS = 1

// El token se envía como header Bearer hacia otro dominio (api-tmd), así que el
// cliente tiene que poder leerlo y la cookie no puede ser httpOnly. Se endurece
// con secure + sameSite en su lugar.
export function createCookie(name: string, value: string) {
  Cookies.set(name, value, {
    expires: AUTH_COOKIE_DAYS,
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
  })
}

export function deleteCookie(name: string) {
  Cookies.remove(name, { path: '/' })
}

export function hasAuthCookie(): boolean {
  return !!Cookies.get(AUTH_COOKIE)
}
