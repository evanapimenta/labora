import { Router } from 'express';
import crypto from 'crypto';
import Admin from '../models/Admin';
import { verifyPassword, hashPassword } from '../lib/auth-helpers';
import { signToken, verifyToken } from '../lib/jwt';

const router = Router();

router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    const admin = await Admin.findOne({
      $or: [
        { username: usernameOrEmail.trim() },
        { email: usernameOrEmail.trim().toLowerCase() }
      ]
    });

    if (!admin) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!admin.password) {
      return res.status(403).json({
        error: 'Sua conta ainda não possui senha. Use "Primeiro acesso" para defini-la.',
        firstAccess: true,
      });
    }

    const isMatch = verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const userPayload = {
      userId: admin._id.toString(),
      id: admin.id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      scope: admin.scope
    };

    const accessToken = signToken(userPayload, 24 * 60 * 60);
    const refreshToken = signToken(userPayload, 30 * 24 * 60 * 60);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userPayload
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

router.post('/first-access', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const admin = await Admin.findOne({
      $or: [
        { username: usernameOrEmail.trim() },
        { email: usernameOrEmail.trim().toLowerCase() },
      ],
    });

    if (!admin) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (admin.password) {
      return res.status(400).json({
        error: 'Esta conta já possui senha. Faça login normalmente.',
      });
    }

    admin.password = hashPassword(password);
    if (admin.status === 'Pendente') {
      admin.status = 'Ativo';
    }
    await admin.save();

    const userPayload = {
      userId: admin._id.toString(),
      id: admin.id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      scope: admin.scope,
    };

    const accessToken = signToken(userPayload, 24 * 60 * 60);
    const refreshToken = signToken(userPayload, 30 * 24 * 60 * 60);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userPayload
    });
  } catch (error: any) {
    console.error('Erro ao definir senha:', error);
    return res.status(500).json({ error: 'Erro ao definir senha: ' + error.message });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token não fornecido.' });
  }

  try {
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado.' });
    }

    const userPayload = {
      userId: payload.id,
      id: payload.numericId,
      name: payload.name,
      username: payload.username,
      email: payload.sub,
      scope: payload.role
    };

    const accessToken = signToken(userPayload, 24 * 60 * 60);
    const newRefreshToken = signToken(userPayload, 30 * 24 * 60 * 60);

    return res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      user: userPayload
    });
  } catch (error: any) {
    console.error('Erro ao atualizar token:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;
