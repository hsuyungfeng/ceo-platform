import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 開始播種測試資料...')

  // 建立測試用戶 (主要帳戶)
  const user = await prisma.user.upsert({
    where: { email: 'supplier@test.com' },
    update: {},
    create: {
      email: 'supplier@test.com',
      name: '王小明',
      phone: '0912345678',
      role: 'MEMBER',
    },
  })
  console.log('✅ 用戶建立完成:', user.email)

  // 建立測試供應商
  const supplier = await prisma.supplier.upsert({
    where: { taxId: '12345678' },
    update: {},
    create: {
      taxId: '12345678',
      companyName: '健康醫療器材有限公司',
      contactPerson: '王小明',
      phone: '0912345678',
      email: 'test@supplier.com',
      address: '台北市信義區健康路123號',
      status: 'ACTIVE',
      isVerified: true,
      mainAccountId: user.id,
    },
  })
  console.log('✅ 供應商建立完成:', supplier.companyName)

  // 建立 Firm (廠商)
  const firm = await prisma.firm.upsert({
    where: { name: '健康醫療器材' },
    update: {},
    create: {
      name: '健康醫療器材',
      phone: '0912345678',
      address: '台北市信義區健康路123號',
      isActive: true,
    },
  })
  console.log('✅ Firm 建立完成:', firm.name)

  // 建立測試商品
  const product = await prisma.product.upsert({
    where: { name: '醫療口罩' },
    update: {},
    create: {
      name: '醫療口罩',
      subtitle: '三層防護，細菌過濾率99%',
      description: '高品質醫療級口罩，採用三層過濾設計，有效阻隔細菌和病毒。適合醫療機構日常使用。',
      image: '/placeholder-product.svg',
      unit: '盒',
      spec: '每盒50片',
      isActive: true,
      isFeatured: true,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      minGroupQty: 1,
      totalSold: 0,
      firmId: firm.id,
    },
  })
  console.log('✅ 商品建立完成:', product.name)

  // 建立階梯價格
  await prisma.priceTier.deleteMany({
    where: { productId: product.id },
  })

  const priceTiers = [
    { productId: product.id, minQty: 1, price: 200 },
    { productId: product.id, minQty: 50, price: 180 },
    { productId: product.id, minQty: 100, price: 150 },
    { productId: product.id, minQty: 200, price: 120 },
  ]

  for (const tier of priceTiers) {
    await prisma.priceTier.create({ data: tier })
  }
  console.log('✅ 階梯價格建立完成')

  // 建立第二個測試商品
  const product2 = await prisma.product.upsert({
    where: { name: '酒精乾洗手' },
    update: {},
    create: {
      name: '酒精乾洗手',
      subtitle: '75%酒精濃度抗菌',
      description: '75%酒精濃度，有效抗菌。適合個人和醫療機構使用。',
      image: '/placeholder-product.svg',
      unit: '瓶',
      spec: '每瓶500ml',
      isActive: true,
      isFeatured: true,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      minGroupQty: 1,
      totalSold: 0,
      firmId: firm.id,
    },
  })
  console.log('✅ 商品2建立完成:', product2.name)

  // 建立第二個商品的階梯價格
  await prisma.priceTier.deleteMany({
    where: { productId: product2.id },
  })

  const priceTiers2 = [
    { productId: product2.id, minQty: 1, price: 280 },
    { productId: product2.id, minQty: 30, price: 250 },
    { productId: product2.id, minQty: 60, price: 220 },
  ]

  for (const tier of priceTiers2) {
    await prisma.priceTier.create({ data: tier })
  }
  console.log('✅ 階梯價格2建立完成')

  // 建立第三個測試商品
  const product3 = await prisma.product.upsert({
    where: { name: '血壓計' },
    update: {},
    create: {
      name: '血壓計',
      subtitle: '數位顯示精準測量',
      description: '高品質數位血壓計，適合家庭和醫療機構使用。',
      image: '/placeholder-product.svg',
      unit: '台',
      spec: '數位顯示，含臂帶',
      isActive: true,
      isFeatured: true,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      minGroupQty: 1,
      totalSold: 0,
      firmId: firm.id,
    },
  })
  console.log('✅ 商品3建立完成:', product3.name)

  // 建立第三個商品的階梯價格
  await prisma.priceTier.deleteMany({
    where: { productId: product3.id },
  })

  const priceTiers3 = [
    { productId: product3.id, minQty: 1, price: 2450 },
    { productId: product3.id, minQty: 10, price: 2200 },
    { productId: product3.id, minQty: 25, price: 1950 },
    { productId: product3.id, minQty: 50, price: 1700 },
  ]

  for (const tier of priceTiers3) {
    await prisma.priceTier.create({ data: tier })
  }
  console.log('✅ 階梯價格3建立完成')

  // 建立第四個測試商品
  const product4 = await prisma.product.upsert({
    where: { name: '血糖儀' },
    update: {},
    create: {
      name: '血糖儀',
      subtitle: '快速精準測量',
      description: '家用血糖儀，快速測量，適合糖尿病患者日常監測。',
      image: '/placeholder-product.svg',
      unit: '台',
      spec: '含試紙50片',
      isActive: true,
      isFeatured: true,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      minGroupQty: 1,
      totalSold: 0,
      firmId: firm.id,
    },
  })
  console.log('✅ 商品4建立完成:', product4.name)

  // 建立第四個商品的階梯價格
  await prisma.priceTier.deleteMany({
    where: { productId: product4.id },
  })

  const priceTiers4 = [
    { productId: product4.id, minQty: 1, price: 1800 },
    { productId: product4.id, minQty: 20, price: 1600 },
    { productId: product4.id, minQty: 50, price: 1400 },
  ]

  for (const tier of priceTiers4) {
    await prisma.priceTier.create({ data: tier })
  }
  console.log('✅ 階梯價格4建立完成')

  // 建立第五個測試商品
  const product5 = await prisma.product.upsert({
    where: { name: '體溫槍' },
    update: {},
    create: {
      name: '體溫槍',
      subtitle: '紅外線非接觸式測溫',
      description: '紅外線體溫槍，非接觸式測量，適合家庭和醫療機構使用。',
      image: '/placeholder-product.svg',
      unit: '支',
      spec: '紅外線感測',
      isActive: true,
      isFeatured: false,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      minGroupQty: 1,
      totalSold: 0,
      firmId: firm.id,
    },
  })
  console.log('✅ 商品5建立完成:', product5.name)

  // 建立第五個商品的階梯價格
  await prisma.priceTier.deleteMany({
    where: { productId: product5.id },
  })

  const priceTiers5 = [
    { productId: product5.id, minQty: 1, price: 1200 },
    { productId: product5.id, minQty: 15, price: 1050 },
    { productId: product5.id, minQty: 30, price: 900 },
  ]

  for (const tier of priceTiers5) {
    await prisma.priceTier.create({ data: tier })
  }
  console.log('✅ 階梯價格5建立完成')

  console.log('\n🎉 測試資料播種完成！')
  console.log('\n📋 商品資訊：')
  console.log('- 醫療口罩 (ID: ' + product.id + ')')
  console.log('  - 1+ 盒: $200')
  console.log('  - 50+ 盒: $180')
  console.log('  - 100+ 盒: $150')
  console.log('  - 200+ 盒: $120')
  console.log('\n- 酒精乾洗手 (ID: ' + product2.id + ')')
  console.log('  - 1+ 瓶: $280')
  console.log('  - 30+ 瓶: $250')
  console.log('  - 60+ 瓶: $220')
  console.log('\n- 血壓計 (ID: ' + product3.id + ')')
  console.log('  - 1+ 台: $2450')
  console.log('  - 10+ 台: $2200')
  console.log('  - 25+ 台: $1950')
  console.log('  - 50+ 台: $1700')
  console.log('\n- 血糖儀 (ID: ' + product4.id + ')')
  console.log('  - 1+ 台: $1800')
  console.log('  - 20+ 台: $1600')
  console.log('  - 50+ 台: $1400')
  console.log('\n- 體溫槍 (ID: ' + product5.id + ')')
  console.log('  - 1+ 支: $1200')
  console.log('  - 15+ 支: $1050')
  console.log('  - 30+ 支: $900')

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('錯誤:', e)
    process.exit(1)
  })
