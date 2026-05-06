import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Verificar si el email ya existe
    const [existing] = await pool.query('SELECT email FROM sec_usuariosusers WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    // Generar campo 'login': 2 primeras letras del nombre + 5 primeras letras del apellido
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    // Usamos el último elemento como apellido por si tienen varios nombres (Ej: Juan Perez, Juan Carlos Perez)
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    const loginPart1 = firstName.substring(0, 2).toLowerCase();
    const loginPart2 = lastName.substring(0, 5).toLowerCase();
    const loginValue = loginPart1 + loginPart2;

    // Insertar nuevo usuario con active='N' y el campo logo vacío para evitar el error
    await pool.query(
      'INSERT INTO sec_usuariosusers (login, pswd, name, email, telefono, active, logo) VALUES (?, ?, ?, ?, ?, "N", "")',
      [loginValue, hashedPassword, name, email, phone]
    );

    return NextResponse.json({ success: true, message: 'Usuario registrado correctamente. Tu cuenta debe ser aprobada para iniciar sesión.' });

  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error BD: ' + error.message }, { status: 500 });
  }
}
