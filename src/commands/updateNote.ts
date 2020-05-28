import { TextDocument, ExtensionContext, window } from "vscode";
import NotesService from "../service/studyNotesService";
import { isFlashCard } from "../util/pathUtils";

const ID_REGEX = /ID: (.*)\n/g;

export async function updateNote(context: ExtensionContext, doc: TextDocument, notesService: NotesService) {
    if (isFlashCard(doc.fileName)) {
        const absolutePath = doc.uri.path;
        const text = doc.getText();
        
        if (text) {
            const res = ID_REGEX.exec(text);
            if (!res)  {
                window.showErrorMessage("Failed to extract ID");
                return;
            }
            const id = res![1];
            window.showInformationMessage("Updating Card");
            notesService.updateNote(id, text, absolutePath);
            window.showInformationMessage("Card Updated");
        }
    }
}