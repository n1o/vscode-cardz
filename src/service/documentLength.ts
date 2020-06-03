import { sanitizeText, removeBlanks } from "../util/sanitizer";

export type DocumentInfo = {
  documentName: string;
  documentLength: number;
  documentValid: boolean;
  previousValidDocumentText: string;
};

export type DocumentEntry = {
  text: string;
  length: number;
};

export interface DocumentCache {
  getDocument(documentName: string): DocumentEntry | undefined;
  updateDocument(documentName: string, entry: DocumentEntry): void;
}

export class DocumentChecker {
  constructor(
    public readonly DocumentMaxLength: number,
    private readonly documentCache: DocumentCache
  ) {}

  public checkDocument(documentName: string, text: string): DocumentInfo {
    const sanitized = sanitizeText(text);
    const previousEntry = this.documentCache.getDocument(documentName);

    const words = removeBlanks(sanitized.split(" "));
    if (words.length > this.DocumentMaxLength) {
        const previousValidDocumentText = previousEntry?.text || text;
      return {
        documentLength: words.length,
        documentName: documentName,
        documentValid: false,
        previousValidDocumentText
      }
    } else {
      const entry: DocumentEntry = { text, length: words.length };
      this.documentCache.updateDocument(documentName, entry);

      return {
        documentLength: entry.length,
        documentName: documentName,
        documentValid: true,
        previousValidDocumentText: text,
      };
    }
  }
}