<?php

/**
 * PRO Upgrade Page (SaaS-style, dashboard-consistent)
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}

function oone_render_pro_page()
{
    $core_version = OONE_VERSION;
    $pro_active   = defined('OONE_PRO_VERSION');
    $pro_version  = $pro_active ? OONE_PRO_VERSION : null;


?>

    <div class="wrap oone-upgrade-to-pro bg-slate-50 oone-main-viewport">

        <?php
        oone_render_dashboard_header(
            __('Upgrade to Pro', 'orbit-one'),
            'banner'
        );
        ?>

        <div class="oone-scroll-area">

            <!-- HERO SECTION -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 text-white shadow-2xl">

                <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>

                <div class="relative p-10 md:p-14 text-center">

                    <!-- Logo -->
                    <div class="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <?php
                        echo wp_kses(
                            oone_get_icon('logo', [
                                'size'  => 56,
                                'color' => '#9813ca',
                            ]),
                            oone_kses_allowed_html_svg()
                        );
                        ?>
                    </div>

                    <h1 class="text-4xl md:text-5xl text-white tracking-tight mb-4">
                        Orbit One Pro — Coming Soon
                    </h1>

                    <p class="text-purple-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                        A powerful upcoming upgrade featuring automation tools, premium blocks, and webhook support.
                        WooCommerce integration and advanced modules are planned for future releases.
                    </p>

                    <div class="flex flex-wrap justify-center gap-4">

                        <a href="<?php echo esc_url(apply_filters('oone_site_url', OONE_SITE_URL)); ?>"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="px-8 py-4 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition no-underline shadow-lg">
                            Join Waitlist
                        </a>

                        <a href="#features"
                            class="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition no-underline">
                            View Planned Features
                        </a>

                    </div>
                </div>
            </div>

            <!-- STATUS CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

                <div class="bg-white rounded-2xl p-6 border shadow-sm">
                    <p class="text-sm text-slate-500">Core Version</p>
                    <p class="text-2xl font-bold text-slate-800"><?php echo esc_html($core_version); ?></p>
                </div>

                <div class="bg-white rounded-2xl p-6 border shadow-sm">
                    <p class="text-sm text-slate-500">Pro Status</p>

                    <?php if ($pro_active): ?>
                        <p class="text-2xl font-bold text-emerald-600">Activated</p>
                        <p class="text-xs text-slate-500">Version <?php echo esc_html($pro_version); ?></p>
                    <?php else: ?>
                        <p class="text-2xl font-bold text-amber-600">Coming Soon</p>
                        <p class="text-xs text-slate-500">
                            Pro version is currently in development and not yet released
                        </p>
                    <?php endif; ?>

                </div>

                <div class="bg-white rounded-2xl p-6 border shadow-sm">
                    <p class="text-sm text-slate-500">Support</p>
                    <p class="text-2xl font-bold text-slate-800">Priority</p>
                    <p class="text-xs text-slate-500">Pro users get faster support</p>
                </div>

            </div>

            <!-- FEATURES -->
            <div id="features" class="mt-12">

                <h2 class="text-2xl font-bold text-slate-800 mb-6">
                    Roadmap: What’s Coming in Pro
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <?php
                    $features = [
                        'Webhook System for External Integrations',
                        'Premium Gutenberg Blocks Library',
                        'Advanced Lead Automation System (Planned)',
                        'Dynamic KPI Dashboard Widgets (Planned)',
                        'Animation & Interaction Controls',
                        'WooCommerce Integration (Coming Soon)',
                        'White Label Mode (Agency Feature - Planned)',
                        'Priority Updates & Support',
                        'AI-Powered Content Tools (Future Roadmap)'
                    ];

                    foreach ($features as $feature): ?>
                        <div class="flex items-start gap-3 bg-white p-5 rounded-xl border shadow-sm">
                            <div class="w-6 h-6 mt-1 text-purple-600">✔</div>
                            <p class="text-slate-700 font-medium"><?php echo esc_html($feature); ?></p>
                        </div>
                    <?php endforeach; ?>

                </div>
            </div>

            <!-- PRICING CTA -->
            <div class="mt-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">

                <div class="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>

                <h2 class="text-3xl text-white mb-4">
                    Simple Pricing. Early Access Coming Soon.
                </h2>

                <p class="text-purple-100 mb-8 max-w-xl mx-auto">
                    We are currently finalizing the Pro version. Pricing plans will be announced at launch, including lifetime and subscription options.
                </p>

                <a href="<?php echo esc_url(apply_filters('oone_site_url', OONE_SITE_URL)); ?>"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block px-10 py-4 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition no-underline shadow-lg">
                    Join Early Access
                </a>

                <p class="text-xs text-purple-200 mt-4">
                    Secure checkout • Instant activation • Regular updates
                </p>

            </div>

        </div>
    </div>

<?php
}
