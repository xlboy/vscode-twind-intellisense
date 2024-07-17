import { twindIntellisense } from './twind-intellisense';
import vscode from 'vscode';

export class Controller {
  constructor(private readonly vscodeContext: vscode.ExtensionContext) {
    this._registerCompletionProvider();
    this._registerHoverProvider();
  }

  private _registerCompletionProvider() {
    const currentSupportedLanguages = ['html'];
    const completionProvider = vscode.languages.registerCompletionItemProvider(currentSupportedLanguages, {
      async provideCompletionItems(document, position) {
        return twindIntellisense.suggest(document, position);
      },
    });

    this.vscodeContext.subscriptions.push(completionProvider);
  }

  private _registerHoverProvider() {
    const currentSupportedLanguages = ['html'];
    const hoverProvider = vscode.languages.registerHoverProvider(currentSupportedLanguages, {
      async provideHover(document, position) {
        return twindIntellisense.hover(document, position);
      },
    });

    this.vscodeContext.subscriptions.push(hoverProvider);
  }
}
