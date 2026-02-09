# ============================================
# CEO Platform - Dockerfile for Production
# ============================================
# 多階段構建：減少最終鏡像大小
# 階段1: 依賴安裝和構建
# 階段2: 運行階段

# ============ 階段1: 構建階段 ============
FROM node:20-alpine AS builder

# 設置工作目錄
WORKDIR /app

# 安裝pnpm（如果未安裝）
RUN npm install -g pnpm@latest

# 複製包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安裝所有依賴（包括devDependencies）
RUN pnpm install --frozen-lockfile

# 複製所有源代碼
COPY . .

# 生成Prisma客戶端
RUN pnpm db:generate

# 構建應用
RUN pnpm build

# ============ 階段2: 運行階段 ============
FROM node:20-alpine AS runner

# 設置工作目錄
WORKDIR /app

# 創建非root用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 從構建階段複製必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# 設置權限
RUN chown -R nextjs:nodejs /app

# 切換到非root用戶
USER nextjs

# 暴露端口
EXPOSE 3000

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 啟動命令
CMD ["node", "server.js"]

# ============================================
# 構建命令:
# docker build -t ceo-platform:latest .
#
# 運行命令:
# docker run -p 3000:3000 --env-file .env.production ceo-platform:latest
# ============================================