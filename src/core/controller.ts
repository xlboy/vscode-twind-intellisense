import vscode from 'vscode';
import { twindIntellisense } from './twind-intellisense';

export class Controller {
  constructor(private readonly vscodeContext: vscode.ExtensionContext) {
    this._registerCompletionProvider();
  }

  _registerCompletionProvider() {
    const currentSupportedLanguages = ['html'];
    const completionProvider = vscode.languages.registerCompletionItemProvider(currentSupportedLanguages, {
      async provideCompletionItems(document, position) {
        return twindIntellisense.suggest(document, position);
        // const completionItems: vscode.CompletionItem[] = [];
        // const completionItem = new vscode.CompletionItem('Hello, World!');
        // completionItem.kind = vscode.CompletionItemKind.Text;
        // completionItem.insertText = new vscode.SnippetString('Hello, World!');
        // completionItem.detail = 'Hello, World!';
        // completionItem.documentation = new vscode.MarkdownString('Hello, World!');
        // completionItems.push(completionItem);
      },
    });

    this.vscodeContext.subscriptions.push(completionProvider);
  }
}
