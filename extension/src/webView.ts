
import * as vscode from 'vscode';
import * as path from 'path';
import { walkDirectory } from './util/walk';
import { render } from 'mustache';
import { StudyNoteEntity } from './entity/StudyNote';
import { getRepository } from 'typeorm';


const htmlTemplate = `<!DOCTYPE html><html lang=en>
<head>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width,initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'unsafe-inline' 'unsafe-eval' vscode-resource:  https:; style-src vscode-resource: https:;"/>
    {{#css}}
    <link rel="stylesheet" type="text/css" href="{{src}}">
    {{/css}}
    </head>
    <body>
        <noscript>
            <strong>We're sorry but client doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
        </noscript>
        <div id=root></div>
        <script unsafe-inline>!function(f){function e(e){for(var r,t,n=e[0],o=e[1],u=e[2],l=0,i=[];l<n.length;l++)t=n[l],Object.prototype.hasOwnProperty.call(c,t)&&c[t]&&i.push(c[t][0]),c[t]=0;for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(f[r]=o[r]);for(s&&s(e);i.length;)i.shift()();return p.push.apply(p,u||[]),a()}function a(){for(var e,r=0;r<p.length;r++){for(var t=p[r],n=!0,o=1;o<t.length;o++){var u=t[o];0!==c[u]&&(n=!1)}n&&(p.splice(r--,1),e=l(l.s=t[0]))}return e}var t={},c={1:0},p=[];function l(e){if(t[e])return t[e].exports;var r=t[e]={i:e,l:!1,exports:{}};return f[e].call(r.exports,r,r.exports,l),r.l=!0,r.exports}l.m=f,l.c=t,l.d=function(e,r,t){l.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},l.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(r,e){if(1&e&&(r=l(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(l.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var n in r)l.d(t,n,function(e){return r[e]}.bind(null,n));return t},l.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(r,"a",r),r},l.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},l.p="/";var r=window.webpackJsonpclient=window.webpackJsonpclient||[],n=r.push.bind(r);r.push=e,r=r.slice();for(var o=0;o<r.length;o++)e(r[o]);var s=n;a()}([])</script>
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

    const repo = getRepository(StudyNoteEntity);
    const studyNoteEntity = await repo.findOne(node.path);
   
    let lastReview = new Date(1);
    if(studyNoteEntity) {
        lastReview = studyNoteEntity.lastReviewed;
    }
    const sources = await walkDirectory(path.join(context.extensionPath, "media", "web/build/static"));

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
                const payload = { ...node, lastReview };
                panel.webview.postMessage({ command: 'study_note', payload });
            }
        }
    });

    panel.webview.html = render(htmlTemplate, args);
}
