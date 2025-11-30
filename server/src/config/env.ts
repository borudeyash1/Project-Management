import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
// We use path.resolve to ensure we find the file relative to the project root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
