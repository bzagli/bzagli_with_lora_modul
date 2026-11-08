<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if ($data === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı']);
    exit;
}

$garden_id = $_GET['garden_id'] ?? '';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = '../../data';
if (!empty($garden_id) && $garden_id !== 'default') {
    $target_dir = "{$directory}/{$garden_id}";
    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
    $filename = "{$target_dir}/schedule.json";
} else {
    $filename = "{$directory}/schedule.json";
}

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

// Write to schedule.json
if (file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    // Generate archive backup copy
    $timestamp = date('Ymd_His');
    $archive_file = "{$directory}/schedule_history_{$timestamp}.json";
    @file_put_contents($archive_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Also mirror to main data/schedule.json if garden-specific was saved
    if ($filename !== "{$directory}/schedule.json") {
        @file_put_contents("{$directory}/schedule.json", json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    echo json_encode(['status' => 'success', 'message' => 'İlaçlama takvimi başarıyla kaydedildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Yazma hatası oluştu']);
}
?>
