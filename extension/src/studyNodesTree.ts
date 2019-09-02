import * as vscode from 'vscode';
import { promises } from 'fs';
import * as path from 'path';

export class StudyNode extends vscode.TreeItem {

	constructor(
		public readonly filePath: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(filePath.split(path.sep).pop() || "", collapsibleState);
		if (!filePath.split(path.sep).pop()) {
			throw new Error("Failed to locate file label");
		}
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return `${this.filePath}`;
	}

	contextValue = 'studyNote';
}

export class StudyNotesTreeProvider implements vscode.TreeDataProvider<StudyNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<StudyNode | undefined> = new vscode.EventEmitter<StudyNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<StudyNode | undefined> = this._onDidChangeTreeData.event;

	constructor(
		private readonly workSpaceRoot: string
	) {
		if (!workSpaceRoot) {
			throw new Error("Invalid directory");
		}
	}
	private async getStudyNote(localPaht: string): Promise<StudyNode> {
		if (!(await promises.stat(localPaht)).isDirectory()) {
			return new StudyNode(
				localPaht, 
				vscode.TreeItemCollapsibleState.None,
				{
					command: "mdDependencies.openFile",
					title: 'Open File',
					arguments: [localPaht]
				}
				);
		} else {
			return new StudyNode(localPaht, vscode.TreeItemCollapsibleState.Collapsed);
		}
		
	}

	private async validPath(localPath: string): Promise<boolean> {
		return !(localPath.startsWith(".") && (await promises.stat(localPath)).isDirectory());
	}

	private async listChildren(localPath: string): Promise<string[]> {
		const paths = await promises.readdir(localPath);

		const children: string[] = [];
		for (const p of paths) {
			// const valid = await this.validPath(p);
			// if (valid) {jj
				children.push(`${localPath}${path.sep}${p}`);
			// }
		}
		return children;
	}

	async getChildren(element?: StudyNode): Promise<StudyNode[]> {
		const children: string[] = [];

		if (element) {
			const data = await this.listChildren(element.filePath);
			children.push(...data);
		} else {
			const data = await this.listChildren(this.workSpaceRoot);
			children.push(...data);
		}
		
		const note: StudyNode[] = [];

		for (const filePath of children) {
			note.push(await this.getStudyNote(filePath));
		}
		return note;
	}

	getTreeItem(element: StudyNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}