<?php

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

try {
    $content = jsc_read_content();
    jsc_json_response([
        'pricing' => $content['pricing'],
        'media' => $content['media'],
    ]);
} catch (JsonException | RuntimeException $error) {
    error_log('JSC public content error: ' . $error->getMessage());
    jsc_json_response(['error' => 'Site content is temporarily unavailable.'], 500);
}
