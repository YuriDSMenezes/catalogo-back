const prisma = require('../config/prisma');
const { uploadImage, deleteImage } = require('../utils/image.utils');

/**
 * Cria um novo produto
 */
const createProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, price, description, categoryId } = req.body;
    let imageUrl = null;

    // Validação básica
    if (!name || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome e preço são obrigatórios',
      });
    }

    // Converter preço para número
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Preço deve ser um número válido e maior que zero',
      });
    }

    // Buscar a loja do usuário
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Verificar se a categoria existe e pertence à loja do usuário
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: store.id,
        },
      });

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Categoria não encontrada',
        });
      }
    }

    // Fazer upload da imagem se houver
    if (req.file) {
      const imageResult = await uploadImage(req.file.path, 'catalogo/products');
      imageUrl = imageResult.url;
    }

    // Criar o produto
    const product = await prisma.product.create({
      data: {
        name,
        price: priceFloat,
        description,
        imageUrl,
        categoryId: categoryId || null,
        storeId: store.id,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Produto criado com sucesso',
      data: { product },
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao criar produto',
    });
  }
};

/**
 * Atualiza um produto existente
 */
const updateProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, price, description, categoryId } = req.body;
    let imageUrl = undefined;

    // Buscar a loja do usuário
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Verificar se o produto existe e pertence à loja do usuário
    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produto não encontrado',
      });
    }

    // Verificar se a categoria existe e pertence à loja do usuário
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: store.id,
        },
      });

      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Categoria não encontrada',
        });
      }
    }

    // Converter preço para número se fornecido
    let priceFloat = undefined;
    if (price !== undefined) {
      priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Preço deve ser um número válido e maior que zero',
        });
      }
    }

    // Fazer upload da nova imagem se houver
    if (req.file) {
      // Remover imagem anterior se existir
      if (product.imageUrl) {
        // Extrair publicId da URL do Cloudinary
        const publicId = product.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }

      const imageResult = await uploadImage(req.file.path, 'catalogo/products');
      imageUrl = imageResult.url;
    }

    // Atualizar o produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        price: priceFloat,
        description: description !== undefined ? description : undefined,
        imageUrl,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Produto atualizado com sucesso',
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar produto',
    });
  }
};

/**
 * Remove um produto
 */
const deleteProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Buscar a loja do usuário
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

    // Verificar se o produto existe e pertence à loja do usuário
    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produto não encontrado',
      });
    }

    // Remover imagem do Cloudinary se existir
    if (product.imageUrl) {
      // Extrair publicId da URL do Cloudinary
      const publicId = product.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    }

    // Remover o produto
    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Produto removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao remover produto',
    });
  }
};

/**
 * Lista todos os produtos da loja
 */
const listProducts = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId } = req.query;

    // Buscar a loja do usuário
    const store = await prisma.store.findFirst({
      where: { userId },
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

    // Buscar todos os produtos da loja
    const products = await prisma.product.findMany({
      where,
      include: {
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
    console.error('Erro ao listar produtos:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao listar produtos',
    });
  }
};

/**
 * Busca um produto específico
 */
const getProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Buscar a loja do usuário
    const store = await prisma.store.findFirst({
      where: { userId },
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
        id,
        storeId: store.id,
      },
      include: {
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
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProduct,
}; 