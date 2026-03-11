import { jest } from '@jest/globals';

console.log('LOADING MANUAL MOCK for @/lib/prisma');

const mockSupplier = {
  findMany: jest.fn(),
  count: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findUnique: jest.fn(),
};

const mockSupplierAccount = {
  create: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};

const prisma = {
  supplier: mockSupplier,
  supplierAccount: mockSupplierAccount,
};

export { prisma };
export default prisma;