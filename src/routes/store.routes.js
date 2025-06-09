const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Todas as rotas de loja requerem autenticação
router.use(authMiddleware);

// Buscar loja do usuário autenticado
router.get('/', storeController.getStore);

// Criar nova loja
router.post('/', upload.single('image'), storeController.createStore);

// Atualizar loja
router.put('/', upload.single('image'), storeController.updateStore);

module.exports = router; 