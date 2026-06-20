<?php
/**
 * Main loader for Orbit One dashboard partials.
 *
 * @package Orbit_One
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$oone_header_path = __DIR__ . '/oone-dashboard-admin-header.php';

if ( file_exists( $oone_header_path ) ) {
	require_once $oone_header_path;
}