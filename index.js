const fontLatin = '"Noto Sans", "Segoe UI", sans-serif';
const fontCyrillicGreek = '"Noto Sans", "Segoe UI", sans-serif';
const fontChinese = '"Noto Sans SC", "Microsoft YaHei", sans-serif';
const fontJapanese = '"Noto Sans JP", "Yu Gothic", sans-serif';
const fontKorean = '"Noto Sans KR", "Malgun Gothic", sans-serif';
const fontArabic = '"Noto Naskh Arabic", "Segoe UI", serif';
const fontDevanagari = '"Noto Sans Devanagari", "Nirmala UI", sans-serif';
const fontBengali = '"Noto Sans Bengali", "Nirmala UI", sans-serif';
const fontGurmukhi = '"Noto Sans Gurmukhi", "Nirmala UI", sans-serif';
const fontThai = '"Noto Sans Thai", "Leelawadee UI", sans-serif';

const greetings = [
    { lang: 'en', text: 'Hello from Dead Poet', font: fontLatin },
    { lang: 'es', text: 'Hola de Dead Poet', font: fontLatin },
    { lang: 'fr', text: 'Bonjour de Dead Poet', font: fontLatin },
    { lang: 'de', text: 'Hallo von Dead Poet', font: fontLatin },
    { lang: 'it', text: 'Ciao da Dead Poet', font: fontLatin },
    { lang: 'pt', text: 'Ola de Dead Poet', font: fontLatin },
    { lang: 'ru', text: 'Привет от Dead Poet', font: fontCyrillicGreek },
    { lang: 'zh', text: '来自Dead Poet的问候', font: fontChinese },
    { lang: 'ja', text: 'Dead Poetよりこんにちは', font: fontJapanese },
    { lang: 'ko', text: 'Dead Poet에서 인사드립니다', font: fontKorean },
    { lang: 'ar', dir: 'rtl', text: 'مرحبا من Dead Poet', font: fontArabic },
    { lang: 'hi', text: 'डेड पोएट की ओर से नमस्ते', font: fontDevanagari },
    { lang: 'mr', text: 'डेड पोएटकडून नमस्कार', font: fontDevanagari },
    { lang: 'bn', text: 'ডেড পোয়েট থেকে শুভেচ্ছা', font: fontBengali },
    { lang: 'pa', text: 'ਡੈਡ ਪੋਇਟ ਵੱਲੋਂ ਸਤ ਸ੍ਰੀ ਅਕਾਲ', font: fontGurmukhi },
    { lang: 'ur', dir: 'rtl', text: 'Dead Poet کی طرف سے سلام', font: fontArabic },
    { lang: 'tr', text: "Dead Poet'tan merhaba", font: fontLatin },
    { lang: 'id', text: 'Salam dari Dead Poet', font: fontLatin },
    { lang: 'vi', text: 'Xin chao tu Dead Poet', font: fontLatin },
    { lang: 'sw', text: 'Salamu kutoka Dead Poet', font: fontLatin },
    { lang: 'nl', text: 'Hallo van Dead Poet', font: fontLatin },
    { lang: 'pl', text: 'Witaj od Dead Poet', font: fontLatin },
    { lang: 'el', text: 'Χαιρετισμούς από Dead Poet', font: fontCyrillicGreek },
    { lang: 'th', text: 'สวัสดีจาก Dead Poet', font: fontThai }
];

const h1Element = document.querySelector('.heading h1');

if (h1Element) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headingElement = h1Element.closest('.heading');
    let currentIndex = 0;
    let fixedHeightPx = 0;

    const applyGreeting = (index) => {
        const item = greetings[index];
        h1Element.textContent = item.text;
        h1Element.style.fontFamily = item.font;
        h1Element.setAttribute('lang', item.lang);
        h1Element.setAttribute('dir', item.dir || 'ltr');
    };

    const measureMaxFontHeight = () => {
        const previousVisibility = h1Element.style.visibility;
        let maxHeight = 0;

        h1Element.style.visibility = 'hidden';

        for (const item of greetings) {
            h1Element.textContent = item.text;
            h1Element.style.fontFamily = item.font;
            h1Element.setAttribute('lang', item.lang);
            h1Element.setAttribute('dir', item.dir || 'ltr');
            const height = Math.ceil(h1Element.getBoundingClientRect().height);
            if (height > maxHeight) {
                maxHeight = height;
            }
        }

        h1Element.style.visibility = previousVisibility;
        return maxHeight;
    };

    const lockHeadingHeight = () => {
        if (!headingElement) {
            return;
        }

        const measured = measureMaxFontHeight();
        if (measured > fixedHeightPx) {
            fixedHeightPx = measured;
            headingElement.style.setProperty('--heading-fixed-height', `${fixedHeightPx}px`);
        }

        applyGreeting(currentIndex);
    };

    applyGreeting(currentIndex);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(lockHeadingHeight);
    } else {
        lockHeadingHeight();
    }

    window.addEventListener('resize', lockHeadingHeight);

    if (!prefersReducedMotion) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % greetings.length;
            applyGreeting(currentIndex);
        }, 2200);
    }
}
