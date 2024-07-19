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

  /**
   * Path to the Twind configuration file.
   *
   * This can be the full path to the configuration file (e.g., `<...>/twind.config.js`),
   * 
   * or the directory containing the configuration file (e.g., `<...>`, which will automatically look for `twind.config.(js|ts)`).
   * 
   * If not specified, the extension will look for the configuration file in the workspace folder (e.g., `${workspaceFolder}/twind.config.(js|ts)`).
   *
   */
  configPath?: string;
}
