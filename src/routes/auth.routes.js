const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rota de registro de usuário
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota para obter os dados do usuário autenticado
router.get('/me', authMiddleware, authController.getMe);

module.exports = router; 