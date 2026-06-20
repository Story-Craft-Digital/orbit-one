<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package Orbit_One
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Ensure uninstall is called properly
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

/**
 * List of custom tables to drop
 */
$oone_tables = [
    $wpdb->prefix . 'oone_form_submissions',
    $wpdb->prefix . 'oone_form_submission_meta',
    $wpdb->prefix . 'oone_form_submission_timeline',
    $wpdb->prefix . 'oone_tasks',
    $wpdb->prefix . 'oone_task_logs',
    $wpdb->prefix . 'oone_chats',
    $wpdb->prefix . 'oone_notifications',
];

foreach ( $oone_tables as $oone_table ) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $wpdb->query( "DROP TABLE IF EXISTS " . esc_sql( $oone_table ) );
}

// 1. Delete main settings and disabled blocks list
delete_option( 'oone_settings' );
delete_option( 'oone_disabled_blocks' );

// 2. Clear any update check transients
delete_transient( 'oone_update_check' );

// 3. Optional: Clear versioning data
delete_option( 'oone_version' );

wp_cache_delete( 'oone_total_leads_count', 'oone' );
wp_cache_delete( 'oone_latest_leads', 'oone' );