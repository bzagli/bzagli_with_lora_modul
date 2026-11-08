<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if ($data_array === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

$directory = "../../data";
$filename = "{$directory}/bku_custom_database.json";

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

if (file_put_contents($filename, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success', 'message' => 'Özel BKÜ veritabanı başarıyla kaydedildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası!']);
}
?>
