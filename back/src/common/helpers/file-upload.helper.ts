import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Function to save a base64 file string
export async function saveFile(base64String: string, folder = 'uploads'): Promise<string> {
  const matches = base64String.match(/^data:.+\/(.+);base64,(.*)$/);
  if (!matches) throw new Error('Invalid base64 string');
  
  const ext = matches[1];  // Get file extension from MIME type
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const newFilename = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const uploadPath = path.join(uploadDir, newFilename);
  
  fs.writeFileSync(uploadPath, buffer);  // Save the file as a buffer
  return `/uploads/${newFilename}`;
}
