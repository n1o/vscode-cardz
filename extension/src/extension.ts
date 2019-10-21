import * as vscode from 'vscode';
import { StudyNotesTreeProvider, StudyNodeTreeItem } from './studyNodesTree';
import webView from './webView';
import newNote from './commands/newNote';
import { AnkiDeckService } from './service/deckService';
import { CardService } from './service/cardService';
import NotesService from './service/studyNotesService';
import { coverageAction } from './commands/coverage';
import { createConnection } from 'typeorm';
import { promises } from 'fs';
import { StudyNoteEntity } from './entity/StudyNoteEntity';
import { ReviewService } from './service/reviewService';
import { startReview } from './commands/review';
import { FlashCardEntity } from './entity/FlashCardEntity';
import { updateNote } from './commands/updateNote';
import FsWatcher from './service/fsWatcher';
import { join } from 'path';

export async function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.workspaceFolders![0].uri.path;

	await initTypeOrm(rootPath);

	const ankiHost: string | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.ankiHost");

	const ankiService  = new AnkiDeckService(ankiHost);
	const decksService = new CardService();
	const notesService = new NotesService(ankiService, decksService);
	const reviewService = new ReviewService();

	const exclusionPattern: string[] | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.exclusionPattern");
	const studyNotesExclusion = exclusionPattern!.map(patter => new RegExp(patter, "g"));

	const studyNoteProvider = new StudyNotesTreeProvider(rootPath , studyNotesExclusion);
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.stats', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				webView(context, reviewService, editor.document.uri );
			}
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(note))),
		vscode.commands.registerCommand('studyNotes.info', (note: StudyNodeTreeItem) => webView(context, reviewService, vscode.Uri.parse(note.filePath) )),
		vscode.commands.registerCommand('studyNotes.newCard', () => newNote(context, ankiService, decksService)),
		vscode.commands.registerCommand('studyNotes.cardCoverage', () => coverageAction(context)),
		vscode.commands.registerCommand('studyNote.review', () => startReview(context, reviewService))
	);

	vscode.workspace.onDidSaveTextDocument(doc => updateNote(context, doc, notesService));
	const watcher = new FsWatcher("**/*.md");
	
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function initTypeOrm(sqlLitepath: string) {
	try {
		if(!(await promises.stat(sqlLitepath)).isDirectory()) {
			throw new Error("Cannot create local storage");
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			(await promises.mkdir(sqlLitepath));
		}
	}
	return createConnection({
		type: "sqljs",
		synchronize: true,
		autoSave: true,
		location: join(sqlLitepath, '.cardz.sqllite'),
		entities: [StudyNoteEntity, FlashCardEntity]
	});
}