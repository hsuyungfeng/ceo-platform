import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  password: z.string().min(6, '密碼至少需要6個字元'),
})

export const registerSchema = z.object({
  name: z.string().min(2, '姓名至少需要2個字元'),
  email: z.string().email('請輸入有效的電子郵件'),
  password: z.string().min(6, '密碼至少需要6個字元'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, '姓名至少需要2個字元').optional(),
  email: z.string().email('請輸入有效的電子郵件').optional(),
  currentPassword: z.string().min(6, '目前密碼至少需要6個字元').optional(),
  newPassword: z.string().min(6, '新密碼至少需要6個字元').optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: '變更密碼需要輸入目前密碼',
  path: ['currentPassword'],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false
  }
  return true
}, {
  message: '新密碼不一致',
  path: ['confirmNewPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>