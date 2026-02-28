        // ── Marked.js 配置：使用 custom renderer 进行代码高亮 ──────────
        const renderer = new marked.Renderer();
        renderer.code = function (code, language) {
            const lang = hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = hljs.highlight(code, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        };
        marked.setOptions({ renderer, breaks: true });

        const data = {
            home: {
                project: 'PROJECT_AI_CORE',
                files: [
                    { name: 'Dashboard', icon: 'fas fa-tachometer-alt text-blue-400', type: 'dashboard' },
                    { name: 'README.md', icon: 'fas fa-info-circle text-blue-400', type: 'code' }
                ],
                content: { readme: `1| <span style="color:#6a9955"># 项目介绍</span>\n2| \n3| <span style="color:#569cd6">const</span> <span style="color:#dcdcaa">AI_Core</span> = () => {\n4| &nbsp;&nbsp;<span style="color:#c586c0">return</span> <span style="color:#ce9178">"Powerful Engine"</span>;\n5| }` }
            },
            contact: {
                project: 'CONTACT_CENTER',
                files: [
                    { name: 'Connect_Card', icon: 'fas fa-id-card text-orange-400', type: 'contact_view' },
                    { name: 'credentials.json', icon: 'fas fa-lock text-yellow-500', type: 'code' }
                ],
                content: { 'credentials.json': `1| {\n2| &nbsp;&nbsp;<span style="color:#ce9178">"status"</span>: <span style="color:#ce9178">"active"</span>,\n3| &nbsp;&nbsp;<span style="color:#ce9178">"open_to_work"</span>: <span style="color:#569cd6">true</span>\n4| }` }
            }
        };
        const BLOG_CONFIG = {
            githubUser: 'cc703',
            githubRepo: 'cc703.github.io',
        };
        function detectGitHubInfo() {
            const host = location.hostname;
            if (!host.endsWith('.github.io')) return null;
            const user = host.replace('.github.io', '');
            const parts = location.pathname.split('/').filter(Boolean);
            const repo = parts.length > 0 ? parts[0] : `${user}.github.io`;
            return { user, repo };
        }
        function parseFrontmatter(raw) {
            const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
            if (!match) return { meta: {}, body: raw };
            const meta = {};
            match[1].split('\n').forEach(line => {
                const colonIdx = line.indexOf(':');
                if (colonIdx === -1) return;
                const key = line.slice(0, colonIdx).trim();
                const val = line.slice(colonIdx + 1).trim();
                if (val.startsWith('[') && val.endsWith(']')) {
                    meta[key] = val.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean);
                } else {
                    meta[key] = val;
                }
            });
            return { meta, body: raw.slice(match[0].length) };
        }

        // ── 模块切换入口 ─────────────────────────────────────────────────
        async function switchModule(moduleId) {
            document.querySelectorAll('.activity-icon').forEach(el => el.classList.remove('active'));
            document.getElementById(`btn-${moduleId}`).classList.add('active');
            document.getElementById('article-breadcrumb').style.display = 'none';
            document.getElementById('status-reading-time').innerText = '';

            if (moduleId === 'blog') {
                await loadBlogModule();
                return;
            }
            const mod = data[moduleId];
            if (!mod) return;
            buildSidebar(mod.files, moduleId);
            render(mod.files[0], moduleId);
        }

        // ── 博客模块主入口：自动扫描，三级降级策略 ───────────────────────
        // 优先级: GitHub Contents API → manifest.json → 错误提示
        async function loadBlogModule() {
            document.getElementById('project-name').innerText = 'MY_ARTICLES';
            showArticleLoading('正在扫描 posts/ 目录...');

            // ▶ 策略 1: GitHub Contents API 自动扫描
            const autoInfo = detectGitHubInfo();
            const cfgInfo = (BLOG_CONFIG.githubUser && BLOG_CONFIG.githubRepo)
                ? { user: BLOG_CONFIG.githubUser, repo: BLOG_CONFIG.githubRepo }
                : null;
            const ghInfo = autoInfo || cfgInfo;

            if (ghInfo) {
                const { user, repo } = ghInfo;
                try {
                    const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/posts`;
                    const res = await fetch(apiUrl, {
                        headers: { Accept: 'application/vnd.github.v3+json' }
                    });
                    if (res.ok) {
                        const files = await res.json();
                        const mdFiles = files
                            .filter(f => f.type === 'file' && f.name.endsWith('.md'))
                            .map(f => ({
                                name: f.name,
                                path: `posts/${f.name}`,
                                download_url: f.download_url,
                                date: '…',
                                tags: []
                            }));
                        if (mdFiles.length > 0) {
                            renderBlogSidebar(mdFiles, 'GitHub API');
                            // 并行拉取所有文章的 frontmatter，渐进更新侧边栏日期
                            prefetchFrontmatters(mdFiles);
                            return;
                        }
                    }
                } catch (e) { /* 降级 */ }
            }

            // ▶ 策略 2: 本地 manifest.json（Live Server 开发时使用）
            try {
                const res = await fetch('./posts/manifest.json');
                if (!res.ok) throw new Error();
                const manifest = await res.json();
                renderBlogSidebar(manifest, 'manifest.json');
            } catch (err) {
                showArticleError(
                    `无法自动扫描文章目录。<br>
                    <small style="line-height:2">
                      ① 如需本地预览，请安装 VS Code <b>Live Server</b> 插件并点击"Open with Live Server"。<br>
                      ② 如已部署到 GitHub Pages，请在 <code>BLOG_CONFIG</code> 中填写 <code>githubUser</code> 与 <code>githubRepo</code>。
                    </small>`
                );
            }
        }

        // ── 渲染侧边栏文章列表 ─────────────────────────────────────────────
        function renderBlogSidebar(articles, source) {
            const list = document.getElementById('sidebar-content');
            list.innerHTML = `
                <div class="px-3 py-2 flex justify-between items-center text-[11px] text-gray-500 border-b border-[#2b2b2b] mb-1">
                    <span>POSTS</span>
                    <span class="sidebar-badge" title="来源: ${source}">${articles.length}</span>
                </div>`;

            articles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'blog-item';
                item.dataset.name = article.name;
                item.innerHTML = `
                    <div class="blog-item-inner">
                        <i class="fab fa-markdown text-blue-400 mt-0.5 shrink-0"></i>
                        <div class="blog-item-info">
                            <span class="blog-item-name">${article.name}</span>
                            <span class="blog-item-date" id="date-${article.name}">${article.date || '…'}</span>
                        </div>
                    </div>`;
                item.onclick = () => loadArticle(article, item);
                list.appendChild(item);
            });

            // 打开第一篇
            if (articles.length > 0) {
                const firstItem = list.querySelector('.blog-item');
                loadArticle(articles[0], firstItem);
            }
        }

        // ── 并行预取所有文章的 frontmatter，渐进更新侧边栏日期 ────────────
        async function prefetchFrontmatters(articles) {
            await Promise.allSettled(articles.map(async article => {
                try {
                    const res = await fetch(article.download_url || article.path);
                    if (!res.ok) return;
                    const raw = await res.text();
                    const { meta } = parseFrontmatter(raw);
                    if (meta.date) {
                        // 更新 article 对象
                        article.date = meta.date;
                        article.tags = meta.tags || [];
                        // 更新侧边栏 DOM
                        const el = document.getElementById(`date-${article.name}`);
                        if (el) el.textContent = meta.date;
                    }
                } catch (e) { /* 忽略单篇失败 */ }
            }));
        }

        // ── 加载并渲染某篇 Markdown 文章 ─────────────────────────────────
        async function loadArticle(article, itemEl) {
            document.querySelectorAll('.blog-item').forEach(el => el.classList.remove('active'));
            if (itemEl) itemEl.classList.add('active');

            document.getElementById('tab-name').innerText = article.name;
            document.getElementById('status-mode').innerText = article.name;
            document.getElementById('status-reading-time').innerText = '';
            showArticleLoading(`正在打开 ${article.name}...`);

            try {
                const res = await fetch(article.download_url || article.path);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const raw = await res.text();

                // 解析 frontmatter，分离元信息和正文
                const { meta, body } = parseFrontmatter(raw);
                const tags = meta.tags || article.tags || [];
                const date = meta.date || article.date || '';

                // 更新面包屑（含标签）
                const breadcrumb = document.getElementById('article-breadcrumb');
                breadcrumb.style.display = 'flex';
                const tagsHtml = tags.map(t => `<span class="bc-tag">${t}</span>`).join('');
                breadcrumb.innerHTML = `
                    <span class="bc-dim">POSTS</span>
                    <span class="bc-sep">›</span>
                    <span class="bc-file"><i class="fab fa-markdown mr-1 text-blue-400"></i>${article.name}</span>
                    ${date ? `<span class="bc-dim bc-sep">${date}</span>` : ''}
                    <span class="bc-tags">${tagsHtml}</span>`;

                document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
                document.getElementById('view-article').classList.add('active');

                const contentEl = document.getElementById('article-content');
                contentEl.innerHTML = `<div class="markdown-body fade-in">${marked.parse(body)}</div>`;
                contentEl.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
                document.getElementById('article-scroll-area').scrollTop = 0;

                // 估算阅读时间
                const wordCount = body.replace(/```[\s\S]*?```/g, '').trim().split(/\s+/).length;
                const mins = Math.max(1, Math.ceil(wordCount / 200));
                document.getElementById('status-reading-time').innerText = `阅读约 ${mins} 分钟`;

            } catch (err) {
                showArticleError(`无法加载 "${article.path}"<br><small>${err.message}</small>`);
            }
        }

        // ── 加载中 / 错误占位 ──────────────────────────────────────────────
        function showArticleLoading(msg) {
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            document.getElementById('view-article').classList.add('active');
            document.getElementById('article-content').innerHTML = `
                <div class="article-loading">
                    <div class="loading-terminal">
                        <span class="loading-caret">›</span>
                        <span class="loading-text">${msg}</span>
                        <span class="loading-cursor">_</span>
                    </div>
                </div>`;
        }

        function showArticleError(msg) {
            document.getElementById('article-content').innerHTML = `
                <div class="article-error">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
                    <p>${msg}</p>
                </div>`;
        }

        // ── 非博客模块通用侧边栏 ──────────────────────────────────────────
        function buildSidebar(files, moduleId) {
            document.getElementById('project-name').innerText = data[moduleId].project;
            const list = document.getElementById('sidebar-content');
            list.innerHTML = '';
            files.forEach(f => {
                const item = document.createElement('div');
                item.className = 'sidebar-item ml-4';
                item.innerHTML = `<i class="${f.icon}"></i> ${f.name}`;
                item.onclick = () => render(f, moduleId);
                list.appendChild(item);
            });
        }

        // ── 非博客模块的静态视图渲染 ──────────────────────────────────────
        function render(file, mid) {
            document.getElementById('tab-name').innerText = file.name;
            document.getElementById('status-mode').innerText = file.name;
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));

            if (file.type === 'dashboard') {
                document.getElementById('view-dashboard').classList.add('active');
            } else if (file.type === 'contact_view') {
                document.getElementById('view-contact').classList.add('active');
            } else if (file.type === 'code') {
                document.getElementById('view-code').classList.add('active');
                const raw = data[mid].content[file.name]
                    || data[mid].content['readme']
                    || data[mid].content['credentials.json'];
                document.getElementById('view-code').innerHTML = raw.split('\n').map(l => {
                    const [n, ...r] = l.split('|');
                    return `<div class="line"><span class="line-num">${n}</span><span>${r.join('|')}</span></div>`;
                }).join('');
            } else {
                document.getElementById('view-article').classList.add('active');
                const rawMd = data[mid].content[file.name] || '# 内容为空';
                document.getElementById('article-content').innerHTML = `<div class="markdown-body fade-in">${marked.parse(rawMd)}</div>`;
            }
        }

        // ── 复制到剪贴板 ──────────────────────────────────────────────────
        function copyToClipboard(text, msg) {
            navigator.clipboard.writeText(text).catch(() => {
                const el = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            });
            const toast = document.getElementById('copy-toast');
            toast.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }

        // ── 打字机动效 ────────────────────────────────────────────────────
        const text = "AI_STUDENT";
        let idx = 0;
        function typing() {
            if (idx < text.length) {
                document.getElementById("typewriter").innerHTML += text.charAt(idx);
                idx++;
                setTimeout(typing, 150);
            }
        }

        window.onload = () => { switchModule('home'); typing(); };
