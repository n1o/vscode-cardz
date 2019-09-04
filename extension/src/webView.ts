
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory, fileAsString } from './util/walk';

export default async function webView(context: vscode.ExtensionContext) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            localResourceRoots: [vscode.Uri.file(context.extensionPath)],
            enableScripts: true
        }
    );
    const sources = await walkDirectory(path.join(context.extensionPath, "web"));

    const resources: vscode.Uri[] = [];
    for (const p of sources){
        if (p.endsWith("index.html")) {

            const html = await fileAsString(p);
            console.log(html);
            panel.webview.html = html;
        } else {
            resources.push(vscode.Uri.file(p).with({ scheme: 'vscode-resource'} ));            
        }
    }
}


function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
  }