// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sep } from 'path';
import { StudyNotesTreeProvider, StudyNode } from './studyNodesTree';
import webView from './webView';
import newNote from './newNote';
import { AnkiDeckService } from './service/deckService';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const studyNoteProvider = new StudyNotesTreeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.info', (note: StudyNode) => webView(context, { name: note.label!, path: note.filePath }))
	);

	vscode.commands.registerCommand('studyNotes.openFile', (note: string) => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(note)));
	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.stats', () => { 
			const editor = vscode.window.activeTextEditor;
			if(editor) {
				webView(context, { name: editor.document.fileName.split(sep).pop()!, path: editor.document.fileName });
			}
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('studyNotes.newCard', () => newNote(context, new AnkiDeckService()))
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
