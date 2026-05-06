import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM sec_usuariosusers WHERE email = ? LIMIT 1',
      [email]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const user = users[0];
    
    // Validar contraseña con sha256
    const hashedPassword = hashPassword(password);
    
    if (hashedPassword !== user.pswd) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    if (user.active === 'N') {
      return NextResponse.json({ error: 'Tu cuenta está inactiva. Espera la aprobación del administrador.' }, { status: 403 });
    }

    // Crear token y guardarlo en una cookie
    const token = await createSessionToken({ email: user.email, name: user.name });
    
    const response = NextResponse.json({ success: true, message: 'Login exitoso' });
    
    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 horas
    });

    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
