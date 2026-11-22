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
