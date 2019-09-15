
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory, fileAsString } from './util/walk';
import normalizeHtml from './util/normalizeVueHtml';
import { StudyNode } from './studyNodesTree';
import { notEqual } from 'assert';

const TO_REPLACE = new Set([
    /<link href=.+ rel=preload as=style>/g, 
    /<link href=.+ rel=preload as=script>/g]
    );

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
    const mapping = new Map<string, string>();
    const sources = await walkDirectory(path.join(context.extensionPath, "media", "web"));

    let html = "";
    for (const s of sources) {
        if (s.endsWith("index.html")) {
            html = await fileAsString(s);
        } else {
            mapping.set(s.split("web")[1],  vscode.Uri.file(s).with({ scheme: 'vscode-resource' }).toString());
        }
    }
    console.log(node.filePath);
    panel.webview.html = normalizeHtml(html, TO_REPLACE, mapping);
    panel.webview.onDidReceiveMessage(message => {
        switch(message.command) {
            case 'ready': {
                panel.webview.postMessage({ command: 'study_note', payload: { path: node.filePath, name: node.label, lastReviewd: new Date() }});
            }
        }
    });
}