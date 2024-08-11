import { configurator } from './configurator';
import { logger } from './logger';
import { TwindDefaultPreset } from './types';
import { fromRatio, names as namedColors } from '@ctrl/tinycolor';
import { type Intellisense, type Suggestion, createIntellisense } from '@phoenix-twind/intellisense';
import { type Preset } from '@twind/core';
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

class TwindIntellisense {
  private _twindInstance?: Intellisense;
  private readonly _decorations = {
    classColorIcon: vscode.window.createTextEditorDecorationType({
      before: {
        width: '0.9em',
        height: '0.9em',
        contentText: ' ',
        border: '1px solid',
        margin: `-0.16em 0.2em auto auto;vertical-align: middle;border-radius: 4px;`,
      },
      dark: { before: { borderColor: '#eeeeee50' } },
      light: { before: { borderColor: '#00000050' } },
    }),
  };
  private _cachedColorDecorations = new Map</* code */ string, vscode.DecorationOptions[]>();

  constructor() {
    this._initWatcher();
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

  renderClass(editor: vscode.TextEditor) {
    if (!this._twindInstance) return;

    const extensionConfig = configurator.getExtensionConfig();

    renderColorIcon.call(this);

    async function renderColorIcon(this: TwindIntellisense) {
      if (!extensionConfig.colorPreview.enabled) {
        editor.setDecorations(this._decorations.classColorIcon, []);
        return;
      }

      const docCode = editor.document.getText();
      const docLanguageId = editor.document.languageId;

      let colorDecorations = this._cachedColorDecorations.get(docCode);
      if (!colorDecorations) {
        const colors = await this._twindInstance!.collectColors(docCode, docLanguageId);
        colorDecorations = colors.map(color => {
          const colorValue = namedColors[color.value] || fromRatio(color.rgba).toHexString();
          const range = new vscode.Range(
            editor.document.positionAt(color.start),
            editor.document.positionAt(color.end),
          );
          return { range, renderOptions: { before: { backgroundColor: colorValue } } };
        });
        this._cachedColorDecorations.set(docCode, colorDecorations);
      }
      editor.setDecorations(this._decorations.classColorIcon, []);
      editor.setDecorations(this._decorations.classColorIcon, colorDecorations);
    }
  }

  private _refreshTwindInstance = () => {
    const twindUserConfig = configurator.getTwindUserConfig();
    const extensionConfig = configurator.getExtensionConfig();

    if (!twindUserConfig) return;

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
  };

  private _initWatcher() {
    configurator.onWatchTwindUserConfig(() => {
      this._cachedColorDecorations.clear();
      this._refreshTwindInstance();
      if (vscode.window.activeTextEditor) {
        this.renderClass(vscode.window.activeTextEditor);
      }
    });
    configurator.onWatchExtensionConfig(() => {
      this._refreshTwindInstance();
      if (vscode.window.activeTextEditor) {
        this.renderClass(vscode.window.activeTextEditor);
      }
    });
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) this.renderClass(editor);
    });
    vscode.workspace.onDidChangeTextDocument(
      debounce<(event: vscode.TextDocumentChangeEvent) => void>(event => {
        if (vscode.window.activeTextEditor?.document === event.document) {
          twindIntellisense.renderClass(vscode.window.activeTextEditor);
        }
      }, 1000),
    );
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
