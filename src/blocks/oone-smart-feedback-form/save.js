// save.js (Corrected Version)
import { useBlockProps } from "@wordpress/block-editor";

export default function Save({ attributes }) {
	const { blockId, ...restOfAttributes } = attributes;

	const attributesToSave = {
		...restOfAttributes,
		blockId,
	};
	
	const blockProps = useBlockProps.save({
		className: "oone-smart-feedback-form-block-wrapper",
		id: blockId,
		"data-attributes": JSON.stringify(attributesToSave),
	});

	return (
		<div {...blockProps}>
			<div id={`oone-smart-feedback-form-block-root-component-${blockId}`}></div>
		</div>
	);
}