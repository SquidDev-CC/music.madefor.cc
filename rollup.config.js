import html, { makeHtmlAttributes } from "@rollup/plugin-html";
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import autoprefixer from "autoprefixer";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import livereload from 'rollup-plugin-livereload';
import postcss from "rollup-plugin-postcss";
import svelte from 'rollup-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import tailwindcss from "tailwindcss";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn('python', ['-m', 'http.server', '8080', '-d', '_build'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

/** @type {import("rollup").RollupOptions} */
export default {
  input: 'src/main.ts',
  output: {
    dir: '_build',
    format: 'iife',
    entryFileNames: "[name]-[hash].js",

    sourcemap: !production,
    externalLiveBindings: true,
    freeze: true,
    generatedCode: {
      constBindings: true,
      arrowFunctions: true,
    }
  },
  plugins: [
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),

    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      }
    }),

    postcss({
      extract: true,
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
      minimize: production,
    }),

    resolve({
      browser: true,
      dedupe: ['svelte']
    }),

    html({
      template: async ({ attributes, files, publicPath }) => {
        const scripts = (files.js || [])
          .map(({ fileName }) => `<script defer src="${publicPath}${fileName}"${makeHtmlAttributes(attributes.script)}></script>`)
          .join("\n");

        const links = (files.css || [])
          .map(({ fileName }) => `<link href="${publicPath}${fileName}" rel="stylesheet"${makeHtmlAttributes(attributes.link)}>`)
          .join("\n");

        const templateFields = { scripts, links };

        const template = await fs.readFile("src/index.html", { encoding: "utf-8" });
        return template.replace(/\$\{([^}]+)\}/g, (_, name) => {
          const value = templateFields[name];
          if (value === undefined) throw new Error(`Unknown field ${name}`);
          return value;
        });
      },
    }),

    // Setup dev server for dev builds
    !production && serve(),
    !production && livereload('_build'),

    // Otherwise minify
    production && terser(),
  ],
  watch: {
    clearScreen: false
  }
};
