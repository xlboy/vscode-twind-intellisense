import { configurator } from './configurator';
import { logger } from './logger';
import { type Intellisense, type Suggestion, createIntellisense } from '@twind/intellisense';
import { getOffsetFromPosition } from '@vscode-use/utils';
import vscode from 'vscode';

class TwindIntellisense {
  private _twindInstance?: Intellisense;

  constructor() {
    configurator.onWatchTwindUserConfig(async config => {
      this._twindInstance = createIntellisense(config);
    });
  }

  async suggest(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    if (!this._twindInstance) return [];

    try {
      const docCode = document.getText();
      const positionOffset = getOffsetFromPosition(position, docCode);

      if (positionOffset === undefined) return [];
      const { suggestions } = (await this._twindInstance.suggestAt(docCode, positionOffset, document.languageId)) || {};
      if (!suggestions) {
        logger.error('Error while suggesting: suggestions is undefined');
        return [];
      }

      return suggestions.map(this._helpers.convertToCompletionItem);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error while suggesting:' + errMsg);
      return [];
    }
  }

  private _helpers = {
    convertToCompletionItem: (suggestion: Suggestion, index: number): vscode.CompletionItem => {
      // Source code from: `https://github.com/tw-in-js/twind/blob/17bdfce63a463f43614062040c2156112c87b50d/sites/twind.run/src/lib/monaco.ts#L132`
      if (suggestion.type === 'variant') {
        return {
          label: {
            label: suggestion.value.endsWith('[:') ? suggestion.value.slice(0, -1) : suggestion.value,
            detail:
              suggestion.detail ||
              (suggestion.value.endsWith('[:') ? '…]:' : suggestion.value.endsWith('/:') ? '…' : undefined),
            description: suggestion.description,
          },
          detail: suggestion.color || suggestion.detail,
          kind: suggestion.color ? vscode.CompletionItemKind.Color : vscode.CompletionItemKind.Module,
          sortText: index.toString().padStart(8, '0'),
          filterText: suggestion.name,
          insertText: suggestion.value.endsWith('[:') ? suggestion.value.slice(0, -1) : suggestion.value,
          command: { command: 'editor.action.triggerSuggest', title: '' },
        };
      }

      return {
        label: {
          label: suggestion.value,
          detail:
            suggestion.detail ||
            (suggestion.value.endsWith('[') ? '…]' : suggestion.value.endsWith('/') ? '…' : undefined),
          description: suggestion.description,
        },
        detail: suggestion.color || suggestion.detail,
        kind: suggestion.color
          ? vscode.CompletionItemKind.Color
          : suggestion.value.endsWith('[')
            ? vscode.CompletionItemKind.Variable
            : suggestion.value.endsWith('/')
              ? vscode.CompletionItemKind.Class // TypeParameter
              : vscode.CompletionItemKind.Constant,
        sortText: index.toString().padStart(8, '0'),
        filterText: suggestion.name,
        insertText: suggestion.value,
        command: suggestion.value.endsWith('/') ? { command: 'editor.action.triggerSuggest', title: '' } : undefined,
      };
    },
  };
}

export const twindIntellisense = new TwindIntellisense();
