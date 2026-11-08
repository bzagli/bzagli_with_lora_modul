// Okunmamış tavsiye ve istişare mesajlarını takip eder.
// Okundu bilgisi bu tarayıcıda, giriş yapan kullanıcıya özel saklanır; sunucu verisine yazılmaz.
window.BzUnread = (function () {
    function currentUser() {
        return localStorage.getItem('userName') || localStorage.getItem('username') || '';
    }

    function storageKey() {
        return 'bz_seen_messages_v1_' + currentUser();
    }

    function loadState() {
        try {
            const state = JSON.parse(localStorage.getItem(storageKey()) || 'null');
            if (state && Array.isArray(state.ids)) return state;
        } catch (e) { }
        return null;
    }

    function saveState(state) {
        try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch (e) { }
    }

    function isAdmin() {
        return localStorage.getItem('userRole') === 'admin';
    }

    function allowedGardenIds() {
        try {
            const allowed = JSON.parse(localStorage.getItem('allowed_gardens') || '[]');
            return Array.isArray(allowed) ? allowed.map(String) : [];
        } catch (e) {
            return [];
        }
    }

    // recommendations.html içindeki itemMatchesTargetGarden ile aynı kural
    function matchesGarden(item, gardenId) {
        if (Array.isArray(item.excluded_gardens) && item.excluded_gardens.includes(gardenId)) return false;
        if (item.garden_id === 'all' || (Array.isArray(item.garden_ids) && item.garden_ids.includes('all'))) return true;
        if (Array.isArray(item.garden_ids) && item.garden_ids.length > 0) return item.garden_ids.includes(gardenId);
        return item.garden_id === gardenId;
    }

    function isSharedAcrossGardens(item) {
        return !item.garden_id || item.garden_id === 'all' ||
            (Array.isArray(item.garden_ids) && (item.garden_ids.includes('all') || item.garden_ids.length > 1));
    }

    function isAdminComment(c) {
        const role = String(c.role || '').toLowerCase();
        const author = String(c.author || '').toLowerCase();
        return role === 'admin' || role === 'danışman' || role === 'danisman' ||
            author.includes('danışman') || author.includes('danisman') || author.includes('zir. müh') ||
            author.includes('ziraat') || author.includes('yönetici') || author.includes('admin') ||
            author === 'bulent' || author === 'begum';
    }

    function isOwn(author) {
        const user = currentUser();
        const name = String(author || '').trim();
        // recommendations.html yanıtlarında kullanılan yazar biçimleri
        return !!user && (name === user || name === 'Zir. Danışman ' + user || name === 'Zir. Müh. ' + user + ' (Danışman)');
    }

    function visibleItems(recs) {
        if (isAdmin()) return recs;
        const allowed = allowedGardenIds();
        return recs.filter(item => allowed.some(gid => matchesGarden(item, gid)));
    }

    // Ortak kayıtlarda diğer bahçe kullanıcılarının mesajları kullanıcıya gösterilmez, sayılmaz da
    function visibleComments(item) {
        const comments = Array.isArray(item.comments) ? item.comments : [];
        if (isAdmin() || !isSharedAcrossGardens(item)) return comments;
        return comments.filter(c => isAdminComment(c) || isOwn(c.author));
    }

    function itemKey(item) { return 'r:' + item.id; }
    function commentKey(item, c) { return 'c:' + item.id + ':' + c.id; }

    function allKeys(item) {
        const keys = [itemKey(item)];
        (Array.isArray(item.comments) ? item.comments : []).forEach(c => { if (c && c.id) keys.push(commentKey(item, c)); });
        return keys;
    }

    // Döner: { items: { [recId]: { recNew, commentIds[] } }, newRecs, newMessages, total }
    function compute(recs) {
        const items = visibleItems(Array.isArray(recs) ? recs : []);
        let state = loadState();
        if (!state) {
            // İlk kullanımda mevcut her şey okunmuş sayılır; yalnızca bundan sonra gelenler uyarılır.
            state = { ids: [] };
            items.forEach(item => state.ids.push(...allKeys(item)));
            saveState(state);
        }
        const seen = new Set(state.ids);
        const result = { items: {}, newRecs: 0, newMessages: 0, total: 0 };
        items.forEach(item => {
            const recNew = !seen.has(itemKey(item)) && !isOwn(item.author);
            const commentIds = visibleComments(item)
                .filter(c => c && c.id && !seen.has(commentKey(item, c)) && !isOwn(c.author))
                .map(c => String(c.id));
            if (recNew || commentIds.length > 0) {
                result.items[item.id] = { recNew, commentIds };
                if (recNew) result.newRecs++;
                result.newMessages += commentIds.length;
            }
        });
        result.total = result.newRecs + result.newMessages;
        return result;
    }

    function markRead(items) {
        const state = loadState() || { ids: [] };
        const seen = new Set(state.ids);
        items.forEach(item => { if (item) allKeys(item).forEach(k => seen.add(k)); });
        state.ids = Array.from(seen);
        saveState(state);
    }

    // Kısa uyarı metni: "2 yeni öneri, 3 yeni mesaj"
    function summaryText(result) {
        const parts = [];
        if (result.newRecs > 0) parts.push(result.newRecs + ' yeni öneri');
        if (result.newMessages > 0) parts.push(result.newMessages + ' yeni mesaj');
        return parts.join(', ');
    }

    return { compute, markRead, summaryText };
})();
