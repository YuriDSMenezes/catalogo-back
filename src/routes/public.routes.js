const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Buscar loja pelo slug
router.get('/stores/:slug', publicController.getStoreBySlug);

// Buscar categorias de uma loja pelo slug
router.get('/stores/:slug/categories', publicController.getCategoriesByStoreSlug);

// Buscar produtos de uma loja pelo slug
router.get('/stores/:slug/products', publicController.getProductsByStoreSlug);

// Buscar um produto específico de uma loja pelo slug
router.get('/stores/:slug/products/:productId', publicController.getProductByStoreSlug);

module.exports = router; 