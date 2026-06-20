<?php

/**
 * Renders the content for the Settings page.
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles the logic for both Palette Reset and Full System Reset.
 */
function oone_handle_settings_reset()
{
    // 1. Basic security check: Is the nonce present and valid?
    if (! isset($_GET['_wpnonce']) || ! wp_verify_nonce(sanitize_key(wp_unslash($_GET['_wpnonce'])), 'oone_reset_settings_nonce')) {
        return;
    }

    // Double check user role capability security before executing raw options modifications
    if (! current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have permission to modify these settings.', 'orbit-one'));
    }

    // --- 2. PALETTE ONLY RESET ---
    if (isset($_GET['oone-reset-palette'])) {
        $settings = get_option('oone_settings', []);
        $palette_keys = ['color_palette_choice', 'default', 'oone', 'orbitone', 'sunset', 'ocean', 'forest', 'crimson', 'royal', 'slate', 'sakura', 'mono', 'mint', 'lavender', 'coffee', 'corporate', 'earthy', 'luxury', 'neon', 'pastel', 'twilight', 'autumn', 'sage_stone', 'rose_gold', 'citrus'];

        foreach ($palette_keys as $key) {
            unset($settings[$key]);
        }

        update_option('oone_settings', $settings);
        wp_safe_redirect(admin_url('admin.php?page=oone-settings&palette-reset=true&_wpnonce=' . wp_create_nonce('oone_settings_view_nonce')));
        exit;
    }

    // --- 3. FULL SYSTEM RESET ---
    // Note: Use 'oone-system-reset' to match your bottom link
    if (isset($_GET['oone-system-reset'])) {
        if (!current_user_can('activate_plugins')) {
            wp_die(esc_html__('You do not have permission to perform a system reset.', 'orbit-one'));
        }

        delete_option('oone_settings');
        $GLOBALS['oone_settings'] = array();
        wp_safe_redirect(admin_url('admin.php?page=oone-settings&system-reset=true&_wpnonce=' . wp_create_nonce('oone_settings_view_nonce')));
        exit;
    }
}
add_action('admin_init', 'oone_handle_settings_reset');

/**
 * Registers all the settings, sections, and fields for the global settings page.
 */
function oone_register_global_settings()
{
    // This function remains the same.
    register_setting('oone_settings_group', 'oone_settings', array(
        'sanitize_callback' => 'oone_sanitize_settings',
    ));
    add_settings_section('oone_api_keys_section', null, '__return_false', 'oone-settings-api');
    add_settings_field('google_maps_api_key', esc_html__('Google Maps API Key', 'orbit-one'), 'oone_render_api_key_field', 'oone-settings-api', 'oone_api_keys_section', ['option_name' => 'oone_settings', 'field_id' => 'google_maps_api_key', 'description' => esc_html__('Required for all map-related blocks to function correctly.', 'orbit-one')]);
    add_settings_section('oone_color_palette_section', null, '__return_false', 'oone-settings-colors');
    add_settings_field('color_palette', esc_html__('Color Palette', 'orbit-one'), 'oone_render_palette_selector_field', 'oone-settings-colors', 'oone_color_palette_section', ['option_name' => 'oone_settings']);
}
add_action('admin_init', 'oone_register_global_settings');

/**
 * Sanitization callback for oone_settings
 */
function oone_sanitize_settings($input)
{
    $new_input = array();

    // Sanitize API Key
    if (isset($input['google_maps_api_key'])) {
        $new_input['google_maps_api_key'] = sanitize_text_field($input['google_maps_api_key']);
    }

    // Sanitize Palette Choice
    if (isset($input['color_palette_choice'])) {
        $new_input['color_palette_choice'] = sanitize_key($input['color_palette_choice']);
    }

    // Sanitize custom palette labels and colors (Recursive sanitization)
    $palette_keys = array('default', 'oone', 'orbitone', 'sunset', 'ocean', 'forest', 'crimson', 'royal', 'slate', 'sakura', 'mono', 'mint', 'lavender', 'coffee', 'corporate', 'earthy', 'luxury', 'neon', 'pastel', 'twilight', 'autumn', 'sage_stone', 'rose_gold', 'citrus');

    foreach ($palette_keys as $key) {
        if (isset($input[$key])) {
            $new_input[$key]['label'] = sanitize_text_field($input[$key]['label']);
            if (isset($input[$key]['colors']) && is_array($input[$key]['colors'])) {
                foreach ($input[$key]['colors'] as $color_id => $hex) {
                    $new_input[$key]['colors'][sanitize_key($color_id)] = sanitize_hex_color($hex);
                }
            }
        }
    }

    return $new_input;
}

