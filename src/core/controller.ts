import { twindIntellisense } from './twind-intellisense';
import vscode from 'vscode';

export class Controller {
  constructor(private readonly vscodeContext: vscode.ExtensionContext) {
    this._registerCompletionProvider();
    this._registerHoverProvider();
  }

  private _registerCompletionProvider() {
    const currentSupportedLanguages = ['html', 'typescriptreact', 'javascriptreact', 'typescript', 'javascript'];
    const completionProvider = vscode.languages.registerCompletionItemProvider(currentSupportedLanguages, {
      provideCompletionItems: twindIntellisense.suggestProvider,
    });

    this.vscodeContext.subscriptions.push(completionProvider);
  }

  private _registerHoverProvider() {
    const currentSupportedLanguages = ['html', 'typescriptreact', 'javascriptreact', 'typescript', 'javascript'];
    const hoverProvider = vscode.languages.registerHoverProvider(currentSupportedLanguages, {
      provideHover: twindIntellisense.hoverProvider,
    });

    this.vscodeContext.subscriptions.push(hoverProvider);
  }
}
