import { TextDocument, ExtensionContext, window } from "vscode";
import NotesService from "../service/studyNotesService";
import { isFlashCard, getRelativePath } from "../util/pathUtils";
import { getRepository } from "typeorm";
import { FlashCardEntity } from "../entity/FlashCardEntity";

export async function updateNote(context: ExtensionContext, doc: TextDocument, notesService: NotesService) {
    if(isFlashCard(doc.fileName)) {
        const absolutePath = doc.uri.path;
        const text = doc.getText();
        const relativePath = getRelativePath(absolutePath);
        if(text) {
            const repo = getRepository(FlashCardEntity);
            const card = await repo.findOne({ where: { relativePath }});
            if(card) {
                window.showInformationMessage("Updating Card");
                notesService.updateNote(card.id, text,absolutePath);
                window.showInformationMessage("Card Updated");
            }
        }
    }
}