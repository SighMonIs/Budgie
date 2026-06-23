import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dashboardRouter from './routes/dashboard.js';
import billsRouter from './routes/bills.js';
import settingsRouter from './routes/settings.js';
import accountsRouter from './routes/accounts.js';
import payeesRouter from './routes/payees.js';
import fundsRouter from './routes/funds.js';
import categoriesRouter from './routes/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRouter);
app.use('/api/bills', billsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/payees', payeesRouter);
app.use('/api/funds', fundsRouter);
app.use('/api/categories', categoriesRouter);

// Serve built frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Budgie API running on http://localhost:${PORT}`);
});
