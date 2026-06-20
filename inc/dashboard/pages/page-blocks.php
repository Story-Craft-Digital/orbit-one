<?php

/**
 * Renders the content for the Blocks management page.
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}
function oone_render_blocks_page()
{
    if (! current_user_can('manage_options')) {
        return;
    }

    // 1. SAVE LOGIC (Run this first)
    if (isset($_POST['oone_save_blocks_settings']) && check_admin_referer('oone_save_blocks_settings', 'oone_blocks_nonce')) {
        $enabled_from_form = isset($_POST['enabled_blocks']) ? array_map('sanitize_text_field', wp_unslash((array) $_POST['enabled_blocks'])) : array();

        // We need all registered blocks to compare.
        $all_registered      = WP_Block_Type_Registry::get_instance()->get_all_registered();
        $new_disabled_blocks = array();

        foreach ($all_registered as $name => $settings) {
            // Only care about your specific category
            if (isset($settings->category) && $settings->category === 'oone-blocks') {
                if (! in_array($name, $enabled_from_form, true)) {
                    $new_disabled_blocks[] = $name;
                }
            }
        }

        update_option('oone_disabled_blocks', $new_disabled_blocks);

        // Show a native WordPress success notice
?>
        <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e('Settings saved.', 'orbit-one'); ?></p>
        </div>
    <?php
    }

    // 2. DATA RETRIEVAL (Run this second so it gets the UPDATED options)
    $all_blocks = WP_Block_Type_Registry::get_instance()->get_all_registered();
    $oone_blocks = array_filter($all_blocks, function ($block) {
        return isset($block->category) && $block->category === 'oone-blocks';
    });

    // This will now fetch the fresh data we just saved above
    $disabled_blocks = get_option('oone_disabled_blocks', []);

    ?>

    <div class="wrap oone-blocks bg-slate-50 oone-main-viewport">
        <?php
        oone_render_dashboard_header(
            __('Blocks', 'orbit-one'),
            'banner'
        );
        ?>
        <div class="oone-scroll-area">
            <form method="post" id="oone-blocks-form" action="" class="flex flex-col flex-grow overflow-hidden">
                <?php wp_nonce_field('oone_save_blocks_settings', 'oone_blocks_nonce'); ?>

                <div class="oone-sticky-header mb-8 flex flex-col md:flex-row md:items-center justify-between bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div class="flex items-start gap-3 md:gap-4 flex-1">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>

                        <div>
                            <span class="font-bold text-base md:text-lg text-slate-800 block leading-tight"><?php esc_html_e('Block Performance', 'orbit-one'); ?></span>
                            <p class="text-xs md:text-sm text-slate-500 mt-1">
                                <?php esc_html_e('Optimize your workflow by disabling unused blocks.', 'orbit-one'); ?>
                            </p>
                        </div>
                    </div>

                    <div class="flex-shrink-0">
                        <button type="submit" name="oone_save_blocks_settings" class="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-purple-600 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-100 cursor-pointer border-none">
                            <?php esc_attr_e('Save Changes', 'orbit-one'); ?>
                        </button>
                    </div>
                </div>
                <?php if (empty($oone_blocks)) : ?>
                    <div class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <p class="text-slate-400 font-medium"><?php esc_html_e('No blocks found in this category.', 'orbit-one'); ?></p>
                    </div>
                <?php else : ?>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <?php foreach ($oone_blocks as $block) : ?>
                            <?php $is_active = ! in_array($block->name, $disabled_blocks, true); ?>

                            <div class="group bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:shadow-xl hover:border-purple-300 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-start justify-between">
                                        <div class="flex gap-4">
                                            <div class="w-12 h-12 flex items-center justify-center bg-purple-50 rounded-xl text-purple-600 transition-all duration-300 flex-shrink-0">
                                                <?php
                                                echo wp_kses(oone_get_block_icon_svg($block->name), oone_kses_allowed_html_svg()); ?>
                                            </div>

                                            <div>
                                                <h3 class="text-base font-bold text-slate-800 m-0 leading-tight">
                                                    <?php echo esc_html($block->title); ?>
                                                </h3>

                                                <div class="flex items-center gap-3 mt-2">
                                                    <div class="flex items-center gap-1.5">
                                                        <span class="oone-status-indicator">
                                                            <?php if ($is_active) : ?>
                                                                <span class="oone-status-ping"></span>
                                                            <?php endif; ?>
                                                            <span class="<?php echo $is_active ? 'oone-status-dot-active' : 'oone-status-dot'; ?>"></span>
                                                        </span>
                                                        <span class="text-[10px] font-bold uppercase tracking-wider <?php echo $is_active ? 'text-green-600' : 'text-slate-400'; ?>">
                                                            <?php echo $is_active ? esc_html__('Active', 'orbit-one') : esc_html__('Inactive', 'orbit-one'); ?>
                                                        </span>
                                                    </div>

                                                    <label class="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="enabled_blocks[]"
                                                            value="<?php echo esc_attr($block->name); ?>"
                                                            class="sr-only peer"
                                                            <?php checked($is_active); ?>>
                                                        <div class="w-7 h-4 bg-slate-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <?php $previews = oone_get_block_previews($block->name); ?>
                                        <?php if (! empty($previews['desktop'])) : ?>
                                            <button
                                                type="button"
                                                class="oone-block-preview-trigger w-8 h-8 rounded-full bg-slate-50 text-purple-400 hover:bg-purple-100 hover:text-purple-600 transition-all flex items-center justify-center flex-shrink-0"
                                                data-title="<?php echo esc_attr($block->title); ?>"
                                                data-name="<?php echo esc_attr($block->name); ?>"
                                                data-description="<?php echo esc_attr($block->description); ?>"
                                                data-desktop-src="<?php echo esc_url($previews['desktop']); ?>"
                                                data-mobile-src="<?php echo esc_url($previews['mobile']); ?>">

                                                <?php
                                                echo wp_kses(
                                                    oone_get_icon('info', [
                                                        'size'  => 18,
                                                        'color' => '#9813ca',
                                                    ]),
                                                    oone_kses_allowed_html_svg()
                                                );
                                                ?>

                                            </button>
                                        <?php endif; ?>
                                    </div>

                                    <div class="group/desc relative mt-4">
                                        <p class="text-sm text-slate-500 line-clamp-2 leading-snug">
                                            <?php echo esc_html($block->description); ?>
                                        </p>
                                        <div class="invisible opacity-0 group-hover/desc:visible group-hover/desc:opacity-100 absolute bottom-full left-0 mb-2 w-full min-w-[200px] p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl transition-all duration-200 z-10">
                                            <?php echo esc_html($block->description); ?>
                                            <div class="absolute top-full left-4 border-4 border-transparent border-t-slate-800"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>



                <div id="oone-block-modal" class="fixed inset-0 z-[99999] hidden items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                    <div id="oone-block-modal-overlay" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 opacity-0"></div>

                    <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl m-auto max-h-[90vh] flex flex-col transition-all duration-300 scale-95 opacity-0 overflow-hidden">

                        <div class="px-4 sm:px-6 py-4 border-b border-slate-100 bg-white z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div class="flex items-start sm:items-center gap-3 w-full">
                                <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 id="oone-block-modal-title" class="text-base sm:text-xl font-bold text-slate-800 leading-tight mb-1"></h2>
                                    <p id="oone-block-modal-name" class="text-[10px] text-slate-400 font-mono uppercase tracking-widest"></p>
                                </div>
                            </div>

                            <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                                <div id="oone-block-modal-tabs" class="grid grid-cols-2 w-full sm:flex sm:w-auto p-1 bg-slate-100 rounded-xl">
                                    <button data-tab="desktop" class="w-full sm:w-auto px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"><?php esc_html_e('Desktop', 'orbit-one'); ?></button>
                                    <button data-tab="mobile" class="w-full sm:w-auto px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"><?php esc_html_e('Mobile', 'orbit-one'); ?></button>
                                </div>
                                <button id="oone-block-modal-close" type="button" class="w-8 h-8 flex items-center justify-center rounded-full !bg-slate-50 !text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="flex-grow bg-slate-50 min-h-[500px] max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div class="p-4 sm:p-8 flex justify-center">

                                <div id="oone-block-modal-content-desktop" class="tab-panel w-full h-full max-w-4xl mx-auto animate-in fade-in flex flex-col items-center justify-center">

                                    <div class="w-full max-w-[80%] aspect-[15/10] bg-slate-800 p-1.5 rounded-xl shadow-2xl border-[6px] border-slate-800 flex flex-col">

                                        <div class="bg-white rounded-md overflow-hidden flex flex-col flex-grow">

                                            <div class="bg-slate-100 px-3 py-1.5 flex items-center gap-2 border-b flex-shrink-0">
                                                <div class="flex gap-1">
                                                    <div class="w-2 h-2 rounded-full bg-red-400"></div>
                                                    <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                                                    <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                                </div>
                                            </div>

                                            <div class="bg-white overflow-y-auto custom-scrollbar flex-grow flex items-center justify-center">

                                                <img id="oone-desktop-img" src="" alt="Desktop" class="w-auto h-auto max-w-full max-h-full block border-none">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="w-24 h-2 bg-slate-700 shadow-inner"></div>
                                    <div class="w-40 h-1.5 bg-slate-800 rounded-b-xl shadow-lg"></div>
                                </div>

                                <div id="oone-block-modal-content-mobile" class="tab-panel hidden h-full animate-in fade-in flex items-center justify-center">
                                    <div class="device-mobile-frame relative mx-auto border-[8px] border-slate-900 rounded-[2.5rem] shadow-2xl bg-slate-900 overflow-hidden ring-4 ring-slate-800/10">
                                        <div class="absolute top-0 inset-x-0 h-7 bg-slate-900 z-20">
                                            <div class="mt-2.5 mx-auto w-16 h-3.5 bg-black rounded-full"></div>
                                        </div>

                                        <div class="h-full w-full bg-white pt-8 overflow-y-auto custom-scrollbar flex items-center justify-center">

                                            <img id="oone-mobile-img" src="" alt="Mobile" class="w-auto h-auto max-w-full max-h-full block">

                                        </div>
                                        <div class="absolute bottom-1 inset-x-0 h-1 w-20 mx-auto bg-slate-300 rounded-full z-20 opacity-40"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="p-6 bg-white border-t border-slate-100">
                                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"><?php esc_html_e('About this block', 'orbit-one'); ?></h4>
                                <p id="oone-block-modal-description" class="text-sm text-slate-600 leading-relaxed max-w-2xl"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

<?php
}
