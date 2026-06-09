# DayNightModule — 日间/夜间主题切换模块

纯前端日间/夜间主题切换模块，支持基于时间的自动切换和手动切换，用户偏好自动保存。

## 主要功能

- 日间/夜间两套主题，CSS 变量驱动
- 基于时间自动切换（默认 6:00-18:00 日间，其余夜间）
- 支持跨午夜时间区间（如 22:00~6:00）
- 手动切换按钮自动挂载（`.dnm-toggle`）
- `localStorage` 记忆用户偏好
- 零配置开箱即用，支持 `data-*` 自定义配置
- 主题切换过渡动画
- 尊重 `prefers-reduced-motion` 减少动画设置
- `destroy()` 完整清理，无内存泄漏

## 环境要求

- 现代浏览器（支持 CSS 自定义属性）
- 无需构建工具，直接引入即可

## 快速开始

将 `modules/theme/` 目录拷贝到你的项目中，然后在 HTML 中引入：

```html
<link rel="stylesheet" href="modules/theme/theme.css">
<script src="modules/theme/theme-manager.js"></script>
```

页面加载后会自动初始化主题，并在右上角显示切换按钮。

## 项目结构

```
DayNightModule/
├── modules/
│   └── theme/
│       ├── theme.css            # 日间/夜间颜色变量与样式
│       └── theme-manager.js     # 主题管理器
├── Architecture.md              # 架构说明
├── README.md                    # 项目简介
├── File_Index.md                # 文件索引
└── .gitignore
```

## API 说明

### 方法

| 方法 | 说明 |
|------|------|
| `themeManager.getCurrentTheme()` | 获取当前主题（`'day'` 或 `'night'`） |
| `themeManager.setTheme('day' \| 'night')` | 设置主题 |
| `themeManager.toggleTheme()` | 切换主题 |
| `themeManager.clearSavedTheme()` | 清除保存的偏好 |
| `themeManager.getConfig()` | 获取当前配置 |
| `themeManager.destroy()` | 销毁实例 |

### 事件

| 事件名 | 说明 |
|--------|------|
| `theme:initialized` | 初始化完成 |
| `theme:themeChanged` | 主题切换（`event.detail.newTheme` / `event.detail.oldTheme` / `event.detail.isManual`） |
| `theme:destroyed` | 销毁完成 |

### 配置项

通过 `<script>` 标签的 `data-*` 属性配置：

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `data-day-start` | 日间开始时间 | `06:00` |
| `data-night-start` | 夜间开始时间 | `18:00` |
| `data-interval` | 检查间隔(ms) | `60000` |
| `data-storage-key` | localStorage 键名 | `theme-preference` |
| `data-manual-override` | 手动切换覆盖自动判断 | `true` |
| `data-auto-init` | 自动初始化 | `true` |
| `data-auto-button` | 自动挂载切换按钮 | `true` |
| `data-button-selector` | 自定义按钮 CSS 选择器 | — |

## 如何贡献

1. Fork 本仓库
2. 创建功能分支
3. 提交代码并更新文档
4. 发起 Pull Request
