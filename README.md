# cc703's Blog 🖥️

> 一个仿 Visual Studio Code 风格的个人极客博客，基于纯静态 HTML/CSS/JS 构建，部署在 GitHub Pages。

🔗 **访问地址**: [https://cc703.github.io](https://cc703.github.io)

---

## 技术栈

- 纯 HTML + CSS + JavaScript（无框架）
- [Tailwind CSS](https://tailwindcss.com/) — 实用 CSS 框架
- [marked.js](https://marked.js.org/) — Markdown 渲染
- [highlight.js](https://highlightjs.org/) — 代码语法高亮
- GitHub Pages — 静态托管

## 项目结构

```
├── index.html          # 页面骨架
├── css/style.css       # 全局样式
├── js/app.js           # 业务逻辑（文章扫描、渲染）
├── posts/              # 所有文章（.md 文件）
│   └── *.md
└── .nojekyll           # 禁用 Jekyll，确保文件路径正确
```

## 新增文章

1. 在 `posts/` 目录下新建 `.md` 文件
2. 文件开头添加 frontmatter：
   ```markdown
   ---
   title: 文章标题
   date: 2026-01-01
   tags: [标签1, 标签2]
   ---
   正文内容...
   ```
3. `git add` → `git commit` → `git push`，网站自动更新
