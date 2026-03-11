# WCAG 2.1 AA 無障礙性實施指南

## 目標
將 CEO 平台的無障礙性評分從 4/10 提升到 >= 7/10，符合 WCAG 2.1 AA 標準。

## 核心原則

### 1. 可感知性 (Perceivable)
- **文字替代**：所有非文字內容提供文字替代
- **時間媒體**：提供時間媒體的替代方案
- **可適應**：內容可以不同方式呈現而不丟失資訊
- **可辨識**：讓用戶更容易看到和聽到內容

### 2. 可操作性 (Operable)
- **鍵盤可訪問**：所有功能可通過鍵盤操作
- **足夠時間**：用戶有足夠時間閱讀和使用內容
- **不會引發癲癇**：內容不會以已知會引發癲癇的方式設計
- **易於導航**：幫助用戶導航、查找內容和確定位置

### 3. 可理解性 (Understandable)
- **可讀**：文字內容可讀且可理解
- **可預測**：網頁以可預測的方式運作
- **輸入協助**：幫助用戶避免和修正錯誤

### 4. 穩健性 (Robust)
- **相容性**：與當前和未來的用戶工具相容

## 實施清單

### 1. 文字替代 (Text Alternatives)
- [ ] 所有圖片有 `alt` 屬性
- [ ] 圖標按鈕有 `aria-label`
- [ ] 表單輸入有相關聯的 `label`
- [ ] 裝飾性圖片有 `alt=""`

### 2. 鍵盤導航 (Keyboard Navigation)
- [ ] 所有互動元素有 `tabindex="0"`
- [ ] 自定義組件支援鍵盤事件
- [ ] 焦點指示器可見
- [ ] 跳過導航連結

### 3. 色彩對比 (Color Contrast)
- [ ] 文字與背景對比度 >= 4.5:1
- [ ] 大文字對比度 >= 3:1
- [ ] 非文字對比度 >= 3:1
- [ ] 不使用顏色作為唯一傳達資訊的方式

### 4. 表單可訪問性 (Form Accessibility)
- [ ] 所有輸入有 `id` 和 `for` 關聯
- [ ] 錯誤訊息有 `aria-describedby`
- [ ] 必填字段有 `aria-required="true"`
- [ ] 表單驗證提供清晰回饋

### 5. 語義標記 (Semantic Markup)
- [ ] 使用正確的 HTML5 語義元素
- [ ] 標題層級正確 (`h1` → `h6`)
- [ ] 列表使用 `ul`/`ol`/`li`
- [ ] 表格有適當的標題和描述

### 6. ARIA 屬性 (ARIA Attributes)
- [ ] 動態內容有 `aria-live` 區域
- [ ] 狀態變化有 `aria-expanded`/`aria-selected`
- [ ] 角色定義正確 (`role="button"`, `role="navigation"`)
- [ ] 避免 ARIA 誤用

### 7. 焦點管理 (Focus Management)
- [ ] 模態對話框捕獲焦點
- [ ] 動態內容更新後焦點管理
- [ ] 頁面轉換時焦點重置
- [ ] 可跳過的內容區域

## 關鍵頁面優先級

### 高優先級 (立即實施)
1. **登入頁面** (`/login`)
2. **註冊頁面** (`/register`)
3. **首頁** (`/`)
4. **供應商列表** (`/suppliers`)

### 中優先級 (第 2 天)
5. **產品列表** (`/products`)
6. **購物車** (`/cart`)
7. **通知中心** (`/notifications`)

### 低優先級 (第 3 天)
8. **管理頁面** (`/admin/*`)
9. **供應商儀表板** (`/supplier/*`)
10. **其他功能頁面**

## 測試工具

### 自動化測試
- **Lighthouse**：Chrome DevTools 內建
- **axe DevTools**：瀏覽器擴展
- **WAVE**：網頁可訪問性評估工具

### 手動測試
- **鍵盤導航**：僅使用 Tab、Shift+Tab、Enter、Space、箭頭鍵
- **螢幕閱讀器**：NVDA (Windows)、VoiceOver (macOS)
- **色彩對比**：Color Contrast Analyzer
- **縮放測試**：200% 縮放

## 實施步驟

### 第 1 天：基礎無障礙性
1. 添加所有圖片的 `alt` 屬性
2. 確保所有表單輸入有 `label`
3. 添加按鈕和連結的 `aria-label`
4. 檢查色彩對比度

