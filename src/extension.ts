// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StudyNotesTreeProvider } from './studyNodesTree';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("Something");
	const studyNoteProvider = new StudyNotesTreeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider('studyNotes', studyNoteProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
