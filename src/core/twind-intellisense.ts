import { configurator } from './configurator';
import { logger } from './logger';
import { type Intellisense, createIntellisense } from '@twind/intellisense';
import { getOffsetFromPosition } from '@vscode-use/utils';
import vscode from 'vscode';

class TwindIntellisense {
  private _twindInstance?: Intellisense;

  constructor() {
    configurator.onWatchTwindUserConfig(async config => {
      this._twindInstance = createIntellisense(config);
      
      const result = await this._twindInstance!.suggestAt(`<div class='font-(bold hover:(extr))'>`, 34, 'html')
    });
  }

  async suggest(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    if (!this._twindInstance) return [];

    const docCode = document.getText();
    const positionOffset = getOffsetFromPosition(position, docCode);

    if (positionOffset === undefined) return [];

    try {
      const suggestions = await this._twindInstance.suggestAt(docCode, positionOffset, document.languageId);
      return [];
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error while suggesting:' + errMsg);
      return [];
    }
  }
}

export const twindIntellisense = new TwindIntellisense();
