<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$upload_dir = __DIR__ . '/../uploads/recommendations';
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, 0777, true);
}

function format_bytes($bytes, $precision = 1) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// İzin verilen dosya uzantıları
$allowed_extensions = [
    'jpg', 'jpeg', 'png', 'webp', 'gif',
    'pdf', 
    'doc', 'docx', 
    'xls', 'xlsx', 'csv', 
    'txt', 
    'zip', 'rar'
];

$file_payload = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $file_payload = $_FILES['file'];
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file_payload = $_FILES['image'];
}

// 1. Multipart dosya yüklemesi
if ($file_payload !== null) {
    $original_name = $file_payload['name'];
    $file_size = $file_payload['size'];
    $ext = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

    if (empty($ext) || !in_array($ext, $allowed_extensions)) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Geçersiz dosya formatı. Desteklenen türler: Görsel (JPG, PNG, WEBP), PDF, Word (DOC/DOCX), Excel (XLS/XLSX), CSV, TXT, ZIP.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 25 MB maksimum boyut
    if ($file_size > 25 * 1024 * 1024) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Dosya boyutu 25MB\'den büyük olamaz.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $clean_ext = ($ext === 'jpeg') ? 'jpg' : $ext;
    $safe_name = 'rec_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $clean_ext;
    $target_path = $upload_dir . '/' . $safe_name;

    if (move_uploaded_file($file_payload['tmp_name'], $target_path)) {
        $is_image = in_array($clean_ext, ['jpg', 'png', 'webp', 'gif']);
        echo json_encode([
            'status' => 'success',
            'message' => 'Dosya başarıyla yüklendi.',
            'url' => 'uploads/recommendations/' . $safe_name,
            'file_name' => $original_name,
            'file_type' => $clean_ext,
            'file_size' => $file_size,
            'file_size_formatted' => format_bytes($file_size),
            'is_image' => $is_image
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Dosya sunucuya kaydedilemedi.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 2. Base64 JSON verisi kontrolü (Yedek)
$raw = file_get_contents('php://input');
if (!empty($raw)) {
    $json = json_decode($raw, true);
    if ($json && !empty($json['image_base64'])) {
        $data = $json['image_base64'];
        if (preg_match('/^data:(image|application)\/(\w+);base64,/', $data, $type)) {
            $data = substr($data, strpos($data, ',') + 1);
            $type = strtolower($type[2]);
            if (!in_array($type, $allowed_extensions)) {
                $type = 'jpg';
            }
            $data = base64_decode($data);
            if ($data !== false) {
                $safe_name = 'rec_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $type;
                $target_path = $upload_dir . '/' . $safe_name;
                if (@file_put_contents($target_path, $data)) {
                    $is_image = in_array($type, ['jpg', 'png', 'webp', 'gif']);
                    $file_size = strlen($data);
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Dosya başarıyla kaydedildi.',
                        'url' => 'uploads/recommendations/' . $safe_name,
                        'file_name' => !empty($json['file_name']) ? $json['file_name'] : $safe_name,
                        'file_type' => $type,
                        'file_size' => $file_size,
                        'file_size_formatted' => format_bytes($file_size),
                        'is_image' => $is_image
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }
        }
    }
}

echo json_encode(['status' => 'error', 'message' => 'Yüklenecek geçerli bir dosya veya görsel bulunamadı.'], JSON_UNESCAPED_UNICODE);
?>
