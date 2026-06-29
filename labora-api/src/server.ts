import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/db';

import authRouter from './routes/auth';
import adminsRouter from './routes/admins';
import laboratoriosRouter from './routes/laboratorios';
import filiaisRouter from './routes/filiais';
import examesRouter from './routes/exames';
import agendamentosRouter from './routes/agendamentos';
import resultadosRouter from './routes/resultados';
import auditoriaRouter from './routes/auditoria';
import accessibleBranchesRouter from './routes/accessible-branches';
import dashboardRouter from './routes/dashboard';
import usersRouter from './routes/users';
import pacientesRouter from './routes/pacientes';
import rolesRouter from './routes/roles';

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:4200'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origem CORS não permitida: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRouter);
app.use('/api/admins', adminsRouter);
app.use('/api/laboratorios', laboratoriosRouter);
app.use('/api/filiais', filiaisRouter);
app.use('/api/exames', examesRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/resultados', resultadosRouter);
app.use('/api/audit-logs', auditoriaRouter);
app.use('/api/accessible-branches', accessibleBranchesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);
app.use('/api/pacientes', pacientesRouter);
app.use('/api/roles', rolesRouter);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`🚀 API da Labora rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Falha crítica ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
