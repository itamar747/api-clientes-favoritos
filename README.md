# API de Clientes e Produtos Favoritos

API REST desenvolvida com **JavaScript, Cloudflare Workers e Cloudflare D1**, integrada à Fake Store API.

## Endereço público

https://api-clientes-favoritos.itamarteixeirasousa747.workers.dev

## Tecnologias utilizadas

- JavaScript
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Wrangler
- Fake Store API
- Vitest

## Funcionalidades

- Cadastro, consulta, atualização e exclusão de clientes.
- Senhas armazenadas com hash PBKDF2 e salt aleatório.
- Consulta de produtos pela Fake Store API.
- Consulta de produtos por ID.
- Listagem de categorias.
- Adição, consulta e remoção de produtos favoritos.
- Armazenamento dos favoritos no banco D1.
- Validação de dados e respostas HTTP.

## Endpoints

Base URL:

`https://api-clientes-favoritos.itamarteixeirasousa747.workers.dev`

### Clientes

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/clients` | Cadastrar cliente |
| GET | `/clients` | Listar clientes |
| GET | `/clients/:id` | Buscar cliente |
| PUT | `/clients/:id` | Atualizar cliente |
| DELETE | `/clients/:id` | Excluir cliente |

### Produtos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/products` | Listar produtos |
| GET | `/products/:id` | Buscar produto por ID |
| GET | `/categories` | Listar categorias |

Os produtos são consultados diretamente na Fake Store API: https://fakestoreapi.com

### Favoritos

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/clients/:id/favorites` | Adicionar favorito |
| GET | `/clients/:id/favorites` | Listar favoritos do cliente |
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

### Adicionar produto aos favoritos

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

O projeto utiliza Cloudflare D1 com duas tabelas:

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

A tabela favorites possui relacionamento com clients e impede que o mesmo produto seja adicionado duas vezes aos favoritos do mesmo cliente.

## Como executar localmente

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entrar na pasta

```bash
cd api-clientes-favoritos
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Executar a API

```bash
npm run dev
```

A API ficará disponível localmente em:

`http://localhost:8787`

## Migrações do banco de dados

Aplicar as migrações no banco local:

```bash
npx wrangler d1 migrations apply api-clientes-favoritos-db --local
```

Aplicar as migrações no banco remoto:

```bash
npx wrangler d1 migrations apply api-clientes-favoritos-db --remote
```

## Publicação

Para publicar a API na Cloudflare Workers:

```bash
npm run deploy
```

## Testes

Para executar os testes automatizados:

```bash
npm test
```

As rotas também podem ser testadas com Postman ou cURL.

## Autor

Projeto acadêmico desenvolvido para estudo de desenvolvimento de APIs REST, integração com serviços externos e banco de dados.
