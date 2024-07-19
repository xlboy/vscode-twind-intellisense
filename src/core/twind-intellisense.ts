import { configurator } from './configurator';
import { logger } from './logger';
import { TwindDefaultPreset } from './types';
import { fromRatio, names as namedColors } from '@ctrl/tinycolor';
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
import { debounce } from 'lodash-es';
import vscode from 'vscode';

type SuggestProvider = vscode.CompletionItemProvider['provideCompletionItems'];
type HoverProvider = vscode.HoverProvider['provideHover'];
type DocumentColorProvider = vscode.DocumentColorProvider['provideDocumentColors'];
type DocumentColorEditProvider = vscode.DocumentColorProvider['provideColorPresentations'];

class TwindIntellisense {
  private _twindInstance?: Intellisense;

  constructor() {
    configurator.onWatchTwindUserConfig(this._refreshTwindInstance.bind(this));
    configurator.onWatchExtensionConfig(this._refreshTwindInstance.bind(this));
  }

  suggestProvider: SuggestProvider = async (doc, position) => {
    if (!this._twindInstance) return [];

    try {
      const docCode = doc.getText();

      const positionOffset = getOffsetFromPosition(position, docCode);
      if (positionOffset === undefined) return [];

      const suggestResult = await this._twindInstance.suggestAt(docCode, positionOffset, doc.languageId);
      if (!suggestResult) {
        logger.error('Error while suggesting: suggestions is undefined');
        return [];
      }

      const currentInputRange = new vscode.Range(
        doc.positionAt(suggestResult.start),
        doc.positionAt(suggestResult.end),
      );
      return suggestResult.suggestions.map((s, i) => this._helpers.convertToCompletionItem(s, i, currentInputRange));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error while suggesting:' + errMsg);
      return [];
    }
  };

  hoverProvider: HoverProvider = async (doc, position) => {
    if (!this._twindInstance) return;

    try {
      const docCode = doc.getText();

      const positionOffset = getOffsetFromPosition(position, docCode);
      if (positionOffset === undefined) return;

      const hoverResult = await this._twindInstance.documentationAt(docCode, positionOffset, doc.languageId);
      if (!hoverResult) return;

      const currentHoverRange = new vscode.Range(doc.positionAt(hoverResult.start), doc.positionAt(hoverResult.end));
      return new vscode.Hover(hoverResult.value, currentHoverRange);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error while hovering:' + errMsg);
    }

    return;
  };

  documentColorProvider: DocumentColorProvider = async doc => {
    if (!this._twindInstance) return [];

    const colors = (await this._twindInstance.collectColors(doc.getText(), doc.languageId)) ?? [];

    return colors.map(
      c =>
        new vscode.ColorInformation(
          new vscode.Range(doc.positionAt(c.start), doc.positionAt(c.end)),
          new vscode.Color(c.rgba.r / 255, c.rgba.g / 255, c.rgba.b / 255, c.rgba.a),
        ),
    );
  };

  documentColorEditProvider: DocumentColorEditProvider = async (color, context) => {
    // @See `https://github.com/xlboy/twind/blob/17bdfce63a463f43614062040c2156112c87b50d/sites/twind.run/src/lib/monaco.ts#L219`
    const className = context.document.getText(new vscode.Range(context.range.start, context.range.end));
    const colorNames = Object.keys(namedColors);
    const editabelColorReg = new RegExp(
      `-\\[(${colorNames.join('|')}|(?:(?:#|(?:(?:hsl|rgb)a?|hwb|lab|lch|color)\\())[^]\\(]+)\\]$`,
      'i',
    );

    const matchColor = className.match(editabelColorReg);
    if (!matchColor) return [];

    const currentColor = matchColor[1];
    const isNamedColor = colorNames.includes(currentColor);
    const tinyColor = fromRatio({
      r: color.red,
      g: color.green,
      b: color.blue,
      a: color.alpha,
    });

    let hexValue = tinyColor.toHex8String(!isNamedColor && (currentColor.length === 4 || currentColor.length === 5));
    if (hexValue.length === 5) {
      hexValue = hexValue.replace(/f$/, '');
    } else if (hexValue.length === 9) {
      hexValue = hexValue.replace(/ff$/, '');
    }

    const prefix = className.slice(0, matchColor.index);

    return [hexValue, tinyColor.toRgbString().replace(/ /g, ''), tinyColor.toHslString().replace(/ /g, '')].map(v => ({
      label: `${prefix}-[${v}]`,
    }));
  };

  private _refreshTwindInstance = debounce(() => {
    const twindUserConfig = configurator.getTwindUserConfig();
    const extensionConfig = configurator.getExtensionConfig();
    
    if (!twindUserConfig) return;

    logger.info('Refreshing twind instance...');

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
    this._twindInstance = createIntellisense({
      presets: [twindUserConfig as any, ...twindDefaultPresets].filter(Boolean),
    });

    logger.info('Twind instance refreshed');
  }, 500);

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
