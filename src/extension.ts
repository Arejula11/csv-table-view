import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

  // --- Registrar el comando ---
  const disposable = vscode.commands.registerCommand('csv-viewer.openAsTable', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No file is open.');
      return;
    }

    const doc = editor.document;
    if (!doc.fileName.endsWith('.csv')) {
      vscode.window.showErrorMessage('This command only works with CSV files.');
      return;
    }

    showCsvTable(editor.document.uri.fsPath);
  });

  context.subscriptions.push(disposable);

  // --- Listener para sugerir ejecutar la extensión ---
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (!editor) return;
    const doc = editor.document;

    // Solo para CSV
    if (doc.languageId === 'csv' || doc.fileName.endsWith('.csv')) {
      // Mostrar un mensaje de información con acción
      vscode.window.showInformationMessage(
        `CSV file detected: "${doc.fileName.split('/').pop()}"`,
        'Open CSV Viewer'
      ).then(selection => {
        if (selection === 'Open CSV Viewer') {
          vscode.commands.executeCommand('csv-viewer.openAsTable');
        }
      });
    }
  });
}

// --- Función que crea la webview ---
function showCsvTable(filePath: string) {
  const filePathShort = filePath.split('/').pop() || filePath;
  const content = fs.readFileSync(filePath, 'utf8');

  // Detectar separador
  const firstLine = content.split('\n')[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const rows = content.split('\n').map(r => r.split(separator));

  const panel = vscode.window.createWebviewPanel(
    'csvViewer',
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
        <tr>${rows[0].map(h => `<th>${h.trim()}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </body>
  </html>
  `;
}
