<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz istek metodu.']);
    exit;
}

$garden_id = $_POST['garden_id'] ?? $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

if (!isset($_FILES['doc_file']) || $_FILES['doc_file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yüklenemedi veya dosya seçilmedi.']);
    exit;
}

$file = $_FILES['doc_file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

$allowed = ['pdf', 'png', 'jpg', 'jpeg'];
if (!in_array($ext, $allowed)) {
    echo json_encode(['status' => 'error', 'message' => 'Sadece PDF, PNG, JPG veya JPEG formatında dosyalar yüklenebilir.']);
    exit;
}

$uploadDir = "../../data/{$garden_id}/cari_docs";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$newFileName = "doc_" . time() . "_" . uniqid() . "." . $ext;
$targetPath = "{$uploadDir}/{$newFileName}";

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $fileUrl = "api/get_cari_doc.php?garden_id={$garden_id}&file={$newFileName}";
    echo json_encode([
        'status' => 'success',
        'file_url' => $fileUrl,
        'file_name' => $file['name'],
        'stored_name' => $newFileName
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya sunucuya kaydedilirken hata oluştu.']);
}
?>
