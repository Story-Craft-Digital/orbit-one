<?php

/**
 * Plugin Name:       Orbit One
 * Plugin URI:        https://storycraft.digital/plugins/orbit-one
 * Description:       A high-performance business intelligence and lead management framework.
 * Version:           1.0.0
 * Author:            Story Craft Digital
 * Author URI:        https://storycraft.digital
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       orbit-one
 * Requires at least: 6.2
 * Tested up to:      7.0
 * Requires PHP:      7.4
 *
 * @package           Orbit_One
 */

if ( ! defined('ABSPATH') ) {
	exit;
}

/**
 * Define plugin constants.
 */

if ( ! defined('OONE_VERSION') ) {
    define('OONE_VERSION', '1.0.0');
}
define( 'OONE_PLUGIN_FILE', __FILE__ );
define( 'OONE_BASENAME', plugin_basename( __FILE__ ) );
define( 'OONE_PATH', plugin_dir_path( __FILE__ ) );
define( 'OONE_URL', plugin_dir_url( __FILE__ ) );

if (! defined('OONE_SITE_URL')) {
    define(
        'OONE_SITE_URL',
        apply_filters('oone_site_url', 'https://storycraft.digital')
    );
}

/**
 * 2. Helper to load files safely
 * Prevents a "White Screen of Death" if a file is missing.
 */
function oone_load_file(string $path)
{
    if (file_exists(OONE_PATH . $path)) {
        require_once OONE_PATH . $path;
    }
}

// 3. Load components using the safety helper
function oone_init()
{

	$files = [
		'core' => [
			'inc/database-tables/forms-database-table.php',
		],
		'ui' => [
			'inc/blocks.php',
			'inc/styles.php',
			'inc/scripts.php',
		],
		'admin' => [
			'inc/dashboard/pages/partials/partials-loader.php',
			'inc/dashboard/main.php',
		],
		'others' => [
			'inc/utils/utils-loader.php',
			'inc/block-category/block-category.php',
			'inc/rich-schemas/plugin-schema.php',
			'inc/ajax/ajax-main.php',
		],
	];

	foreach ($files as $group) {
		foreach ($group as $file) {
			oone_load_file($file);
		}
	}
}
add_action('plugins_loaded', 'oone_init');

// 4. Robust Activation
register_activation_hook(__FILE__, 'oone_activate');

function oone_activate()
{
	$db_file_path = OONE_PATH . 'inc/database-tables/forms-database-table.php';

	if (file_exists($db_file_path)) {
		require_once $db_file_path;

		if (function_exists('oone_lead_tables_activate')) {
			oone_lead_tables_activate();
		}
	}
}

/**
 * Check if Orbit One Pro is installed and active.
 */
function oone_is_pro_active(): bool
{
	if (defined('OONE_PRO_VERSION')) {
		return true;
	}

	if (! function_exists('is_plugin_active')) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	return is_plugin_active('orbit-one-pro/orbit-one-pro.php');
}
