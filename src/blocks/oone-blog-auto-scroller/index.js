import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

import "./editor.scss";
import "./style.scss";
import { useBlockProps } from "@wordpress/block-editor";

//SVG for Icon
const CustomIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        role="img" 
        focusable="false"
    >
        {/* Soft Background Card - Force fill and opacity to prevent Editor black-out */}
        <rect 
            x="2" 
            y="3" 
            width="20" 
            height="18" 
            rx="3" 
            fill="#eed4fa" 
            fillOpacity="1" 
        />
        
        {/* Border */}
        <rect 
            x="2" 
            y="3" 
            width="20" 
            height="18" 
            rx="3" 
            stroke="#9813ca" 
            strokeWidth="1.5" 
            fill="none" 
        />
        
        {/* Lines */}
        <line x1="6" y1="8" x2="14" y2="8" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="16" x2="12" y2="16" stroke="#9813ca" strokeWidth="2" strokeLinecap="round" />
        
        {/* Arrow Path */}
        <path 
            d="M17 15.5C18.1046 15.5 19 16.3954 19 17.5C19 18.6046 18.1046 19.5 17 19.5C15.8954 19.5 15 18.6046 15 17.5" 
            stroke="#9813ca" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
        />
        <polyline 
            points="15,16 15,17.5 16.5,17.5" 
            stroke="#9813ca" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
        />
    </svg>
);


registerBlockType(metadata.name, {
	...metadata,
	icon: CustomIcon,
	edit: Edit,
	save: Save, // This now points to your NEW, corrected Save function

	// ADD THIS DEPRECATION TO HANDLE OLD BLOCKS
	deprecated: [
		{
			// This describes the OLD attributes structure (it's the same)
			attributes: metadata.attributes,

			// This is a save function that reproduces the OLD, broken HTML
			save: ({ attributes }) => {
				const blockProps = useBlockProps.save({
					className: "oone-blog-auto-scroller-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-blog-auto-scroller-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
