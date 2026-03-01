/**
 * Phase 4.5 Task 4 — Join Group Buying 單元測試
 *
 * 測試範圍：
 * - 加入邏輯的業務規則驗證（純函式層）
 * - getQtyToNextTier() 輔助函式
 * - 折扣計算 + 退款預估邏輯
 */

import { getGroupDiscount, getQtyToNextTier, GROUP_DISCOUNT_TIERS } from '@/lib/group-buying'

// ─── 1. getQtyToNextTier() ────────────────────────────────────────────────────

describe('getQtyToNextTier()', () => {
  it('1 件 → 距下一階梯還需 99 件', () => {
    expect(getQtyToNextTier(1)).toBe(99)
  })

  it('50 件 → 距下一階梯還需 50 件', () => {
    expect(getQtyToNextTier(50)).toBe(50)
  })

  it('99 件 → 距下一階梯還需 1 件', () => {
    expect(getQtyToNextTier(99)).toBe(1)
  })

  it('100 件 → 距下一階梯還需 400 件', () => {
    expect(getQtyToNextTier(100)).toBe(400)
  })

  it('499 件 → 距下一階梯還需 1 件', () => {
    expect(getQtyToNextTier(499)).toBe(1)
  })

  it('500 件 → 已達最高階梯，回傳 null', () => {
    expect(getQtyToNextTier(500)).toBeNull()
  })

  it('1000 件 → 已達最高階梯，回傳 null', () => {
    expect(getQtyToNextTier(1000)).toBeNull()
  })
})

// ─── 2. 加入後折扣升級驗證 ────────────────────────────────────────────────────

describe('加入後折扣升級情境', () => {
  it('團長 80 件 + 新成員 25 件 = 105 件 → 觸發 5% 折扣', () => {
    const leaderQty = 80
    const newMemberQty = 25
    const totalBefore = leaderQty
    const totalAfter  = leaderQty + newMemberQty

    expect(getGroupDiscount(totalBefore)).toBe(0)     // 升級前
    expect(getGroupDiscount(totalAfter)).toBe(0.05)   // 升級後
  })

  it('累計 450 件 + 新成員 60 件 = 510 件 → 觸發 10% 折扣', () => {
    const existing = 450
    const incoming = 60
    const totalAfter = existing + incoming

    expect(getGroupDiscount(existing)).toBe(0.05)     // 升級前
    expect(getGroupDiscount(totalAfter)).toBe(0.10)   // 升級後
  })

  it('累計 300 件 + 新成員 50 件 → 還不會升級', () => {
    const existing = 300
    const incoming = 50
    const totalAfter = existing + incoming

    expect(getGroupDiscount(existing)).toBe(0.05)
    expect(getGroupDiscount(totalAfter)).toBe(0.05)   // 維持 5%
    expect(getQtyToNextTier(totalAfter)).toBe(150)    // 還差 150 件到 500
  })
})

// ─── 3. 返利金額計算 ──────────────────────────────────────────────────────────

describe('返利金額計算（結算時）', () => {
  /**
   * 返利計算邏輯：
   * 若結算時折扣率 = D，某訂單原始金額 = amount，
   * 則返利 = amount × D
   */
  const calcRefund = (originalAmount: number, discountRate: number) =>
    Math.round(originalAmount * discountRate * 100) / 100

  it('原始金額 1000，最終折扣 5%，返利 50 元', () => {
    const finalDiscount = getGroupDiscount(250) // 250 件 → 5%
    expect(calcRefund(1000, finalDiscount)).toBe(50)
  })

  it('原始金額 2500，最終折扣 10%，返利 250 元', () => {
    const finalDiscount = getGroupDiscount(600) // 600 件 → 10%
    expect(calcRefund(2500, finalDiscount)).toBe(250)
  })

  it('原始金額 999.99，折扣 10%，返利 100 元（四捨五入）', () => {
    const finalDiscount = getGroupDiscount(500)
    expect(calcRefund(999.99, finalDiscount)).toBe(100)
  })

  it('未達折扣門檻（99 件），返利應為 0', () => {
    const finalDiscount = getGroupDiscount(99)
    expect(calcRefund(5000, finalDiscount)).toBe(0)
  })
})

// ─── 4. 折扣階梯完整性驗證 ────────────────────────────────────────────────────

describe('折扣階梯完整性', () => {
  it('每個階梯的 discount 必須是 0 到 1 之間的數字', () => {
    GROUP_DISCOUNT_TIERS.forEach(tier => {
      expect(tier.discount).toBeGreaterThanOrEqual(0)
      expect(tier.discount).toBeLessThanOrEqual(1)
    })
  })

  it('minQty 必須是正整數', () => {
    GROUP_DISCOUNT_TIERS.forEach(tier => {
      expect(tier.minQty).toBeGreaterThan(0)
      expect(Number.isInteger(tier.minQty)).toBe(true)
    })
  })

  it('第一個階梯的 minQty 必須是 1（從第 1 件開始）', () => {
    expect(GROUP_DISCOUNT_TIERS[0].minQty).toBe(1)
  })
})
