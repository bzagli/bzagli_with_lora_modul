<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

$data_file = dirname(__DIR__, 2) . '/data/station_names.json';

$default_names = [
    'kutoren' => 'Kutören İstasyonu',
    'bor' => 'Bor İstasyonu (LoRa)',
    'fixaj' => 'Fixaj İstasyonu (LoRa)'
];

if (file_exists($data_file)) {
    $content = file_get_contents($data_file);
    $json = json_decode($content, true);
    if (is_array($json) && !empty($json['kutoren']) && !empty($json['bor'])) {
        echo json_encode([
            'status' => 'success',
            'names' => [
                'kutoren' => $json['kutoren'],
                'bor' => $json['bor'],
                'fixaj' => !empty($json['fixaj']) ? $json['fixaj'] : $default_names['fixaj']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

echo json_encode([
    'status' => 'success',
    'names' => $default_names
], JSON_UNESCAPED_UNICODE);
?>
