/**
 * CorosDev - Global Main Script
 * Centralizes UI logic: Stars Animation (Delta Time), Dynamic Testimonials, and Mobile Menu.
 */

// Global state to avoid Layout Thrashing (Read once, use many)
let globalScrollY = 0;

document.addEventListener('DOMContentLoaded', () => {
    // No leemos scrollY aquí para evitar Forced Reflow; se actualizará en el primer frame/evento.

    window.addEventListener('scroll', throttle(() => {
        globalScrollY = window.scrollY || 0;
    }, 16), { passive: true });

    // 1. Menú Móvil (Presente en el header global)
    if (document.getElementById('mobile-menu-btn')) {
        initMobileMenu();
    }

    // 2. Navegación (Site Nav)
    if (document.getElementById('site-nav')) {
        initScrollNav();
    }

    // 3. Efecto Tilt (Solo si hay elementos .tilt)
    if (document.querySelectorAll('.tilt').length > 0) {
        initTilt();
    }

    // 4. Generador de Estrellas (Solo si existen los nodos de renderizado)
    if (document.getElementById('stars-1')) {
        requestAnimationFrame(initCSSStars);
    }

    // Priority 3: Non-critical DOM manipulation
    const lowPriorityTasks = () => {
        initDynamicMarquee();
        initScrollReveal();
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(lowPriorityTasks);
    } else {
        setTimeout(lowPriorityTasks, 1000);
    }
});

/**
 * Performance Helpers
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 0. Navigation Scroll Effect
 */
function initScrollNav() {
    const siteNav = document.getElementById('site-nav');
    if (!siteNav) return;

    let isScrolled = false;
    const toggleNavGlass = () => {
        const shouldBeScrolled = globalScrollY > 10;
        if (shouldBeScrolled !== isScrolled) {
            isScrolled = shouldBeScrolled;
            if (isScrolled) siteNav.classList.add('scrolled');
            else siteNav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', throttle(() => requestAnimationFrame(toggleNavGlass), 60), { passive: true });
}

/**
 * 1. Optimized Tilt Effect
 * Caches dimensions on mouseenter to avoid Layout Thrashing.
 */
function initTilt() {
    document.querySelectorAll('.tilt').forEach(el => {
        let rafId = null;
        let r = null;
        
        el.addEventListener('mouseenter', () => {
            r = el.getBoundingClientRect();
        });

        el.addEventListener('mousemove', (e) => {
            if (rafId || !r) return;
            rafId = requestAnimationFrame(() => {
                const x = e.clientX - r.left, y = e.clientY - r.top;
                const rx = ((y / r.height) - .5) * -8;
                const ry = ((x / r.width) - .5) * 8;
                el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                rafId = null;
            });
        });

        el.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
            el.style.transform = 'perspective(1000px)';
        });
    });
}

/**
 * 4. Scroll Reveal via IntersectionObserver
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-item');
    if (revealElements.length === 0) return;

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target?.classList.add('active');
                // Dejamos de observar para liberar memoria una vez animado
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });
}


/**
 * Genera un mapa de estrellas usando box-shadow para que el CSS lo mueva.
 * Esto libera el hilo principal (Main Thread) al 100%.
 */
function initCSSStars() {
    const createLayer = (id, count, size) => {
        const el = document.getElementById(id);
        if (!el) return;
        let shadows = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000;
            const y = Math.random() * 2000;
            shadows.push(`${x}px ${y}px #FFF`);
            // Añadir un "glow" baked-in para las estrellas más grandes
            if (size > 1) {
                shadows.push(`${x}px ${y}px 5px rgba(255, 255, 255, 0.5)`);
            }
        }
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.boxShadow = shadows.join(', ');
    };

    createLayer('stars-1', 100, 1);
    createLayer('stars-2', 50, 2);
}

/**
 * 2. Dynamic Marquee for Testimonials
 * Clones nodes automatically to keep HTML clean and translations unique.
 */
function initDynamicMarquee() {
    const track = document.querySelector('.marquee-content');
    if (!track) return;

    // Get original items before cloning
    const originalItems = Array.from(track.children);
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
}

/**
 * 3. Mobile Menu Logic
 * Handled via Event Listeners to avoid scope issues with defer scripts.
 */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const h1 = document.getElementById('ham-1'), h2 = document.getElementById('ham-2'), h3 = document.getElementById('ham-3');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        if (h1) h1.style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
        if (h2) h2.style.opacity = isOpen ? '0' : '1';
        if (h3) h3.style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('open');
            if (h1) h1.style.transform = '';
            if (h2) h2.style.opacity = '1';
            if (h3) h3.style.transform = '';
        }
    });
}