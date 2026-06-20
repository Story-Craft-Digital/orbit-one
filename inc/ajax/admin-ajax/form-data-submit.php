<?php

/**
 * Form Data Processing via Native AJAX Bridge
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}

// Register both public and authenticated core access listeners
add_action('wp_ajax_oone_lead_form_submit', 'oone_handle_ajax_public_submission');
add_action('wp_ajax_nopriv_oone_lead_form_submit', 'oone_handle_ajax_public_submission');

/**
 * Global Helper: Inserts a lead into custom tables.
 * Retained completely intact for global capability compatibility with add-ons.
 */
if (! function_exists('oone_insert_lead')) {
    function oone_insert_lead($data, $overrides = array())
    {
        global $wpdb;
        $current_time = gmdate('Y-m-d H:i:s');

        $check_form_id   = sanitize_text_field($data['form_id'] ?? '');
        $check_source    = sanitize_text_field($data['source'] ?? 'Unknown');
        $check_fname     = sanitize_text_field($data['fields']['firstName'] ?? '');
        $check_lname     = sanitize_text_field($data['fields']['lastName'] ?? '');
        $check_email     = sanitize_email($data['fields']['email'] ?? '');
        $check_phone     = sanitize_text_field($data['fields']['phone'] ?? '');
        $check_subject   = sanitize_text_field($data['fields']['subject'] ?? '');
        $check_type      = sanitize_text_field($data['fields']['type'] ?? '');

        $raw_string = $check_form_id . $check_source . $check_fname . $check_lname . $check_email . $check_phone . $check_subject . $check_type;
        $submission_hash = hash('sha256', $raw_string);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $duplicate_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT submission_id FROM {$wpdb->prefix}oone_form_submissions WHERE submission_hash = %s LIMIT 1",
                $submission_hash
            )
        );

        if ($duplicate_id) {
            return $duplicate_id;
        }

        $status = isset($overrides['lead_status']) ? sanitize_text_field($overrides['lead_status']) : 'new';
        $owner = isset($overrides['contact_owner_id'])
            ? absint($overrides['contact_owner_id'])
            : 0;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert(
            $wpdb->prefix . 'oone_form_submissions',
            array(
                'form_id'          => $check_form_id,
                'block_id'         => sanitize_text_field($data['block_id'] ?? 'external'),
                'entry_id'         => sanitize_text_field($data['entry_id'] ?? ''),
                'user_id'          => get_current_user_id(),
                'submission_hash'  => $submission_hash,
                'lead_status'      => $status,
                'contact_owner_id' => $owner,
                'submitted_at'     => $current_time,
                'last_activity'    => $current_time
            ),
            array(
                '%s',
                '%s',
                '%s',
                '%d',
                '%s',
                '%s',
                '%d',
                '%s',
                '%s',
            )
        );
        if (false === $wpdb->insert_id) {
            return false;
        }

        $submission_id = $wpdb->insert_id;
        if (! $submission_id) {
            return false;
        }

        if (isset($data['fields']) && is_array($data['fields'])) {
            foreach ($data['fields'] as $key => $value) {
                if ('' !== $value) {
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $wpdb->insert(
                        "{$wpdb->prefix}oone_form_submission_meta",
                        array(
                            'submission_id' => (int) $submission_id,
                            'meta_key'      => sanitize_key($key),
                            'meta_value'    => sanitize_textarea_field(is_array($value) ? implode(', ', $value) : $value)
                        ),
                        array('%d', '%s', '%s')
                    );
                }
            }
        }

        $cache_key = 'source_check_' . $submission_id;

        $existing_source = wp_cache_get(
            $cache_key,
            'oone'
        );

        if (false === $existing_source) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value
            $existing_source = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT meta_id
            FROM {$wpdb->prefix}oone_form_submission_meta
            WHERE submission_id = %d
            AND meta_key = 'formsource'
            LIMIT 1",
                    (int) $submission_id
                )
            );

            wp_cache_set(
                $cache_key,
                $existing_source,
                'oone'
            );
        }

        if (! $existing_source) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                $wpdb->prefix . 'oone_form_submission_meta',
                array(
                    'submission_id' => $submission_id,
                    'meta_key'      => 'formsource',
                    'meta_value'    => $check_source,
                ),
                array(
                    '%d',
                    '%s',
                    '%s',
                )
            );
        }

        $name = trim($check_fname . ' ' . $check_lname);

        if (empty($name)) {
            $name = 'Unknown';
        }
        $note = "New Lead via $check_source\nName: $name\nEmail: $check_email\nPhone: $check_phone";

        if ($owner > 0) {
            $owner_name = get_the_author_meta('display_name', $owner);
            if ($owner_name) {
                $note .= "\n(Assigned to " . $owner_name . ")";
            }
        }

        $note = sanitize_textarea_field($note);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->insert(
            "{$wpdb->prefix}oone_form_submission_timeline",
            array(
                'submission_id' => (int) $submission_id,
                'user_id'       => (int) get_current_user_id(),
                'type'          => 'submission',
                'note'          => $note,
                'created_at'    => $current_time
            ),
            array('%d', '%d', '%s', '%s', '%s')
        );

        wp_cache_delete('oone_total_leads_count', 'oone');
        wp_cache_delete('oone_latest_leads', 'oone');

        return $submission_id;
    }
}

