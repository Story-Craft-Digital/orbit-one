<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates all database tables required for Orbit One CRM.
 *
 * CORE TABLES (Free Version):
 * - oone_form_submissions:
 *   Stores all lead/form submissions and core CRM data.
 *
 * - oone_form_submission_meta:
 *   Stores dynamic metadata for each submission (key-value structure).
 *
 *
 * PRO-READY STRUCTURE (Schema Included, Logic in Pro Plugin):
 * - lead_status:
 *   Reserved for CRM pipeline stages (e.g., New, Contacted, Qualified).
 *
 * - contact_owner_id:
 *   Reserved for assigning leads to users/agents.
 *
 * - oone_form_submission_timeline:
 *   Stores all lead activity logs including submissions, updates, and future Pro events.
 * 
 * - oone_tasks:
 *   Task management system for leads (assignment, tracking, workflow).
 *
 * - oone_task_logs:
 *   Audit logs for task actions (created, updated, completed).
 *
 * - oone_chats:
 *   Internal communication system linked to leads.
 *
 * - oone_notifications:
 *   Notification system for CRM events (read/unread tracking).
 *
 * NOTE:
 * These tables and fields are designed to support optional Pro extensions.
 * They remain inactive in Core and are only utilized when Pro plugin is installed.
 * This ensures backward compatibility and seamless upgrades.
 */
function oone_lead_tables_activate() {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $charset_collate = $wpdb->get_charset_collate();

    // 1. Submissions Table
    $table_submissions = $wpdb->prefix . 'oone_form_submissions';
    $sql_submissions = "CREATE TABLE $table_submissions (
        submission_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        form_id VARCHAR(100) NOT NULL,
        block_id VARCHAR(100) NOT NULL,
        entry_id VARCHAR(255) NULL DEFAULT NULL,
        status TINYINT(1) NOT NULL DEFAULT 0, 
        lead_status VARCHAR(50) DEFAULT 'new', 
        contact_owner_id BIGINT(20) UNSIGNED DEFAULT 0, 
        submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_id BIGINT(20) UNSIGNED,
        submission_hash VARCHAR(64) NOT NULL,
        PRIMARY KEY  (submission_id),
        KEY form_id (form_id),
        KEY block_id (block_id),
        KEY entry_id (entry_id(191)),
        KEY lead_status (lead_status),
        KEY contact_owner_id (contact_owner_id),
        KEY last_activity (last_activity),
        KEY submission_hash (submission_hash)
    ) $charset_collate;";
    dbDelta($sql_submissions);

    // 2. Meta Table
    $table_meta = $wpdb->prefix . 'oone_form_submission_meta';
    $sql_meta = "CREATE TABLE $table_meta (
        meta_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        submission_id BIGINT(20) UNSIGNED NOT NULL,
        meta_key VARCHAR(255) NOT NULL,
        meta_value LONGTEXT,
        PRIMARY KEY  (meta_id),
        KEY submission_id (submission_id),
        KEY meta_key (meta_key(191))
    ) $charset_collate;";
    dbDelta($sql_meta);

    // 3. Timeline Table
    $table_timeline = $wpdb->prefix . 'oone_form_submission_timeline';
    $sql_timeline = "CREATE TABLE $table_timeline (
        timeline_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        submission_id BIGINT(20) UNSIGNED NOT NULL,
        user_id BIGINT(20) UNSIGNED NOT NULL, 
        type VARCHAR(50) NOT NULL, 
        note LONGTEXT, 
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (timeline_id),
        KEY submission_id (submission_id),
        KEY type (type)
    ) $charset_collate;";
    dbDelta($sql_timeline);

    // 4. Tasks Table 
    $table_tasks = $wpdb->prefix . 'oone_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        task_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        submission_id BIGINT(20) UNSIGNED NOT NULL,
        created_by BIGINT(20) UNSIGNED NOT NULL,
        assigned_to BIGINT(20) UNSIGNED DEFAULT 0,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        due_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (task_id),
        KEY submission_id (submission_id),
        KEY assigned_to (assigned_to),
        KEY status (status)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // 5. Task Logs Table
    $table_task_logs = $wpdb->prefix . 'oone_task_logs';
    $sql_task_logs = "CREATE TABLE $table_task_logs (
        log_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        task_id BIGINT(20) UNSIGNED NOT NULL,
        user_id BIGINT(20) UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        note LONGTEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (log_id),
        KEY task_id (task_id)
    ) $charset_collate;";
    dbDelta($sql_task_logs);

    // 6. Chats Table
    $table_chats = $wpdb->prefix . 'oone_chats';
    $sql_chats = "CREATE TABLE $table_chats (
    chat_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    object_id BIGINT(20) UNSIGNED NOT NULL,
    object_type VARCHAR(20) NOT NULL DEFAULT 'lead',
    user_id BIGINT(20) UNSIGNED NOT NULL,
    message LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY  (chat_id),
    KEY object_lookup (object_id, object_type)
    ) $charset_collate;";
    dbDelta($sql_chats);

    // 7. Notifications Table
    $table_notifs = $wpdb->prefix . 'oone_notifications';
    $sql_notifs = "CREATE TABLE $table_notifs (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) UNSIGNED NOT NULL,
    created_by BIGINT(20) UNSIGNED NOT NULL,
    object_id BIGINT(20) UNSIGNED NOT NULL,
    object_type VARCHAR(20) NOT NULL DEFAULT 'lead',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY  (id),
    KEY user_read (user_id, is_read)
    ) $charset_collate;";
    dbDelta($sql_notifs);
    update_option( 'oone_db_version', OONE_VERSION );
}

/**
 * Run database upgrades when plugin version changes.
 */
function oone_maybe_upgrade_database() {
    $installed_version = get_option( 'oone_db_version', '0.0.0' );

    if ( version_compare( $installed_version, OONE_VERSION, '<' ) ) {
        oone_lead_tables_activate();
    }
}
if ( is_admin() ) {
    add_action( 'plugins_loaded', 'oone_maybe_upgrade_database' );
}