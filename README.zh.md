# VSCode Twind Intellisense (Phoenix)

[English](./README.md) | 简体中文

https://github.com/user-attachments/assets/483449e3-9dbd-465f-aa17-b4dc71d78fed

## 关于它

一个为 [Twind](https://twind.style) 提供智能感知的 VSCode 扩展程序。

为什么名称尾部会带上 `Phoenix`（凤凰） 一词？因为它正在浴火重生，在未来的某一天，它仍会像曾经那样耀眼。

## 特性

- 智能感应
- 清晰的类信息
- 颜色预览

## 如何使用

安装扩展后，简单配置即可使用。

```json
{
  // [重要] 填写项目中使用到的预设，如 `tailwind`, ...
  "twind-intellisense.presets": ["tailwind", "typography"]
  // ...其余配置请向下查看
}
```

## 配置

- `twind-intellisense.enabled`: 是否启用插件

  - 类型：`boolean`
  - 默认值：`true`

- `twind-intellisense.presets`: 项目中使用到的预设
  - 类型：`Array<'tailwind' | 'tailwind-forms' | 'autoprefix' | 'container-queries' | 'line-clamp' | 'radix-ui' | 'typography'>`
  - 默认值：`["tailwind"]`
  > 请注意，如果你的项目中使用了 `tailwind` 预设，请务必添加。

  > `tailwind` 即为 `@twind/preset-tailwind`，其余的也是同理。
- `twind-intellisense.configPath`: Twind 配置文件路径
  - 类型：`string | undefined`
  > 可以是配置文件的完整路径（如：`<...>/lib/twind.ts`）

  > 或是包含配置文件的目录路径（如：`<...>/lib`，会自动在此目录下寻找 `twind.config.(js|ts)` 配置文件）

  > 如果不填，将会在工作区文件夹中查找配置文件（如：`${workspaceFolder}/twind.config.(js|ts)`）
  
## 各语言的支持情况

> 因依赖 [`@twind/intellisense`](https://www.npmjs.com/package/@twind/intellisense) 库，此库目前只支持 `html`。

> 目前，我正在尽力的基于此库扩展其他语言（`react`, `vue`, ...），敬请期待。

- [x] HTML
- [ ] React
- [ ] Vue
- [ ] ...

## CHANGELOG
