<?php

/**
 * Renders the content for the Help page.
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}
function oone_render_help_page()
{
    // Example FAQs - You can turn this into an array
    $faqs = [
        [
            'q' => __('How do I enable or disable blocks?', 'orbit-one'),
            'a' => __('Navigate to the Blocks Library page and toggle blocks based on your workflow.', 'orbit-one')
        ],
        [
            'q' => __('Can I customize global styles?', 'orbit-one'),
            'a' => __('Yes, go to the Global Styles page to configure typography, spacing, and colors.', 'orbit-one')
        ],
        [
            'q' => __('Where can I access tutorials and documentation?', 'orbit-one'),
            'a' => __('Visit the Resources section inside the dashboard to access guides and video tutorials.', 'orbit-one')
        ],
    ];
?>

    <div class="wrap oone-help bg-slate-50 oone-main-viewport">
        <?php
        oone_render_dashboard_header(
            __('Help', 'orbit-one'),
            'banner'
        );
        ?>
        <div class="oone-scroll-area">
            <div class="bg-gradient-to-br from-purple-600 via-slate-900 to-indigo-900 rounded-[2.5rem] p-10 mb-10 relative border border-white/5">
                <div class="relative z-10">
                    <h2 class="text-3xl font-bold text-white mb-2">
                        <?php esc_html_e('What are you working on today?', 'orbit-one'); ?>
                    </h2>
                    <p class="text-indigo-200/60 mb-8">
                        <?php esc_html_e('Select a path below to view specific guides and shortcuts.', 'orbit-one'); ?>
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="<?php echo esc_url(admin_url('admin.php?page=oone-form-entries')); ?>" class="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-purple-600 hover:border-purple-500 transition-all group">
                            <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <span class="block text-white font-bold text-sm">
                                    <?php esc_html_e('Managing Leads', 'orbit-one'); ?>
                                </span>
                                <span class="text-slate-400 text-[10px] uppercase font-bold group-hover:text-purple-100">Go to Explorer</span>
                            </div>
                        </a>

                        <a href="<?php echo esc_url(admin_url('admin.php?page=oone-settings')); ?>" class="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                            <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <span class="block text-white font-bold text-sm">System Setup</span>
                                <span class="text-slate-400 text-[10px] uppercase font-bold group-hover:text-blue-100">Configure Plugin</span>
                            </div>
                        </a>

                        <button aria-expanded="false" onclick="document.getElementById('faq').scrollIntoView({behavior: 'smooth', block: 'center'})" class="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-emerald-600 hover:border-emerald-500 transition-all group text-left">
                            <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <span class="block text-white font-bold text-sm">Common Issues</span>
                                <span class="text-slate-400 text-[10px] uppercase font-bold group-hover:text-emerald-100">View FAQs</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                <div class="group relative p-7 bg-white rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 flex flex-col items-start justify-between overflow-hidden">
                    <div class="absolute -bottom-6 -right-6 text-slate-100 group-hover:text-indigo-50 transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                        <svg class="w-40 h-40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    <div class="relative z-10 w-full">
                        <div class="flex items-center gap-4 mb-5">
                            <div class="w-12 h-12 shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 class="font-bold text-slate-800 text-xl tracking-tight">Technical Documentation</h3>
                        </div>
                        <p class="text-slate-500 text-[13px] leading-relaxed mb-4 font-medium max-w-[210px]">Master the explorer and block configurations with our deep-dive guides.</p>
                    </div>

                    <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="relative z-10 inline-flex items-center gap-3 px-7 py-4 rounded-2xl transition-all duration-300 bg-purple-600 hover:bg-purple-800 text-white hover:text-white shadow-md hover:shadow-purple-300">
                        <span class="font-bold text-[11px] uppercase tracking-wider">Open Library</span>
                        <svg class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <path d="M9 15L15 9M15 9H11M15 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>

                <div class="group relative p-7 bg-white rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 flex flex-col items-start justify-between overflow-hidden">
                    <div class="absolute -bottom-6 -right-6 text-slate-100 group-hover:text-red-50 transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                        <svg class="w-40 h-40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div class="relative z-10 w-full">
                        <div class="flex items-center gap-4 mb-5">
                            <div class="w-12 h-12 shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 class="font-bold text-slate-800 text-xl tracking-tight">Video Masterclass</h3>
                        </div>
                        <p class="text-slate-500 text-[13px] leading-relaxed mb-4 font-medium max-w-[210px]">Premium step-by-step videos to help you automate your workflow faster.</p>
                    </div>

                    <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="relative z-10 inline-flex items-center gap-3 px-7 py-4 rounded-2xl transition-all duration-300 bg-purple-600 hover:bg-purple-800 text-white hover:text-white shadow-md hover:shadow-purple-300">
                        <span class="font-bold text-[11px] uppercase tracking-wider">Start Watching</span>

                        <svg class="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                            <path d="M15.5 11.134C16.1667 11.5189 16.1667 12.4811 15.5 12.866L10.25 15.8971C9.58333 16.282 8.75 15.8009 8.75 15.0311L8.75 8.96891C8.75 8.19911 9.58333 7.718 10.25 8.1029L15.5 11.134Z" fill="currentColor" />
                        </svg>
                    </a>
                </div>
                <div class="flex flex-col gap-4">
                    <div class="group relative p-6 bg-gradient-to-br from-purple-800 to-indigo-700 rounded-[2rem] text-white shadow-lg shadow-purple-200 flex-1 flex items-center justify-between gap-6 overflow-hidden border border-white/10">

                        <div class="absolute -bottom-4 -right-2 text-white/10 group-hover:text-white/20 transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:rotate-12">
                            <svg class="w-24 h-24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>

                        <div class="relative z-10 flex items-center gap-4">
                            <div class="w-10 h-10 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>

                            <div>
                                <h3 class="font-bold text-white text-xl tracking-tight leading-none mb-2">Direct Support</h3>
                                <div class="flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <p class="text-purple-100/80 text-[10px] uppercase font-bold tracking-widest">Engineering Team</p>
                                </div>
                            </div>
                        </div>

                        <a href="javascript:void(0);" onclick="ooneOpenPortal('https://storycraft.digital')" class="relative z-10 px-4 py-3 bg-white text-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-lg group/btn flex items-center gap-2">
                            Open Ticket
                        </a>
                    </div>

                    <div class="group relative p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] text-white border border-slate-700/50 overflow-hidden transition-all duration-500 hover:border-purple-500/30">

                        <div class="absolute -bottom-4 -right-2 text-slate-700/30 group-hover:text-purple-500/10 transition-all duration-700 pointer-events-none transform group-hover:scale-110">
                            <svg class="w-24 h-24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3V7.5a3 3 0 013-3h13.5a3 3 0 013 3v3.75a3 3 0 01-3 3m-13.5 0a3 3 0 00-3 3v.75c0 1.242 1.008 2.25 2.25 2.25h15.75c1.242 0 2.25-1.008 2.25-2.25v-.75a3 3 0 00-3-3" />
                            </svg>
                        </div>

                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Environment</span>
                                </div>

                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold border border-emerald-500/20">
                                    <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Secure
                                </span>
                            </div>

                            <div class="flex gap-6">
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Plugin</span>
                                    <span class="text-xs font-black text-purple-400 italic">v<?php echo esc_html(OONE_VERSION); ?> Stable</span>
                                </div>
                                <div class="flex flex-col border-l border-slate-700/50 pl-6">
                                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Engine</span>
                                    <span class="text-xs font-black text-white">PHP <?php echo esc_html(phpversion()); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 group relative p-7 bg-white rounded-[2.5rem] border border-slate-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">

                    <div class="absolute -top-6 -right-6 text-slate-100/50 group-hover:text-purple-50 transition-all duration-700 pointer-events-none transform group-hover:scale-110">
                        <svg class="w-64 h-64" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div id="faq" class="relative z-10">
                        <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <div class="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            Frequent Questions
                        </h3>

                        <div class="space-y-1" id="faq-accordion">
                            <?php foreach ($faqs as $index => $faq): ?>
                                <div class="faq-item border-b border-slate-50 last:border-0 overflow-hidden">
                                    <button aria-expanded="false" class="faq-trigger w-full flex justify-between items-center font-bold bg-slate-50/50 text-slate-700 hover:text-purple-600 transition-all py-3 px-2 rounded-xl hover:bg-purple-50/50 text-left">
                                        <span class="text-[14px] tracking-tight"><?php echo esc_html($faq['q']); ?></span>
                                        <svg class="faq-icon w-4 h-4 text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div class="faq-content grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                        <div class="overflow-hidden">
                                            <div class="px-2 pb-4 pt-1">
                                                <p class="text-slate-500 text-[13px] leading-relaxed border-l-2 border-purple-200 pl-4">
                                                    <?php echo esc_html($faq['a']); ?>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <div class="group relative p-8 bg-white rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:border-purple-200 transition-all duration-500 overflow-hidden">

                    <div class="absolute -bottom-6 -right-6 text-slate-100/50 group-hover:text-purple-50 transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                        <svg class="w-48 h-48" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.98 14.98 0 00-6.16 12.12c1.86.12 3.63-.3 5.18-1.18m11.16-11.16a3 3 0 11-4.24-4.24 3 3 0 014.24 4.24z" />
                        </svg>
                    </div>

                    <div class="relative z-10">

                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Release Timeline
                        </h3>

                        <div class="relative space-y-8 ml-2">

                            <div class="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                            <!-- Initial Release -->
                            <div class="relative flex gap-6 group/item">

                                <div class="relative z-10 w-3 h-3 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] border-2 border-white"></div>

                                <div>
                                    <span class="block text-[10px] font-black text-purple-500/70 uppercase tracking-widest">
                                        Initial Release
                                    </span>

                                    <p class="text-[13px] font-bold text-slate-700 mt-1 leading-snug">
                                        Orbit One officially launched with Lead Explorer and Core Dashboard.
                                    </p>
                                </div>

                            </div>

                            <!-- Upcoming -->
                            <div class="relative flex gap-6 group/item">

                                <div class="relative z-10 w-3 h-3 mt-1.5 rounded-full bg-slate-300 border-2 border-white"></div>

                                <div>
                                    <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Coming Soon
                                    </span>

                                    <p class="text-[13px] font-bold text-slate-600 mt-1 leading-snug">
                                        More integrations, analytics widgets, and automation tools.
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div class="mt-10">

                            <div class="p-4 bg-gradient-to-tr from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-3">

                                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>

                                <p class="text-[11px] text-slate-500 font-bold tracking-tight">
                                    Running <span class="text-slate-800">Orbit One v<?php echo esc_html(OONE_VERSION); ?></span>
                                </p>

                            </div>

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
                <p class="text-slate-500 text-sm mb-8"><?php esc_html_e('You are about to visit the Story Craft Digital portal for external resources and updates.', 'orbit-one'); ?></p>

                <div class="flex gap-3">
                    <button onclick="ooneClosePortal()" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"><?php esc_html_e('Cancel', 'orbit-one'); ?></button>
                    <a id="oone-portal-confirm" href="#" target="_blank" rel="noopener noreferrer" onclick="ooneClosePortal()" class="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 no-underline"><?php esc_html_e('Proceed', 'orbit-one'); ?></a>
                </div>
            </div>
        </div>
    </div>
<?php
}
