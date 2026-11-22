import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(async () => {
  await env.api_clientes_favoritos_db.prepare(
    "DELETE FROM favorites"
  ).run();

  await env.api_clientes_favoritos_db.prepare(
    "DELETE FROM clients"
  ).run();
});

describe("API de clientes", () => {
  it("deve cadastrar um cliente", async () => {
    const response = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Itamar",
        email: "itamar@teste.com",
        password: "senha12345"
      })
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.client.name).toBe("Itamar");
    expect(data.client.email).toBe("itamar@teste.com");
    expect(data.client.password).toBeUndefined();
  });

  it("deve rejeitar cadastro com dados inválidos", async () => {
    const response = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        email: "email-invalido",
        password: "123"
      })
    });

    expect(response.status).toBe(400);
  });

  it("não deve permitir e-mail duplicado", async () => {
    const cliente = {
      name: "Itamar",
      email: "itamar@teste.com",
      password: "senha12345"
    };

    await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente)
    });

    const response = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente)
    });

    expect(response.status).toBe(409);
  });

  it("deve listar os clientes cadastrados", async () => {
    await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Itamar",
        email: "itamar@teste.com",
        password: "senha12345"
      })
    });

    const response = await SELF.fetch("http://example.com/clients");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.clients.length).toBe(1);
    expect(data.clients[0].name).toBe("Itamar");
  });
});

describe("Atualização e exclusão de clientes", () => {
  it("deve atualizar os dados de um cliente", async () => {
    const cadastro = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Itamar",
        email: "itamar@teste.com",
        password: "senha12345"
      })
    });

    const clienteCriado = await cadastro.json();
    const id = clienteCriado.client.id;

    const response = await SELF.fetch(`http://example.com/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Itamar Teixeira",
        email: "itamar@teste.com"
      })
    });

    expect(response.status).toBe(200);

    const consulta = await SELF.fetch(`http://example.com/clients/${id}`);
    const data = await consulta.json();

    expect(data.client.name).toBe("Itamar Teixeira");
  });

  it("deve excluir um cliente", async () => {
    const cadastro = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cliente para excluir",
        email: "excluir@teste.com",
        password: "senha12345"
      })
    });

    const clienteCriado = await cadastro.json();
    const id = clienteCriado.client.id;

    const response = await SELF.fetch(`http://example.com/clients/${id}`, {
      method: "DELETE"
    });

    expect(response.status).toBe(200);

    const consulta = await SELF.fetch(`http://example.com/clients/${id}`);

    expect(consulta.status).toBe(404);
  });
});

describe("API de produtos e categorias", () => {
  it("deve listar os produtos da Fake Store API", async () => {
    const response = await SELF.fetch("http://example.com/products");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);
  });

  it("deve listar as categorias dos produtos", async () => {
    const response = await SELF.fetch("http://example.com/categories");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.categories)).toBe(true);
    expect(data.categories.length).toBeGreaterThan(0);
  });
});

describe("API de favoritos", () => {
  async function criarCliente() {
    const response = await SELF.fetch("http://example.com/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Itamar",
        email: "itamar@teste.com",
        password: "senha12345"
      })
    });

    const data = await response.json();
    return data.client.id;
  }

  it("deve adicionar um produto aos favoritos", async () => {
    const id = await criarCliente();

    const response = await SELF.fetch(
      `http://example.com/clients/${id}/favorites`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: 1 })
      }
    );

    expect(response.status).toBe(201);
  });

  it("deve listar os favoritos do cliente", async () => {
    const id = await criarCliente();

    await SELF.fetch(`http://example.com/clients/${id}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 1 })
    });

    const response = await SELF.fetch(
      `http://example.com/clients/${id}/favorites`
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.favorites)).toBe(true);
    expect(data.favorites.length).toBe(1);
  });

  it("não deve permitir produtos favoritos duplicados", async () => {
    const id = await criarCliente();

    const url = `http://example.com/clients/${id}/favorites`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 1 })
    };

    await SELF.fetch(url, options);
    const response = await SELF.fetch(url, options);

    expect(response.status).toBe(409);
  });

  it("deve remover um produto dos favoritos", async () => {
    const id = await criarCliente();

    await SELF.fetch(`http://example.com/clients/${id}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: 1 })
    });

    const response = await SELF.fetch(
      `http://example.com/clients/${id}/favorites/1`,
      { method: "DELETE" }
    );

    expect(response.status).toBe(200);
  });
});
