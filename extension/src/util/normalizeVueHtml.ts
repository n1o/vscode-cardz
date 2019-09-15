export default function normalizeHtml(html: string, toRemove: Set<RegExp>, map: Map<string, string>): string {
   
    const cleaned = remove(html, [...toRemove]);
    const replaced = replace(cleaned, map);
    return replaced.replace("<meta>", `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource: https:; style-src vscode-resource: https:;"/>`);
}

function remove(html: string, exp: RegExp[]): string {
    return exp.reduce((acc, exp ) => acc.replace(exp, ""), html);
}

function replace(html: string, map: Map<string,string>): string {
    const styleSheetRegex = /<link href=(.+) rel=stylesheet>/g;
    const scriptRegex = new RegExp("<script src=(.+)></script>", "g");

    const scripts = [...matchAll(html, scriptRegex)].map(arr => arr[1]);
    const styles = [...matchAll(html, styleSheetRegex)].map(arr => arr[1]);
    const replaceScripts = scripts.reduce( (acc, script) => acc.replace(new RegExp(script, "g"), map.get(script)!) ,html);
    const replaceStyles = styles.reduce((acc, style) => acc.replace(new RegExp(style, "g"), map.get(style)!), replaceScripts);
    return replaceStyles;
}

function* matchAll(str: string, re: RegExp) {
    let match;
    while (match = re.exec(str)) {
      yield match;
    }
  }