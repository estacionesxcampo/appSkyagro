import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySessionToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const [rows] = await pool.query(
      'SELECT name, email, telefono, logo, login FROM sec_usuariosusers WHERE email = ? LIMIT 1',
      [payload.email]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Error en GET profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { name, telefono, logo, password, email: newEmail } = body;

    let query = 'UPDATE sec_usuariosusers SET name = ?, telefono = ?, email = ?';
    const params = [name, telefono, newEmail];

    if (password && password.trim() !== '') {
      query += ', pswd = ?';
      params.push(hashPassword(password));
    }

    query += ' WHERE email = ?';
    params.push(payload.email);

    await pool.query(query, params);

    return NextResponse.json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error en POST profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
