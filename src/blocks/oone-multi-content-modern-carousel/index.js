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
		{/* Perspective Layer - Skewed effect for 'Modern' look */}
		<path
			d="M4 7C4 5.89543 4.89543 5 6 5H14L11 17H4V7Z"
			fill="#9813ca"
			fillOpacity="0.2"
			stroke="none"
		/>

		{/* Main Floating Card */}
		<rect
			x="8"
			y="4"
			width="12"
			height="15"
			rx="2"
			fill="#eed4fa"
			fillOpacity="1"
			stroke="#9813ca"
			strokeWidth="1.2"
		/>

		{/* Visual Content Placeholder */}
		<rect
			x="10"
			y="7"
			width="8"
			height="6"
			rx="1"
			fill="#9813ca"
			fillOpacity="0.15"
			stroke="none"
		/>

		{/* Detail Line */}
		<rect
			x="10"
			y="15"
			width="5"
			height="1"
			rx="0.5"
			fill="#9813ca"
			fillOpacity="1"
			stroke="none"
		/>

		{/* Modern Navigation/Track line */}
		<path
			d="M4 21H20"
			stroke="#9813ca"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeOpacity="0.3"
			fill="none"
		/>
		<circle
			cx="12"
			cy="21"
			r="1.5"
			fill="#9813ca"
			fillOpacity="1"
			stroke="none"
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
					className: "oone-multi-content-modern-carousel-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-multi-content-modern-carousel-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
