
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory } from './util/walk';
import { StudyNode } from './studyNodesTree';
import { render } from 'mustache';


const htmlTemplate = `<!DOCTYPE html><html lang=en>
<head>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width,initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource: https:; style-src vscode-resource: https:;"/>
    {{#css}}
    <link rel="stylesheet" type="text/css" href="{{src}}">
    {{/css}}
    </head>
    <body>
        <noscript>
            <strong>We're sorry but client doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
        </noscript>
        <div id=app></div>
        {{#scripts}}
        <script src="{{src}}"></script>
        {{/scripts}}
    </body>
</html>`;

export default async function webView(context: vscode.ExtensionContext, node: { path: string, name: string }) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
    );

    const sources = await walkDirectory(path.join(context.extensionPath, "media", "web"));

    const files = sources
        .filter(s => !s.endsWith("index.html"))
        .map(s => { return { src:  vscode.Uri.file(s).with({ scheme: 'vscode-resource' }).toString() }; });

    const args = {
        css: files.filter(f => f.src.endsWith(".css")),
        scripts: files.filter(f => f.src.endsWith('.js'))
    };
  
    panel.webview.onDidReceiveMessage(message => {
        switch(message.command) {
            case 'ready': {
                const payload = { ...node, lastReview: new Date() };
                panel.webview.postMessage({ command: 'study_note', payload });
            }
        }
    });

    panel.webview.html = render(htmlTemplate, args);
}