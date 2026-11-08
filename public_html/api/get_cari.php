<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/cari.json";

if (file_exists($filename)) {
    $data = null;
    for ($i = 0; $i < 3; $i++) {
        $json_data = @file_get_contents($filename);
        if ($json_data !== false && strlen(trim($json_data)) > 0) {
            $decoded = json_decode($json_data, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $data = $decoded;
                break;
            }
        }
        usleep(50000); // 50ms bekleme
    }
    
    if (is_array($data)) {
        echo json_encode($data);
    } else {
        echo json_encode([]);
    }
} else {
    echo json_encode([]);
}
?>
