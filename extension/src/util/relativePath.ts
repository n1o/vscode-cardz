import { workspace } from "vscode";

export default function getRelativePath(path: string): string {
    const rootPath = workspace.workspaceFolders![0].uri.path;
	return path.replace(rootPath, "");
}