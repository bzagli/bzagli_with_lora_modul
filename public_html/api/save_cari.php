<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if ($data_array === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/cari.json";
$tmp_filename = "{$directory}/cari.json.tmp";

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

$encoded = json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
if (file_put_contents($tmp_filename, $encoded, LOCK_EX) !== false) {
    if (@rename($tmp_filename, $filename)) {
        echo json_encode(['status' => 'success', 'message' => 'Cari ve harcama verileri başarıyla kaydedildi.']);
    } else {
        file_put_contents($filename, $encoded, LOCK_EX);
        @unlink($tmp_filename);
        echo json_encode(['status' => 'success', 'message' => 'Cari ve harcama verileri başarıyla kaydedildi.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası! Yazma izinlerini kontrol edin.']);
}
?>
