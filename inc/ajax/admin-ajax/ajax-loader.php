<?php
/**
 * Admin AJAX Components Organizer Loader
 *
 * @package Orbit_One
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// 1. Mount lead capture and form tracking rules
if ( file_exists( OONE_PATH . 'inc/ajax/admin-ajax/form-data-submit.php' ) ) {
    require_once OONE_PATH . 'inc/ajax/admin-ajax/form-data-submit.php';
}

// 2. Mount admin-only Google Form schema extraction scraper
if ( file_exists( OONE_PATH . 'inc/ajax/admin-ajax/google-fields-fetch.php' ) ) {
    require_once OONE_PATH . 'inc/ajax/admin-ajax/google-fields-fetch.php';
}