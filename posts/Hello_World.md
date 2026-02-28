---
title: 你好，世界！
date: 2026-02-28
tags: [入门, 博客]
---

# 你好，世界！🚀

> 欢迎来到我的个人博客。这是一个运行在 GitHub Pages 上的极客风格网页，用来记录我的技术成长。

## 为什么打造这个博客？

作为一名开发者，我认为博客是最好的"公开笔记本"。它可以：

- **沉淀知识**：写作是对理解程度最严格的考验
- **记录成长**：每篇文章都是一个里程碑
- **连接社区**：把你的思考分享给和你有同样热爱的人

## 博客的设计理念

这个博客选择了一个对开发者来说最熟悉的界面风格——**Visual Studio Code 编辑器**。

左侧是文件目录树，右侧是"编辑器"主区域，你点击的每一篇文章都会像打开一个文件一样，在主区域渲染出来。

## 技术栈一览

| 技术 | 用途 |
|---|---|
| 原生 HTML / CSS | 页面骨架与样式 |
| Tailwind CSS CDN | 快速工具类布局 |
| Marked.js | Markdown 实时解析 |
| Highlight.js | 代码块语法高亮 |
| GitHub Pages | 免费静态托管 |

## 一段有趣的代码

这是博客文章加载的核心逻辑，非常简洁：

```javascript
async function loadArticle(article) {
  const response = await fetch(article.path);
  const markdown = await response.text();
  
  document.getElementById('article-content').innerHTML =
    marked.parse(markdown);
}
```

就这么几行，完成了从 `.md` 文件到精美 HTML 的全部转换魔法。

---

这里是一切的起点。接下来，我会持续在这里输出技术文章。如果你也感兴趣，欢迎 Star 我的 GitHub 仓库！
