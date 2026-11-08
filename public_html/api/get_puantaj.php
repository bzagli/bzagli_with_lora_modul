<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

// Bahçe ID'sini al
$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id); // Güvenlik temizliği

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/puantaj.json";

// Dosya varsa içeriğini oku ve JSON olarak döndür
if (file_exists($filename)) {
    $json_data = file_get_contents($filename);
    // JSON verisi boşsa veya geçersizse boş bir dizi döndür
    $data = json_decode($json_data, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        echo json_encode([]);
    } else {
        echo json_encode($data);
    }
} else {
    // Dosya yoksa boş bir JSON dizisi döndür
    echo json_encode([]);
}
?>