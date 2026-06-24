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
		{/* Main Center Card */}
		<rect
			x="7"
			y="6"
			width="10"
			height="12"
			rx="2"
			fill="#9813ca"
			fillOpacity="1"
			stroke="none"
		/>
		<circle
			cx="12"
			cy="11"
			r="2.5"
			fill="#eed4fa"
			fillOpacity="1"
			stroke="none"
		/>
		<rect
			x="9"
			y="15"
			width="6"
			height="1"
			rx="0.5"
			fill="#eed4fa"
			fillOpacity="1"
			stroke="none"
		/>

		{/* Left Side Card (Partial) */}
		<rect
			x="-1"
			y="7"
			width="6"
			height="10"
			rx="1.5"
			fill="#9813ca"
			fillOpacity="0.4"
			stroke="none"
		/>

		{/* Right Side Card (Partial) */}
		<rect
			x="19"
			y="7"
			width="6"
			height="10"
			rx="1.5"
			fill="#9813ca"
			fillOpacity="0.4"
			stroke="none"
		/>

		{/* Pagination Dots */}
		<circle
			cx="10"
			cy="21"
			r="1"
			fill="#9813ca"
			fillOpacity="1"
			stroke="none"
		/>
		<circle
			cx="12"
			cy="21"
			r="1"
			fill="#9813ca"
			fillOpacity="0.3"
			stroke="none"
		/>
		<circle
			cx="14"
			cy="21"
			r="1"
			fill="#9813ca"
			fillOpacity="0.3"
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
					className: "oone-brand-slide-carousel-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-brand-slide-carousel-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
