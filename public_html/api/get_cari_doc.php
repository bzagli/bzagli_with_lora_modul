<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$file = $_GET['file'] ?? '';
$file = basename($file); // Prevent directory traversal

$filePath = "../../data/{$garden_id}/cari_docs/{$file}";

if (!empty($file) && file_exists($filePath)) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    $contentTypes = [
        'pdf' => 'application/pdf',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg'
    ];

    $mime = $contentTypes[$ext] ?? 'application/octet-stream';

    header("Content-Type: {$mime}");
    header("Content-Disposition: inline; filename=\"{$file}\"");
    header("Content-Length: " . filesize($filePath));
    readfile($filePath);
    exit;
} else {
    http_response_code(404);
    echo "Belge bulunamadı.";
}
?>
