
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory, fileAsString } from './util/walk';

export default async function webView(context: vscode.ExtensionContext) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );
    const mapping = new Map<string, vscode.Uri>();
    const sources = await walkDirectory(path.join(context.extensionPath, "web"));

    let html = "";
    for (const s of sources) {
        if (s.endsWith("index.html")) {
            html = await fileAsString(s);
        } else {
            mapping.set(s.split("web")[1],  vscode.Uri.file(s));
        }
    }
    panel.webview.html = [...mapping.entries()].reduce((acc, [k,v]) => acc.replace(k,v) , html);
    console.log(panel.webview.html);
}