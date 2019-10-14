import { workspace } from "vscode";
import { basename, dirname } from "path";

export function getRelativePath(path: string): string {
    const rootPath = workspace.workspaceFolders![0].uri.path;
	return path.replace(rootPath, "");
}

export function isFlashCard(fileName: string): boolean {
	const p = basename(dirname(fileName));
	return p.endsWith(".flashCards");
}