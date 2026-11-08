<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$dataDir = __DIR__ . "/../../data";
$files = [
    $dataDir . "/elma_bku_verileri.json",
    $dataDir . "/bku_custom_database.json"
];
$records = [];

foreach ($files as $file) {
    if (!file_exists($file)) continue;
    $content = json_decode(file_get_contents($file), true);
    if (is_array($content)) {
        $records = array_merge($records, $content);
    }
}

echo json_encode($records, JSON_UNESCAPED_UNICODE);
?>
