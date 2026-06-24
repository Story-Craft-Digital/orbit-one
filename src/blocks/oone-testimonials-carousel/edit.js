import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	RichText,
} from "@wordpress/block-editor";
import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
import {
	Button,
	ButtonGroup,
	ColorPicker,
	GradientPicker,
	PanelBody,
	RangeControl,
	SelectControl,
	TabPanel,
	TextControl,
	ToggleControl,
	Tooltip,
} from "@wordpress/components";
import {
	formatBold,
	formatItalic,
	formatUnderline,
	alignLeft,
	alignCenter,
	alignRight,
	arrowUp,
	arrowDown,
} from "@wordpress/icons";
import Component from "./view";

// 🎨 --- START: REUSABLE PALETTE CODE --- 🎨

/**
 * Resolves simple keys AND gradient strings with keys.
 * @param {string} colorValue The saved attribute value (e.g., "primary" or "linear-gradient(90deg, primary, accent)")
 * @returns {string} A valid CSS color value.
 */
const resolveColor = (colorValue) => {
	const oonePalette = window.oonePalette || {};
	if (!colorValue) return "transparent"; // Handle empty/null

	// 1. Is it a simple key?
	if (oonePalette[colorValue]) {
		return oonePalette[colorValue]; // 'primary' -> '#9813ca'
	}

	// 2. Is it a gradient string *with keys*?
	if (typeof colorValue === "string" && colorValue.includes("gradient")) {
		let resolvedGradient = colorValue;
		// Find all palette keys (primary, secondary, etc.) in the string
		resolvedGradient = resolvedGradient.replace(
			/(primary|secondary|accent|neutral|light|white)/g,
			(match) => {
				// For each match, look it up in the palette
				return oonePalette[match] || match; // Return hex or the key itself if not found
			},
		);
		// 'linear-gradient(90deg, primary, accent)' -> 'linear-gradient(90deg, #9813ca, #2e1065)'
		return resolvedGradient;
	}

	// 3. It's already a valid hex, rgb, or full CSS gradient
	return colorValue;
};

/**
 * A component to display quick-select buttons for your palette.
 */
const PaletteButtons = ({ onSelect }) => {
	const oonePalette = window.oonePalette || {};
	const keys = ["primary", "secondary", "accent", "neutral", "light", "white"];
	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: "6px",
				marginBottom: "12px",
				paddingBottom: "10px",
				borderBottom: "1px solid #ddd",
			}}
		>
			{keys.map((key) => {
				const color = oonePalette[key];
				if (!color) return null;
				return (
					<Tooltip text={`Set to ${key}`} key={key}>
						<Button
							onClick={() => onSelect(key)}
							style={{
								backgroundColor: color,
								border: "1px solid #ccc",
								height: "28px",
								width: "28px",
								minWidth: "28px",
								borderRadius: "50%",
								boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
							}}
							label={`Set to ${key}`}
						/>
					</Tooltip>
				);
			})}
		</div>
	);
};

// Define BoxModelControls outside Edit
const BoxModelControls = ({ type, values, updateBoxModel }) => (
	<div
		style={{
			padding: "12px",
			border: "1px solid #9813ca",
			backgroundColor: "#eed4fa",
			borderRadius: "8px",
			marginTop: "10px",
			marginBottom: "10px",
		}}
	>
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: "8px",
				marginTop: "10px",
			}}
		>
			{["top", "right", "bottom", "left"].map((side) => (
				<div key={side}>
					<TextControl
						label={__(side.toUpperCase(), "orbit-one")}
						value={values?.[side] || ""}
						type="number"
						onChange={(value) => updateBoxModel(type, side, value)}
						style={{ textAlign: "center" }}
						className="oone-boxmodel-input"
					/>
				</div>
			))}
		</div>
	</div>
);
// Define CornerRadiusControls outside Edit
const CornerRadiusControls = ({ values, updateCorners, attributeName }) => (
	<div
		style={{
			padding: "12px",
			border: "1px solid #9813ca",
			backgroundColor: "#eed4fa",
			borderRadius: "8px",
			marginTop: "10px",
			marginBottom: "10px",
		}}
	>
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: "8px",
				marginTop: "10px",
			}}
		>
			{["topLeft", "topRight", "bottomRight", "bottomLeft"].map((corner) => (
				<div key={corner}>
					<TextControl
						label={__(
							corner.replace(/([A-Z])/g, " $1"),
							"orbit-one",
						)}
						value={values?.[corner] || ""}
						type="number"
						onChange={(value) => updateCorners(attributeName, corner, value)}
						style={{ textAlign: "center" }}
						className="oone-boxmodel-input"
					/>
				</div>
			))}
		</div>
	</div>
);

