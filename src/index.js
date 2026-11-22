const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    key,
    256
  );

  const toHex = (bytes) =>
    Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const db = env.api_clientes_favoritos_db;
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    try {
      // CADASTRAR CLIENTE
      if (path === "/clients" && method === "POST") {
        const body = await request.json();
        const { name, email, password } = body;

        if (
          typeof name !== "string" || !name.trim() ||
          typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          typeof password !== "string" || password.length < 8
        ) {
          return json({
            error: "Informe nome, e-mail válido e senha com pelo menos 8 caracteres.",
          }, 400);
        }

        const passwordHash = await hashPassword(password);

        try {
          const result = await db.prepare(
            "INSERT INTO clients (name, email, password_hash) VALUES (?, ?, ?)"
          ).bind(name.trim(), email.trim().toLowerCase(), passwordHash).run();

          return json({
            message: "Cliente cadastrado com sucesso.",
            client: {
              id: result.meta.last_row_id,
              name: name.trim(),
              email: email.trim().toLowerCase(),
            },
          }, 201);
        } catch (error) {
          if (String(error.message).toLowerCase().includes("unique")) {
            return json({ error: "Este e-mail já está cadastrado." }, 409);
          }
          throw error;
        }
      }

      // LISTAR CLIENTES
      if (path === "/clients" && method === "GET") {
        const result = await db.prepare(
          "SELECT id, name, email, created_at FROM clients ORDER BY id"
        ).all();
        return json({ clients: result.results });
      }

      // ROTAS DE CLIENTE POR ID
      const clientMatch = path.match(/^\/clients\/(\d+)$/);

      if (clientMatch) {
        const id = Number(clientMatch[1]);

        if (method === "GET") {
          const client = await db.prepare(
            "SELECT id, name, email, created_at FROM clients WHERE id = ?"
          ).bind(id).first();

          return client
            ? json({ client })
            : json({ error: "Cliente não encontrado." }, 404);
        }

        if (method === "PUT") {
          const body = await request.json();
          const { name, email, password } = body;

          if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            return json({ error: "Informe nome e e-mail válido." }, 400);
          }

          const existing = await db.prepare(
            "SELECT id FROM clients WHERE id = ?"
          ).bind(id).first();

          if (!existing) return json({ error: "Cliente não encontrado." }, 404);

          if (password !== undefined) {
            if (typeof password !== "string" || password.length < 8) {
              return json({ error: "A senha deve ter pelo menos 8 caracteres." }, 400);
            }

            const passwordHash = await hashPassword(password);
            await db.prepare(
              "UPDATE clients SET name = ?, email = ?, password_hash = ? WHERE id = ?"
            ).bind(name.trim(), email.trim().toLowerCase(), passwordHash, id).run();
          } else {
            await db.prepare(
              "UPDATE clients SET name = ?, email = ? WHERE id = ?"
            ).bind(name.trim(), email.trim().toLowerCase(), id).run();
          }

          return json({ message: "Cliente atualizado com sucesso." });
        }

        if (method === "DELETE") {
          const result = await db.prepare(
            "DELETE FROM clients WHERE id = ?"
          ).bind(id).run();

          return result.meta.changes
            ? json({ message: "Cliente excluído com sucesso." })
            : json({ error: "Cliente não encontrado." }, 404);
        }
      }

      // LISTAR PRODUTOS
      if (path === "/products" && method === "GET") {
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) return json({ error: "Falha ao buscar produtos." }, 502);
        return json({ products: await response.json() });
      }

      // BUSCAR PRODUTO POR ID
      const productMatch = path.match(/^\/products\/(\d+)$/);

      if (productMatch && method === "GET") {
        const response = await fetch(
          `https://fakestoreapi.com/products/${productMatch[1]}`
        );

        if (response.status === 404) {
          return json({ error: "Produto não encontrado." }, 404);
        }
        if (!response.ok) return json({ error: "Falha ao buscar produto." }, 502);
        return json({ product: await response.json() });
      }

      // LISTAR CATEGORIAS
      if (path === "/categories" && method === "GET") {
        const response = await fetch("https://fakestoreapi.com/products/categories");
        if (!response.ok) return json({ error: "Falha ao buscar categorias." }, 502);
        return json({ categories: await response.json() });
      }

      // ROTAS DE FAVORITOS
      const favoritesMatch = path.match(/^\/clients\/(\d+)\/favorites(?:\/(\d+))?$/);

      if (favoritesMatch) {
        const clientId = Number(favoritesMatch[1]);
        const productId = favoritesMatch[2] ? Number(favoritesMatch[2]) : null;

        const client = await db.prepare(
          "SELECT id FROM clients WHERE id = ?"
        ).bind(clientId).first();

        if (!client) return json({ error: "Cliente não encontrado." }, 404);

        if (method === "POST" && productId === null) {
          const body = await request.json();
          const id = Number(body.product_id);

          if (!Number.isInteger(id) || id <= 0) {
            return json({ error: "Informe um product_id válido." }, 400);
          }

          const productResponse = await fetch(
            `https://fakestoreapi.com/products/${id}`
          );

          if (!productResponse.ok) {
            return json({ error: "Falha ao consultar produto." }, 502);
          }

          const product = await productResponse.json();
          if (!product || !product.id) {
            return json({ error: "Produto não encontrado." }, 404);
          }

          try {
            await db.prepare(
              "INSERT INTO favorites (client_id, product_id) VALUES (?, ?)"
            ).bind(clientId, id).run();

            return json({
              message: "Produto adicionado aos favoritos.",
              client_id: clientId,
              product_id: id,
            }, 201);
          } catch (error) {
            if (String(error.message).toLowerCase().includes("unique")) {
              return json({ error: "Este produto já está nos favoritos." }, 409);
            }
            throw error;
          }
        }

        if (method === "GET" && productId === null) {
          const result = await db.prepare(
            "SELECT product_id, created_at FROM favorites WHERE client_id = ? ORDER BY id"
          ).bind(clientId).all();

          const products = await Promise.all(
            result.results.map(async (favorite) => {
              const response = await fetch(
                `https://fakestoreapi.com/products/${favorite.product_id}`
              );
              return response.ok ? response.json() : null;
            })
          );

          return json({
            client_id: clientId,
            favorites: products.filter(Boolean),
          });
        }

        if (method === "DELETE" && productId !== null) {
          const result = await db.prepare(
            "DELETE FROM favorites WHERE client_id = ? AND product_id = ?"
          ).bind(clientId, productId).run();

          return result.meta.changes
            ? json({ message: "Favorito removido com sucesso." })
            : json({ error: "Favorito não encontrado." }, 404);
        }
      }

      return json({ error: "Rota não encontrada." }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: "Erro interno do servidor." }, 500);
    }
  },
};
