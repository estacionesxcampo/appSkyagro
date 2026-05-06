import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  if (!nombre) {
    return NextResponse.json({ error: 'Nombre de estación requerido' }, { status: 400 });
  }

  try {
    const externalUrl = `http://3.209.148.75/skyagro/procesos_appsmith/api_datos_estacion_seleccionada.php?nombre=${encodeURIComponent(nombre)}`;
    
    const response = await fetch(externalUrl);
    if (!response.ok) {
      throw new Error('Error al consultar el servicio de estación');
    }

    const data = await response.json();
    
    // Si la API devuelve un array, tomamos el primer elemento (generalmente es así en estos servicios PHP)
    const stationData = Array.isArray(data) ? data[0] : data;

    return NextResponse.json(stationData);

  } catch (error) {
    console.error('Error en GET station detail:', error);
    return NextResponse.json({ error: 'Error al obtener datos de la estación' }, { status: 500 });
  }
}
