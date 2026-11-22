<?php

declare(strict_types=1);

const JSC_CONTENT_FILE = __DIR__ . '/data/site-content-live.json';
const JSC_CONTENT_TEMPLATE_FILE = __DIR__ . '/data/site-content.json';

function jsc_json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function jsc_read_content(): array
{
    $contentFile = is_file(JSC_CONTENT_FILE) ? JSC_CONTENT_FILE : JSC_CONTENT_TEMPLATE_FILE;
    $contents = file_get_contents($contentFile);
    if ($contents === false) {
        throw new RuntimeException('Unable to read the saved site content.');
    }

    $content = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($content) || !isset($content['pricing'], $content['media']) || !is_array($content['media'])) {
        throw new RuntimeException('The saved site content has an invalid format.');
    }

    return $content;
}

function jsc_save_content(array $content): void
{
    $json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL;
    $temporaryFile = tempnam(dirname(JSC_CONTENT_FILE), 'content-');
    if ($temporaryFile === false) {
        throw new RuntimeException('Unable to create a temporary content file.');
    }

    $written = file_put_contents($temporaryFile, $json, LOCK_EX);
    if ($written !== strlen($json) || !chmod($temporaryFile, 0644) || !rename($temporaryFile, JSC_CONTENT_FILE)) {
        if (is_file($temporaryFile)) {
            unlink($temporaryFile);
        }
        throw new RuntimeException('Unable to save the site content. Check folder permissions.');
    }
}

function jsc_require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!isset($_SESSION['csrf_token']) || !is_string($token) || !hash_equals($_SESSION['csrf_token'], $token)) {
        jsc_json_response(['error' => 'Your session has expired. Refresh the page and try again.'], 403);
    }
}

function jsc_require_admin(): void
{
    if (empty($_SESSION['authenticated'])) {
        jsc_json_response(['error' => 'Please sign in to continue.'], 401);
    }

    jsc_require_csrf();
}

function jsc_read_json_request(): array
{
    $request = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($request)) {
        jsc_json_response(['error' => 'The request body must be a JSON object.'], 400);
    }

    return $request;
}

function jsc_validate_page_value(mixed $value, mixed $template, string $path = 'page'): void
{
    if (is_array($template)) {
        if (!is_array($value)) {
            throw new RuntimeException("Invalid page content at {$path}.");
        }

        if (array_is_list($template)) {
            if (!array_is_list($value) || count($value) > 30) {
                throw new RuntimeException("Invalid list at {$path}; lists can contain up to 30 items.");
            }
            if ($template === []) {
                if ($value !== []) {
                    throw new RuntimeException("Unexpected list items at {$path}.");
                }
                return;
            }
            foreach ($value as $index => $item) {
                jsc_validate_page_value($item, $template[0], "{$path}[{$index}]");
            }
            return;
        }

        if (array_is_list($value)) {
            throw new RuntimeException("Invalid page content at {$path}.");
        }
        $expectedKeys = array_keys($template);
        $submittedKeys = array_keys($value);
        sort($expectedKeys);
        sort($submittedKeys);
        if ($expectedKeys !== $submittedKeys) {
            throw new RuntimeException("Page fields do not match the expected structure at {$path}.");
        }
        foreach ($template as $key => $childTemplate) {
            jsc_validate_page_value($value[$key], $childTemplate, "{$path}.{$key}");
        }
        return;
    }

    if (is_string($template)) {
        if (!is_string($value) || strlen($value) > 5000 || preg_match('//u', $value) !== 1) {
            throw new RuntimeException("Text at {$path} must be valid UTF-8 and no longer than 5,000 bytes.");
        }
        return;
    }

    if (is_bool($template) && is_bool($value)) {
        return;
    }

    throw new RuntimeException("Invalid page content type at {$path}.");
}
