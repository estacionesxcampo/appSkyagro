import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();
    
    // Carpetas fuente que queremos incluir (excluyendo node_modules y .next temp folders)
    const foldersToAdd = ['app', 'components', 'lib', 'hooks', 'public'];
    
    for (const folder of foldersToAdd) {
      const folderPath = path.join(rootDir, folder);
      if (fs.existsSync(folderPath)) {
        zip.addLocalFolder(folderPath, folder);
      }
    }

    // Agregar todos los archivos que estén directamente en la raíz (package.json, configuraciones, etc.)
    const rootFiles = fs.readdirSync(rootDir);
    for (const file of rootFiles) {
      const filePath = path.join(rootDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        zip.addLocalFile(filePath);
      }
    }

    const zipBuffer = zip.toBuffer();
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="SkyAgro-Source.zip"',
      },
    });
  } catch (error) {
    console.error("Error al generar el ZIP:", error);
    return new NextResponse('Error generando el ZIP: ' + String(error), { status: 500 });
  }
}
