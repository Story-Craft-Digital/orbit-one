=== Orbit One ===
Contributors: storycraft
Tags: gutenberg, blocks, lead generation, forms, crm
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A high-performance business intelligence and lead management framework with modular blocks, analytics, and form lead management.

== Description ==

Orbit One is a high-performance business intelligence and lead management framework for WordPress. It is built for WordPress users who demand a high-performance, clutter-free editing experience combined with professional-grade lead management.

Most block plugins bloat your WordPress editor with dozens of scripts you don't use. Orbit One solves this by giving you a centralized "Block Control Center." Toggle exactly which blocks are active, keeping your site fast and your workflow clean.

Beyond block management, Orbit One acts as a lightweight CRM. Every form submission from an Orbit One block is captured, organized, and searchable within a modern, responsive interface that feels like a standalone app, not a typical WordPress settings page.

= Key Features =
* **Modular Block Control:** One-click activation/deactivation of Orbit One blocks to keep your site lightweight.
* **Centralized Lead Explorer:** No more checking emails for form entries. View all submissions in a fast, sortable, and searchable table.
* **Lead Detailed View:** Deep-dive into specific submissions with a dedicated modal view for metadata.
* **Unified Global Styling:** A centralized palette manager allows you to set brand colors that propagate throughout your Orbit One components.
* **Developer Friendly:** Built with modern JS and PHP standards, ensuring high compatibility and speed.
* **Theme Compatible:** Orbit One is designed to work with modern WordPress themes and popular page builders.


== Source Code ==
This plugin uses modern build tools (npm/webpack) to generate the production assets. The human-readable source code for all minified JavaScript and CSS files is publicly available.

You can review, study, or fork the source code at our public repository:
https://github.com/Story-Craft-Digital/orbit-one


== Installation ==

1. Upload the `orbit-one` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Access the dashboard by clicking on the 'Orbit One' menu item in your admin sidebar.

== Frequently Asked Questions ==

= Does this plugin work with any theme? =
Yes, Orbit One is designed to be theme-agnostic. Orbit One is designed to work smoothly with modern WordPress themes and builders.

= Where are my form leads stored? =
All leads are stored securely in your own WordPress database using plugin-specific tables (for example: `{prefix}oone_form_submissions`). No data is sent to external servers.

= Can I export my leads? =
In the current core version, leads can be viewed and managed via the Explorer. Advanced export features are part of our extended roadmap.

== Screenshots ==

1. The Orbit One Dashboard providing an overview of your system environment and resources.
2. The Blocks Library manager where you can toggle block availability and view block previews.
3. The Leads explorer: A high-performance table for managing your lead submissions.
4. Detailed Lead Modal: View specific metadata for any form entry at a glance.
5. Global Settings: Manage your brand color palette and API configurations in one place.
6. Help & Documentation: Quick access to guides, community links, and support resources.

== Changelog ==

= 1.0.0 =
* Initial release of Orbit One.
* Integrated Block Performance Manager.
* Integrated Leads Explorer.
* Added Global Color Palette settings.