import { getDocumentVersion } from "@/services/server/document";
import dynamic from "next/dynamic";


const DocumentViewer = dynamic(() => import("@/app/(authorized)/docviewer/DocumentViewer"), { ssr: false, })


export default async function DocumentReader({ params }: { params: { docVerId: number } }) {
	const docVer = await getDocumentVersion(params.docVerId)
	return <>
		<DocumentViewer docVerId={params.docVerId} fileUrl={`/api/file/${docVer.file?.find(i => i)?.fileKey}`}/>
	</>
}
