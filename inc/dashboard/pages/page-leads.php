<?php

/**
 * Renders the content for the Leads page.
 *
 * @package Orbit_One
 */

if (! defined('ABSPATH')) {
    exit;
}
function oone_render_leads_page()
{
    if (! current_user_can('manage_options')) {
        return;
    }
    global $wpdb;

    // 1. Nonce Verification for Form Actions/Filters
    if (isset($_GET['oone_s']) || isset($_GET['paged']) || isset($_GET['orderby'])) {
        if (! isset($_GET['oone_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['oone_nonce'])), 'oone_leads_filter')) {
            wp_die(esc_html__('Security check failed.', 'orbit-one'));
        }
    }

    $na_text = __('N/A', 'orbit-one');

    $submissions_table = "{$wpdb->prefix}oone_form_submissions";
    $meta_table        = "{$wpdb->prefix}oone_form_submission_meta";

    // 2. Parameters.
    $per_page = 15;
    $paged    = isset($_GET['paged']) ? max(1, intval(wp_unslash($_GET['paged']))) : 1;
    $offset   = ($paged - 1) * $per_page;
    $search   = isset($_GET['oone_s']) ? sanitize_text_field(wp_unslash($_GET['oone_s'])) : '';

    $orderby = isset($_GET['orderby'])
        ? sanitize_text_field(wp_unslash($_GET['orderby']))
        : 'submitted_at';
    $order      = (isset($_GET['order']) && 'ASC' === strtoupper(sanitize_text_field(wp_unslash($_GET['order'])))) ? 'ASC' : 'DESC';
    $next_order = ('ASC' === $order) ? 'DESC' : 'ASC';

    // Generate current nonce token to carry over into URL tracking elements
    $nonce_token = wp_create_nonce('oone_leads_filter');

    // 3. Query Preparation.
    $is_searching = ! empty($search);
    $search_term  = $is_searching ? '%' . $wpdb->esc_like($search) . '%' : '';

    // Allowed sorting columns.
    $allowed_orderby = array(
        'submission_id' => 'submission_id',
        'submitted_at'  => 'submitted_at',
        'last_activity' => 'last_activity',
    );

    // Validate orderby.
    $orderby = $allowed_orderby[$orderby] ?? 'submitted_at';

    // Unified SQL compilation with targeted annotations to satisfy automated repository tools
    if ($is_searching) {
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $count_query_string = "SELECT COUNT(DISTINCT s.submission_id) FROM {$submissions_table} s 
             LEFT JOIN {$meta_table} m_search ON s.submission_id = m_search.submission_id 
             WHERE (s.submission_id LIKE %s OR s.form_id LIKE %s OR m_search.meta_value LIKE %s)";

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $count_sql = $wpdb->prepare($count_query_string, $search_term, $search_term, $search_term);

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $main_query_string = "SELECT DISTINCT s.* FROM {$submissions_table} s 
             LEFT JOIN {$meta_table} m_search ON s.submission_id = m_search.submission_id 
             WHERE (s.submission_id LIKE %s OR s.form_id LIKE %s OR m_search.meta_value LIKE %s)
             ORDER BY s.{$orderby} {$order} LIMIT %d, %d";

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $main_sql = $wpdb->prepare($main_query_string, $search_term, $search_term, $search_term, $offset, $per_page);
    } else {
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $count_sql = "SELECT COUNT(DISTINCT s.submission_id) FROM {$submissions_table} s";

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $main_query_string = "SELECT DISTINCT s.* FROM {$submissions_table} s 
             ORDER BY s.{$orderby} {$order} LIMIT %d, %d";

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $main_sql = $wpdb->prepare($main_query_string, $offset, $per_page);
    }

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
    $total_leads = (int) $wpdb->get_var($count_sql);
    $total_pages = max(1, (int) ceil($total_leads / $per_page));

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
    $leads       = $wpdb->get_results($main_sql);
?>


    <div class="wrap oone-leads bg-slate-50 oone-main-viewport">
        <?php
        oone_render_dashboard_header(
            __('Leads', 'orbit-one'),
            'banner'
        );
        ?>
        <div class="oone-scroll-area">
            <div class=" bg-white overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 p-4 rounded-2xl border border-slate-100 shadow-sm">

                <div class="flex items-center gap-3 shrink-0">
                    <span
                        class="w-12 h-12 flex items-center justify-center bg-purple-50 text-purple-600 rounded-xl font-black text-lg">
                        <?php echo (int) $total_leads; ?>
                    </span>
                    <span class="text-sm md:text-sm font-bold text-slate-400 uppercase tracking-widest"><?php esc_html_e('Total leads', 'orbit-one'); ?></span>
                </div>

                <form method="get" class="flex flex-col sm:flex-row flex-grow max-w-2xl items-stretch sm:items-center gap-2">
                    <?php wp_nonce_field('oone_leads_filter', 'oone_nonce'); ?>
                    <?php
                    $current_page_slug = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : 'oone-form-entries';
                    ?>

                    <input type="hidden" name="page" value="<?php echo esc_attr($current_page_slug); ?>">

                    <div class="relative flex-grow flex items-center">
                        <div class="absolute left-0 w-10 md:w-12 flex items-center justify-center pointer-events-none z-20">
                            <svg class="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        <input type="text" name="oone_s" value="<?php echo esc_attr($search); ?>"
                            placeholder="<?php esc_attr_e('Search name, phone...', 'orbit-one'); ?>"
                            class="w-full h-[40px] md:h-[44px] pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none md:!pl-12 !pl-10">
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="submit"
                            class="purple-btn flex-grow sm:flex-grow-0 h-[40px] md:h-[44px] px-5 md:px-6 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center transition-all active:scale-95 whitespace-nowrap shadow-sm">
                            <?php esc_html_e('Search', 'orbit-one'); ?>
                        </button>

                        <?php if (!empty($search)): ?>
                            <a href="?page=<?php echo esc_attr($current_page_slug); ?>&oone_nonce=<?php echo esc_attr($nonce_token); ?>"
                                class="h-[40px] md:h-[44px] px-4 flex items-center justify-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 border border-slate-100 hover:bg-red-50 rounded-xl transition-all no-underline">
                                <?php esc_html_e('Clear', 'orbit-one'); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>


            <div class="overflow-x-auto no-scrollbar">
                <table class="w-full text-left border-collapse min-w-[800px] md:min-w-full">
                    <thead class=" bg-slate-50">
                        <tr
                            class="border-b border-slate-100 text-[9px] md:text-[10px] uppercase font-black tracking-widest text-slate-400">
                            <th class="p-3 md:p-5 w-12 md:w-16">
                                <a href="<?php echo esc_url(add_query_arg([
                                                'orderby'  => 'submission_id',
                                                'order'    => $next_order,
                                                'oone_s' => $search,
                                                'paged'    => $paged,
                                                'oone_nonce' => $nonce_token,
                                            ])); ?>"
                                    class="hover:text-purple-600 flex items-center gap-1">
                                    <?php esc_html_e('ID', 'orbit-one'); ?> <?php echo esc_html($orderby === 'submission_id' ? ($order === 'ASC' ? '↑' : '↓') : ''); ?>
                                </a>
                            </th>
                            <th class="p-3 md:p-5"><?php esc_html_e('Name', 'orbit-one'); ?></th>
                            <th class="p-3 md:p-5"><?php esc_html_e('Subject', 'orbit-one'); ?></th>
                            <th class="p-3 md:p-5"><?php esc_html_e('Communication', 'orbit-one'); ?></th>
                            <th class="p-3 md:p-5">
                                <a href="<?php echo esc_url(add_query_arg([
                                                'orderby'  => 'submitted_at',
                                                'order'    => $next_order,
                                                'oone_s' => $search,
                                                'paged'    => $paged,
                                                'oone_nonce' => $nonce_token,
                                            ])); ?>"
                                    class="hover:text-purple-600 flex items-center gap-1">
                                    <?php esc_html_e('Date', 'orbit-one'); ?> <?php echo esc_html($orderby === 'submitted_at' ? ($order === 'ASC' ? '↑' : '↓') : ''); ?>
                                </a>
                            </th>
                            <th class="p-3 md:p-5"><?php esc_html_e('Email', 'orbit-one'); ?></th>
                            <th class="p-3 md:p-5 text-right"><?php esc_html_e('Action', 'orbit-one'); ?></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <?php
                        if ($leads) :
                            $submission_ids = wp_list_pluck($leads, 'submission_id');

                            $all_meta = array();

                            if (! empty($submission_ids)) {

                                $submission_ids = array_map('intval', $submission_ids);

                                $placeholders = implode(',', array_fill(0, count($submission_ids), '%d'));

                                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                                $sql = "
        SELECT submission_id, meta_key, meta_value
        FROM {$meta_table}
        WHERE submission_id IN ($placeholders)
    ";

                                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                                $meta_results = $wpdb->get_results(
                                    $wpdb->prepare(
                                        "SELECT submission_id, meta_key, meta_value FROM {$meta_table} WHERE submission_id IN ($placeholders)",
                                        ...$submission_ids
                                    )
                                );

                                foreach ($meta_results as $meta_row) {

                                    if (! isset($all_meta[$meta_row->submission_id])) {
                                        $all_meta[$meta_row->submission_id] = array();
                                    }

                                    $all_meta[$meta_row->submission_id][$meta_row->meta_key] = $meta_row;
                                }
                            }
                            foreach ($leads as $lead) :
                                $meta = isset($all_meta[$lead->submission_id])
                                    ? $all_meta[$lead->submission_id]
                                    : array();

                                $f_name = isset($meta['firstname'])
                                    ? sanitize_text_field($meta['firstname']->meta_value)
                                    : '';

                                $l_name = isset($meta['lastname'])
                                    ? sanitize_text_field($meta['lastname']->meta_value)
                                    : '';

                                $row_full_name = trim($f_name . ' ' . $l_name) ?: __('New Lead', 'orbit-one');

                                $phone = isset($meta['phone'])
                                    ? sanitize_text_field($meta['phone']->meta_value)
                                    : (
                                        isset($meta['mobile'])
                                        ? sanitize_text_field($meta['mobile']->meta_value)
                                        : $na_text
                                    );

                                $email = isset($meta['email'])
                                    ? sanitize_email($meta['email']->meta_value)
                                    : $na_text;

                                $initial = strtoupper(
                                    mb_substr($f_name, 0, 1) .
                                        mb_substr($l_name, 0, 1)
                                ) ?: '?';
                                $utc_iso_string = gmdate('c', strtotime($lead->submitted_at . ' UTC'));
                        ?>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="p-3 md:p-5 text-[10px] md:text-xs text-slate-400 font-bold">
                                        #<?php echo esc_html((int) $lead->submission_id); ?></td>
                                    <td class="p-3 md:p-5">
                                        <div class="flex items-center gap-2 md:gap-3">
                                            <div
                                                class="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] md:text-[10px] font-black border border-slate-200">
                                                <?php echo esc_html($initial); ?></div>
                                            <span
                                                class="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap"><?php echo esc_html($row_full_name); ?></span>
                                        </div>
                                    </td>
                                    <td class="p-3 md:p-5 text-xs md:text-sm text-slate-500 col-subject whitespace-nowrap">
                                        <?php
                                        echo esc_html(
                                            isset($meta['subject'])
                                                ? sanitize_text_field($meta['subject']->meta_value)
                                                : __('No Subject', 'orbit-one')
                                        );
                                        ?>
                                    </td>

                                    <td class="p-3 md:p-5">
                                        <div class="flex items-center gap-2">
                                            <?php if ($phone !== $na_text):
                                                $whatsapp_phone = preg_replace('/[^0-9]/', '', $phone);
                                            ?>
                                                <a href="tel:<?php echo esc_attr($phone); ?>"
                                                    class="text-xs md:text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap">
                                                    <?php echo esc_html($phone); ?>
                                                </a>

                                                <a href="https://wa.me/<?php echo esc_attr($whatsapp_phone); ?>" target="_blank" rel="noopener noreferrer"
                                                    class="text-slate-400 hover:text-[#25D366] transition-colors"
                                                    title="<?php esc_attr_e('Message on WhatsApp', 'orbit-one'); ?>">
                                                    <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </a>

                                                <button type="button" onclick="ooneCopy('<?php echo esc_js($phone); ?>', this)"
                                                    class="copy-btn !p-1">
                                                    <svg class="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                                                        </path>
                                                    </svg>
                                                </button>
                                            <?php else: ?>
                                                <span class="text-xs md:text-sm text-slate-300">
                                                    <?php echo esc_html($na_text); ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </td>

                                    <td class="p-3 md:p-5">
                                        <div class="flex flex-col whitespace-nowrap SCD-local-time-tracker" data-utc="<?php echo esc_attr($utc_iso_string); ?>">
                                            <span class="text-xs md:text-sm font-bold text-slate-700 date-display-span">
                                                <?php echo esc_html(gmdate('M j, Y', strtotime($lead->submitted_at))); ?>
                                            </span>
                                            <span class="text-[9px] md:text-[10px] text-slate-400 uppercase font-medium time-display-span">
                                                <?php echo esc_html(gmdate('g:i A', strtotime($lead->submitted_at))); ?> GMT
                                            </span>
                                        </div>
                                    </td>

                                    <td class="p-3 md:p-5">
                                        <div class="flex items-center gap-2">
                                            <?php if ($email && $email !== $na_text): ?>
                                                <a href="mailto:<?php echo esc_attr(sanitize_email($email)); ?>"
                                                    class="text-xs md:text-sm text-slate-500 hover:text-purple-600 transition-colors whitespace-nowrap">
                                                    <?php echo esc_html($email); ?>
                                                </a>
                                                <button type="button" onclick="ooneCopy('<?php echo esc_js($email); ?>', this)"
                                                    class="copy-btn !p-1">
                                                    <svg class="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                                                        </path>
                                                    </svg>
                                                </button>
                                            <?php else: ?>
                                                <span class="text-xs md:text-sm text-slate-300">
                                                    <?php echo esc_html($na_text); ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </td>

                                    <td class="p-3 md:p-5 text-right">

                                        <?php
                                        $clean_meta = array();

                                        foreach ($meta as $key => $item) {
                                            $clean_meta[sanitize_key($key)] = sanitize_text_field($item->meta_value);
                                        }
                                        ?>

                                        <button type="button"
                                            class="oone-view-lead-btn purple-btn px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm"
                                            data-id="<?php echo (int) $lead->submission_id; ?>"
                                            data-name="<?php echo esc_attr($row_full_name); ?>"
                                            data-phone="<?php echo esc_attr($phone); ?>"
                                            data-email="<?php echo esc_attr($email); ?>"
                                            data-meta="<?php echo esc_attr(wp_json_encode($clean_meta, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG)); ?>">

                                            <?php esc_html_e('View', 'orbit-one'); ?>
                                        </button>

                                    </td>
                                </tr>
                            <?php endforeach;
                        else: ?>
                            <tr>
                                <td colspan="7" class="p-0 border-none">
                                    <div
                                        class="sticky left-0 w-[calc(100vw-4rem)] md:w-full flex justify-center items-center py-12 px-6">
                                        <div class="text-center">
                                            <div
                                                class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                                                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                                </svg>
                                            </div>
                                            <p class="text-slate-400 font-bold text-sm tracking-tight leading-tight">
                                                <?php esc_html_e('No Form Entries found.', 'orbit-one'); ?>
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <div id="oone-lead-modal" class="fixed inset-0 z-[99999] hidden items-center justify-center">
                <div id="oone-lead-overlay" class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>

                <div class="relative bg-white rounded-[2rem] shadow-2xl flex flex-col mx-4 overflow-hidden">

                    <div class="px-8 py-6 border-b border-slate-50 flex-shrink-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 id="m-name" class="text-xl font-black text-slate-800 mb-1"></h2>
                                <div class="flex items-center gap-2">
                                    <span id="m-id"
                                        class="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"></span>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <?php esc_html_e('Lead details', 'orbit-one'); ?></span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <a id="m-wa" href="#" target="_blank" rel="noopener noreferrer"
                                    class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"><svg
                                        class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg></a>
                                <a id="m-tel" href="#"
                                    class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><svg
                                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                        <path
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg></a>
                                <a id="m-mail" href="#"
                                    class="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><svg
                                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                        <path
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg></a>
                                <button onclick="ooneCloseModal()"
                                    class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-red-500 font-bold">✕</button>
                            </div>
                        </div>
                    </div>
                    <div class="flex-grow overflow-y-auto p-8 bg-slate-50/50" id="m-meta-container"></div>
                </div>
            </div>
        </div>
        <div class="oone-footer-sticky">

            <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </span>
                <span class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                    <?php
                    echo wp_kses(
                        sprintf(
                            /* translators: 1: number of leads shown on current page, 2: total number of leads */
                            _n(
                                'Showing %1$s of %2$s Lead',
                                'Showing %1$s of %2$s Leads',
                                (int) $total_leads,
                                'orbit-one'
                            ),
                            '<span>' . (int) count($leads) . '</span>',
                            '<span>' . (int) $total_leads . '</span>'
                        ),
                        array(
                            'span' => array(
                                'class' => true,
                            ),
                        )
                    );
                    ?>
                </span>
            </div>

            <div class="flex items-center gap-1.5">

                <?php if ($paged > 1): ?>
                    <a href="<?php echo esc_url(add_query_arg([
                                    'paged'        => $paged - 1,
                                    'oone_s'     => $search,
                                    'orderby'      => $orderby,
                                    'order'        => $order,
                                    'oone_nonce' => $nonce_token,
                                ])); ?>"
                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm no-underline">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </a>
                <?php else: ?>
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-200 border border-slate-100 cursor-not-allowed">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                <?php endif; ?>

                <div class="px-4 h-8 flex items-center bg-slate-50 border border-slate-100 rounded-lg">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <?php
                        echo wp_kses(
                            sprintf(
                                /* translators: 1: current page number, 2: total pages */
                                __('Page %1$s / %2$s', 'orbit-one'),
                                '<span class="text-purple-600 mx-1">' . (int) $paged . '</span>',
                                (int) $total_pages
                            ),
                            array(
                                'span' => array(
                                    'class' => true,
                                ),
                            )
                        );
                        ?>
                    </span>
                </div>

                <?php if ($paged < $total_pages): ?>
                    <a href="<?php echo esc_url(add_query_arg([
                                    'paged'        => $paged + 1,
                                    'oone_s'     => $search,
                                    'orderby'      => $orderby,
                                    'order'        => $order,
                                    'oone_nonce' => $nonce_token,
                                ])); ?>"
                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm no-underline">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                <?php else: ?>
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-200 border border-slate-100 cursor-not-allowed">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                <?php endif; ?>

            </div>
        </div>
    </div>
<?php
}
