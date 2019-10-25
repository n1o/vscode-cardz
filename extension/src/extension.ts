import * as vscode from 'vscode';
import webView from './webView';
import newNote from './commands/newNote';
import { AnkiDeckService } from './service/deckService';
import { CardService } from './service/cardService';
import NotesService from './service/studyNotesService';
import { coverageAction } from './commands/coverage';
import { ReviewService } from './service/reviewService';
import { startReview } from './commands/review';
import { updateNote } from './commands/updateNote';
import FsWatcher from './service/fsWatcher';
import initTypeOrm from './service/initOrm';
import { StudyItemsProvider, StudyItem } from './views/newTreeView';
import { getCustomRepository } from 'typeorm';
import { FlashCardRepository } from './repository/FlashCardRepository';

export async function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.workspaceFolders![0].uri.path;

	await initTypeOrm(rootPath);

	const ankiHost: string | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.ankiHost");

	const deckService  = new AnkiDeckService(ankiHost);
	const cardService = new CardService();
	const notesService = new NotesService(deckService);
	const reviewService = new ReviewService();
	const flashCardRepo = getCustomRepository(FlashCardRepository);

	const exclusionPattern: string[] | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.exclusionPattern");
	const studyNotesExclusion = exclusionPattern!.map(patter => new RegExp(patter, "g"));

	const studyNoteProvider = new StudyItemsProvider(rootPath , studyNotesExclusion);
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.stats', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				webView(context, reviewService, editor.document.uri);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(note))),
		vscode.commands.registerCommand('studyNotes.info', (note: StudyItem) => webView(context, reviewService, vscode.Uri.parse(note.location))),
		vscode.commands.registerCommand('studyNotes.newCard', () => newNote(context, deckService, cardService, flashCardRepo)),
		vscode.commands.registerCommand('studyNotes.cardCoverage', () => coverageAction(context)),
		vscode.commands.registerCommand('studyNotes.review', () => startReview(context, reviewService))
	);

	vscode.workspace.onDidSaveTextDocument(doc => updateNote(context, doc, notesService));
	const watcher = new FsWatcher("**/*.md");
	
}

// this method is called when your extension is deactivated
export function deactivate() {}