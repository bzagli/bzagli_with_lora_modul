<?php
// One API, one append-only observation store. PHP 7.2 or later.
date_default_timezone_set('Europe/Istanbul');
ini_set('display_errors', '0');
ini_set('log_errors', '1');
const M3_VERSION = '4.2.0';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Meteo-Version: ' . M3_VERSION);

function m3_root() { return dirname(__DIR__, 2) . '/data'; }
function m3_store() { return m3_root() . '/meteo_v3'; }
function m3_json($data) {
    $text = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($text === false) throw new RuntimeException('JSON oluşturulamadı.');
    return $text;
}
function m3_read($path) {
    if (!is_file($path)) return null;
    $text = file_get_contents($path);
    if ($text === false) throw new RuntimeException('Ölçüm dosyası okunamıyor.');
    $value = json_decode($text, true);
    return is_array($value) ? $value : null;
}
function m3_number($value, $min, $max) {
    if (!is_scalar($value) || is_bool($value)) return null;
    $value = str_replace(',', '.', trim((string)$value));
    if ($value === '' || !is_numeric($value)) return null;
    $n = (float)$value;
    return is_finite($n) && $n >= $min && $n <= $max ? $n : null;
}
function m3_record($value) {
    if (!is_array($value)) return null;
    $t = m3_number($value['temp'] ?? null, -50, 80);
    $h = m3_number($value['hum'] ?? null, 0, 100);
    if ($t === null || $h === null) return null;
    $time = $value['time'] ?? $value['at'] ?? null;
    if (!is_string($time)) return null;
    $format = strpos($time, '-') === 4 ? 'Y-m-d H:i:s' : 'd.m.Y H:i:s';
    $dt = DateTimeImmutable::createFromFormat('!' . $format, $time);
    if (!$dt || $dt->format($format) !== $time) return null;
    return ['id' => is_string($value['id'] ?? null) ? $value['id'] : null, 'temp' => $t, 'hum' => $h,
        'time' => $dt->format('d.m.Y H:i:s'), 'ts' => $dt->getTimestamp(),
        'source' => is_string($value['source'] ?? null) ? $value['source'] : 'legacy'];
}
function m3_fingerprint($r) { return hash('sha256', $r['time'] . '|' . $r['temp'] . '|' . $r['hum']); }
function m3_locked($callback) {
    $dir = m3_store();
    if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) throw new RuntimeException('data/meteo_v3 klasörü oluşturulamıyor. PHP yazma iznini kontrol edin.');
    $lock = fopen($dir . '/record.lock', 'c');
    if ($lock === false) throw new RuntimeException('Ölçüm klasörüne yazılamıyor. PHP yazma iznini kontrol edin.');
    try {
        if (!flock($lock, LOCK_EX)) throw new RuntimeException('Kayıt kilidi alınamadı.');
        return $callback();
    } finally { flock($lock, LOCK_UN); fclose($lock); }
}
function m3_lines($path) {
    $rows = [];
    if (!is_file($path)) return $rows;
    $file = fopen($path, 'rb');
    if ($file === false) throw new RuntimeException('Arşiv okunamıyor.');
    try {
        while (($line = fgets($file)) !== false) {
            $r = m3_record(json_decode($line, true));
            if ($r !== null) $rows[] = $r;
        }
    } finally { fclose($file); }
    return $rows;
}
function m3_append($date, $rows) {
    if (!$rows) return;
    $file = fopen(m3_store() . '/' . $date . '.jsonl', 'c+b');
    if ($file === false) throw new RuntimeException('Ölçüm kaydı açılamıyor.');
    try {
        fseek($file, 0, SEEK_END); $size = ftell($file);
        if ($size > 0) {
            fseek($file, -1, SEEK_END); $tail = fread($file, 1);
            fseek($file, 0, SEEK_END);
            if ($tail !== "\n" && fwrite($file, "\n") !== 1) throw new RuntimeException('Kayıt satırı açılamadı.');
        }
        foreach ($rows as $row) {
            $line = m3_json($row) . "\n";
            if (fwrite($file, $line) !== strlen($line)) throw new RuntimeException('Ölçüm kaydı tamamlanamadı.');
        }
        if (!fflush($file)) throw new RuntimeException('Ölçüm diske yazılamadı.');
    } finally { fclose($file); }
}
function m3_effective($rows) {
    $primary = []; $ids = []; $secondary = []; $out = [];
    foreach ($rows as $r) {
        if (in_array($r['source'], ['device', 'legacy_raw'], true)) $primary[m3_fingerprint($r)] = true;
    }
    foreach ($rows as $index => $r) {
        $id = $r['id'] ?? m3_fingerprint($r);
        if (isset($ids[$id])) continue;
        $ids[$id] = true;
        $fingerprint = m3_fingerprint($r);
        if (!in_array($r['source'], ['device', 'legacy_raw'], true)) {
            if (isset($primary[$fingerprint]) || isset($secondary[$fingerprint])) continue;
            $secondary[$fingerprint] = true;
        }
        $r['_order'] = $index; $out[] = $r;
    }
    usort($out, static function ($a, $b) {
        if ($a['ts'] !== $b['ts']) return $a['ts'] <=> $b['ts'];
        $pa = $a['source'] === 'device' ? 1 : 0;
        $pb = $b['source'] === 'device' ? 1 : 0;
        return $pa !== $pb ? $pa <=> $pb : $a['_order'] <=> $b['_order'];
    });
    foreach ($out as &$r) unset($r['_order']);
    unset($r);
    return $out;
}
function m3_last_from_store() {
    $files = glob(m3_store() . '/????-??-??.jsonl');
    if (!$files) return null;
    rsort($files);
    foreach ($files as $file) {
        $rows = m3_lines($file);
        if ($rows) return $rows[count($rows) - 1];
    }
    return null;
}
// All calls are inside the lock. Imported observations have stable IDs: polling
// never increases the count for the same source observation.
function m3_sync($from, $to, $compact = false, &$metadata = null) {
    $metadata = [];
    $today = date('Y-m-d');
    $migratedFlag = m3_store() . '/.legacy_migrated_v4';
    $needLegacy = !is_file($migratedFlag);
    $legacy = $needLegacy ? m3_lines(m3_root() . '/meteo_history.jsonl') : [];
    $latest = m3_record(m3_read(m3_root() . '/meteo.json'));
    $grouped = [];
    foreach ($legacy as $r) {
        $date = date('Y-m-d', $r['ts']);
        $r['id'] = 'history:' . m3_fingerprint($r); $r['source'] = 'legacy_history';
        $grouped[$date][] = $r;
    }
    if ($latest !== null && $latest['ts'] <= time() + 300) {
        $date = date('Y-m-d', $latest['ts']);
        $latest['id'] = 'latest:' . m3_fingerprint($latest); $latest['source'] = 'latest_fallback';
        $grouped[$date][] = $latest;
    }
    $cacheFile = m3_store() . '/summaries_cache.json';
    $sumCache = ($compact === 'daily_only' && is_file($cacheFile)) ? (m3_read($cacheFile) ?? []) : [];
    $cacheDirty = false;
    $result = [];
    $cursor = new DateTimeImmutable($from); $end = new DateTimeImmutable($to);
    for (; $cursor <= $end; $cursor = $cursor->modify('+1 day')) {
        $date = $cursor->format('Y-m-d');
        $dayFile = m3_store() . '/' . $date . '.jsonl';
        if ($compact === 'daily_only' && !$needLegacy && $date < $today && empty($grouped[$date])) {
            if (!is_file($dayFile)) {
                $metadata[$date] = ['summary' => m3_summary([], $date), 'last' => null];
                $result[$date] = [];
                continue;
            }
            $fSize = @filesize($dayFile);
            $fMtime = @filemtime($dayFile);
            if (isset($sumCache[$date]) && ($sumCache[$date]['size'] ?? -1) === $fSize && ($sumCache[$date]['mtime'] ?? -1) === $fMtime && isset($sumCache[$date]['summary'])) {
                $metadata[$date] = ['summary' => $sumCache[$date]['summary'], 'last' => $sumCache[$date]['last'] ?? null];
                $result[$date] = [];
                continue;
            }
        }
        $existing = m3_lines($dayFile);
        $seen = [];
        foreach ($existing as $r) $seen[$r['id'] ?? m3_fingerprint($r)] = true;
        $candidates = $grouped[$date] ?? [];
        // Read the daily JSON archive used by the first meteorology package too.
        if ($needLegacy || !$existing) {
            $raw = m3_read(m3_root() . '/meteo_archive/' . $date . '.json');
            if (isset($raw['samples']) && is_array($raw['samples'])) {
                foreach ($raw['samples'] as $index => $sample) {
                    $r = m3_record($sample);
                    if ($r === null || date('Y-m-d', $r['ts']) !== $date) continue;
                    $r['id'] = 'raw:' . $date . ':' . $index . ':' . m3_fingerprint($r);
                    $r['source'] = 'legacy_raw'; $candidates[] = $r;
                }
            }
        }
        $added = [];
        if ($candidates) {
            $primarySeen = [];
            foreach (array_merge($existing, $candidates) as $r) {
                if (in_array($r['source'], ['device', 'legacy_raw'], true)) $primarySeen[m3_fingerprint($r)] = true;
            }
            foreach ($candidates as $r) {
                if ($r['ts'] > time() + 300 || isset($seen[$r['id']])) continue;
                if (!in_array($r['source'], ['device', 'legacy_raw'], true) && isset($primarySeen[m3_fingerprint($r)])) continue;
                $seen[$r['id']] = true; $added[] = $r;
            }
            if ($added) m3_append($date, $added);
        }
        $effective = m3_effective(array_merge($existing, $added));
        $daySummary = m3_summary($effective, $date);
        $dayLast = $effective ? $effective[count($effective)-1] : null;
        $metadata[$date] = ['summary' => $daySummary, 'last' => $dayLast];
        if ($compact === 'daily_only' && $date < $today && is_file($dayFile)) {
            $sumCache[$date] = ['size' => @filesize($dayFile), 'mtime' => @filemtime($dayFile), 'summary' => $daySummary, 'last' => $dayLast];
            $cacheDirty = true;
        }
        // Month views retain only interval points in memory; daily extrema still
        // use every observation. Full raw records remain in their daily files.
        $result[$date] = $compact === 'daily_only' ? [] : ($compact === 'archive' ? m3_interval_summary($effective) : ($compact ? m3_slots($effective) : $effective));
        unset($effective, $existing, $candidates, $added);
    }
    if ($cacheDirty) {
        @file_put_contents($cacheFile, m3_json($sumCache));
    }
    if ($needLegacy && $from <= '2026-09-29' && $to >= '2026-10-02') {
        @file_put_contents($migratedFlag, date('c'));
    }
    return $result;
}
function m3_summary($rows, $date) {
    $s = ['date' => $date, 'count' => count($rows), 'temp_min' => null, 'temp_max' => null, 'temp_avg' => null,
        'hum_min' => null, 'hum_max' => null, 'hum_avg' => null, 'first_time' => null, 'last_time' => null];
    $temp_sum = 0;
    $hum_sum = 0;
    foreach ($rows as $r) {
        foreach (['temp', 'hum'] as $field) {
            $min = $field . '_min'; $max = $field . '_max';
            $s[$min] = $s[$min] === null ? $r[$field] : min($s[$min], $r[$field]);
            $s[$max] = $s[$max] === null ? $r[$field] : max($s[$max], $r[$field]);
        }
        $temp_sum += $r['temp'];
        $hum_sum += $r['hum'];
    }
    if ($rows) {
        $cnt = count($rows);
        $s['temp_avg'] = round($temp_sum / $cnt, 1);
        $s['hum_avg'] = round($hum_sum / $cnt, 1);
        $s['first_time'] = $rows[0]['time'];
        $s['last_time'] = $rows[$cnt-1]['time'];
    }
    return $s;
}
function m3_slots($rows) {
    $slots = [];
    foreach ($rows as $r) {
        $slot = (int)floor($r['ts'] / 900);
        if (!isset($slots[$slot])) $slots[$slot] = $r;
    }
    ksort($slots);
    return array_values($slots);
}
// Aggregate raw observations BEFORE reducing the archive to one row per interval.
function m3_interval_summary($rows) {
    $slots = [];
    foreach ($rows as $r) {
        $slot = (int)floor($r['ts'] / 900);
        if (!isset($slots[$slot])) {
            $slots[$slot] = $r;
            $slots[$slot]['interval_start'] = date('d.m.Y H:i', $slot * 900);
            $slots[$slot]['interval_end'] = date('H:i', ($slot + 1) * 900);
            $slots[$slot]['sample_count'] = 0;
            foreach (['temp', 'hum'] as $field) {
                $slots[$slot][$field . '_min'] = $r[$field];
                $slots[$slot][$field . '_max'] = $r[$field];
            }
        }
        $slots[$slot]['sample_count']++;
        foreach (['temp', 'hum'] as $field) {
            $slots[$slot][$field . '_min'] = min($slots[$slot][$field . '_min'], $r[$field]);
            $slots[$slot][$field . '_max'] = max($slots[$slot][$field . '_max'], $r[$field]);
        }
    }
    ksort($slots);
    return array_values($slots);
}
function m3_parse_date($value) {
    if (!is_string($value)) return null;
    $dt = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    return $dt && $dt->format('Y-m-d') === $value ? $dt : null;
}
function m3_compatibility($record) {
    $path = m3_root() . '/meteo.json';
    $tmp = tempnam(m3_root(), '.meteo-v3-');
    if ($tmp === false) return false;
    $ok = false;
    try {
        $json = m3_json($record);
        $ok = file_put_contents($tmp, $json) === strlen($json) && rename($tmp, $path);
    } finally { if (is_file($tmp)) unlink($tmp); }
    return $ok;
}
function m3_checks() {
    $a = m3_record(['temp' => 11.8, 'hum' => 99.9, 'time' => '01.10.2026 08:00:00', 'id' => 'a', 'source' => 'device']);
    $b = m3_record(['temp' => 9.2, 'hum' => 65, 'time' => '01.10.2026 08:01:00', 'id' => 'b', 'source' => 'device']);
    $copy = $a; $copy['id'] = 'imported'; $copy['source'] = 'latest_fallback';
    $rows = m3_effective([$a, $b, $copy, $a]); $s = m3_summary($rows, '2026-10-01');
    $same = $a; $same['id'] = 'different-device-observation';
    $rawA = $a; $rawA['id'] = 'raw-a'; $rawA['source'] = 'legacy_raw';
    $rawB = $rawA; $rawB['id'] = 'raw-b';
    $nextSlot = $b; $nextSlot['ts'] = $a['ts'] + 900;
    $intervals = m3_interval_summary([$a, $b, $nextSlot]);
    $tests = ['interval_min_max_temperature' => $intervals[0]['temp_min'] === 9.2 && $intervals[0]['temp_max'] === 11.8,
        'interval_min_max_humidity' => $intervals[0]['hum_min'] === 65.0 && $intervals[0]['hum_max'] === 99.9,
        'interval_boundary_and_count' => count($intervals) === 2 && $intervals[0]['sample_count'] === 2 && $intervals[1]['sample_count'] === 1,
        'single_interval_observation' => $intervals[1]['temp_min'] === $intervals[1]['temp_max'],
        'unique_observation_count' => count($rows) === 2,
        'minimum_temperature' => $s['temp_min'] === 9.2, 'maximum_temperature' => $s['temp_max'] === 11.8,
        'average_temperature' => $s['temp_avg'] === 10.5,
        'minimum_humidity' => $s['hum_min'] === 65.0, 'maximum_humidity' => $s['hum_max'] === 99.9,
        'average_humidity' => $s['hum_avg'] === 82.5,
        'one_row_per_15_minutes' => count(m3_slots($rows)) === 1,
        'same_value_new_observation_counted' => count(m3_effective([$a, $same])) === 2,
        'raw_observations_preserved' => count(m3_effective([$rawA, $rawB, $copy])) === 2,
        'separate_15_minute_intervals' => count(m3_slots([$a, $nextSlot])) === 2,
        'invalid_calendar_date_rejected' => m3_record(['temp' => 10, 'hum' => 50, 'time' => '31.02.2026 08:00:00']) === null,
        'blank_values_rejected' => m3_number('', -50, 80) === null,
        'zero_temperature_valid' => m3_number('0', -50, 80) === 0.0];
    return ['version' => M3_VERSION, 'checks_passed' => !in_array(false, $tests, true), 'checks' => $tests,
        'interval_extrema' => true, 'storage_writable' => is_writable(m3_store()),
        'saved_day_files' => count(glob(m3_store() . '/*.jsonl') ?: []),
        'last_measurement' => m3_record(m3_read(m3_root() . '/meteo.json')) ?? m3_last_from_store(),
        'server_time' => date('d.m.Y H:i:s')];
}
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (defined('M3_FORCE_WRITE') && $method !== 'POST') {
        http_response_code(405); echo m3_json(['error' => 'Bu adres POST ölçümü kabul eder.']); exit;
    }
    if ($method === 'POST') {
        $input = $_POST;
        if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) { http_response_code(400); echo m3_json(['error' => 'Geçersiz veri biçimi.']); exit; }
        $t = m3_number($input['temp'] ?? $input['temperature'] ?? null, -50, 80);
        $h = m3_number($input['hum'] ?? $input['humidity'] ?? null, 0, 100);
        if ($t === null || $h === null) { http_response_code(400); echo m3_json(['error' => 'Geçerli temp ve hum alanları gerekli.']); exit; }
        $out = m3_locked(function () use ($t, $h) {
            $now = time();
            $r = ['id' => bin2hex(random_bytes(16)), 'temp' => $t, 'hum' => $h,
                'time' => date('d.m.Y H:i:s', $now), 'ts' => $now, 'source' => 'device', 'writer_version' => M3_VERSION];
            m3_append(date('Y-m-d', $now), [$r]);
            $cached = m3_compatibility($r);
            return ['ok' => true, 'version' => M3_VERSION, 'time' => $r['time'], 'compatibility_cache_updated' => $cached];
        });
    } elseif ($method === 'GET') {
        $action = $_GET['action'] ?? 'live';
        if (!is_string($action) || !in_array($action, ['live', 'history', 'archive', 'degree', 'daily', 'check'], true)) {
            http_response_code(400); echo m3_json(['error' => 'Geçersiz işlem.']); exit;
        }
        $out = m3_locked(function () use ($action) {
            if ($action === 'check') return m3_checks();
            $now = time(); $today = date('Y-m-d', $now); $from = $today; $to = $today;
            if ($action === 'history') {
                $days = filter_input(INPUT_GET, 'days', FILTER_VALIDATE_INT);
                if (!in_array($days, [1, 7, 30, 90, 365], true)) $days = 1;
                $since = $now - $days * 86400; $from = date('Y-m-d', $since);
            } elseif ($action === 'archive' || $action === 'degree' || $action === 'daily') {
                $a = m3_parse_date($_GET['from'] ?? ($action === 'daily' ? date('Y-m-d', $now - 30 * 86400) : $today));
                $b = m3_parse_date($_GET['to'] ?? $today);
                $maxDays = $action === 'archive' ? 366 : 3650;
                if (!$a || !$b || $a > $b || $a->diff($b)->days > $maxDays) throw new InvalidArgumentException('Geçerli tarih aralığı seçin: arşiv en fazla 366 gün, gün-derece ve günlük özet en fazla 3650 gün.');
                $from = ($action === 'degree' ? $a->modify('-1 day') : $a)->format('Y-m-d'); $to = $b->format('Y-m-d');
            }
            $metadata = [];
            $compactMode = $action === 'daily' ? 'daily_only' : ($action === 'archive' ? 'archive' : ($action !== 'live'));
            $byDay = m3_sync($from, $to, $compactMode, $metadata);
            $all = [];
            if ($action !== 'daily') {
                foreach ($byDay as $rows) $all = array_merge($all, $rows);
            }
            unset($byDay);
            if ($action === 'degree') return ['version' => M3_VERSION, 'server_ts' => $now, 'points' => array_values(array_filter($all, static function ($r) use ($now) { return $r['ts'] <= $now; }))];
            if ($action === 'daily') {
                $dailyRows = [];
                $allTempSum = 0;
                $allHumSum = 0;
                $allCount = 0;
                $overallTempMin = null;
                $overallTempMax = null;
                $overallHumMin = null;
                $overallHumMax = null;
                foreach ($metadata as $date => $meta) {
                    $summary = $meta['summary'] ?? null;
                    if ($summary && $summary['count'] > 0) {
                        $dailyRows[] = $summary;
                        $allTempSum += ($summary['temp_avg'] * $summary['count']);
                        $allHumSum += ($summary['hum_avg'] * $summary['count']);
                        $allCount += $summary['count'];
                        $overallTempMin = $overallTempMin === null ? $summary['temp_min'] : min($overallTempMin, $summary['temp_min']);
                        $overallTempMax = $overallTempMax === null ? $summary['temp_max'] : max($overallTempMax, $summary['temp_max']);
                        $overallHumMin = $overallHumMin === null ? $summary['hum_min'] : min($overallHumMin, $summary['hum_min']);
                        $overallHumMax = $overallHumMax === null ? $summary['hum_max'] : max($overallHumMax, $summary['hum_max']);
                    }
                }
                $dailyRows = array_reverse($dailyRows);
                $overall = [
                    'total_days' => count($dailyRows),
                    'total_count' => $allCount,
                    'temp_avg' => $allCount > 0 ? round($allTempSum / $allCount, 1) : null,
                    'temp_min' => $overallTempMin,
                    'temp_max' => $overallTempMax,
                    'hum_avg' => $allCount > 0 ? round($allHumSum / $allCount, 1) : null,
                    'hum_min' => $overallHumMin,
                    'hum_max' => $overallHumMax,
                ];
                return ['version' => M3_VERSION, 'from' => $from, 'to' => $to, 'overall' => $overall, 'rows' => $dailyRows];
            }
            if ($action === 'archive') {
                $slots = array_reverse($all); $total = count($slots); $pages = max(1, (int)ceil($total / 100));
                $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
                $page = min($pages, max(1, (int)$page));
                return ['version' => M3_VERSION, 'total' => $total, 'pages' => $pages, 'page' => $page,
                    'interval_extrema' => true, 'rows' => array_slice($slots, ($page-1)*100, 100)];
            }
            $last = $metadata[$today]['last'] ?? m3_record(m3_read(m3_root() . '/meteo.json')) ?? m3_last_from_store();
            $writer = $last !== null && $last['source'] === 'device';
            $result = ['version' => M3_VERSION, 'last' => $last, 'today' => $metadata[$today]['summary'] ?? m3_summary([], $today), 'server_ts' => $now,
                'tracking' => $writer ? 'ok' : 'observed',
                'warning' => $last !== null && !$writer ? 'Son ölçüm eski kayıt yolundan okundu. Görülebilen ve arşivde bulunan ölçümler hesaba katıldı. Tüm yeni ölçümleri kaydetmek için cihaz api/veri_kaydet.php adresine POST göndermelidir.' : null];
            if ($action === 'history') {
                $points = array_values(array_filter(m3_slots($all), static function ($r) use ($since, $now) { return $r['ts'] >= $since && $r['ts'] <= $now; }));
                if ($last !== null && $last['ts'] >= $since && $last['ts'] <= $now && (!$points || $last['ts'] > $points[count($points)-1]['ts'])) $points[] = $last;
                $result['points'] = $points;
            }
            return $result;
        });
    } else { http_response_code(405); $out = ['error' => 'GET veya POST gerekli.']; }
    echo m3_json($out);
} catch (InvalidArgumentException $e) {
    http_response_code(400); echo m3_json(['error' => $e->getMessage(), 'version' => M3_VERSION]);
} catch (Throwable $e) {
    error_log('Meteo v3: ' . $e->getMessage());
    http_response_code(500); echo m3_json(['error' => $e->getMessage(), 'version' => M3_VERSION]);
}
