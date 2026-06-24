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
		slides = [],
		titleFontSize,
		descriptionFontSize,
		buttonFontSize,
		titleBold,
		titleItalics,
		titleUnderline,
		descriptionBold,
		descriptionItalics,
		descriptionUnderline,
		buttonBold,
		buttonItalics,
		buttonUnderline,
		uniteSlideSettings,
		overlayColor,
		overlayOpacity,
		buttonsBorderRadius,
		padding,
		mobilePadding,
		titleLineHeight,
		descriptionMargin,
		titlePadding,
		titleAlign,
		descriptionLineHeight,
		descriptionAlign,
		buttonsAlign,
		slideTitleColor,
		slideDescriptionColor,
		slideBtn1textColor,
		slideBtn2textColor,
		slideBtn1Color,
		slideBtn2Color,
		arrowColor,
		arrowBgColor,
		buttonSize,
		scrollSpeed,
	} = attributes;

	// ✅ Gradient palette setup
	const paletteGradients = useMemo(() => {
		const oonePalette = window.oonePalette || {};
		if (!oonePalette.primary) return [];

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

	// ✅ Initial block setup + slide ID assignment
	useEffect(() => {
		const initialUpdates = {};

		// 1. Assign unique block ID
		if (!blockId) {
			initialUpdates.blockId =
				"oone-multi-image-hero-carousel-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 2. Ensure each slide has a unique ID
		let slidesNeedUpdate = false;
		const updatedSlides = slides.map((slide) => {
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
			initialUpdates.slides = updatedSlides;
		}

		// 3. Add initial slide if none exist
		if (slides.length === 0) {
			initialUpdates.slides = [
				{
					id: "slide-" + Math.random().toString(36).substr(2, 9),
					images: [
						"oone-multi-image-carousel-card1-image-1.webp",
						"oone-multi-image-carousel-card1-image-2.webp",
					],
					title: "New Title Here",
					description:
						"Lorem ipsum dolor sit amet consectetur adipiscing elit proin feugiat ex non arcu",
					titleColor: "accent",
					titleFontSize: 58,
					descriptionFontSize: 30,
					descriptionColor: "neutral",
					btn1textColor: "white",
					btn2textColor: "primary",
					btn1text: "Our Services",
					btn1link: "#services",
					btn1Color: "primary",
					btn2text: "Contact Us",
					btn2link: "#contact",
					btn2Color: "secondary",
					imageAlt: "",
				},
			];
		}

		// 4. Apply updates if any
		if (Object.keys(initialUpdates).length > 0) {
			setAttributes(initialUpdates);
		}

		// 5. Mark loading done
		setIsLoading(false);
	}, []);

	// ✅ Update individual slide
	const updateSlide = (index, field, value) => {
		const newSlides = slides.map((slide, i) =>
			i === index ? { ...slide, [field]: value } : slide,
		);
		setAttributes({ slides: newSlides });
	};

	// ✅ Add new slide
	const addSlide = () => {
		setAttributes({
			slides: [
				...slides,
				{
					id: "slide-" + Math.random().toString(36).substr(2, 9),
					images: [
						"oone-multi-image-carousel-card1-image-1.webp",
						"oone-multi-image-carousel-card1-image-2.webp",
					],
					title: "New Title Here",
					description:
						"Lorem ipsum dolor sit amet consectetur adipiscing elit proin feugiat ex non arcu",
					titleColor: "accent",
					titleFontSize: 58,
					descriptionFontSize: 30,
					descriptionColor: "white",
					btn1textColor: "white",
					btn2textColor: "primary",
					btn1text: "Our Services",
					btn1link: "#services",
					btn1Color: "primary",
					btn2text: "Contact Us",
					btn2link: "#contact",
					btn2Color: "secondary",
					imageAlt: "",
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
								name: "general",
								title: __("General", "orbit-one"),
							},
							{
								name: "layout",
								title: __("Layout", "orbit-one"),
							},
							{
								name: "colors",
								title: __("Colors", "orbit-one"),
							},
						]}
					>
						{(tab) => (
							<>
								{tab.name === "general" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Title Formatting */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Slide Title Formatting",
													"orbit-one",
												)}
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

										{/* Horizontal Alignment */}
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

										{/* Description Formatting */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Slide Description Formatting",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={descriptionBold}
													onClick={() =>
														setAttributes({ descriptionBold: !descriptionBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={descriptionItalics}
													onClick={() =>
														setAttributes({
															descriptionItalics: !descriptionItalics,
														})
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={descriptionUnderline}
													onClick={() =>
														setAttributes({
															descriptionUnderline: !descriptionUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>
										{/* Description Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>
												{__("Description Alignment", "orbit-one")}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={descriptionAlign === "left"}
														onClick={() =>
															setAttributes({ descriptionAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={descriptionAlign === "center"}
														onClick={() =>
															setAttributes({ descriptionAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={descriptionAlign === "right"}
														onClick={() =>
															setAttributes({ descriptionAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Description Line Height */}
										<RangeControl
											label={__(
												"Description Line Height",
												"orbit-one",
											)}
											value={descriptionLineHeight}
											onChange={(value) =>
												setAttributes({ descriptionLineHeight: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the line height.",
												"orbit-one",
											)}
										/>
										{/* Button Formatting */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Slide Button Formatting",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={buttonBold}
													onClick={() =>
														setAttributes({ buttonBold: !buttonBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={buttonItalics}
													onClick={() =>
														setAttributes({ buttonItalics: !buttonItalics })
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={buttonUnderline}
													onClick={() =>
														setAttributes({ buttonUnderline: !buttonUnderline })
													}
												/>
											</ButtonGroup>
										</div>

										{/* Buttons Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>
												{__("Buttons Alignment", "orbit-one")}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={buttonsAlign === "left"}
														onClick={() =>
															setAttributes({ buttonsAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={buttonsAlign === "center"}
														onClick={() =>
															setAttributes({ buttonsAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={buttonsAlign === "right"}
														onClick={() =>
															setAttributes({ buttonsAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Button Font Size */}
										<RangeControl
											label={__(
												"Slide Button FontSize",
												"orbit-one",
											)}
											value={buttonFontSize}
											onChange={(value) =>
												setAttributes({ buttonFontSize: value })
											}
											min={12}
											max={40}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>
										{/* Overlay Opacity */}
										<RangeControl
											label={__("Overlay Opacity", "orbit-one")}
											value={overlayOpacity}
											onChange={(value) =>
												setAttributes({ overlayOpacity: value })
											}
											min={0}
											max={1}
											step={0.1}
										/>

										{/* Unite Slides Settings */}
										<ToggleControl
											label={__(
												"Unite Slide Settings",
												"orbit-one",
											)}
											checked={uniteSlideSettings}
											onChange={(value) =>
												setAttributes({ uniteSlideSettings: value })
											}
										/>
										{/* Unified Title & Description Font Sizes */}
										{uniteSlideSettings && (
											<>
												<RangeControl
													label={__(
														"Slide Title Font Size",
														"orbit-one",
													)}
													value={titleFontSize}
													onChange={(value) =>
														setAttributes({ titleFontSize: value })
													}
													min={10}
													max={100}
													step={1}
												/>
												<RangeControl
													label={__(
														"Slide Description Font Size",
														"orbit-one",
													)}
													value={descriptionFontSize}
													onChange={(value) =>
														setAttributes({ descriptionFontSize: value })
													}
													min={10}
													max={100}
													step={1}
												/>
											</>
										)}

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
										/>

										{/* Button Size */}
										<RangeControl
											label={__(
												"Navigation Button Size",
												"orbit-one",
											)}
											value={buttonSize}
											onChange={(value) => setAttributes({ buttonSize: value })}
											min={0}
											max={100}
											step={1}
										/>
									</div>
								)}

								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
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
										{/* Margin(px) */}
										<div>
											<label
												style={{
													paddingTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__(
													"Description Margin (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="descriptionMargin"
												values={descriptionMargin}
												updateBoxModel={updateBoxModel}
											/>
										</div>
										{/* Title Padding(px) */}
										<div>
											<label
												style={{
													paddingTop: "10px",
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
										{/* Buttons Border Radius (px) */}
										<div>
											<label style={{ paddingBottom: "10px" }}>
												{__(
													"Buttons Border Radius (px)",
													"orbit-one",
												)}
											</label>
											<CornerRadiusControls
												values={buttonsBorderRadius}
												updateCorners={updateCorners}
												attributeName="buttonsBorderRadius"
											/>
										</div>
									</div>
								)}

								{tab.name === "colors" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Arrow Color Picker */}
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "5px",
												marginBottom: "10px",
											}}
										>
											<label>
												{__("Arrow Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("arrowColor")}
												style={{
													backgroundColor: resolveColor(arrowColor) || "#333",
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
												}}
											>
												{activeColorPicker === "arrowColor"
													? "Close Picker"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "arrowColor" && (
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
															setAttributes({ arrowColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(arrowColor)}
														onChangeComplete={(color) =>
															setAttributes({ arrowColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>
										{/* Overlay Color Picker */}
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "5px",
												marginBottom: "10px",
											}}
										>
											<label>
												{__("Overlay Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("overlayColor")}
												style={{
													backgroundColor: resolveColor(overlayColor) || "#333",
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
												}}
											>
												{activeColorPicker === "overlayColor"
													? "Close Picker"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "overlayColor" && (
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
															setAttributes({ overlayColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(overlayColor)}
														onChangeComplete={(color) =>
															setAttributes({ overlayColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* Arrow Background Color */}
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "5px",
												marginBottom: "10px",
											}}
										>
											<label>
												{__("Arrow Background", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("arrowBgColor")}
												style={{
													background: resolveColor(arrowBgColor) || "#333",
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
												}}
											>
												{activeColorPicker === "arrowBgColor"
													? "Close Picker"
													: "Choose Color"}
											</Button>

											{activeColorPicker === "arrowBgColor" && (
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
																				setAttributes({ arrowBgColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(arrowBgColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					arrowBgColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}

																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(arrowBgColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					arrowBgColor: preset
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
																			arrowBgColor: "transparent",
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

										{uniteSlideSettings && (
											<>
												{/* Slide Title Color Picker */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__("Slide Title Color", "orbit-one")}
													</label>
													<Button
														onClick={() => toggleColorPicker("slideTitleColor")}
														style={{
															backgroundColor:
																resolveColor(slideTitleColor) || "#333",
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
														}}
													>
														{activeColorPicker === "slideTitleColor"
															? "Close Picker"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideTitleColor" && (
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
																	setAttributes({ slideTitleColor: key })
																}
															/>
															<ColorPicker
																color={resolveColor(slideTitleColor)}
																onChangeComplete={(color) =>
																	setAttributes({ slideTitleColor: color.hex })
																}
																disableAlpha
															/>
														</div>
													)}
												</div>

												{/* Slide Description Color */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__(
															" Slide Description Color",
															"orbit-one",
														)}
													</label>
													<Button
														onClick={() =>
															toggleColorPicker("slideDescriptionColor")
														}
														style={{
															backgroundColor:
																resolveColor(slideDescriptionColor) || "#333",
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
														}}
													>
														{activeColorPicker === "slideDescriptionColor"
															? "Close Picker"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideDescriptionColor" && (
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
																	setAttributes({ slideDescriptionColor: key })
																}
															/>
															<ColorPicker
																color={resolveColor(slideDescriptionColor)}
																onChangeComplete={(color) =>
																	setAttributes({
																		slideDescriptionColor: color.hex,
																	})
																}
																disableAlpha
															/>
														</div>
													)}
												</div>

												{/* Slide Button One Text Color */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__(
															"Slide Primary Button Text Color",
															"orbit-one",
														)}
													</label>
													<Button
														onClick={() =>
															toggleColorPicker("slideBtn1textColor")
														}
														style={{
															backgroundColor:
																resolveColor(slideBtn1textColor) || "#333",
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
														}}
													>
														{activeColorPicker === "slideBtn1textColor"
															? "Close Picker"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideBtn1textColor" && (
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
																	setAttributes({ slideBtn1textColor: key })
																}
															/>
															<ColorPicker
																color={resolveColor(slideBtn1textColor)}
																onChangeComplete={(color) =>
																	setAttributes({
																		slideBtn1textColor: color.hex,
																	})
																}
																disableAlpha
															/>
														</div>
													)}
												</div>

												{/* Slide Button Two Text Color */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__(
															"Slide Secondary Button Text Color",
															"orbit-one",
														)}
													</label>
													<Button
														onClick={() =>
															toggleColorPicker("slideBtn2textColor")
														}
														style={{
															backgroundColor:
																resolveColor(slideBtn2textColor) || "#333",
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
														}}
													>
														{activeColorPicker === "slideBtn2textColor"
															? "Close Picker"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideBtn2textColor" && (
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
																	setAttributes({ slideBtn2textColor: key })
																}
															/>
															<ColorPicker
																color={resolveColor(slideBtn2textColor)}
																onChangeComplete={(color) =>
																	setAttributes({
																		slideBtn2textColor: color.hex,
																	})
																}
																disableAlpha
															/>
														</div>
													)}
												</div>

												{/* Slide Button One Color */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__(
															" Slide Primary Button Color",
															"orbit-one",
														)}
													</label>
													<Button
														onClick={() => toggleColorPicker("slideBtn1Color")}
														style={{
															background:
																resolveColor(slideBtn1Color) || "#333",
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
														}}
													>
														{activeColorPicker === "slideBtn1Color"
															? "Close Picker"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideBtn1Color" && (
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
																							slideBtn1Color: key,
																						})
																					}
																				/>
																				<ColorPicker
																					color={resolveColor(slideBtn1Color)}
																					onChangeComplete={(color) =>
																						setAttributes({
																							slideBtn1Color: color.hex,
																						})
																					}
																					disableAlpha
																				/>
																			</div>
																		)}
																		{tab.name === "gradient" && (
																			<div style={{ marginTop: "10px" }}>
																				<GradientPicker
																					value={resolveColor(slideBtn1Color)}
																					onChange={(gradientCSS) => {
																						const preset =
																							paletteGradients.find(
																								(p) =>
																									p.gradient === gradientCSS,
																							);
																						setAttributes({
																							slideBtn1Color: preset
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
																					slideBtn1Color: "transparent",
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

												{/* Slide Button Two Color */}
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "5px",
														marginBottom: "10px",
													}}
												>
													<label>
														{__(
															"Slide Secondary Button Color",
															"orbit-one",
														)}
													</label>

													<Button
														onClick={() => toggleColorPicker("slideBtn2Color")}
														style={{
															background:
																resolveColor(slideBtn2Color) || "#333",
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
														}}
													>
														{activeColorPicker === "slideBtn2Color"
															? "Close Picker"
															: "Choose Color"}
													</Button>

													{activeColorPicker === "slideBtn2Color" && (
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
																							slideBtn2Color: key,
																						})
																					}
																				/>
																				<ColorPicker
																					color={resolveColor(slideBtn2Color)}
																					onChangeComplete={(color) =>
																						setAttributes({
																							slideBtn2Color: color.hex,
																						})
																					}
																					disableAlpha
																				/>
																			</div>
																		)}

																		{tab.name === "gradient" && (
																			<div style={{ marginTop: "10px" }}>
																				<GradientPicker
																					value={resolveColor(slideBtn2Color)}
																					onChange={(gradientCSS) => {
																						const preset =
																							paletteGradients.find(
																								(p) =>
																									p.gradient === gradientCSS,
																							);
																						setAttributes({
																							slideBtn2Color: preset
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
																					slideBtn2Color: "transparent",
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
											</>
										)}
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
									{slide.images && slide.images.length > 0 ? (
										<img
											src={getResolvedAsset(slide.images[0])}
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
										{slide.title
											? slide.title.substring(0, 20) + "..."
											: `Slide ${index + 1}`}
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
										{ name: "typography", title: "Typography" },
										{ name: "hoverImages", title: "Image" },
										...(!uniteSlideSettings
											? [{ name: "color", title: "Color" }]
											: []),
									]}
								>
									{(tab) => (
										<>
											{tab.name === "typography" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													<TextControl
														label="Title"
														value={slide.title}
														onChange={(value) =>
															updateSlide(index, "title", value)
														}
													/>

													<TextControl
														label="Description"
														value={slide.description}
														onChange={(value) =>
															updateSlide(index, "description", value)
														}
													/>

													<TextControl
														label="Button One Text"
														value={slide.btn1text}
														onChange={(value) =>
															updateSlide(index, "btn1text", value)
														}
													/>

													<TextControl
														label="Button One Link"
														value={slide.btn1link}
														onChange={(value) =>
															updateSlide(index, "btn1link", value)
														}
													/>

													<TextControl
														label="Button Two Text"
														value={slide.btn2text}
														onChange={(value) =>
															updateSlide(index, "btn2text", value)
														}
													/>

													<TextControl
														label="Button Two Link"
														value={slide.btn2link}
														onChange={(value) =>
															updateSlide(index, "btn2link", value)
														}
													/>

													{!uniteSlideSettings && (
														<RangeControl
															label={__(
																"Title FontSize",
																"orbit-one",
															)}
															value={slide.titleFontSize}
															onChange={(value) =>
																updateSlide(index, "titleFontSize", value)
															}
															min={10}
															max={50}
															step={1}
															help={__(
																"Uses a multiplier of the font size.",
																"orbit-one",
															)}
														/>
													)}

													{!uniteSlideSettings && (
														<RangeControl
															label={__(
																"Description FontSize",
																"orbit-one",
															)}
															value={slide.descriptionFontSize}
															onChange={(value) =>
																updateSlide(index, "descriptionFontSize", value)
															}
															min={10}
															max={50}
															step={1}
															help={__(
																"Uses a multiplier of the font size.",
																"orbit-one",
															)}
														/>
													)}
												</div>
											)}

											{tab.name === "hoverImages" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													{/* Add Hover Image */}
													<MediaUploadCheck>
														<MediaUpload
															onSelect={(media) => {
																const newSlides = [...slides];
																if (!newSlides[index].images) {
																	newSlides[index].images = [];
																}
																newSlides[index].images.push(media.url);
																setAttributes({ slides: newSlides });
															}}
															allowedTypes={["image"]}
															render={({ open }) => (
																<Button
																	onClick={open}
																	style={{
																		backgroundColor: "#9813ca",
																		color: "#fff",
																		borderRadius: "6px",
																		padding: "6px 12px",
																		marginBottom: "10px",
																	}}
																>
																	Add Hover Image
																</Button>
															)}
														/>
													</MediaUploadCheck>

													{/* List of Hover Images */}
													{slide.images && slide.images.length > 0 ? (
														<div
															style={{
																display: "flex",
																flexWrap: "wrap",
																gap: "10px",
															}}
														>
															{slide.images.map((imageUrl, imageIndex) => (
																<div
																	key={imageIndex}
																	style={{
																		position: "relative",
																		width: "calc(50% - 5px)", // two per row with small gap
																		height: "100px",
																		borderRadius: "6px",
																		overflow: "hidden",
																	}}
																>
																	<img
																		src={imageUrl}
																		alt={`Hover ${imageIndex}`}
																		style={{
																			width: "100%",
																			height: "100%",
																			objectFit: "cover",
																		}}
																	/>
																	<Button
																		isDestructive
																		onClick={() => {
																			const newSlides = [...slides];
																			newSlides[index].images = newSlides[
																				index
																			].images.filter(
																				(_, i) => i !== imageIndex,
																			);
																			setAttributes({ slides: newSlides });
																		}}
																		style={{
																			position: "absolute",
																			top: "6px",
																			right: "6px",
																			width: "28px",
																			height: "28px",
																			padding: "0",
																			borderRadius: "50%",
																			fontWeight: "bold",
																			fontSize: "16px",
																			backgroundColor: "rgba(255, 0, 0, 0.8)",
																			color: "#fff",
																			display: "flex",
																			alignItems: "center",
																			justifyContent: "center",
																		}}
																	>
																		×
																	</Button>
																</div>
															))}
														</div>
													) : (
														<p>No hover images added yet.</p>
													)}
												</div>
											)}

											{!uniteSlideSettings && tab.name === "color" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													{/* Individual Slide Title Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Title Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("titleColor", index)
															}
															style={{
																backgroundColor:
																	resolveColor(slide.titleColor) || "#333",
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
															}}
														>
															{activeColorPicker === `titleColor-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `titleColor-${index}` && (
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
																		updateSlide(index, "titleColor", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.titleColor)}
																	onChangeComplete={(color) =>
																		updateSlide(index, "titleColor", color.hex)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>

													{/* Individual Slide Description Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Description Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("descriptionColor", index)
															}
															style={{
																backgroundColor:
																	resolveColor(slide.descriptionColor) ||
																	"#333",
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
															}}
														>
															{activeColorPicker === `descriptionColor-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker ===
															`descriptionColor-${index}` && (
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
																		updateSlide(index, "descriptionColor", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.descriptionColor)}
																	onChangeComplete={(color) =>
																		updateSlide(
																			index,
																			"descriptionColor",
																			color.hex,
																		)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>

													{/* Individual Slide Button One Text Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Primary Button Text Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("btn1textColor", index)
															}
															style={{
																backgroundColor:
																	resolveColor(slide.btn1textColor) || "#333",
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
															}}
														>
															{activeColorPicker === `btn1textColor-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `btn1textColor-${index}` && (
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
																		updateSlide(index, "btn1textColor", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.btn1textColor)}
																	onChangeComplete={(color) =>
																		updateSlide(
																			index,
																			"btn1textColor",
																			color.hex,
																		)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>

													{/* Individual Slide Button two Text Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Secondary Button Text Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("btn2textColor", index)
															}
															style={{
																backgroundColor:
																	resolveColor(slide.btn2textColor) || "#333",
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
															}}
														>
															{activeColorPicker === `btn2textColor-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `btn2textColor-${index}` && (
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
																		updateSlide(index, "btn2textColor", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.btn2textColor)}
																	onChangeComplete={(color) =>
																		updateSlide(
																			index,
																			"btn2textColor",
																			color.hex,
																		)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>

													{/* Individual Slide Button 1 Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Primary Button Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("btn1Color", index)
															}
															style={{
																background:
																	resolveColor(slide.btn1Color) || "#333",
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
															}}
														>
															{activeColorPicker === `btn1Color-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `btn1Color-${index}` && (
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
																		updateSlide(index, "btn1Color", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.btn1Color)}
																	onChangeComplete={(color) =>
																		updateSlide(index, "btn1Color", color.hex)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>

													{/* Individual Slide Button 2 Color */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>Secondary Button Color</label>
														<Button
															onClick={() =>
																toggleColorPicker("btn2Color", index)
															}
															style={{
																background:
																	resolveColor(slide.btn2Color) || "#333",
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
															}}
														>
															{activeColorPicker === `btn2Color-${index}`
																? "Close Picker"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `btn2Color-${index}` && (
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
																		updateSlide(index, "btn2Color", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.btn2Color)}
																	onChangeComplete={(color) =>
																		updateSlide(index, "btn2Color", color.hex)
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>
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

			{/* Confirmation Dialog for Delete */}
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
						zIndex: 1000,
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
							Are you sure you want to delete this{" "}
							<strong>
								{confirmDelete.type === "slide" ? "slide" : "item"}
							</strong>
							?
						</p>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								gap: "12px",
							}}
						>
							<button
								onClick={() =>
									setConfirmDelete({
										show: false,
										type: null,
										index: null,
									})
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
								onMouseOver={(e) =>
									(e.target.style.backgroundColor = "#f1f1f1")
								}
								onMouseOut={(e) => (e.target.style.backgroundColor = "#fff")}
							>
								Cancel
							</button>
							<button
								onClick={() => {
									if (confirmDelete.type === "slide") {
										const newSlides = slides.filter(
											(_, i) => i !== confirmDelete.index,
										);
										setAttributes({ slides: newSlides });
										setSelectedSlideIndex(null);
									}
									setConfirmDelete({
										show: false,
										type: null,
										index: null,
									});
								}}
								style={{
									padding: "8px 18px",
									borderRadius: "8px",
									border: "none",
									backgroundColor: "#e53935",
									color: "#fff",
									cursor: "pointer",
									transition: "background-color 0.2s ease",
								}}
								onMouseOver={(e) =>
									(e.target.style.backgroundColor = "#c62828")
								}
								onMouseOut={(e) => (e.target.style.backgroundColor = "#e53935")}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Preview */}
			<div className="oone-block-editor-preview">
				<Component attributes={attributes} />
			</div>
		</div>
	);
}
