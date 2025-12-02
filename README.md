# Jitter API

API de gerenciamento de pedidos desenvolvida com NestJS, Prisma ORM e PostgreSQL.

## 📋 Sobre o Projeto

API RESTful completa para gerenciamento de pedidos, usuários e produtos. O sistema oferece autenticação JWT, validação robusta de dados e documentação interativa via Swagger.

## 🚀 Tecnologias

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo para construção de aplicações server-side
- **[Prisma ORM](https://www.prisma.io/)** - ORM moderno para TypeScript e Node.js (v7 com adapter-pg)
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Docker](https://www.docker.com/)** - Containerização do banco de dados
- **[JWT](https://jwt.io/)** - Autenticação e autorização via JSON Web Tokens
- **[Swagger](https://swagger.io/)** - Documentação interativa da API
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[Class Validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **TypeScript** - Tipagem estática

## 📚 Documentação da API

A documentação completa e interativa está disponível via Swagger em:

```
http://localhost:3000/api
```

### Funcionalidades Disponíveis no Swagger

- 🔐 **Autenticação JWT** - Use o botão "Authorize" para testar rotas protegidas
- 📝 **Exemplos de Requisições** - Todos os endpoints possuem exemplos práticos
- ✅ **Testar Endpoints** - Execute requisições diretamente pela interface
- 📊 **Schemas de Dados** - Visualize a estrutura completa dos DTOs

### Módulos da API

#### Authentication (`/auth`)
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login e obter token JWT
- `GET /auth/me` - Obter perfil do usuário autenticado 🔒

#### Products (`/product`)
- `GET /product/list` - Listar todos os produtos

#### Orders (`/order`)
- `POST /order` - Criar novo pedido 🔒
- `GET /order/list` - Listar pedidos do usuário 🔒
- `GET /order/:id` - Buscar pedido por número 🔒
- `PATCH /order/:id` - Atualizar pedido (substituição completa) 🔒
- `DELETE /order/:id` - Deletar pedido 🔒

🔒 = Requer autenticação JWT

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/phebueno/jitter-api.git
cd jitter-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
POSTGRES_USER=jitter
POSTGRES_PASSWORD=jitter123
POSTGRES_DB=jitter_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

4. **Suba o banco de dados com Docker**
```bash
docker compose up -d
```

5. **Gere o Prisma Client (opcional)**
```bash
npx prisma generate
```
> Nota: Este passo é executado automaticamente após `npm install` via script postinstall

6. **Execute as migrations do Prisma**
```bash
npx prisma migrate dev
```

7. **Popule o banco com dados iniciais (opcional)**
```bash
npm run seed
```

8. **Inicie a aplicação**
```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Modelos

- **User** - Usuários do sistema (email, senha hash, nome)
- **Product** - Produtos disponíveis
- **Order** - Pedidos realizados (orderId único, valor total, data)
- **Item** - Itens de cada pedido (produto, quantidade, preço)

### Relacionamentos

- Um usuário pode ter vários pedidos (1:N)
- Um pedido pertence a um usuário e contém vários itens (1:N)
- Cada item referencia um produto (N:1)

## 🧪 Testando a API

### Via Swagger (Recomendado)

1. Acesse `http://localhost:3000/api`
2. Registre um usuário em `POST /auth/register`
3. Faça login em `POST /auth/login` e copie o `access_token`
4. Clique no botão **"Authorize"** no topo da página
5. Cole o token e clique em "Authorize"
6. Teste as rotas protegidas livremente!

### Via cURL

```bash
# Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123","name":"João Silva"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Criar pedido (substitua YOUR_TOKEN)
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "numeroPedido": "v10089016vdb",
    "valorTotal": 59.98,
    "dataCriacao": "2025-12-01T10:30:00Z",
    "items": [
      {"idItem": "PRODUCT_ID", "quantidadeItem": 2, "valorItem": 29.99}
    ]
  }'
```

## 📦 Scripts Disponíveis

```bash
npm run start:dev    # Inicia em modo desenvolvimento
npm run start:prod   # Inicia em modo produção
npm run build        # Compila o projeto
npm run seed         # Popula banco com 20 produtos
npm run test         # Executa testes unitários
npm run test:cov     # Executa testes com cobertura
npx prisma studio    # Abre interface visual do banco
```

## ✅ Cobertura de Testes

A aplicação possui uma suíte completa de testes unitários para controllers e services:

- **50 testes** implementados
- **Cobertura de branches**: > 75%
- **Cobertura de funções**: > 90%

### Módulos Testados

- ✅ **AuthService** - 8 testes (register, login, validateUser)
- ✅ **AuthController** - 6 testes (endpoints de autenticação)
- ✅ **ProductsService** - 4 testes (listagem de produtos)
- ✅ **ProductsController** - 4 testes (endpoints de produtos)
- ✅ **OrdersService** - 14 testes (CRUD completo com validações)
- ✅ **OrdersController** - 13 testes (endpoints de pedidos)

Execute `npm run test:cov` para visualizar o relatório completo de cobertura.

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação stateless via JWT
- Validação de dados em todas as requisições
- Rotas protegidas com guards
- Verificação de propriedade de recursos (usuário só acessa seus pedidos)

---
