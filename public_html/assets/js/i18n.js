// Çok dilli arayüz (TR / EN).
// Sayfa Türkçe yazılır; EN seçiliyse DOM'daki metinler i18n_en.js sözlüğü ile çevrilir.
// Dinamik eklenen içerik (tablolar, modallar, bildirimler) MutationObserver ile yakalanır.
// <head> içinde, diğer script'lerden önce yüklenmelidir.
(function () {
    if (window.I18N) return;

    var STORAGE_KEY = 'site_lang';
    var lang = 'tr';
    try { lang = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr'; } catch (e) { }
    // ?lang=en / ?lang=tr bağlantıları seçimi kalıcı olarak değiştirir
    var urlLang = /[?&]lang=(en|tr)\b/.exec(location.search);
    if (urlLang) {
        lang = urlLang[1];
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { }
    }

    var scriptEl = document.currentScript;
    var basePath = scriptEl && scriptEl.src ? scriptEl.src.replace(/i18n\.js(\?.*)?$/, '') : 'assets/js/';
    var version = scriptEl && scriptEl.src && /\?v=([^&]+)/.test(scriptEl.src) ? RegExp.$1 : '1';

    function setLang(next) {
        next = next === 'en' ? 'en' : 'tr';
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { }
        if (next !== lang) location.reload();
    }

    window.I18N = {
        lang: lang,
        setLang: setLang,
        toggle: function () { setLang(lang === 'en' ? 'tr' : 'en'); },
        t: function (s) { return s; }
    };

    // Diğer sekmelerde dil değişirse bu sekmeyi de güncelle
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY && (e.newValue === 'en' ? 'en' : 'tr') !== lang) location.reload();
    });

    document.documentElement.setAttribute('lang', lang);

    // ---- Dil seçici düğmesi (her iki dilde de gösterilir) ----
    var css = document.createElement('style');
    css.textContent =
        '.i18n-switch{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.35);border-radius:999px;overflow:hidden;font-size:.75rem;font-weight:700;line-height:1;vertical-align:middle}' +
        '.i18n-switch button{background:transparent;border:0;color:inherit;padding:.35rem .6rem;cursor:pointer;opacity:.65}' +
        '.i18n-switch button.active{background:rgba(255,255,255,.9);color:#1f2937;opacity:1}' +
        '.i18n-switch button:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px}' +
        '.navbar .i18n-nav-item{display:flex;align-items:center;padding:.25rem .5rem;color:#fff}' +
        '.i18n-floating{position:fixed;left:12px;bottom:12px;z-index:2000;background:#1f2937;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25)}' +
        'html.i18n-pending body{visibility:hidden}';
    (document.head || document.documentElement).appendChild(css);

    function buildSwitch() {
        var wrap = document.createElement('div');
        wrap.className = 'i18n-switch notranslate';
        wrap.setAttribute('data-i18n-skip', '');
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', lang === 'en' ? 'Language' : 'Dil');
        [['tr', 'TR', 'Türkçe'], ['en', 'EN', 'English']].forEach(function (o) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = o[1];
            b.title = o[2];
            b.setAttribute('aria-pressed', String(lang === o[0]));
            if (lang === o[0]) b.className = 'active';
            b.addEventListener('click', function (ev) { ev.preventDefault(); setLang(o[0]); });
            wrap.appendChild(b);
        });
        return wrap;
    }

    function mountSwitch() {
        if (document.querySelector('.i18n-switch')) return;
        var nav = document.querySelector('nav.navbar .navbar-nav');
        if (nav && nav.tagName === 'UL') {
            var li = document.createElement('li');
            li.className = 'nav-item i18n-nav-item';
            li.setAttribute('data-i18n-skip', '');
            li.appendChild(buildSwitch());
            nav.appendChild(li);
        } else if (document.body) {
            var s = buildSwitch();
            s.classList.add('i18n-floating');
            document.body.appendChild(s);
        }
    }

    function onReady(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    onReady(mountSwitch);

    if (lang !== 'en') return;

    // ---- EN: sözlüğü yükle ve sayfayı çevir ----
    document.documentElement.classList.add('i18n-pending');
    var revealTimer = setTimeout(reveal, 2500); // sözlük yüklenemezse sayfayı gizli bırakma
    function reveal() {
        clearTimeout(revealTimer);
        document.documentElement.classList.remove('i18n-pending');
    }

    var DICT = null;
    var GLOSS = null;
    var GLOSS_MAX_WORDS = 1;
    var cache = new Map();
    var LETTER = /[A-Za-zÇĞİÖŞÜçğıöşü]/;
    var TOKEN_RE = /[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu;
    var WORD_RE = /^[\p{L}\p{N}]/u;

    function trUpperFirst(s) { return s.charAt(0).toLocaleUpperCase('tr') + s.slice(1); }
    function trLowerFirst(s) { return s.charAt(0).toLocaleLowerCase('tr') + s.slice(1); }
    function enUpperFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function prepare() {
        var src = window.I18N_EN || {};
        DICT = Object.create(null);
        Object.keys(src).forEach(function (k) { DICT[k.replace(/\s+/g, ' ').trim()] = src[k]; });

        // Kısa ifadelerden kelime/ifade sözlüğü: tam eşleşmeyen uzun metinlerde parça parça çeviri için
        GLOSS = Object.create(null);
        var exclude = {};
        (window.I18N_EN_GLOSSARY_EXCLUDE || []).forEach(function (k) { exclude[k] = 1; });
        function set(k, v) { if (!(k in GLOSS) && !exclude[k]) GLOSS[k] = v; }
        function addGloss(k, v) {
            if (!k || v == null || /\{\d\}/.test(k) || exclude[k] || !WORD_RE.test(k)) return;
            var words = k.split(' ').length;
            if (words > GLOSS_MAX_WORDS) GLOSS_MAX_WORDS = words;
            set(k, v);
            set(trLowerFirst(k), /^[A-Z]{2}/.test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1));
            set(trUpperFirst(k), enUpperFirst(v));
            set(k.toLocaleUpperCase('tr'), v.toUpperCase());
        }
        var extra = window.I18N_EN_GLOSSARY || {};
        Object.keys(extra).forEach(function (k) { addGloss(k, extra[k]); });
        Object.keys(DICT).forEach(function (k) {
            if (k.length <= 50 && k.split(' ').length <= 6 && /[\p{L}\p{N}]$/u.test(k)) addGloss(k, DICT[k]);
        });
    }

    // Metni kelimelere bölüp en uzun sözlük ifadesinden başlayarak parça parça çevirir
    function glossaryTranslate(text) {
        var tokens = text.match(TOKEN_RE);
        if (!tokens) return null;
        var out = [], changed = false;
        for (var i = 0; i < tokens.length; i++) {
            if (!WORD_RE.test(tokens[i])) { out.push(tokens[i]); continue; }
            var hit = null, hitEnd = i;
            for (var n = GLOSS_MAX_WORDS; n >= 1 && !hit; n--) {
                var end = i + (n - 1) * 2;
                if (end >= tokens.length) continue;
                var phrase = tokens.slice(i, end + 1).join('').replace(/\s+/g, ' ');
                if (phrase in GLOSS) { hit = GLOSS[phrase]; hitEnd = end; }
            }
            if (hit != null) { out.push(hit); changed = true; i = hitEnd; }
            else out.push(tokens[i]);
        }
        return changed ? out.join('') : null;
    }

    function lookup(core) {
        var r = DICT[core];
        if (r != null) return r;
        // Sayıları {0},{1}... ile şablona çevirip dene ("5 kayıt" -> "{0} kayıt")
        var nums = [];
        var tmpl = core.replace(/\d+(?:[.,:]\d+)*/g, function (m) { nums.push(m); return '{' + (nums.length - 1) + '}'; });
        if (nums.length) {
            r = DICT[tmpl];
            if (r != null) return r.replace(/\{(\d)\}/g, function (_, i) { return nums[+i] != null ? nums[+i] : ''; });
        }
        return null;
    }

    function translateText(s) {
        if (!s || !LETTER.test(s)) return s;
        var hit = cache.get(s);
        if (hit !== undefined) return hit;

        var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
        var norm = m[2].replace(/\s+/g, ' ');
        var out = lookup(norm);
        if (out == null) {
            // Baştaki/sondaki emoji, noktalama ve sayıları ayırıp çekirdeği dene
            var pre = /^[^\p{L}]*/u.exec(norm)[0];
            var rest = norm.slice(pre.length);
            var suf = /[^\p{L})]*$/u.exec(rest)[0];
            var core = rest.slice(0, rest.length - suf.length);
            var c = core ? lookup(core) : null;
            if (c != null) out = pre + c + suf;
            else if (core) out = glossaryTranslate(norm);
        }
        var result = out == null ? s : m[1] + out + m[3];
        if (cache.size > 20000) cache.clear();
        cache.set(s, result);
        return result;
    }

    // ---- DOM tarama ----
    var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, svg: 1, SVG: 1, TEMPLATE: 1 };
    var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-bs-original-title', 'data-bs-title', 'data-original-title', 'label', 'data-label', 'data-title'];
    var done = new WeakMap(); // text node -> son yazılan çeviri (kendi değişikliklerimizi tekrar işlememek için)

    function skipped(el) {
        for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
            if (SKIP_TAGS[n.tagName] || n.hasAttribute('data-i18n-skip') || n.isContentEditable ||
                (n.classList && n.classList.contains('notranslate'))) return true;
        }
        return false;
    }

    function doTextNode(node) {
        var v = node.nodeValue;
        if (!v || done.get(node) === v) return;
        var t = translateText(v);
        if (t !== v) node.nodeValue = t;
        done.set(node, t);
    }

    function doAttrs(el) {
        for (var i = 0; i < ATTRS.length; i++) {
            var a = ATTRS[i];
            if (el.hasAttribute(a)) {
                var v = el.getAttribute(a), t = translateText(v);
                if (t !== v) el.setAttribute(a, t);
            }
        }
        if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type) && el.value) {
            var tv = translateText(el.value);
            if (tv !== el.value) el.value = tv;
        }
    }

    function walk(root) {
        if (!root) return;
        if (root.nodeType === 3) {
            if (root.parentNode && !skipped(root.parentNode)) doTextNode(root);
            return;
        }
        if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
        if (root.nodeType === 1 && skipped(root)) return;
        if (root.nodeType === 1) doAttrs(root);
        var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: function (n) {
                if (n.nodeType === 1 && (SKIP_TAGS[n.tagName] || n.hasAttribute('data-i18n-skip') ||
                    n.isContentEditable || n.classList.contains('notranslate'))) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var n;
        while ((n = tw.nextNode())) {
            if (n.nodeType === 3) doTextNode(n);
            else doAttrs(n);
        }
    }

    var pending = new Set();
    var scheduled = false;
    function flush() {
        scheduled = false;
        var items = Array.from(pending);
        pending.clear();
        items.forEach(function (n) { if (n.isConnected) walk(n); });
    }
    function queue(n) {
        pending.add(n);
        if (!scheduled) { scheduled = true; Promise.resolve().then(flush); }
    }

    function translateTitle() {
        var t = translateText(document.title);
        if (t !== document.title) document.title = t;
    }

    // Canvas üzerine çizilen Chart.js etiketleri DOM'da olmadığı için yapılandırmadan çevrilir
    function translateChart(chart) {
        var data = chart.data || {}, opts = chart.options || {};
        if (Array.isArray(data.labels)) data.labels = data.labels.map(function (l) { return typeof l === 'string' ? translateText(l) : l; });
        (data.datasets || []).forEach(function (ds) { if (typeof ds.label === 'string') ds.label = translateText(ds.label); });
        var title = opts.plugins && opts.plugins.title;
        if (title && typeof title.text === 'string') title.text = translateText(title.text);
        Object.keys(opts.scales || {}).forEach(function (k) {
            var st = opts.scales[k].title;
            if (st && typeof st.text === 'string') st.text = translateText(st.text);
        });
    }

    function hookCharts() {
        if (window.Chart && typeof window.Chart.register === 'function') {
            window.Chart.register({ id: 'i18nTranslate', beforeUpdate: translateChart });
        }
    }

    function start() {
        if (DICT) return;
        prepare();
        window.I18N.t = translateText;
        hookCharts();
        translateTitle();
        walk(document.body);
        reveal();

        new MutationObserver(function (muts) {
            for (var i = 0; i < muts.length; i++) {
                var m = muts[i];
                if (m.type === 'childList') {
                    for (var j = 0; j < m.addedNodes.length; j++) queue(m.addedNodes[j]);
                } else if (m.type === 'characterData') {
                    queue(m.target);
                } else if (m.type === 'attributes') {
                    if (!skipped(m.target)) {
                        var v = m.target.getAttribute(m.attributeName);
                        var t = translateText(v);
                        if (t !== v) m.target.setAttribute(m.attributeName, t);
                    }
                }
            }
        }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

        var titleEl = document.querySelector('head > title');
        if (titleEl) new MutationObserver(translateTitle).observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    // Tarayıcı diyaloglarındaki mesajları da çevir
    ['alert', 'confirm', 'prompt'].forEach(function (fn) {
        var orig = window[fn];
        if (typeof orig !== 'function') return;
        window[fn] = function (msg) {
            var args = Array.prototype.slice.call(arguments);
            if (DICT && typeof msg === 'string') {
                args[0] = msg.split('\n').map(translateText).join('\n');
            }
            return orig.apply(window, args);
        };
    });

    // Sözlük yalnızca EN seçiliyken yüklenir
    var dictSrc = basePath + 'i18n_en.js?v=' + version;
    if (document.readyState === 'loading') {
        document.write('<script src="' + dictSrc + '"><\/script>');
        onReady(start);
    } else {
        var s = document.createElement('script');
        s.src = dictSrc;
        s.onload = function () { onReady(start); };
        s.onerror = reveal;
        document.head.appendChild(s);
    }
})();
