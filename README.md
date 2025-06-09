# Catálogo Digital - Backend

API REST para o Catálogo Digital com pedidos via WhatsApp.

## Tecnologias Utilizadas

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Multer (Upload de arquivos)
- Cloudinary (Armazenamento de imagens)

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e preenchendo com suas informações:

```bash
# Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/catalogo?schema=public"

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Server
PORT=3001
NODE_ENV=development
```

4. Execute as migrações do banco de dados:

```bash
npm run prisma:migrate
```

5. Gere o cliente Prisma:

```bash
npm run prisma:generate
```

## Executando o Projeto

### Ambiente de Desenvolvimento

```bash
npm run dev
```

### Ambiente de Produção

```bash
npm start
```

## Estrutura da API

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter dados do usuário autenticado

### Lojas

- `GET /api/stores` - Obter loja do usuário autenticado
- `POST /api/stores` - Criar nova loja
- `PUT /api/stores` - Atualizar loja

### Categorias

- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar nova categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Remover categoria

### Produtos

- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Obter produto específico
- `POST /api/products` - Criar novo produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Remover produto

### Rotas Públicas

- `GET /api/public/stores/:slug` - Obter loja pelo slug
- `GET /api/public/stores/:slug/categories` - Listar categorias de uma loja
- `GET /api/public/stores/:slug/products` - Listar produtos de uma loja
- `GET /api/public/stores/:slug/products/:productId` - Obter produto específico de uma loja

## Exemplos de Uso

### Registro de Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "password": "senha123"}'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "password": "senha123"}'
```

### Criar Loja

```bash
curl -X POST http://localhost:3001/api/stores \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: multipart/form-data" \
  -F "name=Minha Loja" \
  -F "description=Descrição da minha loja" \
  -F "image=@/caminho/para/imagem.jpg"
```
