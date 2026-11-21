<?php

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    jsc_json_response(['error' => 'Admin is not configured. Follow the setup steps in README.md.'], 503);
}

$adminConfig = require $configFile;
if (!is_array($adminConfig) || !isset($adminConfig['password_hash']) || !is_string($adminConfig['password_hash']) || !password_get_info($adminConfig['password_hash'])['algo']) {
    jsc_json_response(['error' => 'Admin configuration is invalid. Check admin/config.php.'], 503);
}

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/admin',
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    jsc_json_response([
        'authenticated' => !empty($_SESSION['authenticated']),
        'csrfToken' => $_SESSION['csrf_token'] ?? null,
    ]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    jsc_json_response(['error' => 'This request method is not supported.'], 405);
}

$isJsonRequest = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');
try {
    $request = $isJsonRequest ? jsc_read_json_request() : $_POST;
} catch (JsonException) {
    jsc_json_response(['error' => 'The request body contains invalid JSON.'], 400);
}
$action = $request['action'] ?? '';

if ($action === 'login') {
    $password = $request['password'] ?? null;
    if (!is_string($password) || !password_verify($password, $adminConfig['password_hash'])) {
        jsc_json_response(['error' => 'The password is incorrect.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['authenticated'] = true;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    jsc_json_response(['authenticated' => true, 'csrfToken' => $_SESSION['csrf_token']]);
}

jsc_require_admin();

try {
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => '/admin',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        jsc_json_response(['authenticated' => false]);
    }

    $content = jsc_read_content();

    if ($action === 'save-pricing') {
        $pricing = $request['pricing'] ?? null;
        if (!is_array($pricing)) {
            jsc_json_response(['error' => 'Pricing details are missing.'], 400);
        }

        $season = $pricing['season'] ?? null;
        $weekendChargePercent = $pricing['weekendChargePercent'] ?? null;
        if (!is_string($season) || trim($season) === '' || strlen($season) > 100) {
            jsc_json_response(['error' => 'Enter a season name of up to 100 characters.'], 422);
        }
        if (!is_int($weekendChargePercent) || $weekendChargePercent < 0 || $weekendChargePercent > 100) {
            jsc_json_response(['error' => 'Weekend surcharge must be a whole number from 0 to 100.'], 422);
        }

        $submittedFacilities = $pricing['facilities'] ?? null;
        $submittedPackages = $pricing['bowlingMachinePackages'] ?? null;
        if (!is_array($submittedFacilities) || !is_array($submittedPackages)) {
            jsc_json_response(['error' => 'Facility and bowling package rates are required.'], 422);
        }

        $facilityRates = [];
        foreach (['turf', 'nets'] as $facilityId) {
            $rates = $submittedFacilities[$facilityId] ?? null;
            if (!is_array($rates)) {
                jsc_json_response(['error' => 'Enter day and night rates for both facilities.'], 422);
            }
            foreach (['dayRate', 'nightRate'] as $period) {
                $rate = $rates[$period] ?? null;
                if (!is_int($rate) || $rate < 0 || $rate > 1000000) {
                    jsc_json_response(['error' => 'Facility rates must be whole numbers from 0 to 1,000,000.'], 422);
                }
            }
            $facilityRates[$facilityId] = $rates;
        }

        $packageRates = [];
        foreach ([10, 20, 30, 40, 50, 70] as $overs) {
            $rate = $submittedPackages[(string) $overs] ?? null;
            if (!is_int($rate) || $rate < 0 || $rate > 1000000) {
                jsc_json_response(['error' => 'Bowling package rates must be whole numbers from 0 to 1,000,000.'], 422);
            }
            $packageRates[$overs] = $rate;
        }

        $content['pricing']['season'] = trim($season);
        $content['pricing']['weekendChargePercent'] = $weekendChargePercent;
        foreach ($content['pricing']['facilities'] as &$facility) {
            if (isset($facilityRates[$facility['id']])) {
                $facility['dayRate'] = $facilityRates[$facility['id']]['dayRate'];
                $facility['nightRate'] = $facilityRates[$facility['id']]['nightRate'];
            }
        }
        unset($facility);
        foreach ($content['pricing']['bowlingMachinePackages'] as &$package) {
            if (isset($packageRates[$package['overs']])) {
                $package['price'] = $packageRates[$package['overs']];
            }
        }
        unset($package);

        jsc_save_content($content);
        jsc_json_response(['pricing' => $content['pricing']]);
    }

    if ($action === 'save-page') {
        $page = $request['page'] ?? null;
        if (!is_array($page)) {
            jsc_json_response(['error' => 'Website content is missing.'], 400);
        }

        jsc_validate_page_value($page, $content['page']);

        $expectedSections = array_values(array_filter(
            array_keys($content['page']['sections']),
            static fn (string $sectionId): bool => $sectionId !== 'footer'
        ));
        $submittedOrder = $page['order'];
        $sortedExpected = $expectedSections;
        $sortedOrder = $submittedOrder;
        sort($sortedExpected);
        sort($sortedOrder);
        if ($sortedExpected !== $sortedOrder) {
            jsc_json_response(['error' => 'Every website section must appear exactly once in the section order.'], 422);
        }

        foreach ($page['sections']['offers']['content']['items'] as $offer) {
            if (!in_array($offer['status'], ['ACTIVE', 'EXPIRED'], true)) {
                jsc_json_response(['error' => 'Offer status must be ACTIVE or EXPIRED.'], 422);
            }
        }
        foreach ($page['sections']['gallery']['content']['items'] as $item) {
            if (!in_array($item['category'], ['turf', 'nets', 'bowling', 'academy'], true)) {
                jsc_json_response(['error' => 'Choose a valid gallery category for every gallery card.'], 422);
            }
        }
        foreach ($page['sections']['reviews']['content']['items'] as $review) {
            if (!preg_match('/^[1-5]$/', $review['rating'])) {
                jsc_json_response(['error' => 'Review ratings must be from 1 to 5 stars.'], 422);
            }
        }

        foreach ($page['images'] as $imageKey => $imagePath) {
            if (!preg_match('/^\\/?assets\\/[A-Za-z0-9._\\/-]+$/', $imagePath) || str_contains($imagePath, '..')) {
                jsc_json_response(['error' => "The image path for {$imageKey} is invalid."], 422);
            }
            $localPath = dirname(__DIR__) . '/' . ltrim($imagePath, '/');
            if (!is_file($localPath)) {
                jsc_json_response(['error' => "The selected image for {$imageKey} could not be found."], 422);
            }
        }

        $content['page'] = $page;
        jsc_save_content($content);
        jsc_json_response(['page' => $content['page']]);
    }

    if ($action === 'upload-section-image') {
        $target = $request['target'] ?? '';
        if (!is_string($target) || !array_key_exists($target, $content['page']['images'])) {
            jsc_json_response(['error' => 'Choose a valid website image slot.'], 422);
        }

        $upload = $_FILES['file'] ?? null;
        if (!is_array($upload)) {
            jsc_json_response(['error' => 'Choose an image to upload.'], 422);
        }
        $uploadError = $upload['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) {
            jsc_json_response(['error' => 'The image exceeds the hosting upload limit.'], 413);
        }
        if ($uploadError !== UPLOAD_ERR_OK || !isset($upload['tmp_name']) || !is_string($upload['tmp_name']) || !is_uploaded_file($upload['tmp_name'])) {
            jsc_json_response(['error' => 'The image upload did not complete. Try again or check hosting upload limits.'], 422);
        }

        $imageTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        $fileInfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $fileInfo->file($upload['tmp_name']);
        if (!is_string($mimeType) || !isset($imageTypes[$mimeType])) {
            jsc_json_response(['error' => 'Use a JPG, PNG, WebP, or GIF image.'], 415);
        }
        if (!isset($upload['size']) || !is_int($upload['size']) || $upload['size'] < 1 || $upload['size'] > 12 * 1024 * 1024) {
            jsc_json_response(['error' => 'Website images must be 12 MB or smaller.'], 413);
        }

        $uploadDirectory = dirname(__DIR__) . '/assets/uploads';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            jsc_json_response(['error' => 'The uploads folder could not be created. Check hosting permissions.'], 500);
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . $imageTypes[$mimeType];
        $destination = $uploadDirectory . '/' . $fileName;
        if (!move_uploaded_file($upload['tmp_name'], $destination)) {
            jsc_json_response(['error' => 'The image could not be saved. Check hosting permissions.'], 500);
        }
        if (!chmod($destination, 0644)) {
            unlink($destination);
            jsc_json_response(['error' => 'The uploaded image permissions could not be set.'], 500);
        }

        $content['page']['images'][$target] = '/assets/uploads/' . $fileName;
        try {
            jsc_save_content($content);
        } catch (RuntimeException $error) {
            unlink($destination);
            throw $error;
        }

        jsc_json_response(['target' => $target, 'url' => $content['page']['images'][$target]]);
    }

    if ($action === 'upload') {
        $upload = $_FILES['file'] ?? null;
        if (!is_array($upload)) {
            jsc_json_response(['error' => 'Choose a photo or video to upload.'], 422);
        }
        $uploadError = $upload['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) {
            jsc_json_response(['error' => 'The file exceeds the upload limit configured by the hosting account.'], 413);
        }
        if ($uploadError !== UPLOAD_ERR_OK || !isset($upload['tmp_name']) || !is_string($upload['tmp_name']) || !is_uploaded_file($upload['tmp_name'])) {
            jsc_json_response(['error' => 'The upload did not complete. Try again or check the hosting upload limits.'], 422);
        }

        $mimeTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'video/mp4' => 'mp4',
            'video/webm' => 'webm',
            'video/quicktime' => 'mov',
        ];
        $fileInfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $fileInfo->file($upload['tmp_name']);
        if (!is_string($mimeType) || !isset($mimeTypes[$mimeType])) {
            jsc_json_response(['error' => 'Use a JPG, PNG, WebP, GIF, MP4, WebM, or MOV file.'], 415);
        }

        $isVideo = str_starts_with($mimeType, 'video/');
        $maximumSize = $isVideo ? 100 * 1024 * 1024 : 12 * 1024 * 1024;
        if (!isset($upload['size']) || !is_int($upload['size']) || $upload['size'] < 1 || $upload['size'] > $maximumSize) {
            jsc_json_response(['error' => $isVideo ? 'Videos must be 100 MB or smaller.' : 'Photos must be 12 MB or smaller.'], 413);
        }

        $title = $request['title'] ?? null;
        if (!is_string($title) || trim($title) === '' || strlen($title) > 120 || preg_match('//u', $title) !== 1) {
            jsc_json_response(['error' => 'Enter a title of up to 120 characters.'], 422);
        }
        $title = trim($title);

        $category = $request['category'] ?? '';
        if (!in_array($category, ['turf', 'nets', 'bowling', 'academy'], true)) {
            jsc_json_response(['error' => 'Choose a valid gallery category.'], 422);
        }

        $uploadDirectory = dirname(__DIR__) . '/assets/uploads';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            jsc_json_response(['error' => 'The uploads folder could not be created. Check hosting permissions.'], 500);
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . $mimeTypes[$mimeType];
        $destination = $uploadDirectory . '/' . $fileName;
        if (!move_uploaded_file($upload['tmp_name'], $destination)) {
            jsc_json_response(['error' => 'The upload could not be saved. Check hosting permissions and upload limits.'], 500);
        }
        if (!chmod($destination, 0644)) {
            unlink($destination);
            jsc_json_response(['error' => 'The uploaded file permissions could not be set. Check hosting permissions.'], 500);
        }

        $media = [
            'id' => pathinfo($fileName, PATHINFO_FILENAME),
            'filename' => $fileName,
            'url' => '/assets/uploads/' . $fileName,
            'type' => $isVideo ? 'video' : 'image',
            'title' => $title,
            'category' => $category,
        ];
        array_unshift($content['media'], $media);
        try {
            jsc_save_content($content);
        } catch (RuntimeException $error) {
            unlink($destination);
            throw $error;
        }

        jsc_json_response(['media' => $media]);
    }

    if ($action === 'delete-media') {
        $id = $request['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/', $id)) {
            jsc_json_response(['error' => 'Choose a valid gallery item to remove.'], 422);
        }

        $mediaIndex = null;
        foreach ($content['media'] as $index => $item) {
            if (($item['id'] ?? null) === $id) {
                $mediaIndex = $index;
                break;
            }
        }
        if ($mediaIndex === null) {
            jsc_json_response(['error' => 'That gallery item no longer exists. Refresh and try again.'], 404);
        }

        $fileName = $content['media'][$mediaIndex]['filename'] ?? '';
        if (!is_string($fileName) || !preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|gif|mp4|webm|mov)$/', $fileName)) {
            jsc_json_response(['error' => 'The saved media file name is invalid.'], 500);
        }

        array_splice($content['media'], $mediaIndex, 1);
        jsc_save_content($content);
        $filePath = dirname(__DIR__) . '/assets/uploads/' . $fileName;
        if (is_file($filePath) && !unlink($filePath)) {
            jsc_json_response(['error' => 'The gallery item was removed, but its file could not be deleted. Check hosting permissions.'], 500);
        }

        jsc_json_response(['deleted' => true]);
    }

    jsc_json_response(['error' => 'Unknown admin action.'], 400);
} catch (JsonException | RuntimeException $error) {
    error_log('JSC admin API error: ' . $error->getMessage());
    jsc_json_response(['error' => 'The request could not be completed. Check the server error log for details.'], 500);
}
