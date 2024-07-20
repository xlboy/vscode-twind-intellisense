# VSCode Twind Intellisense (Phoenix)

English | [简体中文](./README.zh.md)

https://github.com/user-attachments/assets/483449e3-9dbd-465f-aa17-b4dc71d78fed

## About It

This is a VSCode extension that provides intelligent insights for [Twind](https://twind.style).

Why does the name end with `Phoenix`? Because it is rising from the ashes, and one day, it will shine as brightly as it once did.

## Features

- Intelligent suggestions
- Clear class information
- Color previews

## How to Use

After installing the extension, simply configure it as follows.

```json
{
  // [Important] Specify the presets used in the project, such as `tailwind`, ...
  "twind-intellisense.presets": ["tailwind", "typography"]
  // ... see below for additional configurations
}
```

## Configuration

- `twind-intellisense.enabled`: Enable the extension

  - Type: `boolean`
  - Default: `true`

- `twind-intellisense.presets`: Presets used in the project

  - Type: `Array<'tailwind' | 'tailwind-forms' | 'autoprefix' | 'container-queries' | 'line-clamp' | 'radix-ui' | 'typography'>`
  - Default: `["tailwind"]`

  > Note: If your project uses the `tailwind` preset, be sure to add it.

  > `tailwind` corresponds to `@twind/preset-tailwind`, and the others follow similarly.

- `twind-intellisense.configPath`: Path to the Twind configuration file

  - Type: `string | undefined`

  > This can be the full path to the configuration file (e.g., `<...>/twind.config.js`)

  > or the directory containing the configuration file (e.g., `<...>`, which will automatically look for `twind.config.(js|ts)`)

  > If not specified, the extension will look for the configuration file in the workspace folder (e.g., `${workspaceFolder}/twind.config.(js|ts)`)

## Language Support Status

> Due to reliance on the [`@twind/intellisense`](https://www.npmjs.com/package/@twind/intellisense) library, this library currently only supports `html`.

> Currently, I am working hard to extend support for other languages (`react`, `vue`, ...), so please stay tuned.

- [x] HTML
- [ ] React
- [ ] Vue
- [ ] ...


## CHANGELOG

[CHANGELOG.md](https://github.com/xlboy/vscode-twind-intellisense/blob/master/CHANGELOG.md)

## License

MIT License © 2023-PRESENT  [xlboy](https://github.com/xlboy)