import { cn } from "@/lib/utils"

// A plain device outline for the landing mocks; no real phone is drawn
function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/18.5] w-full max-w-[280px] rounded-[2.75rem] border border-border bg-background p-2.5 shadow-2xl shadow-black/10",
        className
      )}
    >
      <div className="absolute top-4 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground/90" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.2rem] bg-muted/40">
        {children}
      </div>
    </div>
  )
}

export { PhoneFrame }
