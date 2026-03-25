import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.PORT) || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  dbPath: path.resolve(__dirname, '../data/cognitive_map.db'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

export function validateConfig(): void {
  if (!config.openaiApiKey) {
    console.error('OPENAI_API_KEY is required. Create a .env file with your key.');
    process.exit(1);
  }
}