function oone_localize_global_palette()
{
    $semantic_colors = oone_get_active_palette_colors();
    $handle          = 'oone-color-palette';

    wp_register_script($handle, '', array('wp-blocks'), OONE_VERSION, true);
    wp_enqueue_script($handle);

    $js = 'window.oonePalette = ' . wp_json_encode($semantic_colors) . ';';
    wp_add_inline_script($handle, $js);
}
// 4. Hook it to 'init' so it runs on both frontend and backend
add_action('init', 'oone_localize_global_palette');

// -----------------------------------------------------------------------------
// ✅ NEW & REFACTORED FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * NEW HELPER FUNCTION (Single Source of Truth)
 *
 * Gets the final, active, and customized color palette.
 * This merges presets with any user-saved customizations.
 *
 * @return array The 6-color semantic palette.
 */
function oone_get_active_palette_colors()
{
    $settings       = get_option('oone_settings', []);
    $all_presets    = oone_get_color_presets();
    $palette_choice = $settings['color_palette_choice'] ?? 'default';

    // This line correctly gets the *customized* palette if it exists, or the preset if not.
    $chosen_palette = $settings[$palette_choice] ?? $all_presets[$palette_choice] ?? $all_presets['default'];

    // Get the colors array from the chosen palette
    $colors = $chosen_palette['colors'] ?? [];

    // Ensure all 6 keys exist with fallbacks, just in case.
    return [
        'primary'   => $colors['primary']   ?? '#6c278a',
        'secondary' => $colors['secondary'] ?? '#c154e8',
        'accent'    => $colors['accent']    ?? '#9813ca',
        'neutral'   => $colors['neutral']   ?? '#d1d5db',
        'light'     => $colors['light']     ?? '#f3f4f6',
        'white'     => $colors['white']     ?? '#ffffff',
    ];
}


function oone_localize_settings()
{
    // 1. Grab your raw options from the database
    $db_settings = get_option('oone_settings', []);

    // 2. Fetch the true color map structure
    $active_colors = oone_get_active_palette_colors();

    // 3. Extract your configured option arrays safely
    $api_key        = $db_settings['google_maps_api_key'] ?? '';
    $palette_choice = $db_settings['color_palette_choice'] ?? 'default';

    // 4. Inject them neatly as sub-properties into the existing script configuration handle
    wp_localize_script('oone-shared-libs', 'ooneSettingsData', array(
        'google_maps_api_key'  => $api_key,
        'color_palette_choice' => $palette_choice,
    ));

    // 5. Alternatively, if you want to push the raw array cleanly into your script variables:
    $js_patch = '
        if ( window.ooneSettings ) {
            window.ooneSettings.google_maps_api_key = ' . wp_json_encode($api_key) . ';
            window.ooneSettings.color_palette_choice = ' . wp_json_encode($palette_choice) . ';
        }
    ';
    wp_add_inline_script('oone-shared-libs', $js_patch);
}
add_action('enqueue_block_editor_assets', 'oone_localize_settings');

/**
 * Returns an array of predefined color palettes.
 */
