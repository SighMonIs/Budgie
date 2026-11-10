import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dashboardRouter from './routes/dashboard.js';
import billsRouter from './routes/bills.js';
import settingsRouter from './routes/settings.js';
import fundsRouter from './routes/funds.js';
import { getDb } from './db.js';
import { rollPayday } from './logic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRouter);
app.use('/api/bills', billsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/funds', fundsRouter);

// Serve built frontend in production
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Credit savings goals and advance next_payday as paydays pass (now, then hourly)
const roll = () => { try { rollPayday(getDb()); } catch (e) { console.error('payday roll failed', e); } };
roll();
setInterval(roll, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Budgie API running on http://localhost:${PORT}`);
});
