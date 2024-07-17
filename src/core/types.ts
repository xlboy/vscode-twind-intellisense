export type TwindDefaultPreset =
  | 'tailwind'
  | 'tailwind-forms'
  | 'autoprefix'
  | 'container-queries'
  | 'line-clamp'
  | 'radix-ui'
  | 'typography';

export interface ExtensionConfig {
  /** @default true */
  enabled: boolean;

  /** @default ['tailwind'] */
  presets: TwindDefaultPreset[];

  // TODO: !!!!!!
  /** @default `${workspaceFolder}` */
  // rootPath: string;

  /** @default `${workspaceFolder}/twind.config.js` */
  // configPath: string;
}
