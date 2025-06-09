const prisma = require('../config/prisma');
const { generateSlug, createUniqueSlug } = require('../utils/slug.utils');
const { uploadImage, deleteImage } = require('../utils/image.utils');

/**
 * Cria uma nova loja para o usuário autenticado
 */
const createStore = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;
    let imageUrl = null;

    // Validação básica
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Nome da loja é obrigatório',
      });
    }

    // Verificar se o usuário já tem uma loja
    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return res.status(400).json({
        status: 'error',
        message: 'Usuário já possui uma loja',
      });
    }

    // Gerar slug a partir do nome da loja
    const baseSlug = generateSlug(name);
    
    // Verificar se o slug já existe e criar um único se necessário
    const checkSlugExists = async (slug) => {
      const store = await prisma.store.findUnique({ where: { slug } });
      return !!store;
    };
    
    const slug = await createUniqueSlug(baseSlug, checkSlugExists);

    // Fazer upload da imagem se houver
    if (req.file) {
      const imageResult = await uploadImage(req.file.path, 'catalogo/stores');
      imageUrl = imageResult.url;
    }

    // Criar a loja
    const store = await prisma.store.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        userId,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Loja criada com sucesso',
      data: { store },
    });
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao criar loja',
    });
  }
};

/**
 * Atualiza os dados da loja do usuário autenticado
 */
const updateStore = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;
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

    // Fazer upload da nova imagem se houver
    if (req.file) {
      // Remover imagem anterior se existir
      if (store.imageUrl) {
        // Extrair publicId da URL do Cloudinary
        const publicId = store.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }

      const imageResult = await uploadImage(req.file.path, 'catalogo/stores');
      imageUrl = imageResult.url;
    }

    // Atualizar slug apenas se o nome for alterado
    let slug = undefined;
    if (name && name !== store.name) {
      const baseSlug = generateSlug(name);
      
      // Verificar se o slug já existe e criar um único se necessário
      const checkSlugExists = async (testSlug) => {
        const existingStore = await prisma.store.findUnique({ 
          where: { 
            slug: testSlug,
            id: { not: store.id } 
          }
        });
        return !!existingStore;
      };
      
      slug = await createUniqueSlug(baseSlug, checkSlugExists);
    }

    // Atualizar a loja
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: name || undefined,
        slug,
        description: description !== undefined ? description : undefined,
        imageUrl,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Loja atualizada com sucesso',
      data: { store: updatedStore },
    });
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar loja',
    });
  }
};

/**
 * Busca a loja do usuário autenticado
 */
const getStore = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar a loja do usuário com contagem de produtos
    const store = await prisma.store.findFirst({
      where: { userId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Loja não encontrada',
      });
    }

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

module.exports = {
  createStore,
  updateStore,
  getStore,
}; 