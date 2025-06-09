const prisma = require('../config/prisma');

/**
 * Busca uma loja pelo slug
 */
const getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscar a loja pelo slug
    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        slug: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Incrementar contador de visitas
    await prisma.store.update({
      where: { id: store.id },
      data: {
        visits: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { store },
    });
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar loja',
    });
  }
};

/**
 * Lista as categorias de uma loja pelo slug da loja
 */
const getCategoriesByStoreSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscar a loja pelo slug
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Buscar categorias da loja
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar categorias',
    });
  }
};

/**
 * Lista os produtos de uma loja pelo slug da loja
 */
const getProductsByStoreSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { categoryId } = req.query;

    // Buscar a loja pelo slug
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Filtros para a consulta
    const where = {
      storeId: store.id,
      ...(categoryId ? { categoryId } : {}),
    };

    // Buscar produtos da loja
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar produtos',
    });
  }
};

/**
 * Busca um produto específico de uma loja
 */
const getProductByStoreSlug = async (req, res) => {
  try {
    const { slug, productId } = req.params;

    // Buscar a loja pelo slug
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Buscar o produto
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produto não encontrado',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar produto',
    });
  }
};

module.exports = {
  getStoreBySlug,
  getCategoriesByStoreSlug,
  getProductsByStoreSlug,
  getProductByStoreSlug,
}; 