const prisma = require('../config/prisma');

/**
 * Cria uma nova categoria para a loja do usuário
 */
const createCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    // Validação básica
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome da categoria é obrigatório',
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

    // Verificar se já existe uma categoria com o mesmo nome nesta loja
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: store.id,
        name: {
          equals: name,
          mode: 'insensitive', // Ignora maiúsculas/minúsculas
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe uma categoria com este nome',
      });
    }

    // Criar a categoria
    const category = await prisma.category.create({
      data: {
        name,
        storeId: store.id,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Categoria criada com sucesso',
      data: { category },
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao criar categoria',
    });
  }
};

/**
 * Atualiza uma categoria existente
 */
const updateCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name } = req.body;

    // Validação básica
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome da categoria é obrigatório',
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
    const category = await prisma.category.findFirst({
      where: {
        id,
        storeId: store.id,
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoria não encontrada',
      });
    }

    // Verificar se já existe outra categoria com o mesmo nome nesta loja
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: store.id,
        name: {
          equals: name,
          mode: 'insensitive', // Ignora maiúsculas/minúsculas
        },
        id: {
          not: id,
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Já existe outra categoria com este nome',
      });
    }

    // Atualizar a categoria
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Categoria atualizada com sucesso',
      data: { category: updatedCategory },
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar categoria',
    });
  }
};

/**
 * Remove uma categoria existente
 */
const deleteCategory = async (req, res) => {
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

    // Verificar se a categoria existe e pertence à loja do usuário
    const category = await prisma.category.findFirst({
      where: {
        id,
        storeId: store.id,
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoria não encontrada',
      });
    }

    // Remover a categoria (produtos associados terão categoryId definido como null)
    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Categoria removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao remover categoria',
    });
  }
};

/**
 * Lista todas as categorias da loja do usuário
 */
const listCategories = async (req, res) => {
  try {
    const userId = req.userId;

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

    // Buscar todas as categorias da loja
    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: { name: 'asc' },
      include: {
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
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao listar categorias',
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
}; 