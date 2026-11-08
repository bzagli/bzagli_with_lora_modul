<?php
// Ortak kimlik doğrulama: imzalı, HttpOnly çerez ile sunucu tarafı oturum kontrolü.
// Cihaz uçları (meteo_v4, veri_kaydet, dx_lr02_api) bu dosyayı kullanmaz.

const BZ_AUTH_COOKIE = 'bz_auth';
const BZ_MARKER_COOKIE = 'bz_session'; // JS'nin okuyabildiği, gizli bilgi taşımayan işaret
const BZ_AUTH_TTL = 2592000; // 30 gün

function bz_data_dir() {
    return dirname(__DIR__, 2) . '/data';
}

function bz_auth_secret() {
    static $secret = null;
    if ($secret !== null) return $secret;

    // Gizli anahtar web kökünün dışında tutulur; ilk çağrıda bir kez üretilir.
    $candidates = [dirname(__DIR__, 2) . '/.bz_auth_secret', bz_data_dir() . '/.bz_auth_secret'];
    foreach ($candidates as $file) {
        if (is_file($file)) {
            $value = trim((string)@file_get_contents($file));
            if (strlen($value) >= 32) return $secret = $value;
        }
    }
    $value = bin2hex(random_bytes(32));
    foreach ($candidates as $file) {
        if (@file_put_contents($file, $value, LOCK_EX) !== false) {
            @chmod($file, 0600);
            return $secret = $value;
        }
    }
    // Yazılamıyorsa sunucuya özgü sabit bir anahtara düş (oturumların kilitlenmemesi için).
    return $secret = hash('sha256', __DIR__ . php_uname());
}

function bz_b64url_encode($text) {
    return rtrim(strtr(base64_encode($text), '+/', '-_'), '=');
}

function bz_b64url_decode($text) {
    return base64_decode(strtr($text, '-_', '+/'), true);
}

function bz_users() {
    $users = json_decode((string)@file_get_contents(bz_data_dir() . '/users.json'), true);
    return is_array($users) ? $users : [];
}

function bz_find_user($username) {
    $username = trim((string)$username);
    if ($username === '') return null;
    foreach (bz_users() as $user) {
        if (trim($user['username'] ?? '') === $username) return $user;
    }
    return null;
}

// İmza parolayı da içerir: parola değişince eski oturumlar kendiliğinden geçersiz olur.
function bz_sign($payload, $user) {
    return hash_hmac('sha256', $payload, bz_auth_secret() . '|' . trim((string)($user['password'] ?? '')));
}

function bz_is_https() {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443);
}

function bz_set_cookies($token, $expires) {
    $options = ['expires' => $expires, 'path' => '/', 'secure' => bz_is_https(), 'samesite' => 'Lax'];
    setcookie(BZ_AUTH_COOKIE, $token, $options + ['httponly' => true]);
    setcookie(BZ_MARKER_COOKIE, $token === '' ? '' : '1', $options + ['httponly' => false]);
}

function bz_issue_token($user) {
    $expires = time() + BZ_AUTH_TTL;
    $payload = bz_b64url_encode(json_encode(['u' => trim($user['username'] ?? ''), 'exp' => $expires], JSON_UNESCAPED_UNICODE));
    bz_set_cookies($payload . '.' . bz_sign($payload, $user), $expires);
}

function bz_clear_token() {
    bz_set_cookies('', time() - 3600);
}

function bz_current_user() {
    static $resolved = false, $current = null;
    if ($resolved) return $current;
    $resolved = true;

    $token = $_COOKIE[BZ_AUTH_COOKIE] ?? '';
    if (!is_string($token) || strpos($token, '.') === false) return null;
    [$payload, $signature] = explode('.', $token, 2);

    $data = json_decode((string)bz_b64url_decode($payload), true);
    if (!is_array($data) || (int)($data['exp'] ?? 0) < time()) return null;

    $user = bz_find_user($data['u'] ?? '');
    if ($user === null || !hash_equals(bz_sign($payload, $user), $signature)) return null;
    return $current = $user;
}

function bz_is_admin($user) {
    return in_array(strtolower($user['role'] ?? ''), ['admin', 'yonetici'], true);
}

function bz_deny($code, $message) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'auth' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function bz_require_login() {
    $user = bz_current_user();
    if ($user === null) bz_deny(401, 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
    return $user;
}

function bz_require_admin() {
    $user = bz_require_login();
    if (!bz_is_admin($user)) bz_deny(403, 'Bu işlem için yönetici yetkisi gerekir.');
    return $user;
}
