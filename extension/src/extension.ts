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
import { coverageAction } from './commands/coverage';
import { createConnection } from 'typeorm';
import { promises } from 'fs';
import { StudyNoteEntity } from './entity/StudyNote';
import { ReviewService } from './service/reviewService';
import getActiveDocument from './util/activeDocument';
import { startReview } from './commands/review';

export async function activate(context: vscode.ExtensionContext) {
	const globalStoragePath = context.globalStoragePath;

	try {
		if(!(await promises.stat(globalStoragePath)).isDirectory()) {
			throw new Error("Cannot create local storage");
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			(await promises.mkdir(globalStoragePath));
		}
	}
	await createConnection({
		type: "sqljs",
		synchronize: true,
		autoSave: true,
		location: [globalStoragePath, 'cardz.sqllite'].join(sep),
		entities: [StudyNoteEntity]
	});

	const ankiService  = new AnkiDeckService(vscode.workspace.rootPath!);
	const decksService = new CardService();
	const notesService = new NotesService(context, ankiService, decksService);
	const reviewService = new ReviewService();

	const studyNotesExclusion = [
		/\.vscode$/g,
		/\.idea$/g,
		/\.DS_Store$/g,
		/\.metals$/g,
		/\.assets$/g,
		/^(.+)\.flashCards$/g,
		/^resources$/g
	];

	const rootPath = vscode.workspace.workspaceFolders![0].uri.path;
	const studyNoteProvider = new StudyNotesTreeProvider(rootPath , studyNotesExclusion);
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.info', (note: StudyNode) => webView(context, { name: note.label!, path: relativePath(note.filePath, rootPath ) }))
	);

	vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(note)));

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.stats', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				webView(context, { name: editor.document.fileName.split(sep).pop()!, path: relativePath(editor.document.fileName, rootPath) });
			}
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.newCard', () => newNote(context, ankiService, decksService)),
		vscode.commands.registerCommand('studyNotes.cardCoverage', () => coverageAction(context)),
		vscode.commands.registerCommand('studyNote.review', () => startReview(context, reviewService))
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

function relativePath(path: string, roothPath: string): string {
	return path.replace(roothPath, "");
}