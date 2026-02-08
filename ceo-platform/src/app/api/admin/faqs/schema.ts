import { z } from 'zod';

// FAQ 創建 Schema
export const faqSchema = z.object({
  question: z.string().min(1, '問題不能為空').max(500, '問題不能超過500字'),
  answer: z.string().min(1, '答案不能為空').max(5000, '答案不能超過5000字'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// FAQ 更新 Schema
export const faqUpdateSchema = faqSchema.partial();

// FAQ 查詢參數 Schema
export const faqQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
});

// TypeScript 類型
export type FaqSchema = z.infer<typeof faqSchema>;
export type FaqUpdateSchema = z.infer<typeof faqUpdateSchema>;
export type FaqQuerySchema = z.infer<typeof faqQuerySchema>;