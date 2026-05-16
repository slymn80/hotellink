/**
 * verify-test.ts
 *
 * Test için: UI üzerinden girilen tüm otelleri, ajansları ve aday profillerini
 * doğrulanmış olarak işaretle. Doğrulama akışını kaldırmıyor — sadece
 * mevcut veriyi test edilebilir hale getiriyor.
 *
 * Çalıştırma:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/verify-test.ts
 *
 * VEYA package.json'a ekleyip:
 *   npm run verify-test
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('\n🔧  HotelLink — Test Veri Doğrulama Scripti\n')

  // ── 1. Oteller ────────────────────────────────────────────────────────────
  const pendingHotels = await db.hotel.findMany({
    where: { status: { in: ['PENDING_VERIFICATION', 'REJECTED'] } },
    select: { id: true, name: true, slug: true, status: true },
  })

  if (pendingHotels.length === 0) {
    console.log('ℹ️  Bekleyen veya reddedilen otel yok.')
  } else {
    console.log(`🏨  ${pendingHotels.length} otel doğrulanıyor:`)

    for (const hotel of pendingHotels) {
      await db.hotel.update({
        where: { id: hotel.id },
        data: {
          status: 'VERIFIED',
          isVerified: true,
          verifiedAt: new Date(),
        },
      })

      // Mevcut Verification kaydı var mı kontrol et
      const existing = await db.verification.findFirst({
        where: { entityId: hotel.id, type: 'HOTEL' },
      })

      if (!existing) {
        await db.verification.create({
          data: {
            type: 'HOTEL',
            entityId: hotel.id,
            entityType: 'Hotel',
            status: 'APPROVED',
            submittedAt: new Date(),
            reviewedAt: new Date(),
            notes: 'Test amaçlı — verify-test.ts ile otomatik onaylandı',
            documents: [],
          },
        })
      } else if (existing.status !== 'APPROVED') {
        await db.verification.update({
          where: { id: existing.id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            notes: 'Test amaçlı — verify-test.ts ile otomatik onaylandı',
          },
        })
      }

      console.log(`   ✅  ${hotel.name} (${hotel.status} → VERIFIED)`)
    }
  }

  // ── 2. HR Ajansları ───────────────────────────────────────────────────────
  const pendingAgencies = await db.hRAgency.findMany({
    where: { isVerified: false },
    select: { id: true, agencyName: true },
  })

  if (pendingAgencies.length === 0) {
    console.log('\nℹ️  Doğrulanmamış ajans yok.')
  } else {
    console.log(`\n🏢  ${pendingAgencies.length} ajans doğrulanıyor:`)
    for (const agency of pendingAgencies) {
      await db.hRAgency.update({
        where: { id: agency.id },
        data: { isVerified: true },
      })
      console.log(`   ✅  ${agency.agencyName}`)
    }
  }

  // ── 3. Aday Profilleri ────────────────────────────────────────────────────
  const hiddenCandidates = await db.candidateProfile.findMany({
    where: { isPublic: false },
    select: { id: true, firstName: true, lastName: true },
  })

  if (hiddenCandidates.length === 0) {
    console.log('\nℹ️  Gizli aday profili yok (hepsi zaten public).')
  } else {
    console.log(`\n👤  ${hiddenCandidates.length} aday profili public hale getiriliyor:`)
    await db.candidateProfile.updateMany({
      where: { isPublic: false },
      data: { isPublic: true },
    })
    for (const c of hiddenCandidates) {
      console.log(`   ✅  ${c.firstName} ${c.lastName}`)
    }
  }

  // ── 4. Özet ───────────────────────────────────────────────────────────────
  const stats = {
    verifiedHotels: await db.hotel.count({ where: { status: 'VERIFIED' } }),
    totalHotels: await db.hotel.count(),
    verifiedAgencies: await db.hRAgency.count({ where: { isVerified: true } }),
    totalAgencies: await db.hRAgency.count(),
    publicCandidates: await db.candidateProfile.count({ where: { isPublic: true } }),
    totalCandidates: await db.candidateProfile.count(),
    activeJobs: await db.job.count({ where: { status: 'ACTIVE' } }),
    totalJobs: await db.job.count(),
  }

  console.log('\n─────────────────────────────────────────')
  console.log('📊  Güncel Sistem Durumu:')
  console.log(`   Oteller:   ${stats.verifiedHotels} / ${stats.totalHotels} doğrulandı`)
  console.log(`   Ajanslar:  ${stats.verifiedAgencies} / ${stats.totalAgencies} doğrulandı`)
  console.log(`   Adaylar:   ${stats.publicCandidates} / ${stats.totalCandidates} public`)
  console.log(`   İş İlanı:  ${stats.activeJobs} aktif / ${stats.totalJobs} toplam`)
  console.log('─────────────────────────────────────────\n')
  console.log('✨  Tamamlandı! Artık platform üzerinden tüm akışları test edebilirsin.\n')
}

main()
  .catch((e) => {
    console.error('❌  Script hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
