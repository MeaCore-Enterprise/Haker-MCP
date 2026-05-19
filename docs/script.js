// =============================================
// HAKER-MCP — Scripts
// Particles, animations, interactivity
// =============================================

// Fallback: Show all content immediately if JS loads but something fails
setTimeout(() => {
    document.querySelectorAll('.reveal.hidden').forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('visible');
    });
}, 5000);

document.addEventListener('DOMContentLoaded', () => {

    /* =========== PARTICLES BACKGROUND =========== */

    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let animId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
                ctx.fill();
            }
        }

        const particleCount = Math.min(Math.floor(canvas.width * canvas.height / 12000), 80);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 140;
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            animId = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            particles.forEach(p => {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.x -= dx * force * 0.008;
                    p.y -= dy * force * 0.008;
                }
            });
        });
    }

    /* =========== TYPEWRITER EFFECT =========== */

    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        const text = typewriterEl.textContent.trim();
        const chars = text.split('');
        typewriterEl.textContent = '';
        let i = 0;
        function type() {
            if (i < chars.length) {
                typewriterEl.textContent += chars[i];
                i++;
                setTimeout(type, 60 + Math.random() * 40);
            }
        }
        setTimeout(type, 600);
    }

    /* =========== COUNTER ANIMATION =========== */

    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                if (target === 0) {
                    el.textContent = '0';
                    return;
                }
                let current = 0;
                const increment = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current;
                }, 30);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    /* =========== SCROLL REVEAL =========== */

    const revealEls = document.querySelectorAll('.reveal');
    
    // Add hidden class initially so content is invisible before JS runs
    revealEls.forEach(el => el.classList.add('hidden'));
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                const delay = Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
                    .indexOf(entry.target) * 100;
                setTimeout(() => {
                    entry.target.classList.remove('hidden');
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* =========== 3D TILT ON FEATURE CARDS =========== */

    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    /* =========== TABS =========== */

    const tabBtns = document.querySelectorAll('.tabs__btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.tabs');
            parent.querySelector('.tabs__btn.active')?.classList.remove('active');
            btn.classList.add('active');
            parent.querySelectorAll('.tabs__panel').forEach(p => p.classList.remove('active'));
            const tabId = btn.dataset.tab;
            const panel = document.getElementById(`tab-${tabId}`);
            if (panel) panel.classList.add('active');
        });
    });

    /* =========== CODE COPY =========== */

    document.querySelectorAll('.code-copy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = 'Copiado';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copiar';
                    btn.classList.remove('copied');
                }, 2000);
            } catch {
                btn.textContent = 'Error';
            }
        });
    });

    /* =========== TOOLS SEARCH =========== */

    const searchInput = document.getElementById('toolSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const categories = document.querySelectorAll('.tool-category');

            categories.forEach(cat => {
                if (!query) {
                    cat.classList.remove('hidden');
                    cat.querySelectorAll('.tool-item').forEach(item => item.classList.remove('hidden'));
                    return;
                }

                const items = cat.querySelectorAll('.tool-item');
                let hasVisible = false;

                items.forEach(item => {
                    const searchData = item.dataset.search || '';
                    const match = searchData.toLowerCase().includes(query);
                    item.classList.toggle('hidden', !match);
                    if (match) hasVisible = true;
                });

                cat.classList.toggle('hidden', !hasVisible);
            });
        });
    }

    /* =========== TERMINAL SIMULATION =========== */

    const terminalBody = document.getElementById('terminalBody');
    if (terminalBody) {
        const lines = [
            { text: '> Haker-MCP v4.0.0', cls: 'terminal__line', delay: 500 },
            { text: '> ✓ Loaded 32 tools', cls: 'terminal__line', delay: 1500 },
            { text: '> ✓ MCP server ready', cls: 'terminal__line', delay: 2500 },
            { text: '> Listening on stdio...', cls: 'terminal__line', delay: 3500 },
        ];

        const terminalObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let existingLines = terminalBody.querySelectorAll('.terminal__line');
                let idx = 0;

                function addNextLine() {
                    if (idx >= lines.length) return;
                    const line = lines[idx];
                    const div = document.createElement('div');
                    div.className = line.cls;
                    div.style.animationDelay = '0s';

                    if (idx === 0) {
                        div.innerHTML = `<span class="terminal__prompt">$</span> <span class="terminal__cmd">${line.text}</span>`;
                    } else {
                        div.textContent = line.text;
                    }

                    terminalBody.appendChild(div);
                    idx++;
                    setTimeout(addNextLine, line.delay);
                }

                setTimeout(addNextLine, 300);
                terminalObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.3 });

        terminalObserver.observe(terminalBody);
    }

    /* =========== THEME TOGGLE =========== */

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    /* =========== SMOOTH SCROLL OFFSET =========== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* =========== HEADER SCROLL SHADOW =========== */

    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.style.borderBottomColor = 'var(--border-hover)';
            } else {
                header.style.borderBottomColor = 'var(--border)';
            }
        });
    }

    console.log('%c Haker-MCP %c v4.0.0 ', 'background:#00ff88;color:#000;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold', 'background:#12121a;color:#e4e4e7;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:bold');
    console.log('32 tools · 8 categorías · 0 dependencias extra');
});
