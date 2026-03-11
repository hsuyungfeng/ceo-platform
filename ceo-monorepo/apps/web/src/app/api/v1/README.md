# API 版本管理

## 概述
CEO 平台 API 版本管理系統，支持多版本 API 並存。

## 版本策略

### 版本命名
- `v1`: 當前穩定版本 (2026-03-09)
- `v2`: 未來版本 (規劃中)

### 版本規則
1. **向後兼容**: 新版本應盡量保持向後兼容
2. **版本過渡**: 舊版本至少保留 6 個月
3. **版本標識**: 通過 URL 路徑標識版本 (`/api/v1/...`)

## 遷移指南

### 從舊 API 遷移到 v1
1. 更新 URL 路徑: `/api/xxx` → `/api/v1/xxx`
2. 使用新的中介層系統
3. 遵循標準化的響應格式

### 創建新版本 API
1. 複製 `v1` 目錄到 `v2`
2. 進行必要的修改
3. 更新文檔和測試

## 目錄結構

```
src/app/api/
├── v1/                    # 版本 1 API
│   ├── health/           # 健康檢查
│   ├── suppliers/        # 供應商 API
│   ├── products/         # 商品 API
│   └── ...
├── v2/                    # 版本 2 API (未來)
└── legacy/               # 舊版本 API (過渡期)
```

## 使用範例

### 請求 v1 API
```
GET /api/v1/suppliers
GET /api/v1/products?page=1&limit=20
POST /api/v1/orders
```

### 響應格式
所有 v1 API 使用標準化的響應格式：
```json
{
  "success": true,
  "data": { /* 響應數據 */ },
  "error": null,
  "pagination": { /* 分頁信息 */ }
}
```

## 版本過渡

### 當前狀態
- **v1**: 穩定版本，推薦使用
- **legacy**: 舊版本，逐步淘汰

### 遷移時間表
| 日期 | 行動 |
|------|------|
| 2026-03-09 | 發布 v1 API |
| 2026-04-09 | 開始遷移客戶端到 v1 |
| 2026-09-09 | 停止支持 legacy API |

## 相關文件

- `docs/API_DEVELOPMENT_GUIDE.md` - API 開發指南
- `src/lib/api-middleware.ts` - 中介層系統
- `src/lib/constants.ts` - 常量和配置