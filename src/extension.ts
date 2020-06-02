import * as vscode from 'vscode';
import { AnkiDeckService } from './service/deckService';
import { sep } from 'path';
import { existsSync } from 'fs';
import { mkdirSync } from 'fs';
import { CardsService } from './service/CardInstance';
import { CardsController } from './controller/cardsController';
import { defaultCipherList } from 'constants';

export async function activate(context: vscode.ExtensionContext) {
	const rootFolder = vscode.workspace.workspaceFolders![0].uri.path;
	const cardsFolder = ".cards";

	const cardsPath = [rootFolder, ".cards"].join(sep);
	const exists = existsSync(cardsPath);
	if(!exists) {
		mkdirSync(cardsPath);
	}

	const ankiHost: string | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.ankiHost");

	const deckService  = new AnkiDeckService(ankiHost);
	const cardsService = new CardsService(rootFolder, cardsFolder)

	const cardsController = new CardsController(deckService, cardsService, rootFolder, cardsPath);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.newCard', () => cardsController.newNote()),
		vscode.commands.registerCommand('studyNotes.cardCoverage', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				cardsController.coverage(editor);
			} else {
				vscode.window.showErrorMessage("Select an card first");
			}
		}),
	);

	vscode.workspace.onDidSaveTextDocument(doc => {
		if(doc.uri.fsPath.startsWith(cardsPath)) {
			cardsController.updateNote(doc);
		}
	});
	
}

// this method is called when your extension is deactivated
export function deactivate() {}