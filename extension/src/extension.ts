// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sep, dirname, basename } from 'path';
import { StudyNotesTreeProvider, StudyNode } from './studyNodesTree';
import webView from './webView';
import newNote from './commands/newNote';
import { AnkiDeckService } from './service/deckService';
import { CardService } from './service/cardService';
import NotesService from './commands/updateNote';

export async function activate(context: vscode.ExtensionContext) {
	const ankiService  = new AnkiDeckService(vscode.workspace.rootPath!);
	const decksService = new CardService();
	const notesService = new NotesService(context, ankiService, decksService);
	const studyNotesExclusion = [
		/\.vscode$/g,
		/\.idea$/g,
		/\.DS_Store$/g,
		/\.metals$/g,
		/\.assets$/g,
		/^(.+)\.flashCards$/g,
		/^resources$/g
	];
	const studyNoteProvider = new StudyNotesTreeProvider(vscode.workspace.rootPath! , studyNotesExclusion);
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.info', (note: StudyNode) => webView(context, { name: note.label!, path: note.filePath }))
	);

	vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(note)));

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.stats', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				webView(context, { name: editor.document.fileName.split(sep).pop()!, path: editor.document.fileName });
			}
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.newCard', () => newNote(context, ankiService, decksService))
	);
	vscode.workspace.onDidSaveTextDocument(doc => {

		const fileName = doc.fileName;
		if(isFlashCard(fileName)){
			const text = getActiveWindowText();
			if(text){
				vscode.window.showInformationMessage("Updating Card");
				const id = context.workspaceState.get<string>(fileName);
				notesService.updateNote(id!, text, vscode.Uri.file(fileName));
				vscode.window.showInformationMessage("Card Updated");
			}
		}
    });
}

function getActiveWindowText(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if(editor) {
		return editor.document.getText();
	} 
	console.error("No active text editor selected");
}

function isFlashCard(fileName: string): boolean {
	const p = basename(dirname(fileName));
	return p.endsWith(".flashCards");
}

// this method is called when your extension is deactivated
export function deactivate() {}
