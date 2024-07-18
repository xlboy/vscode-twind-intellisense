import { twindIntellisense } from './twind-intellisense';
import vscode from 'vscode';

export class Controller {
  constructor(private readonly vscodeContext: vscode.ExtensionContext) {
    this._registerCompletionProvider();
    this._registerHoverProvider();
    this._registerColorProvider();
  }

  private _registerCompletionProvider() {
    const currentSupportedLanguages = ['html'];
    const completionProvider = vscode.languages.registerCompletionItemProvider(currentSupportedLanguages, {
      provideCompletionItems: twindIntellisense.suggestProvider,
    });

    this.vscodeContext.subscriptions.push(completionProvider);
  }

  private _registerHoverProvider() {
    const currentSupportedLanguages = ['html'];
    const hoverProvider = vscode.languages.registerHoverProvider(currentSupportedLanguages, {
      provideHover: twindIntellisense.hoverProvider,
    });

    this.vscodeContext.subscriptions.push(hoverProvider);
  }

  private _registerColorProvider() {
    const currentSupportedLanguages = ['html'];
    const colorProvider = vscode.languages.registerColorProvider(currentSupportedLanguages, {
      provideDocumentColors: twindIntellisense.documentColorProvider,
      provideColorPresentations: twindIntellisense.documentColorEditProvider,
    });

    this.vscodeContext.subscriptions.push(colorProvider);
  }
}