/**
 * Handle submission incoming from AJAX loop.
 * Moved outside the function tracking block to guarantee execution.
 */
function oone_handle_ajax_public_submission()
{
    if (
        ! isset($_POST['_ajax_nonce']) ||
        ! wp_verify_nonce(
            sanitize_text_field(wp_unslash($_POST['_ajax_nonce'])),
            'oone_public_nonce'
        )
    ) {
        wp_send_json_error(array('message' => __('Security token expired.', 'orbit-one')), 403);
    }

    $sanitized_fields = array();
    if (isset($_POST['formData'])) {
        $raw_form_data = map_deep(wp_unslash($_POST['formData']), 'sanitize_textarea_field');
        if (is_array($raw_form_data)) {
            $sanitized_fields = $raw_form_data;
        }
    }

    $form_id = isset($_POST['formId'])
        ? sanitize_text_field(wp_unslash($_POST['formId']))
        : (isset($sanitized_fields['formId']) ? sanitize_text_field($sanitized_fields['formId']) : 'internal_crm');

    $block_id = isset($_POST['blockId'])
        ? sanitize_text_field(wp_unslash($_POST['blockId']))
        : (isset($sanitized_fields['blockId']) ? sanitize_text_field($sanitized_fields['blockId']) : 'manual');

    $entry_id = isset($_POST['entryId'])
        ? sanitize_text_field(wp_unslash($_POST['entryId']))
        : (isset($sanitized_fields['entryId']) ? sanitize_text_field($sanitized_fields['entryId']) : 'man_' . time());

    $source = isset($_POST['formsource'])
        ? sanitize_text_field(wp_unslash($_POST['formsource']))
        : (isset($sanitized_fields['formSource']) ? sanitize_text_field($sanitized_fields['formSource']) : 'Website Form');

    $lead_data = [
        'form_id'  => $form_id,
        'block_id' => $block_id,
        'entry_id' => $entry_id,
        'source'   => $source,
        'fields'   => $sanitized_fields
    ];

    $system_keys = array('formId', 'blockId', 'googleFormLink', 'fieldMappings', 'entryId', 'override_owner_id', 'override_status', 'formData', 'formsource', 'source', 'Source');
    foreach ($system_keys as $key) {
        unset($lead_data['fields'][$key]);
    }

    $overrides = array();
    if (current_user_can('oone_access_crm')) {
        if (! empty($_POST['override_owner_id'])) {
            $overrides['contact_owner_id'] = absint(
                wp_unslash($_POST['override_owner_id'])
            );
        }
        if (! empty($_POST['override_status'])) {
            $overrides['lead_status'] = sanitize_text_field(
                wp_unslash($_POST['override_status'])
            );
        }
    }

    $submission_id = oone_insert_lead($lead_data, $overrides);

    if ($submission_id) {
        wp_send_json_success(array('success' => true, 'submission_id' => $submission_id));
    }

    wp_send_json_error(
        array(
            'message' => __('Failed to save lead to database.', 'orbit-one')
        ),
        500
    );
}
