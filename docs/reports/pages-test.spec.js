import { test, expect } from "@playwright/test";

const PAGES = [
  { name: "首頁", path: "/" },
  { name: "商品列表頁", path: "/products" },
  { name: "商品詳情頁", path: "/products/1" },
  { name: "購物車頁", path: "/cart" },
  { name: "結帳頁", path: "/checkout" },
  { name: "訂單頁", path: "/orders" },
  { name: "登入頁", path: "/login" },
  { name: "註冊頁", path: "/register" },
  { name: "忘記密碼頁", path: "/forgot-password" },
  { name: "後台管理頁", path: "/admin" },
];

test.describe("頁面優化測試 - Playwright 瀏覽器測試", () => {
  const results = [];

  for (const { name, path } of PAGES) {
    test(name + " (" + path + ") 應該正常載入", async ({ page }) => {
      const consoleErrors = [];
      page.on("console", msg => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const response = await page.goto("http://localhost:3000" + path, { waitUntil: "domcontentloaded", timeout: 15000 });
      const status = response.status();
      const title = await page.title();
      
      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("img")).filter(img => !img.complete || img.naturalHeight === 0).length;
      });

      results.push({ name, path, status, title, consoleErrors: consoleErrors.length, brokenImages, passed: status < 400 });
      
      expect(status).toBeLessThan(400);
      console.log("✅ " + name + " (" + path + ") - " + status + " - " + title.substring(0, 40));
    });
  }

  test("API 健康檢查應該正常", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/api/health", { waitUntil: "domcontentloaded" });
    expect(response.status()).toBe(200);
    console.log("✅ API 健康檢查 (/api/health) - 200");
  });
});
