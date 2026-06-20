<?php
/**
 * Main loader for all Orbit One utility files.
 * Provides central access to brand SVGs, block icons, and preview logic.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Load brand assets (Logo, category icons, info icons)
require_once __DIR__ . '/brand-svgs.php';

// 2. Load the library for individual block icons (The switch statement)
require_once __DIR__ . '/block-icons.php';

// 3. Load the block preview logic for the dashboard modals
require_once __DIR__ . '/block-previews.php';

// 4. All helpers
require_once __DIR__ . '/helpers.php';