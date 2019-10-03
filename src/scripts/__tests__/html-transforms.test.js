/* eslint-env jest */

import {removeStyleAndScript, addTargetBlank} from '../html-transforms';


describe('HtmlTransforms module', () => {
  const parser = new DOMParser();

  test('removeStyleAndScript removes stylesheets, inline styles, and scripts', () => {
    let document = parser.parseFromString(`<!doctype html>
      <html>
        <head>
          <link rel="canonical" href="somewhere.html" id="non-style-link">
          <link rel="stylesheet" type="text/css" href="sheet.css" id="external-sheet">
          <script type="text/javascript" src="script.js"></script>
          <script type="text/javascript">
            console.log('Inline javascript!');
          </script>
        </head>
        <body>
          <style type="text/css">
            body { background: purple; }
          </style>
          <h1 style="color: orange;">Hello</h1>
        </body>
      </html>
    `, 'text/html');

    document = removeStyleAndScript(document);
    expect(document.getElementById('non-style-link')).toBeInstanceOf(Element);
    expect(document.getElementById('external-sheet')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('style')).toBeNull();
    expect(document.querySelector('h1').style.color).toBe('');
  });

  test('removeStyleAndScript does not remove diff styles and scripts', () => {
    let document = parser.parseFromString(`<!doctype html>
      <html>
        <head>
          <style id="wm-diff-style" type="text/css">
            ins {text-decoration: none; background-color: #d4fcbc;}
          </style>
          <style class="wm-diff-other" type="text/css">
            del {text-decoration: none; background-color: #d4fcbc;}
          </style>
        </head>
        <body>
          <h1 style="color: orange;">Hello</h1>
          <script id="wm-diff-script">
            console.log('Hi!');
          </script>
        </body>
      </html>
    `, 'text/html');

    document = removeStyleAndScript(document);
    expect(document.getElementById('wm-diff-style')).toBeInstanceOf(Element);
    expect(document.getElementById('wm-diff-script')).toBeInstanceOf(Element);
    expect(document.querySelector('.wm-diff-other')).toBeInstanceOf(Element);
    expect(document.querySelector('.wm-diff-other')).toBeInstanceOf(Element);
  });

  test('addTargetBlank adds a target attribute of "_blank" to only <a> tags', () => {
    let document = parser.parseFromString(`<!doctype html>
      <html>
        <head>
          <link rel='canonical' href='somewhere.html' id='non-style-link'>
          <link rel='stylesheet' type='text/css' href='sheet.css' id='external-sheet'>
          <script type='text/javascript' src='script.js'></script>
          <script type='text/javascript'>
            console.log('Inline javascript!');
          </script>
        </head>
        <body>
          <style type='text/css'>
            body { background: purple; }
          </style>
          <a href='google.com' id='goo'>Goo test</a>
          <h1 style='color: orange;' id='orange'>Hello</h1>
        </body>
      </html>
      `, 'text/html');

    document = addTargetBlank(document);
    expect(document.getElementById('goo').target).toEqual('_blank');
    expect(document.getElementById('orange').target).toBeFalsy();
  });
});
