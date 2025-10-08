# Chrome Web Store 提交指南

## 1. 准备工作完成 ✅

### 已完成的文件结构：
```
chrome-extension/
├── manifest.json          # Chrome Manifest V3 兼容
├── background.js          # 后台脚本
├── content.js            # 内容脚本
├── popup.html            # 弹窗界面
├── popup.js              # 弹窗逻辑
├── popup.css             # 弹窗样式
├── icons/                # 扩展图标
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── images/               # 其他图片资源
└── _locales/             # 国际化文件
    └── en/
        └── messages.json
```

### 已创建的 ZIP 文件：
- `read-focus-chrome.zip` - 可直接上传到 Chrome Web Store

## 2. 本地测试步骤

### 在 Chrome 中测试扩展：

1. **打开 Chrome 扩展管理页面**
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"

2. **加载未打包的扩展**
   - 点击"加载已解压的扩展程序"
   - 选择 `chrome-extension/` 目录
   - 确认扩展出现在列表中且无错误

3. **测试功能**
   - 访问任意网页
   - 点击扩展图标，测试弹窗功能
   - 点击"进入专注模式"测试核心功能
   - 验证高亮、摘录等功能是否正常

## 3. Chrome Web Store 提交流程

### 3.1 注册开发者账号
1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 使用 Google 账号登录
3. 支付一次性注册费（$5 USD）
4. 完成开发者信息验证

### 3.2 创建新扩展
1. 在 Developer Dashboard 点击"New item"
2. 上传 `read-focus-chrome.zip` 文件
3. 等待文件处理完成

### 3.3 填写扩展信息

#### 基本信息：
- **名称**: Read Focus
- **摘要**: Let you stay on the current page and finish reading without distractions
- **描述**: 
```
Read Focus helps you concentrate on reading by providing a distraction-free environment. 

Key Features:
• One-click focus mode with fullscreen reading
• Clean, distraction-free layout
• Block distracting links and navigation
• Text highlighting and note-taking
• Export your highlights as Markdown
• Keyboard shortcuts for quick access

Perfect for students, researchers, and anyone who wants to focus on reading without distractions.
```

#### 分类和标签：
- **类别**: Productivity
- **标签**: reading, focus, productivity, distraction-free, highlights, notes

#### 隐私政策：
- 需要创建隐私政策页面
- 说明扩展不收集用户数据
- 所有数据存储在本地

### 3.4 上传资源文件

#### 必需文件：
- **图标**: 使用 `icons/icon128.png` (128x128)
- **截图**: 准备 1-5 张展示扩展功能的截图
  - 建议尺寸: 1280x800 或 640x400
  - 展示专注模式界面
  - 展示高亮和摘录功能
  - 展示弹窗界面

#### 可选文件：
- **宣传图片**: 用于商店展示
- **小图标**: 16x16 像素

### 3.5 设置分发选项

#### 可见性设置：
- **Public**: 公开，任何人都可以安装
- **Unlisted**: 未列出，只有链接可以安装
- **Private**: 私有，仅限指定用户

#### 推荐设置：
- 选择 "Public" 进行公开发布
- 或选择 "Unlisted" 先进行小范围测试

### 3.6 提交审核

1. **检查清单**：
   - ✅ 所有必填字段已填写
   - ✅ 图标和截图已上传
   - ✅ 隐私政策链接有效
   - ✅ 扩展功能测试正常
   - ✅ 无恶意代码或违规内容

2. **提交审核**：
   - 点击 "Submit for review"
   - 等待 Google 审核（通常 1-3 个工作日）

## 4. 审核通过后的管理

### 4.1 发布后管理
- 监控用户反馈和评分
- 定期更新扩展功能
- 响应用户评论

### 4.2 版本更新流程
1. 修改 `manifest.json` 中的版本号
2. 重新打包为 ZIP 文件
3. 在 Developer Dashboard 上传新版本
4. 提交审核

## 5. 自动化部署（可选）

### 使用 GitHub Actions 自动发布：

```yaml
name: Publish to Chrome Web Store
on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Publish to Chrome Web Store
        uses: mobilefirstllc/cws-publish@v1
        with:
          client_id: ${{ secrets.CWS_CLIENT_ID }}
          client_secret: ${{ secrets.CWS_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CWS_REFRESH_TOKEN }}
          extension_id: ${{ secrets.CWS_EXTENSION_ID }}
          zip_file: read-focus-chrome.zip
```

### 获取 API 凭据：
1. 在 Chrome Web Store Developer Dashboard
2. 进入 "API access" 部分
3. 生成 OAuth 2.0 凭据
4. 将凭据添加到 GitHub Secrets

## 6. 常见问题和解决方案

### 6.1 审核被拒的常见原因：
- 权限请求过多或不合理
- 缺少隐私政策
- 功能描述不清晰
- 图标或截图质量差
- 违反 Chrome Web Store 政策

### 6.2 权限优化：
当前权限设置合理：
- `storage`: 存储用户设置和高亮数据
- `activeTab`: 访问当前标签页
- `scripting`: 注入内容脚本
- `<all_urls>`: 在所有网站上工作

### 6.3 性能优化建议：
- 确保扩展加载速度快
- 避免阻塞页面渲染
- 合理使用内存和 CPU

## 7. 营销和推广

### 7.1 商店优化：
- 使用相关关键词
- 提供清晰的截图
- 编写吸引人的描述
- 鼓励用户评价

### 7.2 推广渠道：
- 社交媒体分享
- 技术博客介绍
- 开发者社区推广
- 用户反馈收集

---

## 下一步行动：

1. ✅ 完成本地测试
2. 🔄 注册 Chrome Web Store 开发者账号
3. 🔄 准备截图和宣传材料
4. 🔄 创建隐私政策页面
5. 🔄 提交扩展进行审核

**ZIP 文件位置**: `/Users/ppg20/Desktop/AIGC/AI product build/read focus safari extension/read-focus-chrome.zip`
