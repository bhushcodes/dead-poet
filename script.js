const currentFile = window.location.pathname.split('/').pop() || 'index.html';

const poemPages = new Set([
    'poem-menu.html',
    'english-poem-menu.html',
    'hindi-poem-menu.html',
    'marathi-poem-menu.html',
    'Unheard.html',
    'Bound.html',
    'Last-Year.html',
    'मूल्यवत्ता.html',
    'निर्णय.html',
    'उलझन.html',
    'प्रश्न.html',
    'अवशेष.html',
    'आठवण.html',
    'अनंतता.html'
]);

const storyPages = new Set([
    'stories-menu.html',
    'english-stories-menu.html',
    'hindi-stories-menu.html',
    'marathi-stories-menu.html',
    'Kaalanubhav-by-Bhushan-p1.html',
    'Kaalanubhav-by-Bhushan-p2.html',
    'Kaalanubhav-by-Bhushan-p3.html',
    'Kaalanubhav-by-Bhushan-p4.html',
    'Kaalanubhav-by-Bhushan-p5.html',
    'Kaalanubhav-by-Bhushan-p6.html',
    'खोया-मन.html'
]);

const poemLanguagePages = {
    ENGLISH: new Set([
        'english-poem-menu.html',
        'Unheard.html',
        'Bound.html',
        'Last-Year.html'
    ]),
    HINDI: new Set([
        'hindi-poem-menu.html',
        'मूल्यवत्ता.html',
        'निर्णय.html',
        'उलझन.html',
        'प्रश्न.html',
        'अवशेष.html'
    ]),
    MARATHI: new Set([
        'marathi-poem-menu.html',
        'आठवण.html',
        'अनंतता.html'
    ])
};

const storyLanguagePages = {
    ENGLISH: new Set([
        'english-stories-menu.html',
        'Kaalanubhav-by-Bhushan-p1.html',
        'Kaalanubhav-by-Bhushan-p2.html',
        'Kaalanubhav-by-Bhushan-p3.html',
        'Kaalanubhav-by-Bhushan-p4.html',
        'Kaalanubhav-by-Bhushan-p5.html',
        'Kaalanubhav-by-Bhushan-p6.html'
    ]),
    HINDI: new Set([
        'hindi-stories-menu.html',
        'खोया-मन.html'
    ]),
    MARATHI: new Set([
        'marathi-stories-menu.html'
    ])
};

const languageTargetsBySection = {
    poems: [
        { key: 'ENGLISH', label: 'English', href: 'english-poem-menu.html' },
        { key: 'HINDI', label: 'Hindi', href: 'hindi-poem-menu.html' },
        { key: 'MARATHI', label: 'Marathi', href: 'marathi-poem-menu.html' }
    ],
    stories: [
        { key: 'ENGLISH', label: 'English', href: 'english-stories-menu.html' },
        { key: 'HINDI', label: 'Hindi', href: 'hindi-stories-menu.html' },
        { key: 'MARATHI', label: 'Marathi', href: 'marathi-stories-menu.html' }
    ]
};

const hashFallbackByPage = {
    'Last-Year.html': 'english-poem-menu.html',
    'अवशेष.html': 'hindi-poem-menu.html',
    'अनंतता.html': 'marathi-poem-menu.html'
};

const topPaddingState = {
    initialized: false,
    basePaddingTop: 0
};

function getActiveNavKey() {
    if (currentFile === 'index.html') {
        return 'home';
    }

    if (currentFile === 'menu.html' || currentFile === 'myself.html') {
        return 'menu';
    }

    if (poemPages.has(currentFile)) {
        return 'poems';
    }

    if (storyPages.has(currentFile)) {
        return 'stories';
    }

    return 'menu';
}

function normalizeHashLinks() {
    const fallback = hashFallbackByPage[currentFile] || 'menu.html';

    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.setAttribute('href', fallback);
        link.setAttribute('data-fixed-hash-link', 'true');
    });
}

function initializeTopPaddingState() {
    if (topPaddingState.initialized) {
        return;
    }

    const bodyStyles = window.getComputedStyle(document.body);
    topPaddingState.initialized = true;
    topPaddingState.basePaddingTop = parseFloat(bodyStyles.paddingTop) || 0;
}

function updateFixedUiOffset() {
    initializeTopPaddingState();

    const navElement = document.querySelector('.app-nav.is-visible');
    const pickerElement = document.querySelector('.section-lang-picker.is-visible');

    if (navElement && pickerElement) {
        const navBottom = Math.ceil(navElement.getBoundingClientRect().bottom);
        pickerElement.style.top = `${navBottom + 8}px`;
    } else if (pickerElement) {
        pickerElement.style.removeProperty('top');
    }

    const fixedUiElements = [navElement, pickerElement].filter(Boolean);

    if (!fixedUiElements.length) {
        document.body.style.paddingTop = `${topPaddingState.basePaddingTop}px`;
        return;
    }

    let maxBottom = 0;
    fixedUiElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        maxBottom = Math.max(maxBottom, rect.bottom);
    });

    const fixedInset = Math.max(0, Math.ceil(maxBottom + 8));
    document.body.style.paddingTop = `${topPaddingState.basePaddingTop + fixedInset}px`;
}