function oone_get_color_presets()
{
    return [
        'default' => [
            'label' => 'WordPress Blue',
            'colors' => [
                'primary'   => '#2271b1',
                'secondary' => '#cae8ff',
                'accent'    => '#191e23',
                'neutral'   => '#50575e',
                'light'     => '#f0f0f1',
                'white'     => '#ffffff',
            ],
        ],
        'oone' => [
            'label' => 'Orbit One Purple',
            'colors' => [
                'primary'   => '#9813ca',
                'secondary' => '#eed4fa',
                'accent'    => '#2e1065',
                'neutral'   => '#6b7280',
                'light'     => '#faf5ff',
                'white'     => '#ffffff',
            ],
        ],

        'orbitone' => [
            'label'  => 'Orbit One Brand',
            'colors' => [
                'primary'   => '#9333ea',
                'secondary' => '#db2777',
                'accent'    => '#0f172a',
                'neutral'   => '#64748b',
                'light'     => '#f8fafc',
                'white'     => '#ffffff',
            ],
        ],
        'sunset' => [
            'label' => 'Warm Sunset',
            'colors' => [
                'primary'   => '#f97316',
                'secondary' => '#fdba74',
                'accent'    => '#44403c',
                'neutral'   => '#78716c',
                'light'     => '#fff7ed',
                'white'     => '#ffffff',
            ],
        ],
        'ocean' => [
            'label' => 'Oceanic',
            'colors' => [
                'primary'   => '#0891b2',
                'secondary' => '#67e8f9',
                'accent'    => '#1e293b',
                'neutral'   => '#64748b',
                'light'     => '#ecfeff',
                'white'     => '#ffffff',
            ],
        ],
        'forest' => [
            'label' => 'Forest',
            'colors' => [
                'primary'   => '#16a34a',
                'secondary' => '#86efac',
                'accent'    => '#1e293b',
                'neutral'   => '#475569',
                'light'     => '#f0fdf4',
                'white'     => '#ffffff',
            ],
        ],
        'crimson' => [
            'label' => 'Crimson Red',
            'colors' => [
                'primary'   => '#dc2626',
                'secondary' => '#fca5a5',
                'accent'    => '#450a0a',
                'neutral'   => '#991b1b',
                'light'     => '#fff1f2',
                'white'     => '#ffffff',
            ],
        ],
        'royal' => [
            'label' => 'Royal Gold',
            'colors' => [
                'primary'   => '#ca8a04',
                'secondary' => '#fde047',
                'accent'    => '#422006',
                'neutral'   => '#a16207',
                'light'     => '#fffbeb',
                'white'     => '#ffffff',
            ],
        ],
        'slate' => [
            'label' => 'Modern Slate',
            'colors' => [
                'primary'   => '#4f46e5',
                'secondary' => '#c7d2fe',
                'accent'    => '#1e293b',
                'neutral'   => '#64748b',
                'light'     => '#eef2ff',
                'white'     => '#ffffff',
            ],
        ],
        'sakura' => [
            'label' => 'Sakura Pink',
            'colors' => [
                'primary'   => '#be185d',
                'secondary' => '#fbcfe8',
                'accent'    => '#500724',
                'neutral'   => '#831843',
                'light'     => '#fdf2f8',
                'white'     => '#ffffff',
            ],
        ],
        'mono' => [
            'label' => 'Minimalist Mono',
            'colors' => [
                'primary'   => '#18181b',
                'secondary' => '#a1a1aa',
                'accent'    => '#18181b',
                'neutral'   => '#71717a',
                'light'     => '#f4f4f5',
                'white'     => '#ffffff',
            ],
        ],
        'mint' => [
            'label' => 'Mint Fresh',
            'colors' => [
                'primary'   => '#0d9488',
                'secondary' => '#99f6e4',
                'accent'    => '#0f172a',
                'neutral'   => '#475569',
                'light'     => '#f0fdfa',
                'white'     => '#ffffff',
            ],
        ],
        'lavender' => [
            'label' => 'Calm Lavender',
            'colors' => [
                'primary'   => '#7c3aed',
                'secondary' => '#ddd6fe',
                'accent'    => '#2e1065',
                'neutral'   => '#6b7280',
                'light'     => '#f5f3ff',
                'white'     => '#ffffff',
            ],
        ],
        'coffee' => [
            'label' => 'Rich Coffee',
            'colors' => [
                'primary'   => '#432818',
                'secondary' => '#9f86c0',
                'accent'    => '#211a13',
                'neutral'   => '#6f5e53',
                'light'     => '#fff8f2',
                'white'     => '#ffffff',
            ],
        ],
        'corporate' => [
            'label' => 'Corporate Blue',
            'colors' => [
                'primary'   => '#2563eb',
                'secondary' => '#dbeafe',
                'accent'    => '#1e3a8a',
                'neutral'   => '#475569',
                'light'     => '#f0f9ff',
                'white'     => '#ffffff',
            ],
        ],
        'earthy' => [
            'label' => 'Earthy Terracotta',
            'colors' => [
                'primary'   => '#c2410c',
                'secondary' => '#fed7aa',
                'accent'    => '#422006',
                'neutral'   => '#78716c',
                'light'     => '#fefce8',
                'white'     => '#ffffff',
            ],
        ],
        'luxury' => [
            'label' => 'Luxury Black & Gold',
            'colors' => [
                'primary'   => '#f59e0b',
                'secondary' => '#404040',
                'accent'    => '#facc15',
                'neutral'   => '#a3a3a3',
                'light'     => '#171717',
                'white'     => '#ffffff',
            ],
        ],
        'neon' => [
            'label' => 'Neon Tech',
            'colors' => [
                'primary'   => '#4ade80',
                'secondary' => '#a78bfa',
                'accent'    => '#f472b6',
                'neutral'   => '#e5e5e5',
                'light'     => '#0a0a0a',
                'white'     => '#ffffff',
            ],
        ],
        'pastel' => [
            'label' => 'Soft Pastel',
            'colors' => [
                'primary'   => '#a5b4fc',
                'secondary' => '#f5d0fe',
                'accent'    => '#60a5fa',
                'neutral'   => '#9ca3af',
                'light'     => '#f3f4f6',
                'white'     => '#ffffff',
            ],
        ],
        'twilight' => [
            'label' => 'Twilight Indigo',
            'colors' => [
                'primary'   => '#4338ca',
                'secondary' => '#c4b5fd',
                'accent'    => '#d946ef',
                'neutral'   => '#94a3b8',
                'light'     => '#fbfaff',
                'white'     => '#ffffff',
            ],
        ],
        'autumn' => [
            'label' => 'Autumn Spice',
            'colors' => [
                'primary'   => '#c2410c',
                'secondary' => '#ffedd5',
                'accent'    => '#451a03',
                'neutral'   => '#78716c',
                'light'     => '#fffaf0',
                'white'     => '#ffffff',
            ],
        ],
        'sage_stone' => [
            'label' => 'Sage & Stone',
            'colors' => [
                'primary'   => '#527853',
                'secondary' => '#e8f5e9',
                'accent'    => '#475569',
                'neutral'   => '#a1a1aa',
                'light'     => '#f9fafb',
                'white'     => '#ffffff',
            ],
        ],
        'rose_gold' => [
            'label' => 'Elegant Rose Gold',
            'colors' => [
                'primary'   => '#b48e92',
                'secondary' => '#f9f0f1',
                'accent'    => '#5c4742',
                'neutral'   => '#a69a97',
                'light'     => '#fff8f7',
                'white'     => '#ffffff',
            ],
        ],
        'citrus' => [
            'label' => 'Citrus Pop',
            'colors' => [
                'primary'   => '#84cc16',
                'secondary' => '#fef9c3',
                'accent'    => '#115e59',
                'neutral'   => '#6b7280',
                'light'     => '#fcffeb',
                'white'     => '#ffffff',
            ],
        ],
    ];
}

