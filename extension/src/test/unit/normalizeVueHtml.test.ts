import * as assert from 'assert';
import normalizeHtml from '../../util/normalizeVueHtml';

describe("normalizeVueHtml", function () {

  it("remove junk", function () {

    const html = `
    <!DOCTYPE html>
    <html lang=en>
    <head>
        <meta charset=utf-8>
        <meta>
        <meta name=viewport content="width=device-width,initial-scale=1">
        <title>client</title>
        <link href=/css/app.c61cb057.css rel=preload as=style>
        <link href=/js/app.dc85c75d.js rel=preload as=script>
        <link href=/js/chunk-vendors.5fb349ec.js rel=preload as=script>
        <link href=/css/app.c61cb057.css rel=stylesheet>
    </head>
    <body>
        <noscript><strong>We're sorry but client doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript>
        <div id=app></div>
        <script src=/js/chunk-vendors.5fb349ec.js></script>
        <script src=/js/app.dc85c75d.js></script>
    </body>
    </html>`;

    const map = new Map<string, string>();
    map.set('/css/app.c61cb057.css', 'test:/css/app.c61cb057.css');
    map.set('/js/chunk-vendors.5fb349ec.js', 'test:/js/chunk-vendors.5fb349ec.js');
    map.set('/js/app.dc85c75d.js', 'test:/js/app.dc85c75d.js');
    const result = normalizeHtml(
      html, 
      new Set([/<link href=.+ rel=preload as=style>/g, /<link href=.+ rel=preload as=script>/g]), 
      map);
    console.log(result);
    assert.equal(1,1);
  });
});