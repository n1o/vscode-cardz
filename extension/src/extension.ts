// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sep, basename, join } from 'path';
import { StudyNotesTreeProvider, StudyNodeTreeItem } from './studyNodesTree';
import webView from './webView';
import newNote from './commands/newNote';
import { AnkiDeckService } from './service/deckService';
import { CardService } from './service/cardService';
import NotesService from './service/studyNotesService';
import { coverageAction } from './commands/coverage';
import { createConnection, getRepository, Repository } from 'typeorm';
import { promises } from 'fs';
import { StudyNoteEntity } from './entity/StudyNoteEntity';
import { ReviewService } from './service/reviewService';
import { startReview } from './commands/review';
import { FlashCardEntity } from './entity/FlashCardEntity';
import { updateNote } from './commands/updateNote';
import moment = require('moment');
import { flashCardsDirectory, walkDirectory } from './util/walk';
import { getRelativePath } from './util/pathUtils';

export async function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.workspaceFolders![0].uri.path;

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
		location: join(rootPath, '.cardz.sqllite'),
		entities: [StudyNoteEntity, FlashCardEntity]
	});

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
	const wather = new FsWatcher("**/*.md");
	
}

// this method is called when your extension is deactivated
export function deactivate() {}


class FsWatcher {
	readonly watcher: vscode.FileSystemWatcher;
	readonly flashCardRepo: Repository<FlashCardEntity>;
	readonly reviewRepo: Repository<StudyNoteEntity>;

	buffer: [Date, string][];
	constructor(pattern: string){
		this.buffer = [];
		this.watcher = vscode.workspace.createFileSystemWatcher(pattern, false, false, false);
		this.watcher.onDidCreate(async (e) => {
			console.log('Create', e.path);
			this.buffer.push([new Date(), e.path]);
		});
		this.watcher.onDidDelete(async (e) =>  {
			
			console.log('Delete', e.path);
			while(this.buffer.length > 0) {
				const date = new Date();
				const head = this.buffer.pop();
				if (head && moment(date).diff(head[0], "ms") < 10 && (await this.hasFlashCards(e.path))) {
					this.moveFlashCards(e.path, head[1]);
				}
			}
		});

		this.flashCardRepo = getRepository(FlashCardEntity);
	}

	async updateFlashCardEntity(oldPath: string, newPath: string) {
		const oldRelativePath = getRelativePath(oldPath);
		const newRelativePath = getRelativePath(newPath);
		const res = await this.flashCardRepo.update({ relativePath: oldRelativePath }, { relativePath: newRelativePath });
		return res;
	}

	async updateReviewEntity(oldPath: string, newPath: string) {
		const oldRelativePath = getRelativePath(oldPath);
		const newRelativePath = getRelativePath(newPath);
		const res = await this.reviewRepo.update({ relativePath: oldRelativePath }, { relativePath: newRelativePath});
		return res;
	}

	async hasFlashCards(oldPath: string): Promise<boolean> {
		const stat = await promises.stat(flashCardsDirectory(oldPath));
		try { 
			return stat.isDirectory();
		} catch (e) {
			return false;
		}
	}

	async moveFlashCards(oldPath: string, newPath: string) {
		const oldFlashCardPath = flashCardsDirectory(oldPath);
		try {
			const isDir = (await promises.stat(oldFlashCardPath)).isDirectory();
			if(isDir) {
				const newFlashCardsPath = flashCardsDirectory(newPath);
				await promises.mkdir(newFlashCardsPath);
				const oldCards = await walkDirectory(oldFlashCardPath);
				for (const oldCardPath of oldCards) {
					const newCardPath = join(newFlashCardsPath, basename(oldCardPath));
					await this.updateFlashCardEntity(oldCardPath, newCardPath);
					await promises.copyFile(oldCardPath, newCardPath );
					await promises.unlink(oldCardPath);
				}
				await this.updateReviewEntity(oldPath, newPath);
				await promises.rmdir(oldFlashCardPath);
			}
		} catch (e){
			console.log(e);
		}
	}
}