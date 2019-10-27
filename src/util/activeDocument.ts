import { window, TextDocument } from "vscode";


export default function getActiveDocument(errorMessage? :string): TextDocument | undefined {
    const editor = window.activeTextEditor;
    if (!editor && errorMessage) {
        window.showErrorMessage(errorMessage);
        return;
    }
    const document = editor!.document;
    return document;
}