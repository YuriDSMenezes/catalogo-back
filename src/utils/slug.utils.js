/**
 * Gera um slug a partir de uma string
 * @param {string} text - Texto para converter em slug
 * @returns {string} - Slug gerado
 */
const generateSlug = (text) => {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hifens
    .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos
    .replace(/--+/g, '-') // Substitui múltiplos hifens por um único
    .replace(/^-+/, '') // Remove hifens do início
    .replace(/-+$/, ''); // Remove hifens do final
};

/**
 * Verifica se um slug já existe e gera um novo com sufixo se necessário
 * @param {string} baseSlug - Slug base a ser verificado
 * @param {Function} checkExistsFn - Função que verifica se o slug existe (retorna Promise<boolean>)
 * @returns {Promise<string>} - Slug único
 */
const createUniqueSlug = async (baseSlug, checkExistsFn) => {
  let slug = baseSlug;
  let slugExists = await checkExistsFn(slug);
  let counter = 1;

  // Enquanto o slug existir, adiciona um sufixo numérico
  while (slugExists) {
    slug = `${baseSlug}-${counter}`;
    slugExists = await checkExistsFn(slug);
    counter++;
  }

  return slug;
};

module.exports = {
  generateSlug,
  createUniqueSlug,
}; 