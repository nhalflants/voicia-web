import { auth } from "@clerk/nextjs/server"

import { isUuid } from "@/features/calls/filters"
import { getCallRecordingUrl } from "@/features/calls/repository"
import { ApiError } from "@/lib/api"

// Plays and downloads a call's recording without exposing where it's stored:
// every request trades the call for a fresh short-lived signed URL, so the
// player's src never changes even though the signed URL does
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) return new Response(null, { status: 401 })
  if (!isUuid(id)) return new Response(null, { status: 404 })

  let url: string
  try {
    // The API scopes the call to the caller's organization
    url = await getCallRecordingUrl(id)
  } catch (error) {
    if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
      return new Response(null, { status: error.status })
    }
    console.error("Recording lookup failed", error)
    return new Response(null, { status: 502 })
  }

  if (!new URL(request.url).searchParams.has("download")) {
    return new Response(null, {
      status: 302,
      headers: { Location: url, "Cache-Control": "no-store" },
    })
  }

  // Browsers ignore <a download> across origins, so the file is streamed back
  // under a name of its own
  const file = await fetch(url)
  if (!file.ok || !file.body) {
    console.error("Recording download failed", file.status)
    return new Response(null, { status: 502 })
  }
  const contentType = file.headers.get("Content-Type") ?? "audio/wav"
  const extension = contentType.includes("mpeg") ? "mp3" : "wav"
  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="call-${id}.${extension}"`,
    "Cache-Control": "no-store",
  })
  const length = file.headers.get("Content-Length")
  if (length) headers.set("Content-Length", length)
  return new Response(file.body, { headers })
}
