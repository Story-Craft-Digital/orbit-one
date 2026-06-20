<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Registers the custom 'Orbit One' block category.
 */
function oone_register_block_category($categories)
{
    $category_slugs = wp_list_pluck($categories, 'slug');
    if (in_array('oone-blocks', $category_slugs, true)) {
        return $categories;
    }

    array_unshift(
        $categories,
        array(
            'slug'  => 'oone-blocks',
            'title' => __('Orbit One', 'orbit-one'),
            // The icon will still be added via JavaScript.
        )
    );

    return $categories;
}
add_filter('block_categories_all', 'oone_register_block_category');

/**
 * Enqueues the JS for the block category and passes the SVG icon to it.
 */
function oone_enqueue_category_assets()
{
    $script_handle = 'oone-category-icon-script';

    wp_enqueue_script(
        $script_handle,
        plugin_dir_url(__FILE__) . 'block-category.js',
        array('wp-blocks', 'wp-dom-ready', 'wp-element'),
        OONE_VERSION,
        true
    );

    $svg_icon = oone_get_category_icon_svg();

    // Pass the SVG string as a JavaScript variable to our script.
    $script_data = sprintf(
        'var ooneCategoryIconSVG = %s;',
        wp_json_encode($svg_icon)
    );
    wp_add_inline_script($script_handle, $script_data, 'before');
}
add_action('enqueue_block_editor_assets', 'oone_enqueue_category_assets');
