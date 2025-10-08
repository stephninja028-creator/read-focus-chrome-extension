# Read Focus Chrome Extension

## 🎯 项目概述

Read Focus 是一个 Chrome 浏览器扩展，帮助用户在阅读时保持专注，通过提供无干扰的阅读环境来提升阅读体验。

## 📁 文件结构

```
chrome-extension/
├── manifest.json          # Chrome Manifest V3 配置文件
├── background.js          # 后台服务工作者
├── content.js            # 内容脚本（核心功能）
├── popup.html            # 扩展弹窗界面
├── popup.js              # 弹窗交互逻辑
├── popup.css             # 弹窗样式
├── icons/                # 扩展图标
│   ├── icon16.png        # 16x16 图标
│   ├── icon32.png        # 32x32 图标
│   ├── icon48.png        # 48x48 图标
│   └── icon128.png       # 128x128 图标
├── images/               # 其他图片资源
└── _locales/             # 国际化支持
    └── en/
        └── messages.json
```

## 🚀 核心功能

### 1. 专注阅读模式
- **一键进入**: 点击扩展图标即可进入专注模式
- **全屏阅读**: 自动进入全屏模式，消除干扰
- **清洁布局**: 隐藏导航栏、侧边栏、广告等干扰元素
- **链接拦截**: 阻止点击链接跳转，保持专注

### 2. 文本高亮功能
- **选择高亮**: 选择文本后使用 Ctrl/Cmd + H 进行高亮
- **点击删除**: 点击高亮文本可删除高亮
- **持久保存**: 高亮内容自动保存到本地存储

### 3. 摘录管理
- **摘录收集**: 将重要内容添加到摘录列表
- **侧边栏显示**: 点击"摘录"按钮打开侧边栏
- **导出功能**: 支持导出为 Markdown 格式
- **本地存储**: 所有摘录保存在本地，保护隐私

### 4. 键盘快捷键
- **Escape**: 退出专注模式
- **Ctrl/Cmd + H**: 高亮选中文本
- **Ctrl/Cmd + Shift + L**: 切换摘录面板

## 🛠️ 技术实现

### Manifest V3 兼容
- 使用最新的 Chrome 扩展 API
- 服务工作者替代后台页面
- 内容安全策略 (CSP) 兼容

### 权限设置
```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"]
}
```

### 核心文件说明
- **background.js**: 处理扩展图标点击事件
- **content.js**: 实现专注模式、高亮、摘录等核心功能
- **popup.html/js**: 提供用户界面和快捷操作

## 📦 打包和分发

### 已创建的文件
- ✅ `read-focus-chrome.zip` - Chrome Web Store 提交包
- ✅ `Chrome-Web-Store-Submission-Guide.md` - 详细提交指南
- ✅ `privacy-policy.html` - 隐私政策页面
- ✅ `test-extension.html` - 功能测试页面

### 本地测试
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension/` 目录
6. 使用 `test-extension.html` 测试功能

## 🏪 Chrome Web Store 提交

### 提交清单
- [x] Manifest V3 兼容的 manifest.json
- [x] 完整的图标集 (16, 32, 48, 128px)
- [x] 功能完整的扩展包
- [x] 隐私政策页面
- [x] 测试页面和说明文档

### 下一步操作
1. 注册 Chrome Web Store 开发者账号 ($5 注册费)
2. 准备扩展截图和宣传材料
3. 上传 `read-focus-chrome.zip` 到开发者控制台
4. 填写扩展信息和描述
5. 提交审核

## 🔧 开发和维护

### 版本更新
1. 修改 `manifest.json` 中的版本号
2. 重新打包为 ZIP 文件
3. 在 Chrome Web Store 开发者控制台上传新版本

### 自动化部署
支持 GitHub Actions 自动发布到 Chrome Web Store，详见提交指南中的自动化配置。

## 📋 功能特性

### 用户体验
- 🎯 一键专注，无学习成本
- 🎨 美观的界面设计
- ⌨️ 丰富的键盘快捷键
- 💾 本地数据存储，保护隐私

### 技术特性
- 🔒 符合 Chrome Web Store 政策
- 🚀 高性能，不影响页面加载
- 🌐 支持所有网站
- 📱 响应式设计

## 📞 支持和反馈

- 通过 Chrome Web Store 页面提供用户反馈
- 定期更新和功能改进
- 响应用户需求和建议

---

**准备就绪！** 您的 Read Focus Chrome 扩展已经完全准备好提交到 Chrome Web Store。所有必要的文件都已创建，请按照 `Chrome-Web-Store-Submission-Guide.md` 中的详细步骤进行提交。
