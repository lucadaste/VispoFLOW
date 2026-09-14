import { SharedDocumentViewer } from "@/components/shared-document-viewer"

export const metadata = { title: "Shared Filing — VispoFLOW" }

export default async function SharedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SharedDocumentViewer documentId={id} />
}
