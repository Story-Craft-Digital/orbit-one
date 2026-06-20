<?php

/**
 * Google Form Structure Scraping Interface
 *
 * @package Orbit_Deskk
 */

if (! defined('ABSPATH')) {
    exit;
}

add_action('wp_ajax_oone_extract_google_form_data', 'oone_handle_ajax_extract_google_form_data');

/**
 * Handle authenticated backend admin request loop.
 */
function oone_handle_ajax_extract_google_form_data()
{
    if (! current_user_can('manage_options')) {
        wp_send_json_error(
            array(
                'message' => __('Unauthorized capability level.', 'orbit-one')
            ),
            403
        );
    }

    if (
        ! isset($_POST['_ajax_nonce']) ||
        ! wp_verify_nonce(
            sanitize_text_field(wp_unslash($_POST['_ajax_nonce'])),
            'oone_admin_nonce'
        )
    ) {
        wp_send_json_error(
            array(
                'message' => __('Security validation mismatch.', 'orbit-one')
            ),
            403
        );
    }

    $url = isset($_POST['url']) ? esc_url_raw(wp_unslash($_POST['url'])) : '';

    if (empty($url)) {
        wp_send_json_error(array('message' => __('No valid URL target provided.', 'orbit-one')), 400);
    }

    if (strpos($url, 'docs.google.com/forms') === false) {
        wp_send_json_error(array('message' => __('Only native Google Form fields can be synced.', 'orbit-one')), 403);
    }

    $response = wp_remote_get($url, array(
        'timeout' => 15,
        'user-agent' => 'WordPress/' . get_bloginfo('version') . '; ' . get_bloginfo('url')
    ));

    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => __('Failed to fetch external response markup.', 'orbit-one')), 400);
    }

    $html = wp_remote_retrieve_body($response);

    if (empty($html)) {
        wp_send_json_error(array('message' =>  __('Google Form returned empty structure markup.', 'orbit-one')), 400);
    }

    $previous_libxml = libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
    $dom->loadHTML($html);
    $xpath = new DOMXPath($dom);

    $form = $xpath->query('//form[contains(@action, "/formResponse")]')->item(0);
    $form_action = $form ? $form->getAttribute('action') : '';
    $data_response_attr = $form ? $form->getAttribute('data-response') : '';

    $entry_fields = array();
    if (! empty($data_response_attr)) {
        preg_match_all(
            '/\["(\d+)",\[[^,]+,\d+,\["(.*?)"\]/',
            $data_response_attr,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $entry_fields[] = array(
                'name'  => 'entry.' . sanitize_text_field($match[1]),
                'label' => sanitize_text_field($match[2]),
            );
        }
    }

    libxml_clear_errors();
    libxml_use_internal_errors($previous_libxml);
    wp_send_json_success(array(
        'action'  => esc_url($form_action),
        'entries' => $entry_fields,
    ));
}
