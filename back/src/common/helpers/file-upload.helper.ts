import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

// Types d'image acceptés -> extension imposée par le serveur (jamais celle du client)
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo

// Function to save a base64 file string ("data:<mime>;base64,<données>")
export async function saveFile(base64String: string, folder = 'uploads'): Promise<string> {
  // Découpage sans expression régulière : pas de risque de ReDoS
  const marker = ';base64,';
  const markerIndex = base64String.indexOf(marker);
  if (!base64String.startsWith('data:') || markerIndex === -1) {
    throw new BadRequestException('Invalid base64 string');
  }

  const mimeType = base64String.slice('data:'.length, markerIndex).toLowerCase();
  const ext = ALLOWED_IMAGE_TYPES[mimeType];
  if (!ext) {
    throw new BadRequestException('Type d\'image non autorisé');
  }

  const buffer = Buffer.from(base64String.slice(markerIndex + marker.length), 'base64');
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new BadRequestException('Image trop volumineuse (5 Mo maximum)');
  }

  const newFilename = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uploadPath = path.join(uploadDir, newFilename);

  fs.writeFileSync(uploadPath, buffer);  // Save the file as a buffer
  return `/uploads/${newFilename}`;
}
