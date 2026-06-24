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
const resolveColor = (colorValue, fallback = "transparent") => {
	const oonePalette = window.oonePalette || {};
	if (!colorValue) return fallback; // Handle empty/null

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

// 🎨 --- END: REUSABLE PALETTE CODE --- 🎨

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
	const getResolvedAsset = useCallback(
		(assetValue) => {
			if (!assetValue) return "";
			return typeof resolveAsset === "function"
				? resolveAsset(assetValue)
				: assetValue;
		},
		[resolveAsset],
	);

	const {
		blockId,
		slides = [],
		slideGap,
		backgroundColor,
		padding,
		mobilePadding,
		title,
		titleFontSize,
		titleLineHeight,
		titlePadding,
		titleAlign,
		titleBold,
		titleItalics,
		titleUnderline,
		titleColor,
		minSlidesToShow,
		slideBorderRadius,
		uniteSlideSettings,
		slideTitleColor,
		slideFilterColor,
		slideBackgroundColor,
		slideTitleFontSize,
		buttonSize,
		autoScrolling,
		scrollSpeed,
		progressbarColor,
		progressbar,
	} = attributes;

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
				"oone-multi-content-carousel-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 2. Add initial slide if empty
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
					title: "Card Title",
					titleColor: "white",
					filterColor: "accent",
					textPosition: "bottom",
					backgroundColor: "white",
					fontSize: 25,
					link: "",
					image: "oone-carousel-image-visual-storytelling.webp",
					imgAlt: "",
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
								title: __("Typography", "orbit-one"),
							},
							{
								name: "layout",
								title: __("Layout", "orbit-one"),
							},
							{
								name: "color",
								title: __("Color", "orbit-one"),
							},
						]}
					>
						{(tab) => (
							<>
								{tab.name === "typography" && (
									<div style={{ marginTop: "20px", marginBottom: "10px" }}>
										{/* Title */}
										<TextControl
											label={__("Title", "orbit-one")}
											value={title}
											onChange={(value) => setAttributes({ title: value })}
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

										{/* Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>{__("Text Formatting", "orbit-one")}</p>
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

										{/* Unite Slides Settings */}
										<ToggleControl
											label={__(
												"Unite Slides Settings",
												"orbit-one",
											)}
											checked={uniteSlideSettings}
											onChange={(value) =>
												setAttributes({ uniteSlideSettings: value })
											}
										/>

										{/* Slides Title Font Size */}
										{uniteSlideSettings && (
											<RangeControl
												label={__(
													"Slides Title FontSize",
													"orbit-one",
												)}
												value={slideTitleFontSize}
												onChange={(value) =>
													setAttributes({ slideTitleFontSize: value })
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

										<div className="flex gap-5">
											{/* Auto Scrolling */}
											<ToggleControl
												label={__("Auto Scrolling", "orbit-one")}
												checked={autoScrolling}
												onChange={(value) =>
													setAttributes({ autoScrolling: value })
												}
											/>

											{/* Progress Bar */}
											<ToggleControl
												label={__("Progress Bar", "orbit-one")}
												checked={progressbar}
												onChange={(value) =>
													setAttributes({ progressbar: value })
												}
											/>
										</div>
									</div>
								)}

								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "10px" }}>
										{/* Slide Gap */}
										<RangeControl
											label={__("Slides Gap (px)", "orbit-one")}
											value={slideGap}
											onChange={(value) => setAttributes({ slideGap: value })}
											min={10}
											max={100}
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
											min={1}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier to set Minimum Slides to show.",
												"orbit-one",
											)}
										/>

										{/* Navigation Button Size */}
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
											help={__(
												"Uses a multiplier to set Navigation Button Size.",
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
									</div>
								)}

								{tab.name === "color" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* --- Title Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Title Color", "orbit-one")}
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

										{/* --- Background Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Background Color", "orbit-one")}
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

										{/* --- Progressbar Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Progressbar Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("progressbarColor")}
												style={{
													background: resolveColor(progressbarColor) || "#333",
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
												{activeColorPicker === "progressbarColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "progressbarColor" && (
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
																				setAttributes({ progressbarColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(progressbarColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					progressbarColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(progressbarColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					progressbarColor: preset
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
																			progressbarColor: "transparent",
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

										{/* --- UNITED SLIDE SETTINGS --- */}
										{uniteSlideSettings && (
											<>
												{/* --- Slide Title Color --- */}
												<div style={{ marginBottom: "15px" }}>
													<label
														style={{
															display: "block",
															marginBottom: "8px",
															fontWeight: "500",
														}}
													>
														{__("Slide Title Color", "orbit-one")}
													</label>
													<Button
														onClick={() => toggleColorPicker("slideTitleColor")}
														style={{
															background:
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
															width: "100%",
															justifyContent: "center",
														}}
													>
														{activeColorPicker === "slideTitleColor"
															? "Close"
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
															"Slide Background Color",
															"orbit-one",
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
																					color={resolveColor(
																						slideBackgroundColor,
																					)}
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
																					value={resolveColor(
																						slideBackgroundColor,
																					)}
																					onChange={(gradientCSS) => {
																						const preset =
																							paletteGradients.find(
																								(p) =>
																									p.gradient === gradientCSS,
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

												{/* --- Slide Filter Color --- */}
												<div style={{ marginBottom: "15px" }}>
													<label
														style={{
															display: "block",
															marginBottom: "8px",
															fontWeight: "500",
														}}
													>
														{__(
															"Slide Filter Color",
															"orbit-one",
														)}
													</label>
													<Button
														onClick={() =>
															toggleColorPicker("slideFilterColor")
														}
														style={{
															background:
																resolveColor(slideFilterColor) || "#333",
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
														{activeColorPicker === "slideFilterColor"
															? "Close"
															: "Choose Color"}
													</Button>
													{activeColorPicker === "slideFilterColor" && (
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
																	setAttributes({ slideFilterColor: key })
																}
															/>
															<ColorPicker
																color={resolveColor(slideFilterColor)}
																onChangeComplete={(color) =>
																	setAttributes({ slideFilterColor: color.hex })
																}
																disableAlpha
															/>
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
										{slide.title || `Slide ${index + 1}`}
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
										{ name: "image", title: "Image" },
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
													{/* Title */}
													<TextControl
														label="Title"
														value={slide.title}
														onChange={(value) =>
															updateSlide(index, "title", value)
														}
													/>

													{/* Link */}
													<TextControl
														label="Link"
														value={slide.link}
														onChange={(value) =>
															updateSlide(index, "link", value)
														}
													/>

													{/* Title Font Size */}
													{!uniteSlideSettings && (
														<RangeControl
															label={__(
																"Title FontSize",
																"orbit-one",
															)}
															value={slide.fontSize}
															onChange={(value) =>
																updateSlide(index, "fontSize", value)
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

													{/* Text Position */}
													<SelectControl
														label={__(
															"Text Position",
															"orbit-one",
														)}
														value={slide.textPosition || "bottom"} // default to 'bottom' if undefined
														options={[
															{ label: "Top", value: "top" },
															{ label: "Bottom", value: "bottom" },
														]}
														onChange={(value) =>
															updateSlide(index, "textPosition", value)
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
																		"orbit-one",
																	)}
																	value={slide.imgAlt || ""}
																	onChange={(value) =>
																		updateSlide(index, "imgAlt", value)
																	}
																	help={__(
																		"Describe the image for accessibility.",
																		"orbit-one",
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
											{tab.name === "color" && (
												<div
													style={{ marginTop: "20px", marginBottom: "20px" }}
												>
													{/* --- Individual Title Color --- */}
													<div style={{ marginBottom: "15px" }}>
														<label
															style={{
																display: "block",
																marginBottom: "8px",
																fontWeight: "500",
															}}
														>
															{__("Title Color", "orbit-one")}
														</label>
														<Button
															onClick={() =>
																toggleColorPicker("titleColor", index)
															}
															style={{
																background:
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
																width: "100%",
																justifyContent: "center",
															}}
														>
															{activeColorPicker === `titleColor-${index}`
																? "Close"
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

													{/* --- Individual Background Color --- */}
													<div style={{ marginBottom: "15px" }}>
														<label
															style={{
																display: "block",
																marginBottom: "8px",
																fontWeight: "500",
															}}
														>
															{__(
																"Background Color",
																"orbit-one",
															)}
														</label>
														<Button
															onClick={() =>
																toggleColorPicker("backgroundColor", index)
															}
															style={{
																background:
																	resolveColor(slide.backgroundColor) || "#333",
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
															{activeColorPicker === `backgroundColor-${index}`
																? "Close"
																: "Choose Color"}
														</Button>
														{activeColorPicker ===
															`backgroundColor-${index}` && (
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
																							updateSlide(
																								index,
																								"backgroundColor",
																								key,
																							)
																						}
																					/>
																					<ColorPicker
																						color={resolveColor(
																							slide.backgroundColor,
																						)}
																						onChangeComplete={(color) =>
																							updateSlide(
																								index,
																								"backgroundColor",
																								color.hex,
																							)
																						}
																						disableAlpha
																					/>
																				</div>
																			)}
																			{tab.name === "gradient" && (
																				<div style={{ marginTop: "10px" }}>
																					<GradientPicker
																						value={resolveColor(
																							slide.backgroundColor,
																						)}
																						onChange={(gradientCSS) => {
																							const preset =
																								paletteGradients.find(
																									(p) =>
																										p.gradient === gradientCSS,
																								);
																							updateSlide(
																								index,
																								"backgroundColor",
																								preset
																									? preset.keyString
																									: gradientCSS || "",
																							);
																						}}
																						gradients={[...paletteGradients]}
																					/>
																				</div>
																			)}
																			<Button
																				onClick={() =>
																					updateSlide(
																						index,
																						"backgroundColor",
																						"transparent",
																					)
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

													{/* --- Individual Filter Color --- */}
													<div style={{ marginBottom: "15px" }}>
														<label
															style={{
																display: "block",
																marginBottom: "8px",
																fontWeight: "500",
															}}
														>
															{__("Filter Color", "orbit-one")}
														</label>
														<Button
															onClick={() =>
																toggleColorPicker("filterColor", index)
															}
															style={{
																background:
																	resolveColor(slide.filterColor) || "#333",
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
															{activeColorPicker === `filterColor-${index}`
																? "Close"
																: "Choose Color"}
														</Button>
														{activeColorPicker === `filterColor-${index}` && (
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
																		updateSlide(index, "filterColor", key)
																	}
																/>
																<ColorPicker
																	color={resolveColor(slide.filterColor)}
																	onChangeComplete={(color) =>
																		updateSlide(index, "filterColor", color.hex)
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
