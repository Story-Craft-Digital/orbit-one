<?php
if (! defined('ABSPATH')) exit;

/**
 * A central library for all Orbit One block SVG icons.
 * Returns the SVG markup for a requested block icon.
 *
 * @param string $name The name of the icon (e.g., 'carousel').
 * @return string SVG markup.
 */
function oone_get_block_icon_svg($name)
{
    $svg = '';
    switch ($name) {

        // Orbit One Blog Auto Scroller
        case 'oone/oone-blog-auto-scroller':
            $svg = '
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                            <rect x="2" y="3" width="20" height="18" rx="3" fill="#eed4fa" fillOpacity="1" />

                            <rect x="2" y="3" width="20" height="18" rx="3" stroke="#9813ca" strokeWidth="1.5" fill="none" />

                            <line x1="6" y1="8" x2="14" y2="8" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />
                            <line x1="6" y1="12" x2="18" y2="12" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />
                            <line x1="6" y1="16" x2="12" y2="16" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />

                            <path d="M17 15.5C18.1046 15.5 19 16.3954 19 17.5C19 18.6046 18.1046 19.5 17 19.5C15.8954 19.5 15 18.6046 15 17.5" stroke="#9813ca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <polyline points="15,16 15,17.5 16.5,17.5" stroke="#9813ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Brand Carousel
        case 'oone/oone-brand-slide-carousel':
            $svg = '
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                    <rect x="7" y="6" width="10" height="12" rx="2" fill="#9813ca" />
                    <circle cx="12" cy="11" r="2.5" fill="#eed4fa" />
                    <rect x="9" y="15" width="6" height="1" rx="0.5" fill="#eed4fa" />

                    <rect x="-1" y="7" width="6" height="10" rx="1.5" fill="#9813ca" opacity="0.4" />
                    <rect x="19" y="7" width="6" height="10" rx="1.5" fill="#9813ca" opacity="0.4" />

                    <circle cx="10" cy="21" r="1" fill="#9813ca" />
                    <circle cx="12" cy="21" r="1" fill="#9813ca" opacity="0.3" />
                    <circle cx="14" cy="21" r="1" fill="#9813ca" opacity="0.3" />
                </svg>
            ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Feature Highlight Card
        case 'oone/oone-feature-highlight-card':
            $svg = '
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                    <rect x="3" y="2" width="18" height="20" rx="3" fill="#eed4fa" fill-opacity="1" />
                    <rect x="3" y="2" width="18" height="20" rx="3" stroke="#9813ca" stroke-width="1.2" fill="none" />

                    <path d="M3 5C3 3.34315 4.34315 2 6 2H18C19.6569 2 21 3.34315 21 5V8H3V5Z" fill="#9813ca" />

                    <circle cx="7" cy="11.5" r="1.5" fill="#9813ca" />
                    <rect x="10" y="11" width="8" height="1" rx="0.5" fill="#9813ca" opacity="0.6" />

                    <circle cx="7" cy="14.5" r="1.5" fill="#9813ca" />
                    <rect x="10" y="14" width="6" height="1" rx="0.5" fill="#9813ca" opacity="0.6" />

                    <rect x="6" y="18" width="12" height="2.5" rx="1.25" fill="#9813ca" />
                </svg>
            ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Multi-Content Carousel
        case 'oone/oone-multi-content-carousel':
            $svg = '
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                    <rect x="3" y="5" width="14" height="12" rx="2" fill="#9813ca" opacity="0.3" />
                    
                    <rect x="7" y="3" width="14" height="14" rx="2" fill="#eed4fa" stroke="#9813ca" stroke-width="1.2" />
                    
                    <rect x="10" y="6" width="8" height="5" rx="1" fill="#9813ca" opacity="0.2" />
                    
                    <rect x="10" y="13" width="6" height="1.5" rx="0.75" fill="#9813ca" />
                    
                    <rect x="6" y="20" width="12" height="1.5" rx="0.75" fill="#eed4fa" />
                    <rect x="6" y="20" width="5" height="1.5" rx="0.75" fill="#9813ca" />
                </svg>
            ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Multi-Content Modern Carousel
        case 'oone/oone-multi-content-modern-carousel':
            $svg = '
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                    <path d="M4 7C4 5.89543 4.89543 5 6 5H14L11 17H4V7Z" fill="#9813ca" opacity="0.2" />

                    <rect x="8" y="4" width="12" height="15" rx="2" fill="#eed4fa" stroke="#9813ca" stroke-width="1.2" />

                    <rect x="10" y="7" width="8" height="6" rx="1" fill="#9813ca" opacity="0.15" />
                    <rect x="10" y="15" width="5" height="1" rx="0.5" fill="#9813ca" />

                    <path d="M4 21H20" stroke="#9813ca" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
                    <circle cx="12" cy="21" r="1.5" fill="#9813ca" />
                </svg>
            ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Multi-Image Hero Carousel
        case 'oone/oone-multi-image-hero-carousel':
            $svg = '
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
                    <rect x="2" y="5" width="20" height="14" rx="2" fill="#eed4fa" stroke="#9813ca" stroke-width="1.2" />

                    <path d="M14 11L17.5 15.5H10.5L14 11Z" fill="#9813ca" opacity="0.4" />
                    <path d="M18 13L20 15.5H16L18 13Z" fill="#9813ca" opacity="0.6" />

                    <rect x="5" y="8" width="6" height="1.5" rx="0.75" fill="#9813ca" />
                    <rect x="5" y="11" width="4" height="1" rx="0.5" fill="#9813ca" opacity="0.5" />

                    <rect x="5" y="14" width="3" height="2" rx="0.5" fill="#9813ca" />

                    <path d="M1 10V14" stroke="#9813ca" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M23 10V14" stroke="#9813ca" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            ';
            break;

        //-------------------------------------------------------------------------

        // Orbit One Smart Contact Form
        case 'oone/oone-smart-contact-form':
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" focusable="false">
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#9813ca"/>
                      <path d="M4 6 L12 11 L20 6" stroke="#eed4fa" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7"/>
                      <text x="12" y="15.5" font-size="9" text-anchor="middle" fill="#eed4fa" font-family="Arial, sans-serif" font-weight="bold">@</text>
                    </svg>';
            break;
        //-------------------------------------------------------------------------

        // SCD Smart Feedback Form
        case 'oone/oone-smart-feedback-form':
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" focusable="false">
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#9813ca"/>
                      <path d="M4 6 L12 11 L20 6" stroke="#eed4fa" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7"/>
                      <path d="M12 9.5L13.6 12.3L16.8 12.6L14.4 14.7L15.1 17.8L12 16.2L8.9 17.8L9.6 14.7L7.2 12.6L10.4 12.3L12 9.5Z" fill="#eed4fa" />
                    </svg>';
            break;

        //-------------------------------------------------------------------------

        // SCD Testimonials Carousel
        case 'oone/oone-testimonials-carousel':
            $svg = '
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
            <rect x="5" y="6" width="14" height="12" rx="3" fill="#9813ca" opacity="0.2" />
            
            <rect x="3" y="3" width="18" height="15" rx="3" fill="#eed4fa" stroke="#9813ca" stroke-width="1.2" />
            
            <circle cx="8" cy="9" r="2.5" fill="#9813ca" />
            
            <rect x="12" y="7.5" width="6" height="1" rx="0.5" fill="#9813ca" />
            <rect x="12" y="10.5" width="4" height="1" rx="0.5" fill="#9813ca" opacity="0.6" />
            
            <circle cx="7" cy="14.5" r="1" fill="#9813ca" />
            <circle cx="9.5" cy="14.5" r="1" fill="#9813ca" />
            <circle cx="12" cy="14.5" r="1" fill="#9813ca" />
            <circle cx="14.5" cy="14.5" r="1" fill="#9813ca" />
            <circle cx="17" cy="14.5" r="1" fill="#9813ca" />

            <rect x="9" y="21" width="6" height="1.5" rx="0.75" fill="#9813ca" />
        </svg>
    ';
            break;

        //-------------------------------------------------------------------------

        case 'oone/block-name':
            $svg = '
                
            ';
            break;

        //-------------------------------------------------------------------------

        default:
            $svg = '
        <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" focusable="false">
            <path d="M 40 19 L 28 19 L 25 22 L 25 24 L 29 23 L 30 27 L 22 37 L 18 37 L 17 36 L 18 33 L 17 32 L 12 39 L 12 49 L 23 49 L 40 28 Z" fill="currentColor"/>
            <path d="M 37 0 L 25 0 L 20 5 L 9 19 L 9 30 L 19 30 L 22 27 L 18 27 L 17 26 L 17 22 L 25 13 L 29 13 L 30 17 L 37 8 Z" fill="currentColor"/>
        </svg>
    ';
            break;
    }
    return $svg;
}
