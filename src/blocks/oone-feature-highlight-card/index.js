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
		{/* Main Card Body with Light Purple BG */}
		<rect
			x="3"
			y="2"
			width="18"
			height="20"
			rx="3"
			fill="#eed4fa"
			fillOpacity="1"
		/>
		<rect
			x="3"
			y="2"
			width="18"
			height="20"
			rx="3"
			stroke="#9813ca"
			strokeWidth="1.2"
			fill="none"
		/>

		{/* Header Section (Purple) */}
		<path
			d="M3 5C3 3.34315 4.34315 2 6 2H18C19.6569 2 21 3.34315 21 5V8H3V5Z"
			fill="#9813ca"
			fillOpacity="1"
		/>

		{/* Feature List (Simulated) */}
		<circle cx="7" cy="11.5" r="1.5" fill="#9813ca" />
		<rect
			x="10"
			y="11"
			width="8"
			height="1"
			rx="0.5"
			fill="#9813ca"
			fillOpacity="0.6"
		/>

		<circle cx="7" cy="14.5" r="1.5" fill="#9813ca" />
		<rect
			x="10"
			y="14"
			width="6"
			height="1"
			rx="0.5"
			fill="#9813ca"
			fillOpacity="0.6"
		/>

		{/* Bottom CTA Button shape */}
		<rect
			x="6"
			y="18"
			width="12"
			height="2.5"
			rx="1.25"
			fill="#9813ca"
			fillOpacity="1"
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
					className: "oone-feature-highlight-card-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-feature-highlight-card-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
