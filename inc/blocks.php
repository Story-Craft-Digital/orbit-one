<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Returns the central mapping of placeholder strings to local asset paths.
 */
function oone_get_asset_map() {
    return [
    // Background and System Assets
    'oone-pink-purple-bg-image.webp'           => 'assets/images/defaults/oone-pink-purple-bg-image.webp',
    'oone-contact-form-image.webp'             => 'assets/images/defaults/oone-contact-form-image.webp',
    'oone-featured-card-placeholder.webp'      => 'assets/images/defaults/oone-featured-card-placeholder.webp',

    // Brand Carousel Assets
    'oone-brand-carousel-image-1.webp'         => 'assets/images/defaults/oone-brand-carousel-image-1.webp',
    'oone-brand-carousel-image-2.webp'         => 'assets/images/defaults/oone-brand-carousel-image-2.webp',
    'oone-brand-carousel-image-3.webp'         => 'assets/images/defaults/oone-brand-carousel-image-3.webp',
    'oone-brand-carousel-image-4.webp'         => 'assets/images/defaults/oone-brand-carousel-image-4.webp',
    'oone-brand-carousel-image-5.webp'         => 'assets/images/defaults/oone-brand-carousel-image-5.webp',

    // Multi-Content Carousel Assets (Combined from both JSON blocks)
    'oone-carousel-image-holistic-strategy.webp'   => 'assets/images/defaults/oone-carousel-image-holistic-strategy.webp',
    'oone-carousel-image-brand-evaluation.webp'    => 'assets/images/defaults/oone-carousel-image-brand-evaluation.webp',
    'oone-carousel-image-interface-design.webp'    => 'assets/images/defaults/oone-carousel-image-interface-design.webp',
    'oone-carousel-image-precision-marketing.webp' => 'assets/images/defaults/oone-carousel-image-precision-marketing.webp',
    'oone-carousel-image-strategic-content.webp'   => 'assets/images/defaults/oone-carousel-image-strategic-content.webp',
    'oone-carousel-image-visual-storytelling.webp' => 'assets/images/defaults/oone-carousel-image-visual-storytelling.webp',
    'oone-carousel-image-digital-echo-system.webp' => 'assets/images/defaults/oone-carousel-image-digital-echo-system.webp',
    'oone-carousel-image-revenue-scaling.webp'     => 'assets/images/defaults/oone-carousel-image-revenue-scaling.webp',
    'oone-carousel-image-narrative-mastery.webp'   => 'assets/images/defaults/oone-carousel-image-narrative-mastery.webp',
    'oone-carousel-image-future-tech-potrait.webp' => 'assets/images/defaults/oone-carousel-image-future-tech-potrait.webp',

    // Multi-Image Carousel Card Assets
    'oone-multi-image-carousel-card1-image-1.webp' => 'assets/images/defaults/oone-multi-image-carousel-card1-image-1.webp',
    'oone-multi-image-carousel-card1-image-2.webp' => 'assets/images/defaults/oone-multi-image-carousel-card1-image-2.webp',
    'oone-multi-image-carousel-card2-image-1.webp' => 'assets/images/defaults/oone-multi-image-carousel-card2-image-1.webp',
    'oone-multi-image-carousel-card2-image-2.webp' => 'assets/images/defaults/oone-multi-image-carousel-card2-image-2.webp',

    // Testimonial Assets
    'oone-testimonial-image-aisha.webp'         => 'assets/images/defaults/oone-testimonial-image-aisha.webp',
    'oone-testimonial-image-ben.webp'           => 'assets/images/defaults/oone-testimonial-image-ben.webp',
    'oone-testimonial-image-david.webp'         => 'assets/images/defaults/oone-testimonial-image-david.webp',
    'oone-testimonial-image-elena.webp'         => 'assets/images/defaults/oone-testimonial-image-elena.webp',
    'oone-testimonial-image-kenji.webp'         => 'assets/images/defaults/oone-testimonial-image-kenji.webp',
    'oone-testimonial-image-mark.webp'          => 'assets/images/defaults/oone-testimonial-image-mark.webp',
    'oone-testimonial-image-priya.webp'         => 'assets/images/defaults/oone-testimonial-image-priya.webp',
    'oone-testimonial-image-sarah.webp'         => 'assets/images/defaults/oone-testimonial-image-sarah.webp',
];
}

