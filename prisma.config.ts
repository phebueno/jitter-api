import "dotenv/config";
import { defineConfig } from "prisma/config";

const {
  POSTGRES_USER = "jitter",
  POSTGRES_PASSWORD = "jitter123",
  POSTGRES_HOST = "localhost",
  POSTGRES_PORT = "5432",
  POSTGRES_DB = "jitter_db",
} = process.env;

const databaseUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
