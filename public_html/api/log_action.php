<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');
$json_data = file_get_contents('php://input');
$log_entry = json_decode($json_data, true);
if (!is_array($log_entry)) { exit; }

$filename = "../../data/activity_logs.json";
$log_entry['timestamp'] = date('Y-m-d H:i:s');

// Eşzamanlı isteklerde kayıt kaybolmaması için dosya kilitlenerek okunur ve yazılır.
$fp = @fopen($filename, 'c+');
if ($fp === false || !flock($fp, LOCK_EX)) {
    echo json_encode(['status' => 'error', 'message' => 'Log dosyası açılamadı.']);
    exit;
}
$raw = stream_get_contents($fp);
$logs = trim((string)$raw) === '' ? [] : json_decode($raw, true);
if (!is_array($logs)) {
    // Okunamayan mevcut log dosyasının üzerine yazılmaz.
    flock($fp, LOCK_UN);
    fclose($fp);
    echo json_encode(['status' => 'error', 'message' => 'Log dosyası okunamadı.']);
    exit;
}

// Yeni logu en başa ekle (azalan tarih sırası)
array_unshift($logs, $log_entry);
// Dosya boyutunu korumak için son 2000 kaydı tut
if (count($logs) > 2000) { $logs = array_slice($logs, 0, 2000); }

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);
echo json_encode(['status' => 'success']);
?>
