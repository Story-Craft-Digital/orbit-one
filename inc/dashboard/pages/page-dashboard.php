<?php

/**
 * Renders the content for the Dashboard page.
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}
function oone_render_dashboard_page()
{

    // 1. Plugin Details
    $oone_core_version = OONE_VERSION;

    $oone_pro_active = defined('OONE_PRO_VERSION');

    $oone_pro_version = defined('OONE_PRO_VERSION') ? OONE_PRO_VERSION : 'N/A';
?>


    <div class="wrap oone-dashboard bg-slate-50 oone-main-viewport">
        <?php
        oone_render_dashboard_header(
            __('Dashboard', 'orbit-one'),
            'banner'
        );
        ?>
        <div class="oone-scroll-area">

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <a href="<?php echo esc_url(admin_url('admin.php?page=oone-blocks')); ?>" class="group p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-400 transition-all no-underline">
                    <div class="flex items-center mb-4">
                        <div class="p-2.5 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-all duration-300">
                            <svg class="w-6 h-6 text-purple-700 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="7" height="7" x="3" y="3" rx="1" />
                                <rect width="7" height="7" x="14" y="3" rx="1" />
                                <rect width="7" height="7" x="14" y="14" rx="1" />
                                <rect width="7" height="7" x="3" y="14" rx="1" />
                            </svg>
                        </div>
                        <h2 class="ml-4 text-xl font-bold text-slate-800 m-0 tracking-tight">
                            <?php esc_html_e('Blocks Library', 'orbit-one'); ?>
                        </h2>
                    </div>
                    <p class="text-sm text-slate-600 m-0"><?php esc_html_e('Enable or disable specific blocks to keep your editor clean.', 'orbit-one'); ?></p>
                </a>

                <a href="<?php echo esc_url(admin_url('admin.php?page=oone-settings')); ?>" class="group p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all no-underline">
                    <div class="flex items-center mb-4">
                        <div class="p-2.5 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-all duration-300">
                            <svg class="w-6 h-6 text-purple-700 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.688-1.688h1.938c3.105 0 5.625-2.52 5.625-5.625 0-4.62-4.62-8.75-10-8.75Z" />
                            </svg>
                        </div>
                        <h2 class="ml-4 text-xl font-bold text-slate-800 m-0 tracking-tight">
                            <?php esc_html_e('Global Styles', 'orbit-one'); ?>
                        </h2>
                    </div>
                    <p class="text-sm text-slate-600 m-0"><?php esc_html_e('Set your default colors and typography once and use them everywhere.', 'orbit-one'); ?></p>
                </a>


                <div class="group p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all relative overflow-hidden self-stretch">
                    <div class="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"></div>

                    <div class="relative z-10">
                        <div class="flex items-center mb-6">
                            <div class="p-2.5 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-all duration-300">
                                <svg class="w-6 h-6 text-purple-700 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                    <path d="M10 2v8l3-3 3 3V2" />
                                </svg>
                            </div>
                            <h2 class="ml-4 text-xl font-bold text-slate-800 m-0 tracking-tight">
                                <?php esc_html_e('Resources', 'orbit-one'); ?>
                            </h2>
                        </div>

                        <div class="flex flex-col md:flex-row md:items-center gap-3">

                            <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="group/item flex gap-2 items-center justify-center md:justify-start bg-purple-50 md:bg-slate-50 hover:md:bg-purple-600 text-purple-700 md:text-slate-500 hover:md:text-white p-3 md:p-2.5 rounded-xl border border-purple-200 md:border-slate-100 hover:md:border-purple-600 transition-all duration-300 no-underline overflow-hidden">
                                <svg class="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <line x1="10" y1="9" x2="8" y2="9" />
                                </svg>
                                <span class="max-w-none opacity-100 visible mt-1 md:mt-0 md:max-w-0 md:opacity-0 md:invisible group-hover/item:md:max-w-[130px] group-hover/item:md:opacity-100 group-hover/item:md:visible group-hover/item:md:ml-2 whitespace-nowrap text-[11px] md:text-sm font-bold transition-all duration-300 ease-in-out uppercase md:normal-case">
                                    <?php esc_html_e('Documentation', 'orbit-one'); ?>
                                </span>
                            </a>

                            <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="group/item flex gap-2 items-center justify-center md:justify-start bg-purple-50 md:bg-slate-50 hover:md:bg-purple-600 text-purple-700 md:text-slate-500 hover:md:text-white p-3 md:p-2.5 rounded-xl border border-purple-200 md:border-slate-100 hover:md:border-purple-600 transition-all duration-300 no-underline overflow-hidden">
                                <svg class="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                    <path d="M15 12h.01" />
                                    <path d="M12 12h.01" />
                                    <path d="M9 12h.01" />
                                </svg>
                                <span class="max-w-none opacity-100 visible mt-1 md:mt-0 md:max-w-0 md:opacity-0 md:invisible group-hover/item:md:max-w-[130px] group-hover/item:md:opacity-100 group-hover/item:md:visible group-hover/item:md:ml-2 whitespace-nowrap text-[11px] md:text-sm font-bold transition-all duration-300 ease-in-out uppercase md:normal-case">
                                    <?php esc_html_e('Community', 'orbit-one'); ?>
                                </span>
                            </a>

                            <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="group/item flex gap-2 items-center justify-center md:justify-start bg-purple-50 md:bg-slate-50 hover:md:bg-purple-600 text-purple-700 md:text-slate-500 hover:md:text-white p-3 md:p-2.5 rounded-xl border border-purple-200 md:border-slate-100 hover:md:border-purple-600 transition-all duration-300 no-underline overflow-hidden">
                                <svg class="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="20" height="15" x="2" y="3" rx="2" ry="2" />
                                    <path d="m10 8 5 3-5 3V8Z" />
                                    <line x1="2" y1="18" x2="22" y2="18" />
                                </svg>
                                <span class="max-w-none opacity-100 visible mt-1 md:mt-0 md:max-w-0 md:opacity-0 md:invisible group-hover/item:md:max-w-[130px] group-hover/item:md:opacity-100 group-hover/item:md:visible group-hover/item:md:ml-2 whitespace-nowrap text-[11px] md:text-sm font-bold transition-all duration-300 ease-in-out uppercase md:normal-case">
                                    <?php esc_html_e('Tutorials', 'orbit-one'); ?>
                                </span>
                            </a>

                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <div class="lg:col-span-2 p-8 bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl text-white shadow-lg relative overflow-hidden self-start">
                    <div class="relative z-10">
                        <span class="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                        <h2 class="text-3xl font-bold mt-4 mb-2 text-white"><?php esc_html_e('Unlock Premium Features', 'orbit-one'); ?></h2>
                        <p class="text-purple-100 text-lg mb-6 max-w-md"><?php esc_html_e('Get 20+ Premium Blocks, Dynamic KPI Dashboard, and Advanced Animation Controls.', 'orbit-one'); ?></p>
                        <div class="flex flex-wrap gap-4">
                            <a href="javascript:void(0);"
                                onclick="ooneOpenPortal('https://storycraft.digital')"
                                class="bg-white text-purple-900 font-bold px-6 py-3 rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors no-underline">
                                <?php esc_html_e('Notify Me on Launch', 'orbit-one'); ?>
                            </a>
                            <a href="javascript:void(0);"
                                onclick="ooneOpenPortal('https://storycraft.digital')"
                                class="bg-transparent border-2 border-white/30 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors no-underline">
                                <?php esc_html_e('Join Waitinglist', 'orbit-one'); ?>
                            </a>
                        </div>
                    </div>
                    <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500 opacity-20 rounded-full"></div>
                </div>

                <div class="lg:col-span-1 space-y-6">

                    <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div class="flex items-center mb-6">
                            <div class="p-2.5 bg-purple-100 rounded-xl text-purple-600 transition-all duration-300">
                                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            <h2 class="ml-4 text-xl font-bold text-slate-800 m-0 tracking-tight">
                                <?php esc_html_e('System Status', 'orbit-one'); ?>
                            </h2>
                        </div>

                        <div class="space-y-4">
                            <div class="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span class="text-sm font-medium text-slate-500 italic"><?php esc_html_e('Core Version', 'orbit-one'); ?></span>
                                <span class="text-sm font-bold text-slate-800"><?php echo esc_html($oone_core_version); ?></span>
                            </div>

                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-slate-500 italic"><?php esc_html_e('Pro Version', 'orbit-one'); ?></span>
                                <div class="flex items-center gap-2">
                                    <?php if ($oone_pro_active) : ?>
                                        <span class="text-sm font-bold text-slate-800"><?php echo esc_html($oone_pro_version); ?></span>

                                        <span class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <?php esc_html_e('Activated', 'orbit-one'); ?>
                                        </span>
                                    <?php else : ?>
                                        <span class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase border border-slate-200">
                                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            <?php esc_html_e('Not Installed', 'orbit-one'); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-purple-50 rounded-xl border border-purple-100">
                        <div class="flex items-center mb-4">
                            <div class="p-2.5 bg-purple-100 rounded-xl text-purple-600 transition-all duration-300">
                                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                    <path d="M2 12h20" />
                                </svg>
                            </div>
                            <h2 class="ml-4 text-xl font-bold text-slate-800 m-0 tracking-tight">
                                <?php esc_html_e('Join the Community', 'orbit-one'); ?>
                            </h2>
                        </div>

                        <p class="text-purple-700 text-sm mb-6 font-medium italic">
                            <?php esc_html_e('Get design tips, support, and show off your creations with other Orbit one creators.', 'orbit-one'); ?>
                        </p>

                        <div class="flex items-center gap-4">
                            <a href="javascript:void(0);"
                                onclick="ooneOpenPortal('https://storycraft.digital')"
                                aria-label="<?php esc_attr_e('Visit Orbit one Facebook community', 'orbit-one'); ?>"
                                class="w-10 h-10 flex items-center justify-center bg-blue-600 text-white hover:text-white rounded-full hover:bg-blue-700 transition-transform hover:-translate-y-1 shadow-sm">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                            </a>
                            <a href="javascript:void(0);"
                                onclick="ooneOpenPortal('https://storycraft.digital')"
                                aria-label="<?php esc_attr_e('Join Orbit one Discord community', 'orbit-one'); ?>"
                                class="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white hover:text-white rounded-full hover:bg-indigo-600 transition-transform hover:-translate-y-1 shadow-sm">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                                </svg>
                            </a>
                            <a href="javascript:void(0);"
                                onclick="ooneOpenPortal('https://storycraft.digital')"
                                aria-label="<?php esc_attr_e('Watch Orbit one tutorials on YouTube', 'orbit-one'); ?>"
                                class="w-10 h-10 flex items-center justify-center bg-red-600 text-white hover:text-white rounded-full hover:bg-red-700 transition-transform hover:-translate-y-1 shadow-sm">
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="oone-portal-modal" class="fixed inset-0 z-[100000] hidden items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="ooneClosePortal()"></div>
            <div class="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                <div class="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2"><?php esc_html_e('Leaving Site', 'orbit-one'); ?></h3>
                <p class="text-slate-500 text-sm mb-8"><?php esc_html_e('You are about to visit the Orbit one portal for external resources and updates.', 'orbit-one'); ?></p>

                <div class="flex gap-3">
                    <button onclick="ooneClosePortal()" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"><?php esc_html_e('Cancel', 'orbit-one'); ?></button>
                    <a id="oone-portal-confirm" href="#" target="_blank" rel="noopener noreferrer" onclick="ooneClosePortal()" class="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 no-underline"><?php esc_html_e('Proceed', 'orbit-one'); ?></a>
                </div>
            </div>
        </div>
    </div>
<?php
}
