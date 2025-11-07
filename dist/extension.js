"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
function activate(context) {
  const disposable = vscode.commands.registerCommand("csv-viewer.openAsTable", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file is open.");
      return;
    }
    const doc = editor.document;
    if (!doc.fileName.endsWith(".csv")) {
      vscode.window.showErrorMessage("This command only works with CSV files.");
      return;
    }
    showCsvTable(editor.document.uri.fsPath);
  });
  context.subscriptions.push(disposable);
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) return;
    const doc = editor.document;
    if (doc.languageId === "csv" || doc.fileName.endsWith(".csv")) {
      vscode.window.showInformationMessage(
        `CSV file detected: "${doc.fileName.split("/").pop()}"`,
        "Open CSV Viewer"
      ).then((selection) => {
        if (selection === "Open CSV Viewer") {
          vscode.commands.executeCommand("csv-viewer.openAsTable");
        }
      });
    }
  });
}
function showCsvTable(filePath) {
  const filePathShort = filePath.split("/").pop() || filePath;
  const content = fs.readFileSync(filePath, "utf8");
  const firstLine = content.split("\n")[0];
  const separator = firstLine.includes(";") ? ";" : ",";
  const rows = content.split("\n").map((r) => r.split(separator));
  const panel = vscode.window.createWebviewPanel(
    "csvViewer",
    `${filePathShort} - CSV Viewer`,
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );
  panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 1rem;
      background-color: #f5f5f5;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: auto;
      background-color: #fff;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    thead {
      background-color: #007acc;
      color: #fff;
      font-weight: bold;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
    }

    tr {
      transition: background 0.2s ease;
      cursor: default;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #e6f1fb;
    }

    h2 {
      text-align: center;
      font-weight: 400;
      color: #333;
    }
  </style>
  </head>
  <body>
    <h2>${filePathShort}</h2>
    <table>
      <thead>
        <tr>${rows[0].map((h) => `<th>${h.trim()}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${c.trim()}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </body>
  </html>
  `;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
//# sourceMappingURL=extension.js.map
