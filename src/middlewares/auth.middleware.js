const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o header de autorização existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token de autenticação não fornecido' 
      });
    }

    // Verificar formato do token (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Erro no formato do token' 
      });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token mal formatado' 
      });
    }

    // Verificar validade do token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Token inválido ou expirado' 
        });
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Usuário não encontrado' 
        });
      }

      // Adicionar informações do usuário ao request
      req.userId = decoded.id;
      return next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Erro interno no servidor' 
    });
  }
};

module.exports = authMiddleware; 