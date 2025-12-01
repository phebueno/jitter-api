import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const {
  POSTGRES_USER = 'jitter',
  POSTGRES_PASSWORD = 'jitter123',
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_DB = 'jitter_db',
} = process.env;

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  { name: 'Notebook Dell Inspiron 15' },
  { name: 'Mouse Logitech MX Master 3' },
  { name: 'Teclado Mecânico Keychron K2' },
  { name: 'Monitor LG UltraWide 29"' },
  { name: 'Webcam Logitech C920' },
  { name: 'Headset HyperX Cloud II' },
  { name: 'SSD Samsung 970 EVO 500GB' },
  { name: 'Cadeira Gamer DT3 Sports' },
  { name: 'Mousepad Gamer Grande' },
  { name: 'Hub USB-C 7 em 1' },
  { name: 'Suporte para Notebook Ajustável' },
  { name: 'Cabo HDMI 2.0 Premium 2m' },
  { name: 'Pen Drive SanDisk 128GB USB 3.0' },
  { name: 'Microfone Blue Yeti' },
  { name: 'Luminária LED de Mesa' },
  { name: 'Roteador Wi-Fi 6 TP-Link' },
  { name: 'Caixa de Som Bluetooth JBL' },
  { name: 'Carregador Sem Fio Fast Charge' },
  { name: 'Switch Gigabit Ethernet 8 Portas' },
  { name: 'Webcam Ring Light Integrado' },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.product.deleteMany();
  console.log('🗑️  Produtos antigos removidos');

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ ${products.length} produtos criados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
