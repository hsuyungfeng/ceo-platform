-- ============================================
-- 測試資料庫初始化腳本
-- 用於 Docker 容器啟動時自動執行
-- ============================================

-- 確保 UTF-8 編碼支援
SET client_encoding = 'UTF8';

-- 建立測試用擴展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 設定時區
SET TIME ZONE 'Asia/Taipei';

-- 建立測試專用的模式（可選）
-- CREATE SCHEMA IF NOT EXISTS test_schema;

-- 設定搜尋路徑
-- SET search_path TO test_schema, public;

-- 註：Prisma 會自動建立表格，此處僅進行基本設定
-- 如果需要預設資料，可以在這裡插入