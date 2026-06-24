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
		{/* Background Layer card */}
		<rect
			x="3"
			y="5"
			width="14"
			height="12"
			rx="2"
			fill="#9813ca"
			fillOpacity="0.3"
			stroke="none"
		/>

		{/* Main Content Card with Light Purple BG */}
		<rect
			x="7"
			y="3"
			width="14"
			height="14"
			rx="2"
			fill="#eed4fa"
			fillOpacity="1"
			stroke="#9813ca"
			strokeWidth="1.2"
		/>

		{/* Visual Element (Image placeholder) */}
		<rect
			x="10"
			y="6"
			width="8"
			height="5"
			rx="1"
			fill="#9813ca"
			fillOpacity="0.2"
			stroke="none"
		/>

		{/* Content Line (Title placeholder) */}
		<rect
			x="10"
			y="13"
			width="6"
			height="1.5"
			rx="0.75"
			fill="#9813ca"
			fillOpacity="1"
			stroke="none"
		/>

		{/* Progress Bar (Representing the "progressbar" attribute in your block) */}
		<rect
			x="6"
			y="20"
			width="12"
			height="1.5"
			rx="0.75"
			fill="#eed4fa"
			fillOpacity="1"
			stroke="none"
		/>
		<rect
			x="6"
			y="20"
			width="5"
			height="1.5"
			rx="0.75"
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
					className: "oone-multi-content-carousel-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-multi-content-carousel-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
