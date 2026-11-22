# API de Clientes e Produtos Favoritos

Projeto full-stack desenvolvido com JavaScript, Cloudflare Workers, Cloudflare D1 e React. A aplicação permite gerenciar clientes, consultar produtos e administrar produtos favoritos.

## Demonstração

**API publicada:**

https://api-clientes-favoritos.itamarteixeirasousa747.workers.dev

**Repositório GitHub:**

https://github.com/itamar747/api-clientes-favoritos

## Tecnologias utilizadas

### Backend
- JavaScript
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Wrangler
- Vitest
- Fake Store API

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React

## Funcionalidades

### Clientes
- Cadastrar clientes.
- Listar clientes.
- Consultar cliente por ID.
- Atualizar dados dos clientes.
- Excluir clientes.
- Validar dados e impedir e-mails duplicados.
- Armazenar senhas com hash PBKDF2 e salt aleatório.

### Produtos
- Listar produtos da Fake Store API.
- Consultar produtos por ID.
- Listar categorias.

### Favoritos
- Adicionar produtos aos favoritos.
- Consultar favoritos de cada cliente.
- Remover produtos favoritos.
- Impedir favoritos duplicados.

### Painel administrativo
- Dashboard com resumo das informações.
- Gerenciamento de clientes.
- Visualização de produtos.
- Gerenciamento de favoritos.
- Integração com a API publicada.

## Endpoints da API

**Base URL:**

`https://api-clientes-favoritos.itamarteixeirasousa747.workers.dev`

### Clientes

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/clients` | Cadastrar cliente |
| GET | `/clients` | Listar clientes |
| GET | `/clients/:id` | Buscar cliente |
| PUT | `/clients/:id` | Atualizar cliente |
| DELETE | `/clients/:id` | Excluir cliente |

### Produtos e categorias

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/products` | Listar produtos |
| GET | `/products/:id` | Buscar produto |
| GET | `/categories` | Listar categorias |

Os produtos são obtidos através da [Fake Store API](https://fakestoreapi.com).

### Favoritos

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/clients/:id/favorites` | Adicionar favorito |
| GET | `/clients/:id/favorites` | Listar favoritos |
| DELETE | `/clients/:id/favorites/:productId` | Remover favorito |

## Exemplos de requisições

### Cadastrar cliente

`POST /clients`

```json
{
  "name": "Cliente Teste",
  "email": "cliente@teste.com",
  "password": "senha12345"
}
```

A senha deve possuir pelo menos 8 caracteres.

### Atualizar cliente

`PUT /clients/1`

```json
{
  "name": "Cliente Atualizado",
  "email": "cliente@teste.com"
}
```

### Adicionar favorito

`POST /clients/1/favorites`

```json
{
  "product_id": 1
}
```

### Consultar favoritos

`GET /clients/1/favorites`

### Remover favorito

`DELETE /clients/1/favorites/1`

## Banco de dados

O projeto utiliza Cloudflare D1, com as tabelas:

**clients**
- id
- name
- email
- password_hash
- created_at

**favorites**
- id
- client_id
- product_id
- created_at

A tabela de favoritos possui relacionamento com clientes e impede a duplicação de produtos favoritos para o mesmo cliente.

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/itamar747/api-clientes-favoritos.git
```

### 2. Entrar na pasta

```bash
cd api-clientes-favoritos
```

### 3. Instalar as dependências do backend

```bash
npm install
```

### 4. Aplicar as migrações locais do banco

```bash
npx wrangler d1 migrations apply api-clientes-favoritos-db --local
```

### 5. Iniciar o backend

```bash
npm run dev
```

A API local ficará disponível em:

`http://localhost:8787`

### 6. Instalar as dependências do frontend

Abra outro terminal:

```bash
cd frontend
npm install
```

### 7. Iniciar o frontend

```bash
npm run dev
```

O Vite exibirá o endereço local do painel, normalmente:

`http://localhost:5173`

O frontend está configurado para consumir a API publicada na Cloudflare.

## Testes automatizados

Para executar os testes do backend:

```bash
npm test -- --run
```

**Resultado da última execução:**
- 12 testes aprovados.
- 0 testes com falha.
- Clientes, produtos, categorias e favoritos testados.

## Publicação

Para publicar ou atualizar a API na Cloudflare Workers:

```bash
npm run deploy
```

Para aplicar migrações no banco remoto:

```bash
npx wrangler d1 migrations apply api-clientes-favoritos-db --remote
```

## Autor

Projeto acadêmico desenvolvido para estudo de desenvolvimento de APIs REST, banco de dados, integração com serviços externos e desenvolvimento frontend com React.