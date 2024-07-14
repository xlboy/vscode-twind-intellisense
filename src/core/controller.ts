import { twindIntellisense } from './twind-intellisense';
import vscode from 'vscode';

export class Controller {
  constructor(private readonly vscodeContext: vscode.ExtensionContext) {
    this._registerCompletionProvider();
  }

  _registerCompletionProvider() {
    const currentSupportedLanguages = ['html'];
    const completionProvider = vscode.languages.registerCompletionItemProvider(currentSupportedLanguages, {
      async provideCompletionItems(document, position) {
        return twindIntellisense.suggest(document, position);
      },
    });

    this.vscodeContext.subscriptions.push(completionProvider);
  }
}
