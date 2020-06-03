import { DocumentCache, DocumentEntry } from "../service/documentLength";
import { Memento } from "vscode";

export class VsCodeDocumentCache implements DocumentCache {
    constructor(
        private readonly storage: Memento
    ){}
    
    getDocument(documentName: string): DocumentEntry | undefined {
        const entry = this.storage.get<string>(documentName);
        if(entry) {
            return JSON.parse(entry)
        }
    }
    updateDocument(documentName: string, entry: DocumentEntry): void {
       this.storage.update(documentName, JSON.stringify(entry));
    };
}