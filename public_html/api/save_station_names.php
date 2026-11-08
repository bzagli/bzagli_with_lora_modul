<?php
require_once __DIR__ . '/_auth.php';
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri biçimi']);
    exit;
}

$adminPassword = trim($body['adminPassword'] ?? '');

// Yetki istemcinin bildirdiği role göre değil, sunucu oturumuna göre belirlenir.
$session_user = bz_require_login();
$authorized = bz_is_admin($session_user);
if ($authorized) $body['userName'] = $session_user['username'];

if (!$authorized && $adminPassword !== '') {
    $users_file = dirname(__DIR__, 2) . '/data/users.json';
    if (file_exists($users_file)) {
        $users = json_decode(file_get_contents($users_file), true);
        if (is_array($users)) {
            foreach ($users as $u) {
                if (bz_is_admin($u) && hash_equals(trim($u['password'] ?? ''), $adminPassword)) {
                    $authorized = true;
                    $body['userName'] = $u['username'];
                    break;
                }
            }
        }
    }
}

if (!$authorized) {
    echo json_encode([
        'status' => 'error', 
        'message' => 'Yetkisiz işlem! İstasyon isimlerini yalnızca yöneticiler değiştirebilir. Lütfen doğru yönetici şifresini giriniz.'
    ]);
    exit;
}

$kutoren = trim($body['kutoren'] ?? '');
$bor = trim($body['bor'] ?? '');

if ($kutoren === '') $kutoren = 'Kutören İstasyonu';
if ($bor === '') $bor = 'Bor İstasyonu (LoRa)';

$store = [
    'kutoren' => htmlspecialchars($kutoren, ENT_QUOTES, 'UTF-8'),
    'bor' => htmlspecialchars($bor, ENT_QUOTES, 'UTF-8'),
    'updated_at' => date('Y-m-d H:i:s'),
    'updated_by' => trim($body['userName'] ?? 'admin')
];

$data_dir = dirname(__DIR__, 2) . '/data';
if (!is_dir($data_dir)) {
    @mkdir($data_dir, 0777, true);
}
$data_file = $data_dir . '/station_names.json';

if (file_put_contents($data_file, json_encode($store, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode([
        'status' => 'success', 
        'message' => 'İstasyon isimleri başarıyla kaydedildi.', 
        'names' => $store,
        'isAdmin' => true,
        'userName' => $body['userName'] ?? 'admin'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası oluştu']);
}
?>
