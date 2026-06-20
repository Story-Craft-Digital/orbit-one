<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Renders the Orbit One dashboard header.
 */
function oone_render_dashboard_header($title = '', $svg = '')
{
    $current_user = wp_get_current_user();
    $full_name    = !empty($current_user->user_firstname) ? $current_user->user_firstname . ' ' . $current_user->user_lastname : $current_user->display_name;
    $user_login   = $current_user->user_login;

    $initials = !empty($current_user->user_firstname) && !empty($current_user->user_lastname)
        ? strtoupper(substr($current_user->user_firstname, 0, 1) . substr($current_user->user_lastname, 0, 1))
        : strtoupper(substr($user_login, 0, 2));

    $title = !empty($title) ? $title : __('Orbit One: Dashboard', 'orbit-one');

?>

    <div class="oone-global-header-wrapper px-6 pt-6">
        <h2 class="sr-only"><?php esc_html_e('Notifications', 'orbit-one'); ?></h2>
        <div class="oone-header-container">
            <div class="oone-header-left">
                <div class="oone-logo-wrapper">
                    <?php
                    echo wp_kses(
                        oone_get_icon($svg, [
                            'size'  => 56,
                            'color' => '#9813ca',
                        ]),
                        oone_kses_allowed_html_svg()
                    );
                    ?>
                </div>

                <h1 class="oone-header-title">
                    <?php echo esc_html($title); ?>
                </h1>
            </div>

            <div class="oone-user-badge-wrapper">
                <div class="oone-user-badge">
                    <div class="oone-user-initials">
                        <?php echo esc_html($initials); ?>
                    </div>
                    <div class="oone-user-info">
                        <div class="oone-user-name-row">
                            <span class="oone-user-name"><?php echo esc_html($full_name); ?></span>
                            <span class="oone-status-indicator">
                                <span class="oone-status-ping"></span>
                                <span class="oone-status-dot-active"></span>
                            </span>
                        </div>
                        <span class="oone-user-login">
                            <?php
                            /* translators: %s: User login name */
                            echo sprintf(esc_html__('WP: %s', 'orbit-one'), '<span class="oone-login-name">' . esc_html($user_login) . '</span>');
                            ?>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php
}
