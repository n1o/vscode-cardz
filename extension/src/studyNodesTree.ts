import * as vscode from 'vscode';
import { promises } from 'fs';
import * as path from 'path';


export class StudyNodeTreeItem extends vscode.TreeItem {

	constructor(
		public readonly filePath: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(filePath.split(path.sep).pop() || "", collapsibleState);
		if (!filePath.split(path.sep).pop()) {
			throw new Error("Failed to locate file label");
		}

		if(command) {
			this.contextValue = 'studyNote';
		} else {
			this.contextValue = 'studyNoteParent';
		}
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return `${this.filePath}`;
	}
}

export class StudyNotesTreeProvider implements vscode.TreeDataProvider<StudyNodeTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<StudyNodeTreeItem | undefined> = new vscode.EventEmitter<StudyNodeTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<StudyNodeTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor(
		private readonly workSpaceRoot: string,
		private readonly configExlusions: RegExp[]
	) { }
	private async getStudyNote(localPath: string): Promise<StudyNodeTreeItem> {
		if (!(await promises.stat(localPath)).isDirectory()) {
			return new StudyNodeTreeItem(
				localPath, 
				vscode.TreeItemCollapsibleState.None,
				{
					command: "studyNotes.openFile",
					title: 'Open File',
					arguments: [localPath]
				}
				);
		} else {
			return new StudyNodeTreeItem(localPath, vscode.TreeItemCollapsibleState.Collapsed);
		}
		
	}

	private validPath(localPath: string): boolean {
		for (const e of this.configExlusions) {
			if (localPath.match(e)) {
				return false;
			}
		}
		return true;
	}

	private async listChildren(localPath: string): Promise<string[]> {
		const paths = await promises.readdir(localPath);

		return paths.filter(p => this.validPath(p)).map(p => [localPath, p].join(path.sep));
	}

	async getChildren(element?: StudyNodeTreeItem): Promise<StudyNodeTreeItem[]> {
		const children: string[] = [];

		if (element) {
			const data = await this.listChildren(element.filePath);
			children.push(...data);
		} else {
			const data = await this.listChildren(this.workSpaceRoot);
			children.push(...data);
		}
		return await Promise.all(children.map(filePath => this.getStudyNote(filePath)));
	}

	getTreeItem(element: StudyNodeTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}