<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * A central library for block preview images.
 * Returns local URLs for block previews bundled with the plugin.
 */
function oone_get_block_previews( $block_name ) {
    // Define the base path to your local images folder
    $base_url = plugins_url( 'assets/images/previews/block-previews/', OONE_PLUGIN_FILE );

    $previews = [
        'oone/oone-blog-auto-scroller' => [
            'desktop' => $base_url . 'oone-blog-auto-scroller-desktop.webp',
            'mobile'  => $base_url . 'oone-blog-auto-scroller-mobile.webp',
        ],
        'oone/oone-brand-slide-carousel' => [
            'desktop' => $base_url . 'oone-brand-slide-carousel-desktop.webp',
            'mobile'  => $base_url . 'oone-brand-slide-carousel-mobile.webp',
        ],
        'oone/oone-feature-highlight-card' => [
            'desktop' => $base_url . 'oone-feature-highlight-card-desktop.webp',
            'mobile'  => $base_url . 'oone-feature-highlight-card-mobile.webp',
        ],
        'oone/oone-multi-content-carousel' => [
            'desktop' => $base_url . 'oone-multi-content-carousel-desktop.webp',
            'mobile'  => $base_url . 'oone-multi-content-carousel-mobile.webp',
        ],
        'oone/oone-multi-content-modern-carousel' => [
            'desktop' => $base_url . 'oone-multi-content-modern-carousel-desktop.webp',
            'mobile'  => $base_url . 'oone-multi-content-modern-carousel-mobile.webp',
        ],
        'oone/oone-multi-image-hero-carousel' => [
            'desktop' => $base_url . 'oone-multi-image-hero-carousel-desktop.webp',
            'mobile'  => $base_url . 'oone-multi-image-hero-carousel-mobile.webp',
        ],
        'oone/oone-smart-contact-form' => [
            'desktop' => $base_url . 'oone-smart-contact-form-desktop.webp',
            'mobile'  => $base_url . 'oone-smart-contact-form-mobile.webp',
        ],
        'oone/oone-smart-feedback-form' => [
            'desktop' => $base_url . 'oone-smart-feedback-form-desktop.webp',
            'mobile'  => $base_url . 'oone-smart-feedback-form-mobile.webp',
        ],
        'oone/oone-testimonials-carousel' => [
            'desktop' => $base_url . 'oone-testimonials-carousel-desktop.webp',
            'mobile'  => $base_url . 'oone-testimonials-carousel-mobile.webp',
        ],
        'oone/blockname' => [
            'desktop' => $base_url . 'blockname-desktop.webp',
            'mobile'  => $base_url . 'blockname-mobile.webp',
        ],
    ];

    return $previews[ $block_name ] ?? ['desktop' => '', 'mobile' => ''];
}