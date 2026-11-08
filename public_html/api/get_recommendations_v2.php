<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

// Bahçe ID parametresi (opsiyonel)
$garden_id = $_GET['garden_id'] ?? '';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$filename = "../../data/recommendations.json";

if (file_exists($filename)) {
    $json_data = file_get_contents($filename);
    $data = json_decode($json_data, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
        if (!empty($garden_id)) {
            // İlgili bahçeye ait veya "all" (tüm bahçeler) olanları filtrele (hariç tutulanlar hariç)
            $filtered = array_values(array_filter($data, function($item) use ($garden_id) {
                if (!empty($item['excluded_gardens']) && is_array($item['excluded_gardens']) && in_array($garden_id, $item['excluded_gardens'])) {
                    return false;
                }
                if (!empty($item['garden_ids']) && is_array($item['garden_ids'])) {
                    if (in_array('all', $item['garden_ids']) || in_array($garden_id, $item['garden_ids'])) {
                        return true;
                    }
                }
                return empty($item['garden_id']) || $item['garden_id'] === 'all' || $item['garden_id'] === $garden_id;
            }));
            echo json_encode($filtered, JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        }
    } else {
        echo json_encode([]);
    }
} else {
    echo json_encode([]);
}
?>
