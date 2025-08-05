'use server';

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.SECRET_KEY_JWT)

if (!process.env.SECRET_KEY_JWT) {
    throw new Error('SECRET_KEY_JWT no está configurado en las variables de entorno')
}

const cookieConfig = {
    name: "session",
    options: {
        httpOnly: true,
        sameSite: 'lax',
        path: "/",
    },
    duration: 24 * 60 * 60 * 1000,
}

// Define el tipo para el payload del JWT
interface SessionPayload {
    userId: string
    expires: Date
}

// Función para encriptar el JWT
export async function encryptJWT(payload: SessionPayload): Promise<string> {
    return new SignJWT(payload as Record<string, any>) // Usa Record<string, any> para evitar el error
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1day')
        .sign(key)
}

// Función para desencriptar el JWT
export async function decryptJWT(session: string | undefined = '') {
    try {
      const { payload } = await jwtVerify(session, key, {
        algorithms: ['HS256'],
      })
      return payload
    } catch (error) {
      console.log('Failed to verify session: ', error)
    }
  }

// Función para crear una sesión
export async function createSession(userId: string) {
    const expires = new Date(Date.now() + cookieConfig.duration) // Duración en milisegundos (24 horas)
    const session = await encryptJWT({ userId, expires })
    cookies().set(cookieConfig.name, session, {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        path: "/",
        expires: expires,
    },)
}

// Función para verificar la sesión
export async function verifySession() {
    const cookie = cookies().get(cookieConfig.name)?.value
    const session = await decryptJWT(cookie)
    if(!session?.userId) {
        redirect('/login')
    }
    return { userId: session.userId }
}

// Función para eliminar la sesión
export async function deleteSession() {
    cookies().delete(cookieConfig.name)
    cookies().delete('auth_token')
}
