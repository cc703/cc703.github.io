document.addEventListener('DOMContentLoaded', () => {
    // 1. 自定义鼠标跟随效果
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // 如果是触摸屏设备则移除自定义光标
    if (window.matchMedia("(pointer: coarse)").matches) {
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
        document.body.style.cursor = 'auto';
    } else {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot 实时跟随
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline 带有微小延迟的丝滑跟随
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // 鼠标悬停在链接上时的动效
        const links = document.querySelectorAll('a, .post-card');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(209, 255, 26, 0.1)';
                cursorOutline.style.borderColor = 'transparent';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            link.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorOutline.style.borderColor = 'var(--text-secondary)';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    // 2. 页面向下滚动时卡片的出现动画（Intersection Observer）
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.post-card').forEach(card => {
        observer.observe(card);
    });
});