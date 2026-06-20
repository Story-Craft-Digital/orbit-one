<?php

/**
 * Style Loader for Orbit One
 * Manages Tailwind CSS local builds across Dashboards, Add-ons, and Gutenberg.
 */
if (! defined('ABSPATH')) {
    exit;
}
/**
 * 1. THE DASHBOARD LOADER
 * Automatically detects if the current page is an Orbit One or Orbit One Add-on page.
 */
function oone_enqueue_dashboard_assets($hook_suffix)
{
    $screen = get_current_screen();
    $is_oone_page = false;

    // A. Detect by Parent Menu (Catches Orbit One + All Add-ons using oone- prefix)
    if (isset($screen->parent_base) && strpos($screen->parent_base, 'oone-') !== false) {
        $is_oone_page = true;
    }

    // B. Detect by Prefix list (Backup safety)
    $oone_prefixes = ['oone-', 'oone', 'oone-kpi'];
    if (!$is_oone_page) {
        foreach ($oone_prefixes as $prefix) {
            if (strpos($hook_suffix, $prefix) !== false) {
                $is_oone_page = true;
                break;
            }
        }
    }

    if ($is_oone_page) {
        // Enqueue the Local Tailwind Build
        wp_enqueue_style(
            'oone-tailwind',
            plugins_url('assets/tailwind-built.css', OONE_PLUGIN_FILE),
            array(),
            OONE_VERSION
        );

        // Enqueue Custom Resets (Alignment, Link Color, Button fixes)
        wp_enqueue_style(
            'oone-custom',
            plugins_url('assets/custom.css', OONE_PLUGIN_FILE),
            array('oone-tailwind'),
            OONE_VERSION
        );

        // Enqueue WP Admin Positioning Fixes
        wp_enqueue_style(
            'oone-admin-protection',
            plugins_url('admin/assets/css/admin-protection.css', OONE_PLUGIN_FILE),
            array('oone-tailwind'),
            OONE_VERSION
        );

        // ==========================================================================
        // DYNAMIC INLINE PALETTE INJECTION
        // ==========================================================================
        // Fetch your colors option exactly how you compute them on your settings template page
        $colors = get_option('oone_custom_palette_colors', array(
            'primary'   => '#7c3aed',
            'secondary' => '#4f46e5',
            'accent'    => '#9333ea',
            'neutral'   => '#1e293b',
            'light'     => '#f8fafc',
            'white'     => '#ffffff'
        ));

        // Format raw CSS rules mapping variables out to root elements
        $palette_css = "
            :root {
                --oone-color-primary: " . esc_attr($colors['primary']) . ";
                --oone-color-secondary: " . esc_attr($colors['secondary']) . ";
                --oone-color-accent: " . esc_attr($colors['accent']) . ";
                --oone-color-neutral: " . esc_attr($colors['neutral']) . ";
                --oone-color-light: " . esc_attr($colors['light']) . ";
                --oone-color-white: " . esc_attr($colors['white']) . ";
            }
        ";

        // Securely bind the dynamic CSS properties directly onto our enqueued layout handle
        wp_add_inline_style('oone-custom', $palette_css);
    }
}
add_action('admin_enqueue_scripts', 'oone_enqueue_dashboard_assets');

/**
 * 2. THE FRONTEND LOADER
 * Loads the built Tailwind CSS for your blocks on the actual website.
 */
function oone_load_frontend_styles()
{
    if (is_admin()) return;

    // 1. Identify "Legacy Dashboard" pages where we actually NEED the core CSS
    // Add your slugs to this array as you create them.
    $legacy_dashboards = ['oone-kpi-login', 'oone-kpi-dashboard'];

    $should_load_core = false;

    // Check by slug
    if (is_page($legacy_dashboards)) {
        $should_load_core = true;
    }

    // Check by shortcode (Optional: automatically loads if [oone_kpi_dashboard] is present)
    $post = get_post();

    $content = $post instanceof WP_Post
        ? $post->post_content
        : '';
    if (has_shortcode($content, 'oone_kpi_dashboard')) {
        $should_load_core = true;
    }

    // 2. Only load the heavy CSS if we are on a legacy dashboard page
    if ($should_load_core) {
        wp_enqueue_style(
            'oone-tailwind-public',
            plugins_url('assets/tailwind-built.css', OONE_PLUGIN_FILE),
            array(),
            OONE_VERSION
        );

        wp_enqueue_style(
            'oone-custom-styles',
            plugins_url('assets/custom.css', OONE_PLUGIN_FILE),
            array('oone-tailwind-public'),
            OONE_VERSION
        );
    }
}
add_action('wp_enqueue_scripts', 'oone_load_frontend_styles');

/**
 * 3. EDITOR COMPATIBILITY WRAPPER
 * Enqueue both Tailwind and Custom CSS specifically for the block editor.
 */
function oone_enqueue_editor_specific_assets()
{
    // Enqueue Tailwind
    wp_enqueue_style(
        'oone-editor-tailwind',
        plugins_url('assets/tailwind-built.css', OONE_PLUGIN_FILE),
        array(),
        OONE_VERSION
    );

    wp_enqueue_style(
        'oone-editor-custom',
        plugins_url('assets/custom.css', OONE_PLUGIN_FILE),
        array('oone-editor-tailwind'),
        OONE_VERSION
    );
}
add_action('enqueue_block_editor_assets', 'oone_enqueue_editor_specific_assets');


// Dynamic Color Palette
function oone_enqueue_dynamic_palette() {
    $colors = oone_get_active_palette_colors();
    $palette_css = "
        :root {
            --oone-color-primary: " . esc_attr($colors['primary']) . ";
            --oone-color-secondary: " . esc_attr($colors['secondary']) . ";
            --oone-color-accent: " . esc_attr($colors['accent']) . ";
            --oone-color-neutral: " . esc_attr($colors['neutral']) . ";
            --oone-color-light: " . esc_attr($colors['light']) . ";
            --oone-color-white: " . esc_attr($colors['white']) . ";
        }
    ";
    
    // Apply to Dashboard handle
    wp_add_inline_style('oone-custom', $palette_css);
    
    // Apply to Frontend handle (only if it exists/is enqueued)
    wp_add_inline_style('oone-custom-styles', $palette_css);
}
add_action('admin_enqueue_scripts', 'oone_enqueue_dynamic_palette');
add_action('wp_enqueue_scripts', 'oone_enqueue_dynamic_palette');