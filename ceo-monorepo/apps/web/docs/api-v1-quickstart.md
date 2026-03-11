# API v1 快速入門

## 快速開始

### 1. 基礎請求

```javascript
// 獲取健康狀態
fetch('/api/v1/health')
  .then(response => response.json())
  .then(data => console.log(data));

// 帶認證的請求
fetch('/api/v1/user/profile', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### 2. 使用 axios（推薦）

```javascript
import axios from 'axios';

// 創建實例
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// 請求攔截器（添加認證）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器（錯誤處理）
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 重新登入
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 使用示例
async function getUserProfile() {
  try {
    const response = await api.get('/user/profile');
    console.log('用戶資料:', response.data);
  } catch (error) {
    console.error('獲取失敗:', error.response?.data?.error?.message);
  }
}
```

## 常用端點示例

### 獲取供應商列表

```javascript
async function getSuppliers(page = 1, search = '') {
  const response = await api.get('/suppliers', {
    params: {
      page,
      limit: 20,
      search,
      status: 'ACTIVE'
    }
  });
  
  return {
    suppliers: response.data,
    pagination: response.pagination
  };
}
```

### 創建訂單

```javascript
async function createOrder(items, shippingAddress) {
  const response = await api.post('/orders', {
    items,
    shippingAddress,
    paymentMethod: 'CREDIT_CARD',
    note: ''
  });
  
  return response.data;
}

// 使用
createOrder([
  { productId: 'prod-123', quantity: 2 },
  { productId: 'prod-456', quantity: 1 }
], '台北市信義區');
```

### 註冊供應商

```javascript
async function registerSupplier(supplierData) {
  const response = await api.post('/suppliers', supplierData);
  
  return response.data;
}

// 使用
registerSupplier({
  taxId: '12345678',
  companyName: '測試公司',
  contactPerson: '李四',
  phone: '0223456789',
  email: 'supplier@example.com',
  address: '台北市信義區'
});
```

## 錯誤處理模式

### 1. 基本錯誤處理

```javascript
async function safeApiCall(apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    const apiError = error.response?.data?.error;
    
    if (apiError) {
      switch (apiError.code) {
        case 'UNAUTHORIZED':
          alert('請先登入');
          break;
        case 'FORBIDDEN':
          alert('權限不足');
          break;
        case 'VALIDATION_ERROR':
          alert(`輸入錯誤: ${apiError.details?.errors?.[0]?.message}`);
          break;
        default:
          alert(`操作失敗: ${apiError.message}`);
      }
    } else {
      alert('網路錯誤，請稍後再試');
    }
    
    throw error;
  }
}

// 使用
safeApiCall(() => api.get('/user/profile'));
```

### 2. 表單驗證錯誤處理

```javascript
function displayFormErrors(errors) {
  // errors 格式: [{ field: 'email', message: '請輸入有效的電子郵件' }]
  errors.forEach(error => {
    const element = document.querySelector(`[name="${error.field}"]`);
    if (element) {
      element.classList.add('error');
      // 顯示錯誤訊息
    }
  });
}

// 在表單提交時使用
try {
  await api.post('/suppliers', formData);
} catch (error) {
  if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
    displayFormErrors(error.response.data.error.details.errors);
  }
}
```

## React Hook 示例

### 1. 使用 useQuery (React Query)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// 獲取供應商列表
export function useSuppliers(params) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => api.get('/suppliers', { params }),
  });
}

// 創建訂單
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: () => {
      // 使相關查詢失效
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// 在組件中使用
function SupplierList() {
  const { data, isLoading, error } = useSuppliers({
    page: 1,
    limit: 20
  });
  
  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(supplier => (
        <div key={supplier.id}>{supplier.companyName}</div>
      ))}
    </div>
  );
}
```

### 2. 自定義 Hook

```javascript
import { useState, useCallback } from 'react';
import api from '@/lib/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const callApi = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api[method](endpoint, data);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || { message: '網路錯誤' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    error,
    get: (endpoint, params) => callApi('get', endpoint, { params }),
    post: (endpoint, data) => callApi('post', endpoint, data),
    put: (endpoint, data) => callApi('put', endpoint, data),
    delete: (endpoint) => callApi('delete', endpoint),
  };
}

// 使用
function MyComponent() {
  const { loading, error, get } = useApi();
  
  const loadData = async () => {
    try {
      const data = await get('/user/profile');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div>
      <button onClick={loadData} disabled={loading}>
        {loading ? '載入中...' : '載入資料'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}
```

## TypeScript 類型定義

