<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$data_dir = __DIR__ . '/../../data';
$script = $data_dir . '/bku_service.py';

if (file_exists($script) && function_exists('exec')) {
    // Tek tarama başlatılır: python3 varsa o, yoksa python kullanılır.
    $arg = escapeshellarg($script);
    @exec("(if command -v python3 >/dev/null 2>&1; then python3 {$arg} --now; else python {$arg} --now; fi) > /dev/null 2>&1 &");
    echo json_encode(['success' => true, 'message' => 'BKÜ Canlı Taraması sunucuda başlatıldı. Lütfen 1-2 dakika sonra sayfayı yenileyiniz.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Sunucu tarafında canlı tarama başlatılamadı.']);
}
?>
