<?php
require_once __DIR__ . '/_auth.php';
$admin = bz_require_admin();
header('Content-Type: application/json; charset=utf-8');
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Boş liste kaydı tüm kullanıcıları silip sistemi kilitler; reddedilir.
if (!is_array($data) || count($data) === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri']);
    exit;
}

$users_file = '../../data/users.json';

if (file_put_contents($users_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX)) {
    // Yönetici kendi parolasını değiştirdiyse oturumunu yeni parolayla yenile.
    $me = bz_find_user($admin['username'] ?? '');
    if ($me !== null) bz_issue_token($me);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Kaydetme hatası']);
}
?>
