import { sep } from "path";

export function resolveLink(documentPath: string, relativeDocumentLink: string) {
    if(relativeDocumentLink.startsWith("http")) {
        return relativeDocumentLink;
    }

    const docPath = documentPath.split(sep);
 
    return _resolveLink(docPath.slice(0, docPath.length - 1), relativeDocumentLink.split(sep));
}

function _resolveLink(documentPath: string[], relativeDocumentLink: string[]): string {
    const linkHead = relativeDocumentLink[0];
    if(linkHead === "..") {
        return _resolveLink(
            documentPath.slice(0, documentPath.length - 1), relativeDocumentLink.slice(1)
      );
    }

    if(linkHead === ".") {
        return [...documentPath, ...relativeDocumentLink.slice(1)].join(sep);
    }

    return [...documentPath, ...relativeDocumentLink].join(sep);
}