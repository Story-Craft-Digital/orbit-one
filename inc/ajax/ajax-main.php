<?php
/**
 * Main Ajax Handler Router
 *
 * @package Orbit_One
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Route directly into our isolated Admin AJAX component system
if ( file_exists( OONE_PATH . 'inc/ajax/admin-ajax/ajax-loader.php' ) ) {
    require_once OONE_PATH . 'inc/ajax/admin-ajax/ajax-loader.php';
}