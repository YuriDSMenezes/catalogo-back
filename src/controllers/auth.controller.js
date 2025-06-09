const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Registra um novo usuário
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email e senha são obrigatórios',
      });
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Este email já está em uso',
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      status: 'success',
      message: 'Usuário registrado com sucesso',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao registrar usuário',
    });
  }
};

/**
 * Autentica um usuário existente
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verificar se o usuário existe
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao fazer login',
    });
  }
};

/**
 * Retorna os dados do usuário autenticado
 */
const getMe = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar usuário pelo ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    // Remover senha do objeto de resposta
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar usuário',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
}; 