// --- Field Rendering Callback Functions ---

function oone_render_api_key_field($args)
{
    // This function remains the same.
    $options = get_option($args['option_name']);
    $value = isset($options[$args['field_id']]) ? $options[$args['field_id']] : '';
?>
    <div class="relative max-w-md">
        <input
            type="password"
            id="<?php echo esc_attr($args['field_id']); ?>"
            name="<?php echo esc_attr($args['option_name'] . '[' . $args['field_id'] . ']'); ?>"
            value="<?php echo esc_attr($value); ?>"
            class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition pr-10" />
        <button type="button" class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-purple-600 api-key-toggle">

            <svg class="w-5 h-5 eye-open" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15a3 3 0 110-6 3 3 0 010 6z" />
            </svg>

            <svg class="w-5 h-5 eye-closed hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15a3 3 0 110-6 3 3 0 010 6z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6" />
            </svg>

        </button>
    </div>
    <p class="description"><?php echo esc_html($args['description']); ?></p>
<?php
}

function oone_render_palette_selector_field($args)
{
    $options = get_option($args['option_name']);
    $presets = oone_get_color_presets();
    $current_choice = isset($options['color_palette_choice']) ? $options['color_palette_choice'] : 'default';
?>


    <fieldset>
        <legend class="screen-reader-text"><span><?php esc_html_e('Color Palette', 'orbit-one'); ?></span></legend>

        <div id="oone-palette-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach ($presets as $key => $default_palette) :
                $saved_palette = isset($options[$key]) ? $options[$key] : $default_palette;
                $current_label = $saved_palette['label'];
                $current_colors = $saved_palette['colors'];
            ?>
                <label class="cursor-pointer palette-container group">
                    <input type="radio" name="<?php echo esc_attr($args['option_name']); ?>[color_palette_choice]" value="<?php echo esc_attr($key); ?>" class="sr-only peer" <?php checked($current_choice, $key); ?>>
                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-600 peer-checked:ring-2 peer-checked:ring-purple-300 bg-white space-y-3">

                        <div class="flex items-center justify-left">
                            <span class="font-semibold text-slate-700 p-1 palette-label-text"><?php echo esc_html($current_label); ?></span>
                            <input
                                type="text"
                                name="<?php echo esc_attr($args['option_name']); ?>[<?php echo esc_attr($key); ?>][label]"
                                value="<?php echo esc_attr($current_label); ?>"
                                class="font-semibold text-slate-700 p-1 w-full border-0 bg-transparent focus:ring-0 focus:shadow-none hidden palette-label-input">
                            <button type="button" class="p-1 text-slate-400 hover:text-purple-600 transition-opacity edit-palette-button flex-shrink-0">
                                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex space-x-1 h-8">
                            <?php foreach ($current_colors as $color_key => $color_value) : ?>
                                <label class="block w-1/6 h-full rounded cursor-pointer color-swatch" style="background-color: <?php echo esc_attr($color_value); ?>;">
                                    <input
                                        type="color"
                                        name="<?php echo esc_attr($args['option_name']); ?>[<?php echo esc_attr($key); ?>][colors][<?php echo esc_attr($color_key); ?>]"
                                        value="<?php echo esc_attr($color_value); ?>"
                                        class="sr-only color-picker-input">
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </label>
            <?php endforeach; ?>
        </div>
    </fieldset>
<?php
}

