// =============================================
// HAKER-MCP — Scripts
// Robust, no-dependency, error-tolerant
// =============================================

(function() {
    'use strict';

    // Fallback: ensure content is visible even if JS fails
    function ensureVisible() {
        var hidden = document.querySelectorAll('.reveal.hidden');
        for (var i = 0; i < hidden.length; i++) {
            hidden[i].classList.remove('hidden');
            hidden[i].classList.add('visible');
        }
    }

    // Run fallback after 3 seconds
    setTimeout(ensureVisible, 3000);

    // Main init
    function init() {
        try {
            initParticles();
            initTypewriter();
            initCounters();
            initScrollReveal();
            initTilt();
            initTabs();
            initCopyButtons();
            initSearch();
            initTerminal();
            initThemeToggle();
            initSmoothScroll();
            initHeaderScroll();
        } catch (e) {
            console.error('Haker-MCP init error:', e);
            ensureVisible();
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* =========== PARTICLES =========== */

    function initParticles() {
        var canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        var particles = [];
        var mouseX = -1000, mouseY = -1000;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        var count = Math.min(Math.floor(canvas.width * canvas.height / 12000), 80);
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.1
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 255, 136, ' + p.opacity + ')';
                ctx.fill();
            }

            // Draw connections
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        var alpha = (1 - dist / 140) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(0, 255, 136, ' + alpha + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                var dx = mouseX - p.x;
                var dy = mouseY - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    var force = (150 - dist) / 150;
                    p.x -= dx * force * 0.008;
                    p.y -= dy * force * 0.008;
                }
            }
        });
    }

    /* =========== TYPEWRITER =========== */

    function initTypewriter() {
        var el = document.getElementById('typewriter');
        if (!el) return;

        var text = el.textContent.trim();
        el.textContent = '';
        var i = 0;

        function type() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, 60 + Math.random() * 40);
            }
        }
        setTimeout(type, 600);
    }

    /* =========== COUNTERS =========== */

    function initCounters() {
        var counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters.length) return;

        // Use IntersectionObserver if available, otherwise animate immediately
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(function(c) { observer.observe(c); });
        } else {
            counters.forEach(animateCounter);
        }
    }

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        if (target === 0) { el.textContent = '0'; return; }

        var current = 0;
        var increment = Math.ceil(target / 40);
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 30);
    }

    /* =========== SCROLL REVEAL =========== */

    function initScrollReveal() {
        var reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        // Hide initially
        for (var i = 0; i < reveals.length; i++) {
            reveals[i].classList.add('hidden');
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var siblings = entry.target.parentElement.querySelectorAll('.reveal');
                        var idx = Array.prototype.indexOf.call(siblings, entry.target);
                        setTimeout(function() {
                            entry.target.classList.remove('hidden');
                            entry.target.classList.add('visible');
                        }, idx * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            reveals.forEach(function(el) { observer.observe(el); });
        } else {
            // Fallback: show everything
            for (var i = 0; i < reveals.length; i++) {
                reveals[i].classList.remove('hidden');
                reveals[i].classList.add('visible');
            }
        }
    }

    /* =========== 3D TILT =========== */

    function initTilt() {
        var cards = document.querySelectorAll('[data-tilt]');
        cards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateX = (y - centerY) / centerY * -8;
                var rotateY = (x - centerX) / centerX * 8;
                card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
            });
        });
    }

    /* =========== TABS =========== */

    function initTabs() {
        var btns = document.querySelectorAll('.tabs__btn');
        btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var parent = btn.closest('.tabs');
                if (!parent) return;

                // Remove active from all buttons in this tab group
                var allBtns = parent.querySelectorAll('.tabs__btn');
                for (var i = 0; i < allBtns.length; i++) {
                    allBtns[i].classList.remove('active');
                }

                // Add active to clicked button
                btn.classList.add('active');

                // Hide all panels
                var panels = parent.querySelectorAll('.tabs__panel');
                for (var i = 0; i < panels.length; i++) {
                    panels[i].classList.remove('active');
                }

                // Show target panel
                var tabId = btn.getAttribute('data-tab');
                var panel = document.getElementById('tab-' + tabId);
                if (panel) panel.classList.add('active');
            });
        });
    }

    /* =========== COPY BUTTONS =========== */

    function initCopyButtons() {
        var btns = document.querySelectorAll('.code-copy');
        btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var text = btn.getAttribute('data-copy');
                if (!text) return;

                // Try modern clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function() {
                        showCopied(btn);
                    }).catch(function() {
                        fallbackCopy(text, btn);
                    });
                } else {
                    fallbackCopy(text, btn);
                }
            });
        });
    }

    function fallbackCopy(text, btn) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopied(btn);
        } catch (e) {
            btn.textContent = 'Error';
        }
        document.body.removeChild(textarea);
    }

    function showCopied(btn) {
        btn.textContent = 'Copiado';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = 'Copiar';
            btn.classList.remove('copied');
        }, 2000);
    }

    /* =========== TOOLS SEARCH =========== */

    function initSearch() {
        var input = document.getElementById('toolSearch');
        if (!input) return;

        input.addEventListener('input', function() {
            var query = input.value.toLowerCase().trim();
            var categories = document.querySelectorAll('.tool-category');

            for (var i = 0; i < categories.length; i++) {
                var cat = categories[i];
                var items = cat.querySelectorAll('.tool-item');
                var hasVisible = false;

                if (!query) {
                    cat.classList.remove('hidden');
                    for (var j = 0; j < items.length; j++) {
                        items[j].classList.remove('hidden');
                    }
                    continue;
                }

                for (var j = 0; j < items.length; j++) {
                    var searchData = items[j].getAttribute('data-search') || '';
                    var match = searchData.toLowerCase().indexOf(query) !== -1;
                    if (match) {
                        items[j].classList.remove('hidden');
                        hasVisible = true;
                    } else {
                        items[j].classList.add('hidden');
                    }
                }

                if (hasVisible) {
                    cat.classList.remove('hidden');
                } else {
                    cat.classList.add('hidden');
                }
            }
        });
    }

    /* =========== TERMINAL =========== */

    function initTerminal() {
        var body = document.getElementById('terminalBody');
        if (!body) return;

        var lines = [
            { text: '> Haker-MCP v4.0.0', delay: 500 },
            { text: '> ✓ Loaded 32 tools', delay: 1500 },
            { text: '> ✓ MCP server ready', delay: 2500 },
            { text: '> Listening on stdio...', delay: 3500 }
        ];

        function addLine(idx) {
            if (idx >= lines.length) return;
            var line = lines[idx];
            var div = document.createElement('div');
            div.className = 'terminal__line';
            div.style.animationDelay = '0s';

            if (idx === 0) {
                div.innerHTML = '<span class="terminal__prompt">$</span> <span class="terminal__cmd">' + line.text + '</span>';
            } else {
                div.textContent = line.text;
            }

            body.appendChild(div);
            idx++;
            setTimeout(function() { addLine(idx); }, line.delay);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    setTimeout(function() { addLine(0); }, 300);
                    observer.unobserve(entries[0].target);
                }
            }, { threshold: 0.3 });
            observer.observe(body);
        } else {
            setTimeout(function() { addLine(0); }, 300);
        }
    }

    /* =========== THEME TOGGLE =========== */

    function initThemeToggle() {
        var toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        var saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);

        toggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    /* =========== SMOOTH SCROLL =========== */

    function initSmoothScroll() {
        var anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                var href = anchor.getAttribute('href');
                if (href === '#') return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var offset = 80;
                    var top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        });
    }

    /* =========== HEADER SCROLL =========== */

    function initHeaderScroll() {
        var header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                header.style.borderBottomColor = 'var(--border-hover)';
            } else {
                header.style.borderBottomColor = 'var(--border)';
            }
        });
    }

    // Debug log
    console.log('%c Haker-MCP %c v4.0.0 ', 'background:#00ff88;color:#000;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold', 'background:#12121a;color:#e4e4e7;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:bold');
    console.log('32 tools · 8 categorías · 0 dependencias extra');

})();
