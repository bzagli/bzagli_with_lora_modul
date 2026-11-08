<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = $_GET['garden_id'] ?? '';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = '../../data';
$filename = "{$directory}/schedule.json";

if (!empty($garden_id) && $garden_id !== 'default') {
    $garden_file = "{$directory}/{$garden_id}/schedule.json";
    if (file_exists($garden_file)) {
        $filename = $garden_file;
    }
}

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode(['status' => 'empty', 'schedule' => []]);
}
?>
