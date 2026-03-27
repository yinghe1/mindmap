import { Router } from 'express';
import { generatePerson } from '../services/pipeline.js';
import { isOpenAIConfigured } from '../config.js';
import type { GenerateRequest, ErrorResponse } from '../types/api.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    if (!isOpenAIConfigured()) {
      res.status(503).json({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file, or use the Import button to load a JSON file.' } as ErrorResponse);
      return;
    }

    const { name } = req.body as GenerateRequest;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' } as ErrorResponse);
      return;
    }

    if (name.trim().length > 200) {
      res.status(400).json({ error: 'Name is too long' } as ErrorResponse);
      return;
    }

    const result = await generatePerson(name.trim());
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('not found') || message.includes('not appear') ? 404 : 500;
    res.status(status).json({ error: message } as ErrorResponse);
  }
});

export default router;