/**
 * Register all blocks: core blocks first, then add-on blocks.
 */
function oone_register_all_blocks() {
    // 1. Define the base path once to avoid errors
    $base_dir = plugin_dir_path( OONE_PLUGIN_FILE );
    $manifest_path = $base_dir . 'build/blocks-manifest.php';
    
    if ( file_exists( $manifest_path ) ) {
        $blocks = include $manifest_path;
        
        if ( is_array( $blocks ) ) {
            foreach ( $blocks as $block_folder => $block_data ) {
                
                // 2. Point exactly to the nested blocks folder inside build
                $block_path = $base_dir . "build/blocks/{$block_folder}";

                // 3. Check for the block.json specifically in that subfolder
                if ( file_exists( $block_path . '/block.json' ) ) {
                    register_block_type( $block_path );
                }
            }
        }
    }
    
    // 4. Fire the action for pro-addons to override
    do_action( 'oone_register_addon_blocks' );
}
add_action('init', 'oone_register_all_blocks', 10);

/**
 * ✅ ADDED: Helper to recursively swap placeholders for full URLs
 */
function oone_resolve_placeholders( $attrs, $map ) {
    foreach ( $attrs as $key => $value ) {
        if ( is_array( $value ) ) {
            $attrs[ $key ] = oone_resolve_placeholders( $value, $map );
        } elseif ( is_string( $value ) && isset( $map[ $value ] ) ) {
            $attrs[ $key ] = plugins_url( $map[ $value ], OONE_PLUGIN_FILE );
        }
    }
    return $attrs;
}

/**
 * ✅ ADDED: Filter to fix image paths on the frontend for ALL OONE blocks
 */
add_filter( 'render_block_data', function( $block ) {
    // Only target blocks in your namespace
    if ( isset( $block['blockName'] ) && strpos( $block['blockName'], 'oone/' ) === 0 ) {
        $map = oone_get_asset_map();
        if ( ! empty( $block['attrs'] ) ) {
            $block['attrs'] = oone_resolve_placeholders( $block['attrs'], $map );
        }
    }
    return $block;
}, 10 );

/**
 * Disable blocks in the Gutenberg editor based on Orbit One settings.
 */
add_filter('allowed_block_types_all', function ($allowed_block_types, $editor_context) {
    $disabled_blocks = get_option('oone_disabled_blocks', []);

    // If no blocks are disabled, stay with default behavior
    if (empty($disabled_blocks)) {
        return $allowed_block_types;
    }

    $registry = WP_Block_Type_Registry::get_instance();
    $all_registered = array_keys($registry->get_all_registered());

    // Filter out the disabled blocks
    $allowed = array_diff($all_registered, $disabled_blocks);

    return array_values($allowed);
}, 10, 2);


/**
 * Dynamically attach AJAX Nonce configurations to all plugin blocks at runtime.
 * Bypasses hardcoded script handle matching anomalies completely.
 */
function oone_localize_editor_assets() {
    $bridge_data = array(
        'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
        'publicNonce' => wp_create_nonce( 'oone_public_nonce' ),
        'adminNonce'  => wp_create_nonce( 'oone_admin_nonce' ),
    );

    // This makes sure the nonce is available to ALL block editor scripts
    wp_localize_script( 'oone-shared-libs', 'ooneAjaxBridge', $bridge_data );
}
add_action( 'enqueue_block_editor_assets', 'oone_localize_editor_assets', 20 );