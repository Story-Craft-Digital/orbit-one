import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import Save from './save';

import './editor.scss';
import './style.scss';
import { useBlockProps } from '@wordpress/block-editor';
//SVG for Icon
const CustomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" focusable="false">
        {/* Hero Background Frame */}
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#eed4fa" fillOpacity="1" stroke="#9813ca" strokeWidth="1.2" />
        
        {/* Mountain/Landscape Icons (Representing Images) */}
        <path d="M14 11L17.5 15.5H10.5L14 11Z" fill="#9813ca" fillOpacity="0.4" stroke="none" />
        <path d="M18 13L20 15.5H16L18 13Z" fill="#9813ca" fillOpacity="0.6" stroke="none" />
        
        {/* Content Placeholders */}
        <rect x="5" y="8" width="6" height="1.5" rx="0.75" fill="#9813ca" fillOpacity="1" stroke="none" />
        <rect x="5" y="11" width="4" height="1" rx="0.5" fill="#9813ca" fillOpacity="0.5" stroke="none" />
        
        {/* Button Placeholder */}
        <rect x="5" y="14" width="3" height="2" rx="0.5" fill="#9813ca" fillOpacity="1" stroke="none" />

        {/* Side Indicators (Carousel Feel) */}
        <path d="M1 10V14" stroke="#9813ca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M23 10V14" stroke="#9813ca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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
					className: "oone-multi-image-hero-carousel-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-multi-image-hero-carousel-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});