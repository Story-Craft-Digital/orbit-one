<?php

/**
 * Main file for the admin dashboard (Core Version).
 */
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Register the main menu and essential sub-menus.
 */

function oone_create_admin_menu()
{

    $icon_svg_string = oone_get_category_icon_svg();
    $icon_data_uri = 'data:image/svg+xml;base64,' . base64_encode($icon_svg_string);

    // --- MAIN MENU ---
    add_menu_page(
        __('Orbit One', 'orbit-one'),
        __('Orbit One', 'orbit-one'),
        'manage_options',
        'oone-dashboard',
        'oone_render_dashboard_page',
        $icon_data_uri,
        58
    );

    // --- SUB MENUS ---
    // 1. Main Dashboard Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Dashboard', 'orbit-one'),
        esc_html__('Dashboard', 'orbit-one'),
        'manage_options',
        'oone-dashboard',
        'oone_render_dashboard_page'
    );

    // 2. Blocks Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Blocks', 'orbit-one'),
        esc_html__('Blocks', 'orbit-one'),
        'manage_options',
        'oone-blocks',
        'oone_render_blocks_page'
    );

    // 3. Leads Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Leads', 'orbit-one'),
        esc_html__('Leads', 'orbit-one'),
        'manage_options',
        'oone-leads',
        'oone_render_leads_page'
    );

    // 4. Hook for external submenu
    do_action('oone_after_main_submenus');

    // 5. Settings Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Settings', 'orbit-one'),
        esc_html__('Settings', 'orbit-one'),
        'manage_options',
        'oone-settings',
        'oone_render_settings_page'
    );

    // 6. Help Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Help', 'orbit-one'),
        esc_html__('Help', 'orbit-one'),
        'manage_options',
        'oone-help',
        'oone_render_help_page'
    );

    // 7. Upgrade to Pro Page
    add_submenu_page(
        'oone-dashboard',
        esc_html__('Upgrade to PRO', 'orbit-one'),
        esc_html__('Upgrade to PRO', 'orbit-one'),
        'manage_options',
        'oone-upgrade-pro',
        'oone_render_pro_page'
    );
}
add_action('admin_menu', 'oone_create_admin_menu');

/**
 * Add a body class for Orbit One admin pages
 */
function oone_add_admin_body_class($classes)
{
    // Check if the current request is for one of our pages safely
    $current_page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    if ($current_page && 0 === strpos($current_page, 'oone-')) {
        $classes .= ' oone-admin-page';
    }

    return $classes;
}
add_filter('admin_body_class', 'oone_add_admin_body_class');

/**
 * Loading Page Templates
 */
require_once __DIR__ . '/pages/page-dashboard.php';
require_once __DIR__ . '/pages/page-blocks.php';
require_once __DIR__ . '/pages/page-leads.php';
require_once __DIR__ . '/pages/page-settings.php';
require_once __DIR__ . '/pages/page-help.php';
require_once __DIR__ . '/pages/page-upgrade-to-pro.php';
