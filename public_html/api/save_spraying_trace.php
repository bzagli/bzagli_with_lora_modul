<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$new_trace = json_decode($json_data, true);

if ($new_trace === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri']);
    exit;
}

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = "../../data/{$garden_id}";
if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

$filename = "{$directory}/spraying_traces.json";
$traces = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
if (!is_array($traces)) {
    $traces = [];
}

// Add an ID to the trace if not present
if (!isset($new_trace['id'])) {
    $new_trace['id'] = 'trace_' . time() . '_' . rand(100, 999);
}

// Insert new trace at the beginning of the array (most recent first)
array_unshift($traces, $new_trace);

// Limit to last 100 traces per garden to preserve storage
if (count($traces) > 100) {
    $traces = array_slice($traces, 0, 100);
}

if (file_put_contents($filename, json_encode($traces, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success', 'trace_id' => $new_trace['id']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Yazma hatası']);
}
?>