### 第 2 天：鍵盤導航
1. 實現完整的鍵盤導航
2. 添加焦點指示器
3. 實現跳過導航連結
4. 測試所有互動元素

### 第 3 天：語義標記和 ARIA
1. 修復 HTML 語義結構
2. 添加適當的 ARIA 屬性
3. 實現動態內容的 `aria-live`
4. 測試螢幕閱讀器相容性

### 第 4 天：表單和錯誤處理
1. 改進表單可訪問性
2. 添加錯誤訊息關聯
3. 實現表單驗證回饋
4. 測試表單鍵盤操作

### 第 5 天：整合測試
1. 運行 Lighthouse 審計
2. 進行完整鍵盤測試
3. 螢幕閱讀器測試
4. 收集用戶反饋

## 代碼示例

### 圖片替代文字
```tsx
// 好：有描述性 alt 文字
<img 
  src="/product.jpg" 
  alt="藍色醫療口罩，50片裝，符合醫療標準"
/>

// 好：裝飾性圖片
<img 
  src="/decorative-bg.png" 
  alt=""
/>

// 不好：缺少 alt
<img src="/product.jpg" />
```

### 表單標籤關聯
```tsx
// 好：label 與 input 關聯
<label htmlFor="email">電子郵件</label>
<input id="email" type="email" />

// 好：aria-label
<button aria-label="關閉對話框">
  <XIcon />
</button>

// 不好：缺少標籤
<input type="text" placeholder="輸入名稱" />
```

### 鍵盤導航
```tsx
// 好：支援鍵盤操作
<button 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
>
  提交
</button>

// 好：焦點管理
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">確認對話框</h2>
  {/* 對話框內容 */}
</div>
```

### ARIA 屬性
```tsx
// 好：動態內容
<div aria-live="polite">
  {notificationMessage}
</div>

// 好：狀態指示
<button 
  aria-expanded={isExpanded}
  aria-controls="dropdown-content"
>
  展開選單
</button>

// 好：角色定義
<nav role="navigation">
  {/* 導航連結 */}
</nav>
```

## 常見問題解決方案

### 問題 1：缺少圖片替代文字
**解決方案**：
1. 為所有圖片添加 `alt` 屬性
2. 裝飾性圖片使用 `alt=""`
3. 複雜圖片提供詳細描述

### 問題 2：表單缺少標籤
**解決方案**：
1. 為所有輸入添加 `label`
2. 使用 `aria-label` 或 `aria-labelledby`
3. 確保標籤與輸入關聯

### 問題 3：色彩對比不足
**解決方案**：
1. 使用對比度檢查工具
2. 調整文字或背景顏色
3. 避免淺色文字在淺色背景上

### 問題 4：鍵盤無法操作
**解決方案**：
1. 添加 `tabindex="0"` 到互動元素
2. 實現鍵盤事件處理
3. 確保焦點指示器可見

### 問題 5：螢幕閱讀器不支援
**解決方案**：
1. 使用語義 HTML 元素
2. 添加適當的 ARIA 屬性
3. 測試螢幕閱讀器相容性

## 驗收標準

### 自動化測試
- [ ] Lighthouse 無障礙性評分 >= 90
- [ ] axe DevTools 0 個嚴重錯誤
- [ ] WAVE 0 個錯誤

### 手動測試
- [ ] 所有功能可純鍵盤操作
- [ ] 螢幕閱讀器可讀取所有內容
- [ ] 色彩對比度符合標準
- [ ] 表單錯誤訊息清晰

### 用戶測試
- [ ] 殘障用戶可完成關鍵任務
- [ ] 用戶反饋無障礙性問題
- [ ] 實際使用無障礙性功能

## 維護計劃

### 持續監控
1. **每次部署前**：運行 Lighthouse 審計
2. **每週檢查**：關鍵頁面無障礙性
3. **每月審查**：完整無障礙性審計

### 團隊培訓
1. **開發人員**：無障礙性編碼規範
2. **設計師**：無障礙性設計原則
3. **測試人員**：無障礙性測試方法

### 文檔更新
1. **代碼審查清單**：包含無障礙性檢查
2. **設計系統**：包含無障礙性指南
3. **用戶指南**：包含無障礙性功能

---

**最後更新**：2026-03-09  
**負責人**：CEO Platform Team  
**狀態**：🟡 **實施中** - Phase 10.3 無障礙性改進