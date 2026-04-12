import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: Number(process.env.PORT) || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  useLocal: process.env.USE_LOCAL === 'true',
  localModel: process.env.LOCAL_MODEL || 'llama3',
  dbPath: path.resolve(__dirname, '../data/cognitive_map.db'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

export function validateConfig(): void {
  if (!config.openaiApiKey || config.openaiApiKey === 'sk-your-key-here') {
    console.warn('WARNING: OPENAI_API_KEY is not configured. Generation features are disabled. You can still import JSON files.');
  }
}

export function isOpenAIConfigured(): boolean {
  return !!config.openaiApiKey && config.openaiApiKey !== 'sk-your-key-here';
}
