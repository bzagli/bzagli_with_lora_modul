// Sunucu oturumu ile tarayıcıdaki giriş durumunu senkron tutar.
// Sayfa script'lerinden önce, <head> içinde ilk sırada yüklenmelidir.
(function () {
    if (window.__bzAuthGuard || location.protocol === 'file:') return;
    window.__bzAuthGuard = true;

    var redirecting = false;
    function toLogin() {
        if (redirecting) return;
        redirecting = true;
        try { localStorage.removeItem('isLoggedIn'); } catch (e) { }
        location.replace('login.html?expired=1');
    }

    function isApiUrl(url) {
        return /(^|\/)api\//.test(url) && !/api\/(login|logout)\.php/.test(url);
    }

    // Tarayıcıda giriş yapılmış görünüyor ama sunucu oturumu yoksa (eski oturum / çıkış) yeniden giriş iste.
    var loggedIn = false;
    try { loggedIn = localStorage.getItem('isLoggedIn') === 'true'; } catch (e) { }
    if (loggedIn && !/(^|;\s*)bz_session=1/.test(document.cookie)) {
        toLogin();
        return;
    }

    // Oturum süresi dolarsa API 401 döner: kullanıcıyı giriş sayfasına yönlendir.
    if (window.fetch) {
        var originalFetch = window.fetch;
        window.fetch = function (input) {
            var url = typeof input === 'string' ? input : (input && (input.url || input.href)) || '';
            return originalFetch.apply(this, arguments).then(function (res) {
                if (res.status === 401 && isApiUrl(url)) toLogin();
                return res;
            });
        };
    }

    if (window.XMLHttpRequest) {
        var originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var xhr = this;
            if (isApiUrl(String(url || ''))) {
                xhr.addEventListener('load', function () { if (xhr.status === 401) toLogin(); });
            }
            return originalOpen.apply(this, arguments);
        };
    }
})();
