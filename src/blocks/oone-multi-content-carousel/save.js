// save.js (Corrected Version)
import { useBlockProps } from "@wordpress/block-editor";

export default function Save({ attributes }) {
	const { blockId, ...restOfAttributes } = attributes;

	const attributesToSave = {
		...restOfAttributes,
		blockId,
	};
	
	const blockProps = useBlockProps.save({
		className: "oone-multi-content-carousel-block-wrapper",
		id: blockId,
		"data-attributes": JSON.stringify(attributesToSave),
	});

	return (
		<div {...blockProps}>
			<div id={`oone-multi-content-carousel-block-root-component-${blockId}`}></div>
		</div>
	);
}