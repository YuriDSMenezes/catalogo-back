const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas de categorias requerem autenticação
router.use(authMiddleware);

// Listar todas as categorias da loja
router.get('/', categoryController.listCategories);

// Criar nova categoria
router.post('/', categoryController.createCategory);

// Atualizar categoria
router.put('/:id', categoryController.updateCategory);

// Remover categoria
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 