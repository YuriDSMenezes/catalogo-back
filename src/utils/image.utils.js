const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

/**
 * Faz upload de uma imagem para o Cloudinary
 * @param {string} filePath - Caminho do arquivo temporário
 * @param {string} folder - Pasta no Cloudinary onde a imagem será armazenada
 * @returns {Promise<Object>} - Objeto com informações da imagem enviada
 */
const uploadImage = async (filePath, folder = 'catalogo') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });

    // Remover arquivo temporário após upload
    await unlinkAsync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    // Tentar remover o arquivo temporário mesmo em caso de erro
    try {
      await unlinkAsync(filePath);
    } catch (unlinkError) {
      console.error('Erro ao remover arquivo temporário:', unlinkError);
    }
    throw new Error('Falha ao fazer upload da imagem');
  }
};

/**
 * Remove uma imagem do Cloudinary
 * @param {string} publicId - ID público da imagem no Cloudinary
 * @returns {Promise<boolean>} - true se a imagem foi removida com sucesso
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return true;
    
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Erro ao excluir imagem do Cloudinary:', error);
    return false;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
}; 