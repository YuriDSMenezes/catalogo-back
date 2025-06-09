const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Todas as rotas de produtos requerem autenticação
router.use(authMiddleware);

// Listar todos os produtos da loja
router.get('/', productController.listProducts);

// Buscar um produto específico
router.get('/:id', productController.getProduct);

// Criar novo produto
router.post('/', upload.single('image'), productController.createProduct);

// Atualizar produto
router.put('/:id', upload.single('image'), productController.updateProduct);

// Remover produto
router.delete('/:id', productController.deleteProduct);

module.exports = router; 