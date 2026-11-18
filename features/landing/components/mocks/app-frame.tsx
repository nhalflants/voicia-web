import { cn } from "@/lib/utils"

// A plain panel around a mock of the dashboard
function AppFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-full overflow-hidden rounded-xl bg-background text-left shadow-2xl ring-1 shadow-black/10 ring-foreground/10",
        className
      )}
    >
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

export { AppFrame }
