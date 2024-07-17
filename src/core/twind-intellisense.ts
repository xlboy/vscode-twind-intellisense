import { configurator } from './configurator';
import { logger } from './logger';
import { TwindDefaultPreset } from './types';
import { type Preset } from '@twind/core';
import { type Intellisense, type Suggestion, createIntellisense } from '@twind/intellisense';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetContainerQueries from '@twind/preset-container-queries';
import presetLineClamp from '@twind/preset-line-clamp';
import presetRadixUI from '@twind/preset-radix-ui';
import presetTailwind from '@twind/preset-tailwind';
import presetTailwindForms from '@twind/preset-tailwind-forms';
import presetTypography from '@twind/preset-typography';
import { getOffsetFromPosition } from '@vscode-use/utils';
import vscode from 'vscode';

class TwindIntellisense {
  private _twindInstance?: Intellisense;

  constructor() {
    configurator.onWatchTwindUserConfig(this._refreshTwindInstance.bind(this));
    configurator.onWatchExtensionConfig(this._refreshTwindInstance.bind(this));
  }

  async suggest(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    if (!this._twindInstance) return [];

    try {
      const docCode = document.getText();
      const positionOffset = getOffsetFromPosition(position, docCode);

      if (positionOffset === undefined) return [];
      const suggestResult = await this._twindInstance.suggestAt(docCode, positionOffset, document.languageId);
      if (!suggestResult) {
        logger.error('Error while suggesting: suggestions is undefined');
        return [];
      }

      const currentInputRange = new vscode.Range(
        document.positionAt(suggestResult.start),
        document.positionAt(suggestResult.end),
      );
      return suggestResult.suggestions.map((s, i) => this._helpers.convertToCompletionItem(s, i, currentInputRange));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error while suggesting:' + errMsg);
      return [];
    }
  }

  private _refreshTwindInstance() {
    logger.info('Refreshing twind instance...');

    const extensionConfig = configurator.getExtensionConfig();
    const twindDefaultPresetMap = {
      tailwind: presetTailwind(),
      'container-queries': presetContainerQueries(),
      'line-clamp': presetLineClamp(),
      typography: presetTypography(),
      'tailwind-forms': presetTailwindForms(),
      autoprefix: presetAutoprefix(),
      'radix-ui': presetRadixUI(),
    } satisfies Record<TwindDefaultPreset, Preset<any>>;

    const twindDefaultPresets = extensionConfig.presets.map(preset => twindDefaultPresetMap[preset]);
    const twindUserConfig = configurator.getTwindUserConfig();
    this._twindInstance = createIntellisense({
      presets: [twindUserConfig as any, ...twindDefaultPresets].filter(Boolean),
    });

    logger.info('Twind instance refreshed');
  }

  private _helpers = {
    convertToCompletionItem: (suggestion: Suggestion, index: number, range: vscode.Range): vscode.CompletionItem => {
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
          range,
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
        range,
        command: suggestion.value.endsWith('/') ? { command: 'editor.action.triggerSuggest', title: '' } : undefined,
      };
    },
  };
}

export const twindIntellisense = new TwindIntellisense();
