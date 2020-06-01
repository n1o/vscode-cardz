import { TextDocument, ExtensionContext, window } from "vscode";
import NotesService from "../service/studyNotesService";
import { isFlashCard } from "../util/pathUtils";
import { CardService } from "../service/cardService";

export async function updateNote(context: ExtensionContext, doc: TextDocument, notesService: NotesService) {
    if (isFlashCard(doc.fileName)) {
        const absolutePath = doc.uri.path;
        const text = doc.getText();
        
        if (text) {
            const id = CardService.cardID(text);
            if (!id)  {
                window.showErrorMessage("Failed to extract ID");
                return;
            }
            window.showInformationMessage("Updating Card");
            notesService.updateNote(id, text, absolutePath);
            window.showInformationMessage("Card Updated");
        }
    }
}