export default function Edit({ attributes, setAttributes }) {
	// 1. Destructure safely at the top level
	const sharedUtils = window.oone_shared?.utils || {};
	const { resolveAsset } = sharedUtils;

	// 2. MOVE useMemo HERE (Before any early returns)
	const getResolvedAsset = useCallback((assetValue) => {
			if (!assetValue) return "";
			return typeof resolveAsset === "function" 
				? resolveAsset(assetValue) 
				: assetValue;
		}, [resolveAsset]);
	

	const {
		blockId,
		caption,
		captionFontSize,
		captionLineHeight,
		captionPadding,
		captionAlign,
		captionBold,
		captionItalics,
		captionUnderline,
		titleOne,
		titleTwo,
		titleFontSize,
		titleLineHeight,
		titlePadding,
		titleAlign,
		titleBold,
		titleItalics,
		titleUnderline,
		captionColor,
		titleColor,
		backgroundColor,
		padding,
		mobilePadding,
		slideNameColor,
		slideNameFontSize,
		slideNameLineHeight,
		slideNameBold,
		slideNameItalics,
		slideNameUnderline,
		slideTextColor,
		slideTextFontSize,
		slideTextLineHeight,
		slideTextBold,
		slideTextItalics,
		slideTextUnderline,
		slideRatingColor,
		slideRatingSize,
		slideImageSize,
		slidePadding,
		slideBackgroundColor,
		slideWidth,
		slideBorderRadius,
		minSlidesToShow,
		scrollSpeed,
		slideGap,
		slideContentGap,
		slides = [],
		reviewedEntityType,
		reviewedEntityName,
	} = attributes;
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSlideIndex, setSelectedSlideIndex] = useState(null);
	const [activeColorPicker, setActiveColorPicker] = useState(null);
	const [slidesPanelOpen, setSlidesPanelOpen] = useState(true);
	const slideRefs = useRef([]);
	const [confirmDelete, setConfirmDelete] = useState({
		show: false,
		type: null,
		index: null,
	});

	// ✅ --- REUSABLE PALETTE GRADIENTS ---
	const paletteGradients = useMemo(() => {
		const oonePalette = window.oonePalette || {};
		if (isLoading || !oonePalette.primary) return [];

		return [
			{
				name: "Primary to Accent",
				gradient: `linear-gradient(90deg, ${oonePalette.primary}, ${oonePalette.accent})`,
				keyString: "linear-gradient(90deg, primary, accent)",
			},
			{
				name: "Primary to Secondary",
				gradient: `linear-gradient(90deg, ${oonePalette.primary}, ${oonePalette.secondary})`,
				keyString: "linear-gradient(90deg, primary, secondary)",
			},
			{
				name: "Light to Secondary",
				gradient: `linear-gradient(90deg, ${oonePalette.light}, ${oonePalette.secondary})`,
				keyString: "linear-gradient(90deg, light, secondary)",
			},
			{
				name: "Neutral to Primary",
				gradient: `linear-gradient(90deg, ${oonePalette.neutral}, ${oonePalette.primary})`,
				keyString: "linear-gradient(90deg, neutral, primary)",
			},
			{
				name: "White to Light",
				gradient: `linear-gradient(90deg, ${oonePalette.white}, ${oonePalette.light})`,
				keyString: "linear-gradient(90deg, white, light)",
			},
		];
	}, [isLoading]);

	// ✅ --- NEW CLEANED-UP useEffect ---
	useEffect(() => {
		const initialUpdates = {};

		// 1. Initialize Block ID
		if (!blockId) {
			initialUpdates.blockId =
				"oone-testimonials-carousel-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 2. Initialize Slide IDs
		let slidesNeedUpdate = false;
		const newSlides = slides.map((slide) => {
			if (!slide.id) {
				slidesNeedUpdate = true;
				return {
					...slide,
					id: "slide-" + Math.random().toString(36).substr(2, 9),
				};
			}
			return slide;
		});

		if (slidesNeedUpdate) {
			initialUpdates.slides = newSlides;
		}

		// 3. Apply all updates
		if (Object.keys(initialUpdates).length > 0) {
			setAttributes(initialUpdates);
		}

		// 4. Finish loading
		setIsLoading(false);
	}, []);

	const updateSlide = (index, field, value) => {
		const newSlides = slides.map((slide, i) =>
			i === index ? { ...slide, [field]: value } : slide,
		);
		setAttributes({ slides: newSlides });
	};

	// ✅ Updated addSlide to use palette keys
	const addSlide = () => {
		setAttributes({
			slides: [
				...slides,
				{
					id: "slide-" + Math.random().toString(36).substr(2, 9),
					name: "New Person",
					text: "A wonderful testimonial about your product or service. Clients are happy to share their positive experiences.",
					rating: 5,
					link: "#",
					image:
						"https://project251.hrstride.academy/wp-content/uploads/2025/08/placeholder.webp",
					imgAlt: "New Testimonial",
				},
			],
		});
	};

	const updateCorners = (attributeName, corner, value) => {
		setAttributes({
			[attributeName]: { ...attributes[attributeName], [corner]: value },
		});
	};

	// Generic update function
	const updateBoxModel = (type, side, value) => {
		setAttributes({
			[type]: {
				...attributes[type],
				[side]: value,
			},
		});
	};

	const deleteSlide = (index) => {
		setConfirmDelete({ show: true, type: "slide", index });
	};

	const moveSlide = (index, direction) => {
		const newSlides = [...slides];
		const slideToMove = newSlides[index];
		const newIndex = direction === "up" ? index - 1 : index + 1;

		if (newIndex >= 0 && newIndex < newSlides.length) {
			newSlides.splice(index, 1);
			newSlides.splice(newIndex, 0, slideToMove);
			setAttributes({ slides: newSlides });
			// If you are editing the slide that is being moved, update the index
			if (selectedSlideIndex === index) {
				setSelectedSlideIndex(newIndex);
			}
		}
	};

	const confirmDeletion = () => {
		if (confirmDelete.type === "slide") {
			const newSlides = slides.filter((_, i) => i !== confirmDelete.index);
			setAttributes({ slides: newSlides });
			if (selectedSlideIndex === confirmDelete.index) {
				setSelectedSlideIndex(null);
			}
		}
		setConfirmDelete({ show: false, type: null, index: null });
	};

	const toggleEditSlide = (index) => {
		const isOpening = selectedSlideIndex !== index;
		const isPanelClosed = !slidesPanelOpen;

		// First, update the state to open everything that needs opening
		if (isPanelClosed) {
			setSlidesPanelOpen(true);
		}
		setSelectedSlideIndex(isOpening ? index : null);

		// If we are opening a slide's edit view, scroll to it
		if (isOpening) {
			// Use a short timeout to wait for the PanelBody's animation to complete
			setTimeout(() => {
				if (slideRefs.current[index]) {
					slideRefs.current[index].scrollIntoView({
						behavior: "smooth",
						block: "center", // 'center' is often better than 'start' or 'end'
					});
				}
			}, 150); // A small delay like 150ms is usually enough
		}
	};

	const toggleColorPicker = (key, index = null) => {
		const id = index !== null ? `${key}-${index}` : key;
		setActiveColorPicker(activeColorPicker === id ? null : id);
	};

	// ✅ --- NEW LOADING STATE ---
	if (isLoading) {
		return (
			<div {...useBlockProps()}>
				<p style={{ padding: "20px", textAlign: "center" }}>
					Initializing Carousel...
				</p>
			</div>
		);
	}

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				{/* Carousel Settings */}
				<PanelBody title="Carousel Settings" initialOpen={true}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{
								name: "typography",
								title: __("Typography", "oone-addon-social-proof-kit"),
							},
							{
								name: "layout",
								title: __("Layout", "oone-addon-social-proof-kit"),
							},
							{
								name: "color",
								title: __("Color", "oone-addon-social-proof-kit"),
							},
						]}
					>
						{(tab) => (
							<>
								{/* typography */}
								{tab.name === "typography" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Caption */}
										<TextControl
											label={__("Caption", "oone-addon-social-proof-kit")}
											value={caption || ""}
											onChange={(value) => setAttributes({ caption: value })}
										/>

										{/* Caption Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>
												{__("Caption Alignment", "orbit-one")}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={captionAlign === "left"}
														onClick={() =>
															setAttributes({ captionAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={captionAlign === "center"}
														onClick={() =>
															setAttributes({ captionAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={captionAlign === "right"}
														onClick={() =>
															setAttributes({ captionAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Caption: Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Caption Text Formatting",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={captionBold}
													onClick={() =>
														setAttributes({ captionBold: !captionBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={captionItalics}
													onClick={() =>
														setAttributes({ captionItalics: !captionItalics })
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={captionUnderline}
													onClick={() =>
														setAttributes({
															captionUnderline: !captionUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>

										{/* Caption Font Size */}
										<RangeControl
											label={__("Caption FontSize", "orbit-one")}
											value={captionFontSize}
											onChange={(value) =>
												setAttributes({ captionFontSize: value })
											}
											min={0}
											max={50}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Caption Line Height */}
										<RangeControl
											label={__(
												"Caption Line Height",
												"orbit-one",
											)}
											value={captionLineHeight}
											onChange={(value) =>
												setAttributes({ captionLineHeight: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the line height.",
												"orbit-one",
											)}
										/>
										{/* Title One */}
										<TextControl
											label={__("Title One", "oone-addon-social-proof-kit")}
											value={titleOne || ""}
											onChange={(value) => setAttributes({ titleOne: value })}
										/>
										{/* Title Two */}
										<TextControl
											label={__("Title Two", "oone-addon-social-proof-kit")}
											value={titleTwo || ""}
											onChange={(value) => setAttributes({ titleTwo: value })}
										/>

										{/* Title Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Title Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={titleAlign === "left"}
														onClick={() =>
															setAttributes({ titleAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={titleAlign === "center"}
														onClick={() =>
															setAttributes({ titleAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={titleAlign === "right"}
														onClick={() =>
															setAttributes({ titleAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Title: Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__("Title Text Formatting", "orbit-one")}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={titleBold}
													onClick={() =>
														setAttributes({ titleBold: !titleBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={titleItalics}
													onClick={() =>
														setAttributes({ titleItalics: !titleItalics })
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={titleUnderline}
													onClick={() =>
														setAttributes({ titleUnderline: !titleUnderline })
													}
												/>
											</ButtonGroup>
										</div>

										{/* Title Font Size */}
										<RangeControl
											label={__("Title FontSize", "orbit-one")}
											value={titleFontSize}
											onChange={(value) =>
												setAttributes({ titleFontSize: value })
											}
											min={20}
											max={100}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Title Line Height */}
										<RangeControl
											label={__("Title Line Height", "orbit-one")}
											value={titleLineHeight}
											onChange={(value) =>
												setAttributes({ titleLineHeight: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the line height.",
												"orbit-one",
											)}
										/>

										{/* Slide Name: Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Slide Name Text Formatting",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={slideNameBold}
													onClick={() =>
														setAttributes({ slideNameBold: !slideNameBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={slideNameItalics}
													onClick={() =>
														setAttributes({
															slideNameItalics: !slideNameItalics,
														})
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={slideNameUnderline}
													onClick={() =>
														setAttributes({
															slideNameUnderline: !slideNameUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>

										{/* Slide Name Font Size */}
										<RangeControl
											label={__(
												"Slide Name FontSize",
												"orbit-one",
											)}
											value={slideNameFontSize}
											onChange={(value) =>
												setAttributes({ slideNameFontSize: value })
											}
											min={0}
											max={50}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Slide Name Line Height */}
										<RangeControl
											label={__(
												"Slide Name Line Height",
												"orbit-one",
											)}
											value={slideNameLineHeight}
											onChange={(value) =>
												setAttributes({ slideNameLineHeight: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the line height.",
												"orbit-one",
											)}
										/>

										{/* Slide Text: Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__("Slide Text Formatting", "orbit-one")}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={slideTextBold}
													onClick={() =>
														setAttributes({ slideTextBold: !slideTextBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={slideTextItalics}
													onClick={() =>
														setAttributes({
															slideTextItalics: !slideTextItalics,
														})
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={slideTextUnderline}
													onClick={() =>
														setAttributes({
															slideTextUnderline: !slideTextUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>

										{/* Slide Text Font Size */}
										<RangeControl
											label={__(
												"Slide Text FontSize",
												"orbit-one",
											)}
											value={slideTextFontSize}
											onChange={(value) =>
												setAttributes({ slideTextFontSize: value })
											}
											min={0}
											max={50}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Slide Text Line Height */}
										<RangeControl
											label={__(
												"Slide Text Line Height",
												"orbit-one",
											)}
											value={slideTextLineHeight}
											onChange={(value) =>
												setAttributes({ slideTextLineHeight: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the line height.",
												"orbit-one",
											)}
										/>

										{/* Slide Rating Size */}
										<RangeControl
											label={__("Slide Rating Size", "orbit-one")}
											value={slideRatingSize}
											onChange={(value) =>
												setAttributes({ slideRatingSize: value })
											}
											min={5}
											max={50}
											step={1}
											help={__(
												"Uses a multiplier of the size.",
												"orbit-one",
											)}
										/>

										{/* Slide Image Size */}
										<RangeControl
											label={__("Slide Image Size", "orbit-one")}
											value={slideImageSize}
											onChange={(value) =>
												setAttributes({ slideImageSize: value })
											}
											min={5}
											max={70}
											step={1}
											help={__(
												"Uses a multiplier of the size.",
												"orbit-one",
											)}
										/>

										{/* Review Entity Type */}
										<SelectControl
											label={__(
												"Review Entity Type",
												"oone-addon-social-proof-kit",
											)}
											value={reviewedEntityType}
											options={[
												{ label: "Product", value: "Product" },
												{ label: "Book", value: "Book" },
												{ label: "Course", value: "Course" },
												{
													label: "Creative Work Season",
													value: "CreativeWorkSeason",
												},
												{
													label: "Creative Work Series",
													value: "CreativeWorkSeries",
												},
												{ label: "Episode", value: "Episode" },
												{ label: "Event", value: "Event" },
												{ label: "How-To", value: "HowTo" },
												{ label: "Local Business", value: "LocalBusiness" },
												{ label: "Media Object", value: "MediaObject" },
												{ label: "Movie", value: "Movie" },
												{ label: "Music Recording", value: "MusicRecording" },
												{ label: "Organization", value: "Organization" },
												{ label: "Recipe", value: "Recipe" },
												{
													label: "Software Application",
													value: "SoftwareApplication",
												},
											]}
											onChange={(value) =>
												setAttributes({ reviewedEntityType: value })
											}
										/>

										{/* Review Entity Name */}
										<TextControl
											label={__(
												"Review Entity Name",
												"oone-addon-social-proof-kit",
											)}
											value={reviewedEntityName || ""}
											onChange={(value) =>
												setAttributes({ reviewedEntityName: value })
											}
										/>
									</div>
								)}

								{/* layout */}
								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Slide Gap */}
										<RangeControl
											label={__("Slides Gap (px)", "orbit-one")}
											value={slideGap}
											onChange={(value) => setAttributes({ slideGap: value })}
											min={0}
											max={100}
											step={1}
											help={__(
												"Uses a multiplier of the Slide Gap.",
												"orbit-one",
											)}
										/>

										{/* Slide Gap */}
										<RangeControl
											label={__(
												"Slide Content Gap (px)",
												"orbit-one",
											)}
											value={slideContentGap}
											onChange={(value) =>
												setAttributes({ slideContentGap: value })
											}
											min={0}
											max={50}
											step={1}
											help={__(
												"Uses a multiplier of the Slide Gap.",
												"orbit-one",
											)}
										/>

										{/* Scroll Speed */}
										<RangeControl
											label={__("Scroll Speed", "orbit-one")}
											value={scrollSpeed}
											onChange={(value) =>
												setAttributes({ scrollSpeed: value })
											}
											min={0}
											max={5}
											step={0.1}
											help={__(
												"Uses a multiplier of the Scroll Speed.",
												"orbit-one",
											)}
										/>

										{/* Minimum Slides to Show */}
										<RangeControl
											label={__(
												"Minimum Slides to Show",
												"orbit-one",
											)}
											value={minSlidesToShow}
											onChange={(value) =>
												setAttributes({ minSlidesToShow: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier to set Minimum Slides to show.",
												"orbit-one",
											)}
										/>

										{/* Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="padding"
												values={padding}
												updateBoxModel={updateBoxModel}
											/>
										</div>
										<div>
											<label
												style={{
													paddingTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Mobile Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="mobilePadding"
												values={mobilePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Caption Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Caption Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="captionPadding"
												values={captionPadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Title Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Title Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="titlePadding"
												values={titlePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Slide Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Slide Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="slidePadding"
												values={slidePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Slide Border Radius (px) */}
										<div>
											<label style={{ paddingBottom: "10px" }}>
												{__(
													"Slide  Border Radius (px)",
													"orbit-one",
												)}
											</label>
											<CornerRadiusControls
												values={slideBorderRadius}
												updateCorners={updateCorners}
												attributeName="slideBorderRadius"
											/>
										</div>

										{/* Slide Size */}
										<RangeControl
											label={__("Slide Size", "orbit-one")}
											value={slideWidth}
											onChange={(value) => setAttributes({ slideWidth: value })}
											min={150}
											max={500}
											step={1}
											help={__(
												"Uses a multiplier to set slide Size.",
												"orbit-one",
											)}
										/>

										{/* Slide Profile Image Size */}
										<RangeControl
											label={__(
												"Slide Profile Image Size",
												"orbit-one",
											)}
											value={slideImageSize}
											onChange={(value) =>
												setAttributes({ slideImageSize: value })
											}
											min={0}
											max={100}
											step={0.1}
											help={__(
												"Uses a multiplier to set Profile Image size.",
												"orbit-one",
											)}
										/>
									</div>
								)}

								{/* Color */}
								{tab.name === "color" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* --- Caption Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Caption Color", "oone-addon-social-proof-kit")}
											</label>
											<Button
												onClick={() => toggleColorPicker("captionColor")}
												style={{
													background: resolveColor(captionColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "captionColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "captionColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<PaletteButtons
														onSelect={(key) =>
															setAttributes({ captionColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(captionColor)}
														onChangeComplete={(color) =>
															setAttributes({ captionColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Title Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Title Color", "oone-addon-social-proof-kit")}
											</label>
											<Button
												onClick={() => toggleColorPicker("titleColor")}
												style={{
													background: resolveColor(titleColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "titleColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "titleColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<PaletteButtons
														onSelect={(key) =>
															setAttributes({ titleColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(titleColor)}
														onChangeComplete={(color) =>
															setAttributes({ titleColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Block Background Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Block Background",
													"oone-addon-social-proof-kit",
												)}
											</label>
											<Button
												onClick={() => toggleColorPicker("backgroundColor")}
												style={{
													background: resolveColor(backgroundColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "backgroundColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "backgroundColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<TabPanel
														className="storycraft-tabs"
														activeClass="active-tab"
														tabs={[
															{ name: "color", title: "Color" },
															{ name: "gradient", title: "Gradient" },
														]}
													>
														{(tab) => (
															<>
																{tab.name === "color" && (
																	<div style={{ marginTop: "10px" }}>
																		<PaletteButtons
																			onSelect={(key) =>
																				setAttributes({ backgroundColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(backgroundColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					backgroundColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(backgroundColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					backgroundColor: preset
																						? preset.keyString
																						: gradientCSS || "",
																				});
																			}}
																			gradients={[...paletteGradients]}
																		/>
																	</div>
																)}
																<Button
																	onClick={() =>
																		setAttributes({
																			backgroundColor: "transparent",
																		})
																	}
																	isSecondary
																	style={{
																		marginTop: "10px",
																		width: "100%",
																		justifyContent: "center",
																	}}
																>
																	Set Transparent
																</Button>
															</>
														)}
													</TabPanel>
												</div>
											)}
										</div>

										{/* --- Slide Name Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Slide Name Color",
													"oone-addon-social-proof-kit",
												)}
											</label>
											<Button
												onClick={() => toggleColorPicker("slideNameColor")}
												style={{
													background: resolveColor(slideNameColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "slideNameColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "slideNameColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<PaletteButtons
														onSelect={(key) =>
															setAttributes({ slideNameColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(slideNameColor)}
														onChangeComplete={(color) =>
															setAttributes({ slideNameColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Slide Text Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Slide Text Color",
													"oone-addon-social-proof-kit",
												)}
											</label>
											<Button
												onClick={() => toggleColorPicker("slideTextColor")}
												style={{
													background: resolveColor(slideTextColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "slideTextColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "slideTextColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<PaletteButtons
														onSelect={(key) =>
															setAttributes({ slideTextColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(slideTextColor)}
														onChangeComplete={(color) =>
															setAttributes({ slideTextColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Slide Rating Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Slide Rating Color",
													"oone-addon-social-proof-kit",
												)}
											</label>
											<Button
												onClick={() => toggleColorPicker("slideRatingColor")}
												style={{
													background: resolveColor(slideRatingColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "slideRatingColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "slideRatingColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<PaletteButtons
														onSelect={(key) =>
															setAttributes({ slideRatingColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(slideRatingColor)}
														onChangeComplete={(color) =>
															setAttributes({ slideRatingColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Slide Background Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Slide Background",
													"oone-addon-social-proof-kit",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("slideBackgroundColor")
												}
												style={{
													background:
														resolveColor(slideBackgroundColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													fontWeight: "bold",
													textTransform: "uppercase",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "slideBackgroundColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "slideBackgroundColor" && (
												<div
													style={{
														marginTop: "10px",
														padding: "10px",
														background: "#f8f8f8",
														borderRadius: "4px",
														border: "1px solid #eee",
													}}
												>
													<TabPanel
														className="storycraft-tabs"
														activeClass="active-tab"
														tabs={[
															{ name: "color", title: "Color" },
															{ name: "gradient", title: "Gradient" },
														]}
													>
														{(tab) => (
															<>
																{tab.name === "color" && (
																	<div style={{ marginTop: "10px" }}>
																		<PaletteButtons
																			onSelect={(key) =>
																				setAttributes({
																					slideBackgroundColor: key,
																				})
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(slideBackgroundColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					slideBackgroundColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(slideBackgroundColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					slideBackgroundColor: preset
																						? preset.keyString
																						: gradientCSS || "",
																				});
																			}}
																			gradients={[...paletteGradients]}
																		/>
																	</div>
																)}
																<Button
																	onClick={() =>
																		setAttributes({
																			slideBackgroundColor: "transparent",
																		})
																	}
																	isSecondary
																	style={{
																		marginTop: "10px",
																		width: "100%",
																		justifyContent: "center",
																	}}
																>
																	Set Transparent
																</Button>
															</>
														)}
													</TabPanel>
												</div>
											)}
										</div>
									</div>
								)}
							</>
						)}
					</TabPanel>
				</PanelBody>

				{/* Add Slide Button */}
				<Button
					variant="primary"
					onClick={addSlide}
					style={{
						backgroundColor: "#9813ca",
						color: "#eed4fa",
						width: "100px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: "10px",
						marginLeft: "auto",
						marginRight: "auto",
						borderRadius: "18px",
						fontWeight: "600",
						transition: "all 0.3s ease",
					}}
					onMouseEnter={(e) => {
						e.target.style.backgroundColor = "#eed4fa";
						e.target.style.color = "#9813ca";
					}}
					onMouseLeave={(e) => {
						e.target.style.backgroundColor = "#9813ca";
						e.target.style.color = "#eed4fa";
					}}
				>
					Add Slide
				</Button>

				<PanelBody
					title="Slides"
					initialOpen={true}
					onToggle={() => setSlidesPanelOpen(!slidesPanelOpen)}
					opened={slidesPanelOpen}
				>
					{slides.map((slide, index) => (
						<div
							key={slide.id || index}
							ref={(el) => (slideRefs.current[index] = el)}
							style={{
								border: "1px solid #9813ca",
								padding: "10px",
								marginBottom: "10px",
								borderRadius: "4px",
								backgroundColor:
									selectedSlideIndex === index ? "#eed4fa" : "transparent",
								transition: "background-color 0.3s ease",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "8px" }}
								>
									{slide.image ? (
										<img
											src={getResolvedAsset(slide.image)}
											style={{
												width: "40px",
												height: "40px",
												objectFit: "cover",
												borderRadius: "2px",
											}}
										/>
									) : (
										<div
											style={{
												width: "40px",
												height: "40px",
												backgroundColor: "#f0f0f0",
												borderRadius: "2px",
											}}
										/>
									)}
									<strong style={{ flex: 1 }}>
										{slide.name || `Slide ${index + 1}`}
									</strong>
								</div>

								<div style={{ display: "flex", alignItems: "center" }}>
									<Tooltip text={__("Move Up", "orbit-one")}>
										<Button
											icon={arrowUp}
											onClick={() => moveSlide(index, "up")}
											disabled={index === 0}
											isSmall
										/>
									</Tooltip>
									<Tooltip text={__("Move Down", "orbit-one")}>
										<Button
											icon={arrowDown}
											onClick={() => moveSlide(index, "down")}
											disabled={index === slides.length - 1}
											isSmall
										/>
									</Tooltip>
									<Tooltip text={__("Edit Slide", "orbit-one")}>
										<Button
											icon="edit"
											onClick={() => toggleEditSlide(index)}
											isPressed={selectedSlideIndex === index}
											isSmall
											style={{ marginLeft: "8px" }}
										/>
									</Tooltip>
									<Tooltip text={__("Delete Slide", "orbit-one")}>
										<Button
											icon="trash"
											onClick={() => deleteSlide(index)}
											isDestructive
											isSmall
										/>
									</Tooltip>
								</div>
							</div>

							{selectedSlideIndex === index && (
								<TabPanel
									className="storycraft-tabs"
									activeClass="active-tab"
									tabs={[
										{
											name: "typography",
											title: __("Typography", "oone-addon-social-proof-kit"),
										},
										{
											name: "image",
											title: __("Image", "oone-addon-social-proof-kit"),
										},
									]}
								>
									{(tab) => (
										<>
											{tab.name === "typography" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													<TextControl
														label="Name"
														value={slide.name || ""}
														onChange={(value) =>
															updateSlide(index, "name", value)
														}
													/>
													<TextControl
														label="Text"
														value={slide.text || ""}
														onChange={(value) =>
															updateSlide(index, "text", value)
														}
													/>
													{/* Rating */}
													<RangeControl
														label="Rating"
														value={slide.rating || 0}
														onChange={(value) =>
															updateSlide(index, "rating", parseFloat(value))
														}
														min={0}
														max={5}
														step={0.1}
													/>
													<TextControl
														label="Link"
														value={slide.link || ""}
														onChange={(value) =>
															updateSlide(index, "link", value)
														}
													/>
												</div>
											)}
											{tab.name === "image" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													<MediaUploadCheck>
														<div
															style={{
																display: "flex",
																flexDirection: "column",
																alignItems: "center",
																gap: "10px",
																marginBottom: "10px",
															}}
														>
															{/* Image Preview or Placeholder */}
															{slide.image ? (
																<img
																	src={getResolvedAsset(slide.image)}
																	alt="Preview"
																	style={{
																		width: "90%",
																		height: "auto",
																		borderRadius: "6px",
																		objectFit: "contain",
																	}}
																/>
															) : (
																<div
																	style={{
																		width: "90%",
																		height: "200px",
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																		border: "2px dashed #9813ca",
																		borderRadius: "6px",
																		color: "#9813ca",
																		backgroundColor: "#faf5ff",
																		fontStyle: "italic",
																	}}
																>
																	No image selected
																</div>
															)}

															{/* Alt Text Input Field */}
															{slide.image && (
																<TextControl
																	label={__(
																		"Image Alt Text",
																		"oone-addon-social-proof-kit",
																	)}
																	value={slide.imgAlt || ""}
																	onChange={(value) =>
																		updateSlide(index, "imgAlt", value)
																	}
																	help={__(
																		"Describe the image for accessibility.",
																		"oone-addon-social-proof-kit",
																	)}
																	style={{ width: "90%" }}
																/>
															)}

															{/* Media Upload Component */}
															<MediaUpload
																onSelect={(media) => {
																	updateSlide(index, "image", media.url);
																	// We do NOT update alt text from here anymore
																}}
																allowedTypes={["image"]}
																value={slide.image}
																render={({ open }) => {
																	const baseButtonStyle = {
																		border: "none",
																		borderRadius: "8px",
																		padding: "10px 20px",
																		fontWeight: "600",
																		cursor: "pointer",
																		transition: "all 0.3s ease",
																		boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
																		height: "auto",
																	};

																	return (
																		<div
																			style={{
																				display: "flex",
																				gap: "12px",
																				marginTop: "10px",
																				width: "90%",
																				justifyContent: "center",
																			}}
																		>
																			<Button
																				onClick={open}
																				style={{
																					...baseButtonStyle,
																					backgroundColor: "#9813ca",
																					color: "#eed4fa",
																				}}
																				onMouseEnter={(e) => {
																					e.target.style.backgroundColor =
																						"#eed4fa";
																					e.target.style.color = "#9813ca";
																				}}
																				onMouseLeave={(e) => {
																					e.target.style.backgroundColor =
																						"#9813ca";
																					e.target.style.color = "#eed4fa";
																				}}
																			>
																				{slide.image
																					? "Change Image"
																					: "Select Image"}
																			</Button>

																			{slide.image && (
																				<Button
																					onClick={() => {
																						// This is the correct logic for your data structure
																						const newSlides = [...slides];
																						newSlides[index] = {
																							...newSlides[index],
																							image: "",
																							imgAlt: "",
																						};
																						setAttributes({
																							slides: newSlides,
																						});
																					}}
																					style={{
																						...baseButtonStyle,
																						backgroundColor: "#D9534F",
																						color: "#FFFFFF",
																					}}
																					onMouseEnter={(e) => {
																						e.target.style.backgroundColor =
																							"#C9302C";
																					}}
																					onMouseLeave={(e) => {
																						e.target.style.backgroundColor =
																							"#D9534F";
																					}}
																				>
																					Remove Image
																				</Button>
																			)}
																		</div>
																	);
																}}
															/>
														</div>
													</MediaUploadCheck>
												</div>
											)}
										</>
									)}
								</TabPanel>
							)}
						</div>
					))}
				</PanelBody>
			</InspectorControls>

			{/* Confirmation Dialog */}
			{confirmDelete.show && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0, 0, 0, 0.4)",
						backdropFilter: "blur(3px)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 10000,
						animation: "fadeIn 0.2s ease",
					}}
				>
					<div
						style={{
							background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
							padding: "25px 30px",
							borderRadius: "16px",
							width: "320px",
							boxShadow:
								"0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)",
							textAlign: "center",
							animation: "scaleIn 0.2s ease",
						}}
					>
						<h3
							style={{
								fontSize: "1.25rem",
								marginBottom: "10px",
								color: "#333",
								fontWeight: "600",
							}}
						>
							Confirm Deletion
						</h3>
						<p
							style={{
								fontSize: "0.95rem",
								color: "#555",
								marginBottom: "20px",
							}}
						>
							Are you sure you want to delete this <strong>slide</strong>?
						</p>
						<div
							style={{ display: "flex", justifyContent: "center", gap: "12px" }}
						>
							<button
								onClick={() =>
									setConfirmDelete({ show: false, type: null, index: null })
								}
								style={{
									padding: "8px 18px",
									borderRadius: "8px",
									border: "1px solid #ccc",
									backgroundColor: "#fff",
									color: "#333",
									cursor: "pointer",
									transition: "all 0.2s ease",
								}}
							>
								Cancel
							</button>
							<button
								onClick={confirmDeletion}
								style={{
									padding: "8px 18px",
									borderRadius: "8px",
									border: "none",
									backgroundColor: "#e53935",
									color: "#fff",
									cursor: "pointer",
									transition: "background-color 0.2s ease",
								}}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Editor Preview */}
			<div className="oone-block-editor-preview">
				<Component
					attributes={attributes}
					useEditor={true}
					onSlideClick={(index) => toggleEditSlide(index)}
				/>
			</div>
		</div>
	);
}
