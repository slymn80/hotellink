import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-600 flex items-center justify-center shadow-glow-brand">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading HotelLink...</p>
      </div>
    </div>
  )
}
