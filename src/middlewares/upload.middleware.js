const multer = require('multer');
const path = require('path');

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Gerar nome único baseado no timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload; 