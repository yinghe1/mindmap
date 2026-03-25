import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { migrate } from './db/migrate.js';
import healthRouter from './routes/health.js';
import generateRouter from './routes/generate.js';
import peopleRouter from './routes/people.js';
import { closeDb } from './db/connection.js';

validateConfig();
migrate();

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', generateRouter);
app.use('/api', peopleRouter);

const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

process.on('SIGINT', () => {
  closeDb();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  server.close();
  process.exit(0);
});