```typescript
// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 用戶類型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MEMBER' | 'SUPPLIER' | 'WHOLESALER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 供應商類型
export interface Supplier {
  id: string;
  taxId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  address?: string;
  industry?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 類型安全的 API 調用
async function getUserProfile(): Promise<ApiResponse<User>> {
  const response = await api.get('/user/profile');
  return response.data;
}

async function getSuppliers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ApiResponse<Supplier[]>> {
  const response = await api.get('/suppliers', { params });
  return response.data;
}
```

## 測試示例

### 1. Jest 測試

```javascript
import api from '@/lib/api';
import { mockApiResponse } from '@/lib/test-helpers';

describe('API v1', () => {
  beforeEach(() => {
    // 清除所有模擬
    jest.clearAllMocks();
  });
  
  test('獲取健康狀態', async () => {
    // 模擬 API 響應
    mockApiResponse({
      success: true,
      data: { status: 'healthy' }
    });
    
    const response = await api.get('/health');
    
    expect(response.success).toBe(true);
    expect(response.data.status).toBe('healthy');
  });
  
  test('處理認證錯誤', async () => {
    // 模擬 401 錯誤
    mockApiResponse({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '需要登入'
      }
    }, 401);
    
    try {
      await api.get('/user/profile');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.error.code).toBe('UNAUTHORIZED');
    }
  });
});
```

### 2. Playwright E2E 測試

```javascript
import { test, expect } from '@playwright/test';

test('API 健康檢查', async ({ request }) => {
  const response = await request.get('/api/v1/health');
  
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.data.status).toBe('healthy');
});

test('需要認證的 API', async ({ request }) => {
  // 未認證的請求應該返回 401
  const response = await request.get('/api/v1/user/profile');
  expect(response.status()).toBe(401);
  
  const data = await response.json();
  expect(data.success).toBe(false);
  expect(data.error.code).toBe('UNAUTHORIZED');
});
```

## 性能優化技巧

### 1. 請求合併

```javascript
// 合併多個請求
async function getHomeData() {
  const [health, user, suppliers] = await Promise.all([
    api.get('/health'),
    api.get('/user/profile').catch(() => null), // 可選請求
    api.get('/suppliers?limit=5')
  ]);
  
  return {
    health: health.data,
    user: user?.data,
    suppliers: suppliers.data
  };
}
```

### 2. 緩存策略

```javascript
import { setupCache } from 'axios-cache-interceptor';
import api from '@/lib/api';

// 設置緩存
const cachedApi = setupCache(api, {
  ttl: 5 * 60 * 1000, // 5分鐘
  methods: ['get'],
  cachePredicate: {
    statusCheck: status => status >= 200 && status < 400,
  },
  exclude: {
    // 排除需要實時數據的端點
    paths: ['/user/profile', '/orders']
  }
});

// 使用緩存的 API
cachedApi.get('/suppliers'); // 會被緩存
```

### 3. 請求取消

```javascript
import axios from 'axios';

const CancelToken = axios.CancelToken;
let cancel;

// 發送可取消的請求
async function searchSuppliers(query) {
  // 取消之前的請求
  if (cancel) {
    cancel('取消之前的搜尋');
  }
  
  try {
    const response = await api.get('/suppliers', {
      params: { search: query },
      cancelToken: new CancelToken(c => {
        cancel = c;
      })
    });
    
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('請求已取消:', error.message);
    } else {
      throw error;
    }
  }
}

// 在組件卸載時取消請求
useEffect(() => {
  return () => {
    if (cancel) {
      cancel('組件卸載');
    }
  };
}, []);
```

## 故障排除

### 常見問題

1. **401 錯誤**
   - 檢查 `Authorization` 頭部
   - 確認 token 未過期
   - 檢查 session cookie

2. **403 錯誤**
   - 確認用戶角色有足夠權限
   - 檢查 API 端點所需的角色

3. **500 錯誤**
   - 查看伺服器日誌
   - 檢查 Sentry 錯誤報告
   - 確認資料庫連接正常

4. **網路錯誤**
   - 檢查網路連接
   - 確認 CORS 配置
   - 檢查防火牆設置

### 調試技巧

```javascript
// 啟用詳細日誌
api.interceptors.request.use(config => {
  console.log('請求:', config.method, config.url, config.data);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('響應:', response.status, response.data);
    return response;
  },
  error => {
    console.error('錯誤:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

## 下一步

1. 查看完整 [API 參考文件](./api-v1-reference.md)
2. 測試 Sentry 集成：訪問 `/sentry-test`
3. 運行 API 測試：`node test-v1-apis.js`
4. 探索 API 源代碼：`src/app/api/v1/`