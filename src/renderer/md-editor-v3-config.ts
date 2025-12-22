import 'md-editor-v3/lib/style.css';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.css';
import katex from 'katex';
import hljs from 'highlight.js';
import { config } from 'md-editor-v3';

const atomDarkCss = new URL('node_modules/highlight.js/styles/atom-one-dark.css', import.meta.url)
  .href;

const katexCss = new URL('node_modules/katex/dist/katex.css', import.meta.url).href;

config({
  editorExtensions: {
    highlight: {
      instance: hljs,
      css: {
        atom: {
          light: atomDarkCss,
          dark: atomDarkCss,
        },
      },
    },
    katex: {
      instance: katex,
      css: katexCss,
    },
  },
});
