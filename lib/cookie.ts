'use server'

import { cookies } from 'next/headers'

export async function createCookie(name: string, value: string) {
  cookies().set(name, value)
}

export async function deleteCookie(name: string) {
  cookies().delete(name)
}
