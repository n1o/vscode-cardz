import * as vscode from 'vscode';
import webView from './views/webView';
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
import { join, sep } from 'path';
import { CardInfoService } from './service/cardInfoService';
import { existsSync } from 'fs';
import { mkdirSync } from 'fs';
import { CardsService } from './entity/CardInstance';
import { CardsController } from './controller/notesController';

function tailwindCss(context: vscode.ExtensionContext): string {
	return 	vscode.Uri.file(join(context.extensionPath, 'media', 'css', 'tailwind.min.css')).with({ scheme: 'vscode-resource'}).toString();
}

export async function activate(context: vscode.ExtensionContext) {
	const rootFolder = vscode.workspace.workspaceFolders![0].uri.path;
	const cardsFolder = ".cards";

	const cardsPath = [rootFolder, ".cards"].join(sep);
	const exists = existsSync(cardsPath);
	if(!exists) {
		mkdirSync(cardsPath);
	}

	await initTypeOrm(rootFolder);

	const ankiHost: string | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.ankiHost");

	const deckService  = new AnkiDeckService(ankiHost);
	const cardsService = new CardsService(rootFolder, cardsFolder)
	const notesService = new NotesService(deckService);
	const reviewService = new ReviewService();
	const cardInfoService = new CardInfoService(tailwindCss(context));

	const cardsController = new CardsController(context, deckService, cardsService);

	const exclusionPattern: string[] | undefined = vscode.workspace.getConfiguration().get("conf.studyNotes.exclusionPattern");
	const studyNotesExclusion = exclusionPattern!.map(patter => new RegExp(patter, "g"));

	const studyNoteProvider = new StudyItemsProvider(rootFolder , studyNotesExclusion);
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.file(note))),
		vscode.commands.registerCommand('studyNotes.info', (note?: StudyItem) => {
			if(note) {
				webView(vscode.Uri.file(note.location), context, reviewService, cardInfoService);
			} else {
				const editor = vscode.window.activeTextEditor;
				if(editor) {
					webView(editor.document.uri, context, reviewService, cardInfoService);
				} else {
					throw new Error("Select a note to retrieve info");
				}
			}
		}),
		vscode.commands.registerCommand('studyNotes.newCard', () => cardsController.newNote)),
		vscode.commands.registerCommand('studyNotes.cardCoverage', () => coverageAction(context)),
		vscode.commands.registerCommand('studyNotes.review', async (item? :StudyItem) => { 
			if(item) {
				await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(item.location));
			}
			startReview(context, reviewService);
		})
	);

	vscode.workspace.onDidSaveTextDocument(doc => updateNote(context, doc, notesService));
	const watcher = new FsWatcher("**/*.md");
	
}

// this method is called when your extension is deactivated
export function deactivate() {}