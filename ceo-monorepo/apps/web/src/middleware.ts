import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 暫時禁用 middleware 以解決 Edge Runtime 問題
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// 設定 middleware 匹配的路徑
export const config = {
  matcher: [],
};