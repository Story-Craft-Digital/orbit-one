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
		role="img"
		focusable="false"
	>
		<rect
			x="2"
			y="4"
			width="20"
			height="16"
			rx="2"
			fill="#9813ca"
			fillOpacity="1"
		/>
		<path
			d="M4 6 L12 11 L20 6"
			stroke="#eed4fa"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
			strokeOpacity="0.7"
		/>
		<path
			d="M12 9.5L13.6 12.3L16.8 12.6L14.4 14.7L15.1 17.8L12 16.2L8.9 17.8L9.6 14.7L7.2 12.6L10.4 12.3L12 9.5Z"
			fill="#eed4fa"
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
					className: "oone-smart-feedback-form-block-wrapper",
					id: attributes.blockId,
					"data-attributes": JSON.stringify(attributes), // The old, unstable method
				});

				return (
					<div {...blockProps}>
						<div
							id={`oone-smart-feedback-form-block-root-component-${attributes.blockId}`}
						></div>
					</div>
				);
			},
		},
	],
});
