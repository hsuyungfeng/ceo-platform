/**
 * 簡單的整合測試驗證 Jest 環境是否正常
 */

describe('Jest 整合測試環境驗證', () => {
  it('應該可以通過簡單的測試', () => {
    expect(1 + 1).toBe(2)
  })

  it('應該可以載入環境變數', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
})