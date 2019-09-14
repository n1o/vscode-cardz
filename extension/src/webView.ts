
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory, fileAsString } from './util/walk';

export default async function webView(context: vscode.ExtensionContext) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
    );
    const mapping = new Map<string, vscode.Uri>();
    const sources = await walkDirectory(path.join(context.extensionPath, "media", "web"));

    let html = "";
    for (const s of sources) {
        if (s.endsWith("index.html")) {
            html = await fileAsString(s);
        } else {
            mapping.set(s.split("web")[1],  vscode.Uri.file(s).with({ scheme: 'vscode-resource' }));
        }
    }

    panel.webview.html = html;
    // panel.webview.html = [...mapping.entries()].reduce((acc, [k,v]) => { 
    //     console.log(k,v);
    //     console.log(acc.includes(k));
    //     console.log("\n");
    //     const replaced = acc.replace(k, `"${v.toString()}"`);
    //     console.log(replaced);
    //     console.log("\n\n\n\n\n\n");
    //     return replaced;
    // } , html);
    // console.log(panel.webview.html);
}