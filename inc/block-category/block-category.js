wp.domReady(() => {
    // Check if our SVG variable from PHP exists. If not, do nothing.
    if ( typeof ooneCategoryIconSVG === 'undefined' ) {
        return;
    }

    const { createElement, RawHTML } = wp.element;

    const categories = wp.blocks.getCategories();
    
    const updatedCategories = categories.map( ( cat ) => {
        if ( cat.slug === 'oone-blocks' ) {
            return {
                ...cat,
                // Use the SVG string passed from PHP.
                // RawHTML is the correct component to render an HTML/SVG string.
                icon: createElement(RawHTML, { children: ooneCategoryIconSVG }),
            };
        }
        return cat;
    });

    wp.blocks.setCategories(updatedCategories);
});

