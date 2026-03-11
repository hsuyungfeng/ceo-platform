const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_TEST } }
});

async function check() {
  try {
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', tables);
    const cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'supplier_applications'`;
    console.log('Supplier application columns:', cols);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();