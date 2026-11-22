import { applyD1Migrations } from "cloudflare:test";
import { env } from "cloudflare:workers";

await applyD1Migrations(
  env.api_clientes_favoritos_db,
  env.TEST_MIGRATIONS
);
