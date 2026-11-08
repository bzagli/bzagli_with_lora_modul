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

$directory = '../../data';
$filename = $directory . '/programs.json';

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

// Write to programs.json
if (file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    // Generate an archive backup copy
    $timestamp = date('Ymd_His');
    $archive_file = "{$directory}/programs_history_{$timestamp}.json";
    file_put_contents($archive_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['status' => 'success', 'message' => 'Programlar başarıyla kaydedildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Yazma hatası']);
}
?>
