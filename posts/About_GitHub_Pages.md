---
title: 借助 GitHub Pages 搭建博客
date: 2026-02-20
tags: [GitHub, 部署]
---

# 借助 GitHub Pages 搭建博客

GitHub Pages 是一个由 GitHub 官方提供的**免费静态网站托管服务**，非常适合个人博客、项目文档、作品集展示等场景。

> "无需服务器，无需运维，推送代码即发布。"

## 为什么选择 GitHub Pages？

相比于购买云服务器，GitHub Pages 有几个明显优势：

1. **完全免费** — 公开仓库无限制使用
2. **全球 CDN** — GitHub 的基础设施保证了加载速度
3. **HTTPS 自动化** — 无需配置 SSL 证书
4. **Git 版本控制** — 文章历史修改一目了然
5. **自定义域名** — 可以绑定你自己的域名

## 部署步骤

### 第一步：创建仓库

在 GitHub 新建一个仓库，名称推荐设置为：

```
你的用户名.github.io
```

例如，你的 GitHub 用户名是 `cooldev`，那么仓库名就是 `cooldev.github.io`，部署后访问地址就是 `https://cooldev.github.io`。

### 第二步：推送代码

在项目根目录初始化 Git：

```bash
git init
git add .
git commit -m "feat: init blog"
git branch -M main
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

### 第三步：开启 Pages

进入仓库的 **Settings** → **Pages**，在 `Source` 中选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存后等待 1~2 分钟即可访问。

## 发布新文章的流程

每次写完新文章，只需要：

```bash
# 1. 在 posts/ 文件夹下新建 .md 文件
# 2. 在 posts/manifest.json 中注册文章信息
# 3. 推送到 GitHub
git add .
git commit -m "post: 新增文章《你的文章标题》"
git push
```

推送后 GitHub Actions 会自动完成部署，无需其他操作。

---

掌握了这套流程，你就拥有了一个完全属于自己的、零成本的技术博客。
