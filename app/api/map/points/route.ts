import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
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

    // 1. Obtener el login del usuario desde la base de datos
    const [rows] = await pool.query(
      'SELECT login FROM sec_usuariosusers WHERE email = ? LIMIT 1',
      [payload.email]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const login = users[0].login;

    // 2. Consultar el servicio externo
    const externalUrl = `https://d14y888g0kj9pj.cloudfront.net/skyagro/procesos_appsmith/generador_json_condiciones_por_usuario.php?usuario=${login}`;
    
    const response = await fetch(externalUrl);
    if (!response.ok) {
      throw new Error('Error al consultar el servicio de puntos');
    }

    const data = await response.json();

    // 3. Devolver los puntos (asumiendo que data es un array de puntos con latitud, longitud, nombre)
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET map points:', error);
    return NextResponse.json({ error: 'Error al obtener puntos del mapa' }, { status: 500 });
  }
}
