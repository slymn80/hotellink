import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

export default async function HotelLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string; hotelId: string }
}) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/login`)

  const access = await db.hotelEmployer.findFirst({
    where: { userId: session.user.id, hotelId: params.hotelId },
  })

  if (!access) redirect(`/${params.locale}/hotel`)

  return <>{children}</>
}
