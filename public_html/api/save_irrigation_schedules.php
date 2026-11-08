<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if ($data_array === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $garden_id);
if ($garden_id === '') $garden_id = 'default';

$data_dir = realpath(__DIR__ . '/../../data');
if ($data_dir === false) $data_dir = __DIR__ . '/../../data';
$directory = $data_dir . DIRECTORY_SEPARATOR . $garden_id;
$filename = "{$directory}/irrigation_schedules.json";

if (!is_dir($directory)) {
    if (!mkdir($directory, 0777, true) && !is_dir($directory)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Bahçe veri klasörü oluşturulamadı.']);
        exit;
    }
}

if (file_put_contents($filename, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    $timestamp = date('Ymd_His');
    $archive_file = "{$directory}/irrigation_sched_history_{$timestamp}.json";
    @file_put_contents($archive_file, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['status' => 'success', 'message' => 'Sulama programı verileri başarıyla kaydedildi.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası!']);
}
?>