/**
 * Renders the content for the Global Settings page.
 */
function oone_render_settings_page()
{
    if (! current_user_can('manage_options')) {
        return;
    }

    // Guard against URL tampering alerts when tracking reset success notification messages
    if (isset($_GET['settings-reset']) || isset($_GET['palette-reset']) || isset($_GET['system-reset'])) {
        if (! isset($_GET['_wpnonce']) || ! wp_verify_nonce(sanitize_key(wp_unslash($_GET['_wpnonce'])), 'oone_settings_view_nonce')) {
            wp_die(esc_html__('Security check failed.', 'orbit-one'));
        }
    }

    // GATHER SYSTEM DATA
    $system_info = [
        'WP Version'    => get_bloginfo('version'),
        'PHP Version'   => phpversion(),
        'Active Theme'  => wp_get_theme()->get('Name'),
        'Core Version'  => OONE_VERSION,
        'Server Info'  => isset($_SERVER['SERVER_SOFTWARE']) ? sanitize_text_field(wp_unslash($_SERVER['SERVER_SOFTWARE'])) : 'Unknown',
        'Memory Limit'  => ini_get('memory_limit'),
        'Debug Mode'    => (defined('WP_DEBUG') && WP_DEBUG) ? 'Enabled' : 'Disabled',
    ];

    // Prepare the clean copy string (The "Clean" format)
    $copy_text = "";
    foreach ($system_info as $label => $value) {
        $copy_text .= "$label: $value\n";
    }

    if (isset($_GET['settings-reset'])) {
        add_settings_error('oone_settings', 'settings_reset', esc_html__('Settings have been reset to default.', 'orbit-one'), 'success');
    }

    if (isset($_GET['palette-reset'])) {
        add_settings_error('oone_settings', 'palette_reset', esc_html__('Color palettes have been restored to default.', 'orbit-one'), 'success');
    }

    if (isset($_GET['system-reset'])) {
        add_settings_error('oone_settings', 'system_reset', esc_html__('All Orbit One plugin data has been successfully wiped.', 'orbit-one'), 'success');
    }

    settings_errors();

?>

    <div class="wrap oone-settings bg-slate-50 oone-main-viewport">

        <?php
        oone_render_dashboard_header(
            __('Settings', 'orbit-one'),
            'banner'
        );
        ?>
        <div class="oone-scroll-area">

            <form action="options.php" method="post" class="flex flex-col gap-8">
                <?php settings_fields('oone_settings_group'); ?>

                <div class="p-8 bg-white rounded-lg shadow-md border border-slate-200">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">API Keys</h2>
                    <p class="text-base text-slate-600 mb-6">
                        Enter API keys for third-party services used by Orbit One blocks.
                    </p>
                    <table class="form-table">
                        <?php do_settings_fields('oone-settings-api', 'oone_api_keys_section'); ?>
                    </table>
                </div>

                <div class="p-8 bg-white rounded-lg shadow-md border border-slate-200">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">Color Palette</h2>
                    <p class="text-base text-slate-600 mb-6">
                        Choose or customize a palette. The selected palette will be available as a default for all Orbit One blocks.
                    </p>
                    <?php do_settings_fields('oone-settings-colors', 'oone_color_palette_section'); ?>
                </div>

                <div class="flex items-center gap-x-4">
                    <button type="submit" name="submit" id="submit" class="px-5 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition">
                        <?php esc_html_e('Save Settings', 'orbit-one'); ?>
                    </button>

                    <a href="<?php echo esc_url(add_query_arg(array('oone-reset-palette' => 'true', '_wpnonce' => wp_create_nonce('oone_reset_settings_nonce')), admin_url('admin.php?page=oone-settings'))); ?>"
                        class="oone-confirm-trigger inline-block px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition"
                        data-title="<?php esc_attr_e('Reset Colors?', 'orbit-one'); ?>"
                        data-desc="<?php esc_attr_e('This will restore all color palettes to default. Your API keys are safe.', 'orbit-one'); ?>"
                        data-type="warning">
                        <?php esc_html_e('Reset Colors', 'orbit-one'); ?>
                    </a>
                </div>

                <div class="p-8 bg-white rounded-lg shadow-md border border-slate-200">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-800 mb-1"><?php esc_html_e('System Environment', 'orbit-one'); ?></h2>
                            <p class="text-sm text-slate-500"><?php esc_html_e('Technical details for support and debugging.', 'orbit-one'); ?></p>
                        </div>
                        <button type="button" id="oone-copy-system-status" class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition shadow-md shadow-purple-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                            </svg>
                            <span id="copy-btn-text"><?php esc_html_e('Copy System Report', 'orbit-one'); ?></span>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                        <?php foreach ($system_info as $label => $value) : ?>
                            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span class="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1"><?php echo esc_html($label); ?></span>
                                <span class="block text-sm font-mono font-semibold text-slate-700"><?php echo esc_html($value); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <textarea id="oone-system-status-textarea" class="sr-only" aria-hidden="true"><?php echo esc_textarea(trim($copy_text)); ?></textarea>
                </div>


                <?php if (current_user_can('activate_plugins')) : ?>
                    <div class="p-8 bg-red-50 rounded-lg border border-red-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-red-800"><?php esc_html_e('Orbit One System Reset', 'orbit-one'); ?></h3>
                                <p class="text-red-700 mt-1"><?php esc_html_e('Wipe all plugin data, including API keys, licenses, and global settings. This cannot be undone.', 'orbit-one'); ?></p>
                            </div>
                            <a href="<?php echo esc_url(add_query_arg(array('oone-system-reset' => 'true', '_wpnonce' => wp_create_nonce('oone_reset_settings_nonce')), admin_url('admin.php?page=oone-settings'))); ?>"
                                class="oone-confirm-trigger px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                                data-title="Wipe All Data?"
                                data-desc="CRITICAL: This will permanently delete all API keys, licenses, and settings."
                                data-type="danger">
                                <?php esc_html_e('Reset All Plugin Data', 'orbit-one'); ?>
                            </a>
                        </div>
                    </div>
                <?php endif; ?>

            </form>

            <div id="oone-confirm-modal" class="fixed inset-0 z-[10000] hidden">
                <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                <div class="fixed inset-0 flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 transform transition-all">
                        <div id="modal-icon-container" class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        </div>
                        <h3 id="modal-title" class="text-xl font-bold text-slate-800 mb-2"></h3>
                        <p id="modal-description" class="text-slate-600 mb-6"></p>
                        <div class="flex gap-3">
                            <button id="modal-cancel" class="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                                <?php esc_html_e('Cancel', 'orbit-one'); ?>
                            </button>
                            <a id="modal-confirm" href="#" class="flex-1 py-2 px-4 text-white font-semibold rounded-lg transition-colors shadow-lg">
                                <?php esc_html_e('Proceed', 'orbit-one'); ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php
}
