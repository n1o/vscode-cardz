
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

export default async function webView(context: vscode.ExtensionContext, node: StudyNode) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
    );
    // const mapping = new Map<string, string>();
    const files = [];
    const sources = await walkDirectory(path.join(context.extensionPath, "media", "web"));

    // let html = "";
    for (const s of sources) {
        if (!s.endsWith("index.html")) {
            files.push({ src:  vscode.Uri.file(s).with({ scheme: 'vscode-resource' }).toString() });
        }
    }

    const args = {
        css: files.filter(f => f.src.endsWith(".css")),
        scripts: files.filter(f => f.src.endsWith('.js'))
    };
  
    panel.webview.onDidReceiveMessage(message => {
        switch(message.command) {
            case 'ready': {
                const payload = { path: node.filePath, name: node.label, lastReview: new Date() };
                console.log(payload);
                panel.webview.postMessage({ command: 'study_note', payload });
            }
        }
    });

    panel.webview.html = render(htmlTemplate, args);
}