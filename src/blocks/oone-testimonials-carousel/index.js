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
		width="24"
		height="24"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-hidden="true"
		focusable="false"
	>
		{/* --- Top Row --- */}
		<rect x="2" y="2" width="10" height="6" fill="#eed4fa" rx="1" ry="1" />
		<rect x="12" y="2" width="10" height="6" fill="#eed4fa" rx="1" ry="1" />
		<rect x="6" y="1" width="12" height="8" fill="#9813ca" rx="2" ry="2" />

		{/* --- Bottom Row --- */}
		<rect x="2" y="14" width="10" height="6" fill="#eed4fa" rx="1" ry="1" />
		<rect x="12" y="14" width="10" height="6" fill="#eed4fa" rx="1" ry="1" />
		<rect x="6" y="13" width="12" height="8" fill="#9813ca" rx="2" ry="2" />
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
					className: "oone-testimonials-carousel-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-testimonials-carousel-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
