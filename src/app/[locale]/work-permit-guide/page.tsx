import { redirect } from 'next/navigation'

export default function WorkPermitGuidePage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/guide`)
}
