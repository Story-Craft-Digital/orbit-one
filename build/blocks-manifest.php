<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// This file is generated. Do not modify it manually.
return array(
	'oone-blog-auto-scroller' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-blog-auto-scroller',
		'version' => '0.1.0',
		'title' => 'Blog Auto Scroller',
		'category' => 'oone-blocks',
		'description' => 'A space-saving content section that automatically scrolls through long text in a fixed window. Features an animated gradient title, customizable background images, and dual call-to-action buttons for high engagement without cluttering your page.',
		'example' => array(
			
		),
		'keywords' => array(
			'info',
			'section',
			'scroll',
			'blog',
			'auto',
			'content',
			'oone',
			'buttons',
			'stylish'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Turning Digital Noise into Brand Resonance'
			),
			'text' => array(
				'type' => 'string',
				'default' => 'In an era where the digital landscape is saturated with fleeting trends and fragmented data, Story Craft Digital stands as a beacon for brands that demand more than just visibility. We believe that every business has an inherent narrative waiting to be told—a unique frequency that, when tuned correctly, cuts through the static of the modern web. Our approach merges the analytical precision of high-conversion marketing with the timeless art of emotive storytelling. By meticulously crafting personalized digital strategies, from immersive SEO frameworks to high-impact automation, we don\'t just help you reach your audience; we help you resonate with them. Whether you are a small business looking to scale through WhatsApp integration or a growing enterprise redefining your interior design presence, we act as your strategic partners in progress. At Story Craft Digital, we aren\'t just managing leads—we are curating the future of your brand’s digital legacy.'
			),
			'width' => array(
				'type' => 'number',
				'default' => 800
			),
			'height' => array(
				'type' => 'number',
				'default' => 600
			),
			'mobileHeight' => array(
				'type' => 'number',
				'default' => 450
			),
			'align' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'verticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'borderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '20',
					'topRight' => '20',
					'bottomRight' => '20',
					'bottomLeft' => '20'
				)
			),
			'mobileBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '0',
					'topRight' => '0',
					'bottomRight' => '0',
					'bottomLeft' => '0'
				)
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '15',
					'right' => '15',
					'bottom' => '15',
					'left' => '15'
				)
			),
			'margin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'mobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(135deg, secondary, light)'
			),
			'image' => array(
				'type' => 'string',
				'default' => 'oone-pink-purple-bg-image.webp'
			),
			'imageAlt' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageOpacity' => array(
				'type' => 'number',
				'default' => 0.3
			),
			'mobileViewBreakPoint' => array(
				'type' => 'number',
				'default' => 500
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 0.45
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.3
			),
			'shadow' => array(
				'type' => 'object',
				'default' => array(
					'enabled' => true,
					'offsetX' => 0,
					'offsetY' => 4,
					'blur' => 30,
					'spread' => 0,
					'color' => '#000000',
					'opacity' => 0.15
				)
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 40
			),
			'mobileTitleFontSize' => array(
				'type' => 'number',
				'default' => 25
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'mobileTitleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'titleGradient' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleAnimation' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'titleGradientColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(90deg, primary, secondary, primary)'
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleVerticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'mobileTitlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '10',
					'left' => '0'
				)
			),
			'textFontSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'mobileTextFontSize' => array(
				'type' => 'number',
				'default' => 16
			),
			'textIndent' => array(
				'type' => 'number',
				'default' => 10
			),
			'textLineHeight' => array(
				'type' => 'number',
				'default' => 1.6
			),
			'mobileTextLineHeight' => array(
				'type' => 'number',
				'default' => 1.7
			),
			'textAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'textColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'textMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '15',
					'right' => '10',
					'bottom' => '15',
					'left' => '10'
				)
			),
			'textMobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '5',
					'bottom' => '10',
					'left' => '5'
				)
			),
			'buttonsFontSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'buttonsMobileFontSize' => array(
				'type' => 'number',
				'default' => 15
			),
			'buttonsGap' => array(
				'type' => 'number',
				'default' => 20
			),
			'buttonsMobileGap' => array(
				'type' => 'number',
				'default' => 10
			),
			'buttonsAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'buttonsVerticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'buttonsTextAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'buttonsMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonsMobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonsBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '10',
					'topRight' => '10',
					'bottomRight' => '10',
					'bottomLeft' => '10'
				)
			),
			'primaryButton' => array(
				'type' => 'boolean',
				'default' => true
			),
			'secondaryButton' => array(
				'type' => 'boolean',
				'default' => true
			),
			'primaryButtonBorder' => array(
				'type' => 'number',
				'default' => 0
			),
			'secondaryButtonBorder' => array(
				'type' => 'number',
				'default' => 0
			),
			'primaryButtonLink' => array(
				'type' => 'string',
				'default' => '#'
			),
			'primaryButtonText' => array(
				'type' => 'string',
				'default' => 'Primary Button'
			),
			'primaryButtonColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'primaryButtonHoverColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'primaryButtonTextColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'primaryButtonTextHoverColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'primaryButtonPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '8',
					'right' => '16',
					'bottom' => '8',
					'left' => '16'
				)
			),
			'primaryButtonMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '5',
					'right' => '10',
					'bottom' => '5',
					'left' => '10'
				)
			),
			'secondaryButtonLink' => array(
				'type' => 'string',
				'default' => '#'
			),
			'secondaryButtonText' => array(
				'type' => 'string',
				'default' => 'Secondary Button'
			),
			'secondaryButtonColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'secondaryButtonHoverColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'secondaryButtonTextColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'secondaryButtonTextHoverColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'secondaryButtonPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '8',
					'right' => '16',
					'bottom' => '8',
					'left' => '16'
				)
			),
			'secondaryButtonMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '5',
					'right' => '10',
					'bottom' => '5',
					'left' => '10'
				)
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette',
			'wp-i18n'
		)
	),
	'oone-brand-slide-carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-brand-slide-carousel',
		'version' => '0.1.0',
		'title' => 'Brand Carousel',
		'category' => 'oone-blocks',
		'description' => 'A professional logo showcase featuring two rows of brand icons that automatically scroll in opposite directions. Designed to display partnerships and client logos in a high-performance, seamless loop that builds instant trust with your visitors.',
		'example' => array(
			
		),
		'keywords' => array(
			'assosiates',
			'carousel',
			'slide',
			'branding',
			'oone',
			'testimonials'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'caption' => array(
				'type' => 'string',
				'default' => 'Strategic Partnerships'
			),
			'captionFontSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'captionLineHeight' => array(
				'type' => 'number',
				'default' => 1.2
			),
			'captionPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'captionAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'captionBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'captionItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'captionUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'captionColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'titleOne' => array(
				'type' => 'string',
				'default' => 'Trusted by Industry Leaders.'
			),
			'titleTwo' => array(
				'type' => 'string',
				'default' => 'Powering Growth Through Collaboration.'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 30
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '0',
					'bottom' => '20',
					'left' => '0'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '0',
					'bottom' => '10',
					'left' => '0'
				)
			),
			'slideGap' => array(
				'type' => 'number',
				'default' => 50
			),
			'minSlidesToShow' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'slideNameFontSize' => array(
				'type' => 'number',
				'default' => 22
			),
			'slideNameLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'slideNameBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideNameItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideNameUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => 20,
					'topRight' => 20,
					'bottomRight' => 20,
					'bottomLeft' => 20
				)
			),
			'slideNameColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'slideWidth' => array(
				'type' => 'number',
				'default' => 160
			),
			'slidesColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.6
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'name' => '',
						'link' => '#',
						'image' => 'oone-brand-carousel-image-1.webp',
						'imgAlt' => 'Orion Digital'
					),
					array(
						'name' => '',
						'link' => '#',
						'image' => 'oone-brand-carousel-image-2.webp',
						'imgAlt' => 'Catalyst Logistics'
					),
					array(
						'name' => '',
						'link' => '#',
						'image' => 'oone-brand-carousel-image-3.webp',
						'imgAlt' => 'Luminary AI'
					),
					array(
						'name' => '',
						'link' => '#',
						'image' => 'oone-brand-carousel-image-4.webp',
						'imgAlt' => 'Horizon Growth'
					),
					array(
						'name' => '',
						'link' => '#',
						'image' => 'oone-brand-carousel-image-5.webp',
						'imgAlt' => 'Apex Fintech'
					)
				)
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-feature-highlight-card' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-feature-highlight-card',
		'version' => '0.1.0',
		'title' => 'Feature Highlight Card',
		'category' => 'oone-blocks',
		'icon' => 'smiley',
		'description' => 'A conversion-focused promotional card that layers bold headlines and an interactive checklist over a customizable image background. Perfectly balanced with a gradient overlay and a prominent call-to-action button to turn features into clicks.',
		'example' => array(
			
		),
		'keywords' => array(
			'feature',
			'list',
			'checklist',
			'highlight',
			'promo',
			'card',
			'cta',
			'oone'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'image' => array(
				'type' => 'string',
				'default' => 'oone-featured-card-placeholder.webp'
			),
			'imageAlt' => array(
				'type' => 'string',
				'default' => 'Feature highlight image'
			),
			'gradientOverlay' => array(
				'type' => 'string',
				'default' => 'linear-gradient(135deg, secondary, primary)'
			),
			'gradientOpacity' => array(
				'type' => 'number',
				'default' => 0.4
			),
			'borderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '20',
					'topRight' => '20',
					'bottomRight' => '20',
					'bottomLeft' => '20'
				)
			),
			'maxWidth' => array(
				'type' => 'number',
				'default' => 512
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Accelerate Your Digital Growth'
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 40
			),
			'mobileTitleFontSize' => array(
				'type' => 'number',
				'default' => 28
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'options' => array(
				'type' => 'array',
				'default' => array(
					array(
						'item' => 'Data-Driven SEO Strategies'
					),
					array(
						'item' => 'High-Converting Content Creation'
					),
					array(
						'item' => 'Advanced Social Media Marketing'
					)
				)
			),
			'optionsAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'itemColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'optionsFontSize' => array(
				'type' => 'number',
				'default' => 22
			),
			'mobileOptionsFontSize' => array(
				'type' => 'number',
				'default' => 16
			),
			'optionsBold' => array(
				'type' => 'boolean',
				'default' => false
			),
			'optionsItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'optionsUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'showTickIcons' => array(
				'type' => 'boolean',
				'default' => true
			),
			'tickIconSize' => array(
				'type' => 'number',
				'default' => 24
			),
			'mobileTickIconSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'tickIconColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'tickBgColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'GET A FREE AUDIT'
			),
			'buttonLink' => array(
				'type' => 'string',
				'default' => '#'
			),
			'buttonAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'buttonFontSize' => array(
				'type' => 'number',
				'default' => 18
			),
			'mobileButtonFontSize' => array(
				'type' => 'number',
				'default' => 16
			),
			'buttonColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonHoverColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'buttonTextColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'buttonTextHoverColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonTextBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'buttonTextItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonTextUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonBorder' => array(
				'type' => 'string',
				'default' => 'solid'
			),
			'buttonBorderSize' => array(
				'type' => 'number',
				'default' => 0
			),
			'buttonsBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '0',
					'topRight' => '25',
					'bottomRight' => '0',
					'bottomLeft' => '25'
				)
			),
			'align' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '25',
					'right' => '25',
					'bottom' => '25',
					'left' => '25'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10'
				)
			),
			'margin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '25',
					'right' => '25',
					'bottom' => '25',
					'left' => '25'
				)
			),
			'mobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10'
				)
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-multi-content-carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-multi-content-carousel',
		'version' => '0.1.0',
		'title' => 'Multi-Content Carousel',
		'category' => 'oone-blocks',
		'icon' => 'email',
		'description' => 'A high-performance, interactive slider designed to showcase portfolios, services, or case studies. Featuring smooth touch-and-drag navigation, an intelligent progress tracker, and SEO-ready structured data, it delivers a cinematic browsing experience that scales perfectly from desktop to mobile.',
		'keywords' => array(
			'details',
			'project',
			'process',
			'content',
			'oone',
			'slide'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'example' => array(
			
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'title' => 'Visual Storytelling',
						'image' => 'oone-carousel-image-visual-storytelling.webp',
						'imgAlt' => 'SCD Brand design showcase',
						'link' => '#',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'title' => 'Digital Ecosystems',
						'image' => 'oone-carousel-image-digital-echo-system.webp',
						'imgAlt' => 'SCD Modern web interface',
						'link' => '#',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'title' => 'Revenue Scaling',
						'image' => 'oone-carousel-image-revenue-scaling.webp',
						'imgAlt' => 'SCD Analytics and growth charts',
						'link' => '#',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'title' => 'Narrative Mastery',
						'image' => 'oone-carousel-image-narrative-mastery.webp',
						'imgAlt' => 'SCD Content creation desk',
						'link' => '#',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'title' => 'Next-Gen Tech',
						'image' => 'oone-carousel-image-future-tech-potrait.webp',
						'imgAlt' => 'SCD AI and technology nodes',
						'link' => '#',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					)
				)
			),
			'slideGap' => array(
				'type' => 'number',
				'default' => 30
			),
			'buttonSize' => array(
				'type' => 'number',
				'default' => 40
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '0',
					'bottom' => '20',
					'left' => '0'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '0',
					'bottom' => '10',
					'left' => '0'
				)
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Our Strategic Solutions'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 50
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '0',
					'left' => '20'
				)
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'minSlidesToShow' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'slideBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => 20,
					'topRight' => 20,
					'bottomRight' => 20,
					'bottomLeft' => 20
				)
			),
			'uniteSlideSettings' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideTitleFontSize' => array(
				'type' => 'number',
				'default' => 25
			),
			'slideTitleColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'slideFilterColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'slideBackgroundColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'progressbarColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(90deg, secondary, primary)'
			),
			'autoScrolling' => array(
				'type' => 'boolean',
				'default' => false
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.5
			),
			'progressbar' => array(
				'type' => 'boolean',
				'default' => true
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-multi-content-modern-carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-multi-content-modern-carousel',
		'version' => '0.1.0',
		'title' => 'Multi-Content Modern Carousel',
		'category' => 'oone-blocks',
		'icon' => 'email',
		'description' => 'A premium, ultra-responsive content slider that delivers a sleek, high-end browsing experience. Features immersive \'zoom-on-hover\' visuals, smart gradient overlays for text clarity, and a real-time progress tracker. Every detail—from text size to corner curves—automatically recalibrates to ensure a flawless look on every screen size.',
		'keywords' => array(
			'details',
			'project',
			'modern',
			'process',
			'content',
			'oone',
			'slide'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'example' => array(
			
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'oone-mod-1',
						'title' => 'Holistic Strategy',
						'image' => 'oone-carousel-image-holistic-strategy.webp',
						'imgAlt' => 'Digital Strategy Planning',
						'link' => '',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'id' => 'oone-mod-2',
						'title' => 'Brand Evolution',
						'image' => 'oone-carousel-image-brand-evaluation.webp',
						'imgAlt' => 'Brand Innovation and Design',
						'link' => '',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'id' => 'oone-mod-3',
						'title' => 'Interface Design',
						'image' => 'oone-carousel-image-interface-design.webp',
						'imgAlt' => 'Sleek UX/UI Design',
						'link' => '',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'id' => 'oone-mod-4',
						'title' => 'Precision Marketing',
						'image' => 'oone-carousel-image-precision-marketing.webp',
						'imgAlt' => 'Performance Marketing Analytics',
						'link' => '',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					),
					array(
						'id' => 'oone-mod-5',
						'title' => 'Strategic Content',
						'image' => 'oone-carousel-image-strategic-content.webp',
						'imgAlt' => 'Creative Narrative and Storytelling',
						'link' => '',
						'fontSize' => 25,
						'textPosition' => 'bottom',
						'titleColor' => 'white',
						'filterColor' => 'accent',
						'backgroundColor' => 'white'
					)
				)
			),
			'slideGap' => array(
				'type' => 'number',
				'default' => 30
			),
			'buttonSize' => array(
				'type' => 'number',
				'default' => 40
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '0',
					'bottom' => '20',
					'left' => '0'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '0',
					'bottom' => '10',
					'left' => '0'
				)
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Story Craft Features'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 50
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '0',
					'left' => '20'
				)
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'minSlidesToShow' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'slideBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => 20,
					'topRight' => 20,
					'bottomRight' => 20,
					'bottomLeft' => 20
				)
			),
			'uniteSlideSettings' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideTitleFontSize' => array(
				'type' => 'number',
				'default' => 25
			),
			'slideTitleColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'slideFilterColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'slideBackgroundColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'progressbarColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(90deg, secondary, primary)'
			),
			'autoScrolling' => array(
				'type' => 'boolean',
				'default' => false
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.5
			),
			'progressbar' => array(
				'type' => 'boolean',
				'default' => true
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-multi-image-hero-carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-multi-image-hero-carousel',
		'version' => '0.1.0',
		'title' => 'Multi-Image Hero Carousel',
		'category' => 'oone-blocks',
		'icon' => 'smiley',
		'description' => 'An immersive hero banner featuring a unique multi-layered background system. It cycles through multiple images per slide with smooth cinematic transitions, paired with high-performance text animations and dual call-to-action buttons. Designed to capture immediate attention and deliver a storytelling experience at the very top of your page.',
		'keywords' => array(
			'hero',
			'carousel',
			'slider',
			'banner',
			'animation',
			'slideShow',
			'images',
			'projects',
			'achievements',
			'oone',
			'slide'
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'images' => array(
							'oone-multi-image-carousel-card1-image-1.webp',
							'oone-multi-image-carousel-card1-image-2.webp'
						),
						'title' => 'Storytelling. Crafted for Digital.',
						'description' => 'We build highly engaging, conversion-focused narratives across every digital touchpoint.',
						'titleColor' => 'accent',
						'titleFontSize' => 58,
						'descriptionFontSize' => 30,
						'descriptionColor' => 'neutral',
						'btn1textColor' => 'white',
						'btn2textColor' => 'primary',
						'btn1text' => 'Our Services',
						'btn1link' => '#services',
						'btn1Color' => 'primary',
						'btn2text' => 'Contact Us',
						'btn2link' => '#contact',
						'btn2Color' => 'secondary',
						'imageAlt' => ''
					),
					array(
						'images' => array(
							'oone-multi-image-carousel-card2-image-1.webp',
							'oone-multi-image-carousel-card2-image-2.webp'
						),
						'title' => 'Interactive UX. Dynamic Impact.',
						'description' => 'Seamless, high-performance interfaces that optimize the modern user journey.',
						'titleColor' => '',
						'titleFontSize' => 58,
						'descriptionFontSize' => 30,
						'descriptionColor' => '',
						'btn1textColor' => 'white',
						'btn2textColor' => 'primary',
						'btn1text' => 'Learn More',
						'btn1link' => '#learn',
						'btn1Color' => 'secondary',
						'btn2text' => 'Get Quote',
						'btn2link' => '#quote',
						'btn2Color' => 'primary',
						'imageAlt' => ''
					)
				)
			),
			'slideTitleFontSize' => array(
				'type' => 'number',
				'default' => 58
			),
			'slideDescriptionFontSize' => array(
				'type' => 'number',
				'default' => 30
			),
			'buttonFontSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'descriptionBold' => array(
				'type' => 'boolean',
				'default' => false
			),
			'descriptionItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'descriptionUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonBold' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'uniteSlideSettings' => array(
				'type' => 'boolean',
				'default' => true
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'light'
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 1
			),
			'buttonsBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '10',
					'topRight' => '10',
					'bottomRight' => '10',
					'bottomLeft' => '10'
				)
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '25',
					'right' => '25',
					'bottom' => '25',
					'left' => '25'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10'
				)
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '25',
					'bottom' => '0',
					'left' => '25'
				)
			),
			'descriptionMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '15',
					'right' => '25',
					'bottom' => '20',
					'left' => '25'
				)
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'descriptionLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'descriptionAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'buttonsAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'slideTitleColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'slideDescriptionColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'slideBtn1textColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'slideBtn2textColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'slideBtn1Color' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'slideBtn2Color' => array(
				'type' => 'string',
				'default' => 'secondary'
			),
			'arrowColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'arrowBgColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'buttonSize' => array(
				'type' => 'number',
				'default' => 40
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.5
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-smart-contact-form' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-smart-contact-form',
		'version' => '0.1.0',
		'title' => 'Smart Contact Form',
		'category' => 'oone-blocks',
		'icon' => 'email',
		'description' => 'An intelligent, high-conversion contact system that bridges your website directly to Google Sheets and your KPI dashboard. Featuring real-time email typo-correction, global phone number validation, and an automated lead-tracking engine, it ensures no inquiry is lost while keeping your data organized and actionable.',
		'example' => array(
			
		),
		'keywords' => array(
			'contact',
			'form',
			'google',
			'googleForm',
			'email',
			'integration',
			'oone'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'formId' => array(
				'type' => 'string',
				'default' => 'Form 1'
			),
			'formSource' => array(
				'type' => 'string',
				'default' => 'Contact Us Page'
			),
			'googleFormLink' => array(
				'type' => 'string',
				'default' => ''
			),
			'width' => array(
				'type' => 'number',
				'default' => 500
			),
			'align' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'verticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'borderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '25',
					'topRight' => '25',
					'bottomRight' => '25',
					'bottomLeft' => '25'
				)
			),
			'mobileBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '0',
					'topRight' => '0',
					'bottomRight' => '0',
					'bottomLeft' => '0'
				)
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '30',
					'bottom' => '20',
					'left' => '30'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'margin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10'
				)
			),
			'mobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'image' => array(
				'type' => 'string',
				'default' => 'oone-contact-form-image.webp'
			),
			'imageAlt' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageOpacity' => array(
				'type' => 'number',
				'default' => 0.5
			),
			'mobileViewBreakPoint' => array(
				'type' => 'number',
				'default' => 410
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 0.45
			),
			'shadow' => array(
				'type' => 'object',
				'default' => array(
					'enabled' => true,
					'offsetX' => 0,
					'offsetY' => 4,
					'blur' => 30,
					'spread' => 0,
					'color' => '#000000',
					'opacity' => 0.15
				)
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Contact Us'
			),
			'titleFontFamily' => array(
				'type' => 'string',
				'default' => 'inherit'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 35
			),
			'mobileTitleFontSize' => array(
				'type' => 'number',
				'default' => 25
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'mobileTitleLineHeight' => array(
				'type' => 'number',
				'default' => 1.4
			),
			'titleGradient' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleAnimation' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'titleGradientColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(90deg, primary, secondary, primary)'
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'titleVerticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'mobileTitlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'labelFontFamily' => array(
				'type' => 'string',
				'default' => 'inherit'
			),
			'labelFontSize' => array(
				'type' => 'number',
				'default' => 16
			),
			'mobileLabelFontSize' => array(
				'type' => 'number',
				'default' => 13
			),
			'labelColor' => array(
				'type' => 'string',
				'default' => '#737373'
			),
			'subjectFieldLabel' => array(
				'type' => 'string',
				'default' => 'Subject'
			),
			'subjects' => array(
				'type' => 'array',
				'default' => array(
					'General Inquiry',
					'Technical Support',
					'Billing & Payments',
					'Partnership Opportunities',
					'Request a Quote',
					'Feedback & Suggestions',
					'Report a Bug',
					'Sales Inquiry',
					'Career Opportunities',
					'Media & PR'
				)
			),
			'messageFieldLabel' => array(
				'type' => 'string',
				'default' => 'Message'
			),
			'messageFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Enter your message'
			),
			'firstNameFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'First Name'
			),
			'lastNameFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Last Name'
			),
			'emailFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Enter your email'
			),
			'defaultCountry' => array(
				'type' => 'string',
				'default' => 'US'
			),
			'buttonFontSize' => array(
				'type' => 'number',
				'default' => 18
			),
			'buttonMobileFontSize' => array(
				'type' => 'number',
				'default' => 13
			),
			'buttonAlign' => array(
				'type' => 'string',
				'default' => 'right'
			),
			'buttonTextAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'buttonTakesFullWidth' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '30',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonMobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '15',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '15',
					'topRight' => '15',
					'bottomRight' => '15',
					'bottomLeft' => '15'
				)
			),
			'buttonBorder' => array(
				'type' => 'number',
				'default' => 0
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Submit Request'
			),
			'buttonColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonHoverColor' => array(
				'type' => 'string',
				'default' => 'secondary'
			),
			'buttonTextColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'buttonTextHoverColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '12',
					'right' => '20',
					'bottom' => '12',
					'left' => '20'
				)
			),
			'buttonMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '7',
					'right' => '15',
					'bottom' => '7',
					'left' => '15'
				)
			),
			'inputFieldsGap' => array(
				'type' => 'number',
				'default' => 14
			),
			'inputFieldsMobileGap' => array(
				'type' => 'number',
				'default' => 10
			),
			'inputBorderColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'inputBorderFocusColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'subjectDropdownArrowColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'inputBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '10',
					'topRight' => '10',
					'bottomRight' => '10',
					'bottomLeft' => '10'
				)
			),
			'inputMobileBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '5',
					'topRight' => '5',
					'bottomRight' => '5',
					'bottomLeft' => '5'
				)
			),
			'inputPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '15',
					'bottom' => '10',
					'left' => '15'
				)
			),
			'inputMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '5',
					'right' => '5',
					'bottom' => '5',
					'left' => '5'
				)
			),
			'placeholderScale' => array(
				'type' => 'number',
				'default' => 0.9
			),
			'inputBorder' => array(
				'type' => 'number',
				'default' => 1
			),
			'inputShadow' => array(
				'type' => 'object',
				'default' => array(
					'enabled' => true,
					'offsetX' => 0,
					'offsetY' => 4,
					'blur' => 30,
					'spread' => 0,
					'color' => '#000000',
					'opacity' => 0.15
				)
			),
			'phoneNumberFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'formSourceFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'subjectFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'messageFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'firstNameFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'lastNameFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'emailFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'entryIdFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'formFields' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'newSubject' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessName' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessLogo' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessLogoAltText' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessPhone' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessEmail' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactType' => array(
				'type' => 'string',
				'default' => 'Customer Support'
			),
			'areaServed' => array(
				'type' => 'string',
				'default' => ''
			),
			'availableLanguage' => array(
				'type' => 'string',
				'default' => 'English'
			),
			'spinnerRingColor' => array(
				'type' => 'string',
				'default' => 'secondary'
			),
			'spinnerDotColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'loadingTextColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'dotsColor' => array(
				'type' => 'string',
				'default' => 'primary'
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-smart-feedback-form' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-smart-feedback-form',
		'version' => '0.1.0',
		'title' => 'Smart Feedback Form',
		'category' => 'oone-blocks',
		'icon' => 'email',
		'description' => 'A specialized insight-gathering tool that connects your users\' voices directly to your Google ecosystem and KPI tracker. Built with smart email validation and automated data mapping, it captures valuable customer feedback and transforms it into organized, actionable data for your business growth.',
		'example' => array(
			
		),
		'keywords' => array(
			'feedback',
			'form',
			'google',
			'googleForm',
			'email',
			'integration',
			'oone'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'formId' => array(
				'type' => 'string',
				'default' => 'Form 1'
			),
			'formSource' => array(
				'type' => 'string',
				'default' => 'Contact Us Page'
			),
			'googleFormLink' => array(
				'type' => 'string',
				'default' => ''
			),
			'width' => array(
				'type' => 'number',
				'default' => 500
			),
			'align' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'verticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'borderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '25',
					'topRight' => '25',
					'bottomRight' => '25',
					'bottomLeft' => '25'
				)
			),
			'mobileBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '0',
					'topRight' => '0',
					'bottomRight' => '0',
					'bottomLeft' => '0'
				)
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '30',
					'bottom' => '20',
					'left' => '30'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'margin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10'
				)
			),
			'mobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'image' => array(
				'type' => 'string',
				'default' => 'oone-contact-form-image.webp'
			),
			'imageAlt' => array(
				'type' => 'string',
				'default' => ''
			),
			'imageOpacity' => array(
				'type' => 'number',
				'default' => 0.5
			),
			'mobileViewBreakPoint' => array(
				'type' => 'number',
				'default' => 410
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 0.45
			),
			'shadow' => array(
				'type' => 'object',
				'default' => array(
					'enabled' => true,
					'offsetX' => 0,
					'offsetY' => 4,
					'blur' => 30,
					'spread' => 0,
					'color' => '#000000',
					'opacity' => 0.15
				)
			),
			'title' => array(
				'type' => 'string',
				'default' => 'Feedback Form'
			),
			'titleFontFamily' => array(
				'type' => 'string',
				'default' => 'inherit'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 35
			),
			'mobileTitleFontSize' => array(
				'type' => 'number',
				'default' => 25
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'mobileTitleLineHeight' => array(
				'type' => 'number',
				'default' => 1.4
			),
			'titleGradient' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleAnimation' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'titleGradientColor' => array(
				'type' => 'string',
				'default' => 'linear-gradient(90deg, primary, secondary, primary)'
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'titleVerticalAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '50',
					'left' => '0'
				)
			),
			'mobileTitlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'labelFontFamily' => array(
				'type' => 'string',
				'default' => 'inherit'
			),
			'labelFontSize' => array(
				'type' => 'number',
				'default' => 16
			),
			'mobileLabelFontSize' => array(
				'type' => 'number',
				'default' => 13
			),
			'labelColor' => array(
				'type' => 'string',
				'default' => '#737373'
			),
			'subject' => array(
				'type' => 'string',
				'default' => 'Feedback'
			),
			'messageFieldLabel' => array(
				'type' => 'string',
				'default' => 'Message'
			),
			'messageFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Enter your message'
			),
			'firstNameFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'First Name'
			),
			'lastNameFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Last Name'
			),
			'emailFieldPlaceholder' => array(
				'type' => 'string',
				'default' => 'Enter your email'
			),
			'defaultCountry' => array(
				'type' => 'string',
				'default' => 'US'
			),
			'buttonFontSize' => array(
				'type' => 'number',
				'default' => 18
			),
			'buttonMobileFontSize' => array(
				'type' => 'number',
				'default' => 13
			),
			'buttonAlign' => array(
				'type' => 'string',
				'default' => 'right'
			),
			'buttonTextAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'buttonTakesFullWidth' => array(
				'type' => 'boolean',
				'default' => false
			),
			'buttonMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '30',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonMobileMargin' => array(
				'type' => 'object',
				'default' => array(
					'top' => '15',
					'right' => '0',
					'bottom' => '0',
					'left' => '0'
				)
			),
			'buttonBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '15',
					'topRight' => '15',
					'bottomRight' => '15',
					'bottomLeft' => '15'
				)
			),
			'buttonBorder' => array(
				'type' => 'number',
				'default' => 0
			),
			'buttonText' => array(
				'type' => 'string',
				'default' => 'Send Feedback'
			),
			'buttonColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonHoverColor' => array(
				'type' => 'string',
				'default' => 'secondary'
			),
			'buttonTextColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'buttonTextHoverColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'buttonPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '12',
					'right' => '20',
					'bottom' => '12',
					'left' => '20'
				)
			),
			'buttonMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '7',
					'right' => '15',
					'bottom' => '7',
					'left' => '15'
				)
			),
			'inputFieldsGap' => array(
				'type' => 'number',
				'default' => 14
			),
			'inputFieldsMobileGap' => array(
				'type' => 'number',
				'default' => 10
			),
			'inputBorderColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'inputBorderFocusColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'inputBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '10',
					'topRight' => '10',
					'bottomRight' => '10',
					'bottomLeft' => '10'
				)
			),
			'inputMobileBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => '5',
					'topRight' => '5',
					'bottomRight' => '5',
					'bottomLeft' => '5'
				)
			),
			'inputPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '12',
					'right' => '15',
					'bottom' => '12',
					'left' => '15'
				)
			),
			'inputMobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '4',
					'right' => '5',
					'bottom' => '4',
					'left' => '5'
				)
			),
			'placeholderScale' => array(
				'type' => 'number',
				'default' => 0.9
			),
			'inputBorder' => array(
				'type' => 'number',
				'default' => 1
			),
			'inputShadow' => array(
				'type' => 'object',
				'default' => array(
					'enabled' => true,
					'offsetX' => 0,
					'offsetY' => 4,
					'blur' => 30,
					'spread' => 0,
					'color' => '#000000',
					'opacity' => 0.15
				)
			),
			'phoneNumberFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'formSourceFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'subjectFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'messageFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'firstNameFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'lastNameFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'emailFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonTextFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'entryIdFieldName' => array(
				'type' => 'string',
				'default' => ''
			),
			'formFields' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'businessName' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessLogo' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessLogoAltText' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessPhone' => array(
				'type' => 'string',
				'default' => ''
			),
			'businessEmail' => array(
				'type' => 'string',
				'default' => ''
			),
			'contactType' => array(
				'type' => 'string',
				'default' => 'Customer Support'
			),
			'areaServed' => array(
				'type' => 'string',
				'default' => ''
			),
			'availableLanguage' => array(
				'type' => 'string',
				'default' => 'English'
			),
			'spinnerRingColor' => array(
				'type' => 'string',
				'default' => 'secondary'
			),
			'spinnerDotColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'loadingTextColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'dotsColor' => array(
				'type' => 'string',
				'default' => 'primary'
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	),
	'oone-testimonials-carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'oone/oone-testimonials-carousel',
		'version' => '0.1.0',
		'title' => 'Testimonials Carousel',
		'category' => 'oone-blocks',
		'icon' => 'smiley',
		'description' => 'A trust-building testimonial engine that showcases authentic client feedback in a dynamic, dual-row sliding carousel. Featuring precise star-rating visualizations and automated SEO Review Schema, it turns social proof into a high-end visual experience that perfectly scales across all devices.',
		'example' => array(
			
		),
		'keywords' => array(
			'review',
			'carousel',
			'slide',
			'rating',
			'oone',
			'testimonials'
		),
		'supports' => array(
			'html' => false,
			'multiple' => true
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string'
			),
			'caption' => array(
				'type' => 'string',
				'default' => 'Client Feedback'
			),
			'captionFontSize' => array(
				'type' => 'number',
				'default' => 20
			),
			'captionLineHeight' => array(
				'type' => 'number',
				'default' => 1.2
			),
			'captionPadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'captionAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'captionBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'captionItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'captionUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'captionColor' => array(
				'type' => 'string',
				'default' => 'primary'
			),
			'titleOne' => array(
				'type' => 'string',
				'default' => 'Transforming Visions into Digital Success.'
			),
			'titleTwo' => array(
				'type' => 'string',
				'default' => 'Hear What Our Partners Say'
			),
			'titleFontSize' => array(
				'type' => 'number',
				'default' => 35
			),
			'titleLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'titlePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '0',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'titleAlign' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'titleBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'titleItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'titleColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'backgroundColor' => array(
				'type' => 'string',
				'default' => 'transparent'
			),
			'padding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '0',
					'bottom' => '20',
					'left' => '0'
				)
			),
			'mobilePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '10',
					'right' => '0',
					'bottom' => '10',
					'left' => '0'
				)
			),
			'slideGap' => array(
				'type' => 'number',
				'default' => 40
			),
			'slideContentGap' => array(
				'type' => 'number',
				'default' => 15
			),
			'minSlidesToShow' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'slideNameFontSize' => array(
				'type' => 'number',
				'default' => 17
			),
			'slideNameLineHeight' => array(
				'type' => 'number',
				'default' => 1
			),
			'slideNameBold' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideNameItalics' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideNameUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideNameColor' => array(
				'type' => 'string',
				'default' => 'accent'
			),
			'slideTextFontSize' => array(
				'type' => 'number',
				'default' => 15
			),
			'slideTextLineHeight' => array(
				'type' => 'number',
				'default' => 1.3
			),
			'slideTextBold' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideTextItalics' => array(
				'type' => 'boolean',
				'default' => true
			),
			'slideTextUnderline' => array(
				'type' => 'boolean',
				'default' => false
			),
			'slideTextColor' => array(
				'type' => 'string',
				'default' => 'neutral'
			),
			'slideRatingSize' => array(
				'type' => 'number',
				'default' => 15
			),
			'slideImageSize' => array(
				'type' => 'number',
				'default' => 45
			),
			'slideRatingColor' => array(
				'type' => 'string',
				'default' => '#F3BE00'
			),
			'slidePadding' => array(
				'type' => 'object',
				'default' => array(
					'top' => '20',
					'right' => '20',
					'bottom' => '20',
					'left' => '20'
				)
			),
			'slideBackgroundColor' => array(
				'type' => 'string',
				'default' => 'white'
			),
			'slideWidth' => array(
				'type' => 'number',
				'default' => 350
			),
			'reviewedEntityType' => array(
				'type' => 'string',
				'default' => 'LocalBusiness'
			),
			'reviewedEntityName' => array(
				'type' => 'string',
				'default' => 'Saudi PCC Services'
			),
			'slideBorderRadius' => array(
				'type' => 'object',
				'default' => array(
					'topLeft' => 20,
					'topRight' => 20,
					'bottomRight' => 20,
					'bottomLeft' => 20
				)
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 0.5
			),
			'slides' => array(
				'type' => 'array',
				'default' => array(
					array(
						'name' => 'Sarah Chen',
						'text' => 'Story Craft Digital genuinely revitalized how we connect with customers. Seeing leads increase by 45% felt like a true joint achievement!',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-sarah.webp',
						'imgAlt' => 'Sarah Chen, Marketing Director'
					),
					array(
						'name' => 'Mark Rodriguez',
						'text' => 'The resulting modern design is exactly what we hoped for. We’ve seen measurable growth in both user engagement and satisfaction since launch.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-mark.webp',
						'imgAlt' => 'Mark Rodriguez, Founder'
					),
					array(
						'name' => 'Aisha Khan',
						'text' => 'They simplified a complex part of our business, and the resulting ROI was remarkable. Their analytical precision gave us the competitive advantage we needed.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-aisha.webp',
						'imgAlt' => 'Aisha Khan, Chief Data Officer'
					),
					array(
						'name' => 'David Smith',
						'text' => 'The content precision they brought to our strategic narrative changed everything. Story Craft Digital captured attention by simplifying our message.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-david.webp',
						'imgAlt' => 'David Smith, Head of Strategy'
					),
					array(
						'name' => 'Elena Petrova',
						'text' => 'They didn\'t just present complex theories; they showed us exactly how to unify our story with scalable, sophisticated tech. This felt like true digital innovation.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-elena.webp',
						'imgAlt' => 'Elena Petrova, Visionary Founder'
					),
					array(
						'name' => 'Kenji Tanaka',
						'text' => ' delivered a cohesive, tailored system that feels authentic to who we are. It’s been a professional pleasure working with them.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-kenji.webp',
						'imgAlt' => 'Kenji Tanaka, Brand Manager'
					),
					array(
						'name' => 'Priya Sharma',
						'text' => 'Their close-up focus and elegant handling of data visualizations helped us communicate effectively, truly crafting digital impact.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-priya.webp',
						'imgAlt' => 'Priya Sharma, Lead Strategist'
					),
					array(
						'name' => 'Dr. Ben Carter',
						'text' => 'The sophisticated dashboard they delivered Unified data perfectly with our core business narrative, providing clarity on our digital performance.',
						'rating' => 5,
						'link' => '#',
						'image' => 'oone-testimonial-image-ben.webp',
						'imgAlt' => 'Dr. Ben Carter, Director'
					)
				)
			)
		),
		'textdomain' => 'orbit-one',
		'editorScript' => array(
			'file:./index.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		),
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => array(
			'file:./view.js',
			'oone-shared-libs',
			'oone-tailwind',
			'oone-color-palette'
		)
	)
);
