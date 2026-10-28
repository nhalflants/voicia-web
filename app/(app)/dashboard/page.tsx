import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export default async function DashboardPage() {
  await auth.protect()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nothing here yet</EmptyTitle>
          <EmptyDescription>
            Your workspace is ready. Content will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <UserButton />
    </div>
  )
}
