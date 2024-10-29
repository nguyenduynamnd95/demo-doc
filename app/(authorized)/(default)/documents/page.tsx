import { getDocuments, getDocumentVersions } from "@/services/server/document";
import dynamic from "next/dynamic";

const DocumentCard = dynamic(() => import("@/app/(authorized)/(default)/documents/DocumentCard"), { ssr: false, })

export default async function Documents() {
	const documents = await getDocuments()
	const docIds = documents.records.map(rec => rec.id)
	const versions = await getDocumentVersions(docIds)
	const docsWithFileUrl = documents.records.map(doc => {
		const docVersions = versions.records.filter(ver => ver.documentId === doc.id)
		const latestVersion = docVersions.find(ver => ver)
		const fileKey = latestVersion?.file?.find(i => i)?.fileKey
		return {
			...doc,
			updatedAt: latestVersion?.updatedAt,
			versions: docVersions,
			latestVersion,
			fileUrl: `/api/file/${fileKey}`,
		}
	})

	return <div className="flex flex-col items-center lg:p-5">
		{docsWithFileUrl.map(doc => (
			<DocumentCard key={doc.id} metadata={doc} fileUrl={doc.fileUrl} readUrl={`/docviewer/${doc.latestVersion?.id}`}
			              versions={doc.versions}/>
		))}
	</div>
}
