import fs from 'fs-extra';
import archiver from 'archiver';
import axios from 'axios';
import FormData from 'form-data';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';

export const zipAndUpload = async (folderPath) => {
 const zipFilePath = join(__dirname, 'session.zip');

 if (!fs.existsSync(folderPath)) {
  console.error(`Folder "${folderPath}" does not exist.`);
  return null;
 }
 const archive = archiver('zip', { zlib: { level: 9 } });
 const output = fs.createWriteStream(zipFilePath);

 await new Promise((resolve, reject) => {
  output.on('close', () => {
   resolve();
  });
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory(folderPath, false).finalize();
 });

 const formData = new FormData();
 formData.append('file', fs.createReadStream(zipFilePath));

 try {
  const response = await axios.post(`${BASE_URL}/upload`, formData, {
   headers: {
    ...formData.getHeaders(),
   },
  });
  console.log('Upload Response:', response.data);
  return response.data.accessKey;
 } catch (error) {
  console.error('Error uploading file:', error.response?.data || error.message);
  return null;
 } finally {
  await fs.remove(zipFilePath);
 }
};