function syncReservedTopPadding() {
    document.body.style.paddingTop = '';
    initializeTopPaddingState();
    const base = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
    topPaddingState.basePaddingTop = base;
    updateFixedUiOffset();
}

function buildGlobalNav() {
    if (currentFile === 'index.html') {
        return;
    }

    if (document.querySelector('.app-nav')) {
        return;
    }

    const nav = document.createElement('nav');
    nav.className = 'app-nav';
    nav.setAttribute('aria-label', 'Primary Navigation');

    const links = [
        { href: 'index.html', key: 'home', label: 'HOME' },
        { href: 'menu.html', key: 'menu', label: 'MENU' },
        { href: 'poem-menu.html', key: 'poems', label: 'POEMS' },
        { href: 'stories-menu.html', key: 'stories', label: 'STORIES' }
    ];

    const activeKey = getActiveNavKey();

    links.forEach((item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        if (item.key === activeKey) {
            a.classList.add('is-active');
        }
        nav.appendChild(a);
    });

    document.body.appendChild(nav);

    requestAnimationFrame(() => {
        nav.classList.add('is-visible');
        updateFixedUiOffset();
    });
}

function getSectionKey() {
    if (poemPages.has(currentFile)) {
        return 'poems';
    }

    if (storyPages.has(currentFile)) {
        return 'stories';
    }

    return null;
}

function getCurrentLanguageKey(sectionKey) {
    const pageMap = sectionKey === 'poems' ? poemLanguagePages : storyLanguagePages;

    for (const [languageKey, pages] of Object.entries(pageMap)) {
        if (pages.has(currentFile)) {
            return languageKey;
        }
    }

    return null;
}

function buildSectionLanguageSwitcher() {
    if (currentFile === 'poem-menu.html' || currentFile === 'stories-menu.html') {
        return;
    }

    const sectionKey = getSectionKey();

    if (!sectionKey || document.querySelector('.section-lang-picker')) {
        return;
    }

    const picker = document.createElement('div');
    picker.className = 'section-lang-picker';
    picker.setAttribute('role', 'region');
    picker.setAttribute('aria-label', `${sectionKey === 'poems' ? 'Poems' : 'Short stories'} language selector`);

    const label = document.createElement('label');
    label.className = 'section-lang-picker__label';
    label.setAttribute('for', 'section-language-select');
    label.textContent = sectionKey === 'poems' ? 'POEMS LANGUAGE' : 'STORIES LANGUAGE';

    const select = document.createElement('select');
    select.className = 'section-lang-picker__select';
    select.id = 'section-language-select';
    select.setAttribute('aria-label', `${sectionKey === 'poems' ? 'Poems' : 'Stories'} language`);

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select language';
    placeholderOption.disabled = true;
    select.appendChild(placeholderOption);

    const activeLanguageKey = getCurrentLanguageKey(sectionKey);
    const languageItems = languageTargetsBySection[sectionKey];
    const hrefByValue = new Map();

    languageItems.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.key;
        option.textContent = item.label;
        select.appendChild(option);
        hrefByValue.set(item.key, item.href);
    });

    if (activeLanguageKey) {
        select.value = activeLanguageKey;
    } else {
        select.value = '';
    }

    select.addEventListener('change', () => {
        const targetHref = hrefByValue.get(select.value);
        if (!targetHref) {
            return;
        }

        document.body.classList.add('is-leaving');
        window.setTimeout(() => {
            window.location.href = targetHref;
        }, 120);
    });

    picker.appendChild(label);
    picker.appendChild(select);
    document.body.appendChild(picker);

    requestAnimationFrame(() => {
        picker.classList.add('is-visible');
        updateFixedUiOffset();
    });
}

function buildScrollProgress() {
    if (document.querySelector('.scroll-progress')) {
        return;
    }

    const progress = document.createElement('div');
    progress.className = 'scroll-progress';

    const bar = document.createElement('span');
    progress.appendChild(bar);
    document.body.appendChild(progress);

    const updateProgress = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (maxScroll <= 120) {
            progress.style.opacity = '0';
            bar.style.transform = 'scaleX(0)';
            return;
        }

        const ratio = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
        progress.style.opacity = '1';
        bar.style.transform = `scaleX(${ratio})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
}

function enableSmoothInternalTransitions() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) {
            return;
        }

        if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        event.preventDefault();
        document.body.classList.add('is-leaving');

        window.setTimeout(() => {
            window.location.href = href;
        }, 140);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    normalizeHashLinks();
    buildGlobalNav();
    buildSectionLanguageSwitcher();
    buildScrollProgress();
    enableSmoothInternalTransitions();
    syncReservedTopPadding();
    window.addEventListener('resize', syncReservedTopPadding);
    window.addEventListener('orientationchange', syncReservedTopPadding);
});
