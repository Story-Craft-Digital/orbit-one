import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import "./editor.scss";
import React, { useEffect, useState, useMemo } from "react";
import {
	Button,
	ColorPicker,
	PanelBody,
	TextControl,
	GradientPicker,
	TabPanel,
	ToggleControl,
	RangeControl,
	SelectControl,
	Tooltip,
	ButtonGroup,
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
import { useCallback } from "@wordpress/element";

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
	const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
	const [activeColorPicker, setActiveColorPicker] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState({
		show: false,
		type: null,
		index: null,
		optionIndex: null,
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
		// Core & Image
		image,
		imageAlt,
		gradientOverlay,
		gradientOpacity,
		borderRadius,
		maxWidth,

		// Title
		title,
		titleAlign,
		titleColor,
		titleFontSize,
		mobileTitleFontSize,
		titleBold,
		titleItalics,
		titleUnderline,
		titleLineHeight,

		// Options (List)
		options = [],
		optionsAlign,
		itemColor,
		optionsFontSize,
		mobileOptionsFontSize,
		optionsBold,
		optionsItalics,
		optionsUnderline,

		// Tick Icons
		showTickIcons,
		tickIconSize,
		mobileTickIconSize, // ✅ NEW
		tickIconColor,
		tickBgColor,

		// Button
		buttonText,
		buttonLink,
		buttonAlign,
		buttonFontSize,
		mobileButtonFontSize, // ✅ NEW
		buttonColor,
		buttonHoverColor,
		buttonTextColor,
		buttonTextHoverColor,
		buttonTextBold,
		buttonTextItalics,
		buttonTextUnderline,
		buttonBorder,
		buttonBorderSize,
		buttonsBorderRadius,

		// Layout
		align,
		padding,
		mobilePadding,
		margin,
		mobileMargin,
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
				name: "Secondary to Primary",
				gradient: `linear-gradient(135deg, ${oonePalette.secondary}, ${oonePalette.primary})`,
				keyString: "linear-gradient(135deg, secondary, primary)",
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
				"oone-feature-highlight-card-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 2. Add IDs to options
		let optionsNeedUpdate = false;
		const newOptions = options.map((option, index) => {
			if (!option.id) {
				optionsNeedUpdate = true;
				return {
					...option,
					id: `option-${Date.now()}-${index}`,
				};
			}
			return option;
		});

		if (optionsNeedUpdate) {
			initialUpdates.options = newOptions;
		}

		// 3. Apply all updates
		if (Object.keys(initialUpdates).length > 0) {
			setAttributes(initialUpdates);
		}

		// 4. Finish loading
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (options.length === 0) {
			addOption();
		}
	}, [options]);

	const addOption = () => {
		setAttributes({
			options: [
				...options,
				{
					id: `option-${Date.now()}-${options.length}`,
					item: "New Option",
				},
			],
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

	const updateCorners = (attributeName, corner, value) => {
		setAttributes({
			[attributeName]: {
				...attributes[attributeName],
				[corner]: value,
			},
		});
	};

	// ✅ Update option safely
	const updateOption = (index, field, value) => {
		const newOptions = options.map((option, i) =>
			i === index ? { ...option, [field]: value } : option,
		);
		setAttributes({ options: newOptions });
	};

	// ✅ New function to move option up/down
	const moveOption = (index, direction) => {
		const newOptions = [...options];
		const itemToMove = newOptions[index];
		const newIndex = direction === "up" ? index - 1 : index + 1;

		if (newIndex >= 0 && newIndex < newOptions.length) {
			newOptions.splice(index, 1);
			newOptions.splice(newIndex, 0, itemToMove);
			setAttributes({ options: newOptions });

			// If we are moving the currently selected item, update the selection index
			if (selectedOptionIndex === index) {
				setSelectedOptionIndex(newIndex);
			}
		}
	};

	const toggleEditOption = (index) => {
		setSelectedOptionIndex(selectedOptionIndex === index ? null : index);
	};
	const toggleColorPicker = (key, index = null) => {
		const id = index !== null ? `${key}-${index}` : key;
		setActiveColorPicker(activeColorPicker === id ? null : id);
	};

	const deleteItem = (index) => {
		setConfirmDelete({ show: true, type: "Item", index, itemIndex: null });
	};

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				{/* Title Settings */}
				<PanelBody title="Title Settings" initialOpen={true}>
					<div style={{ marginTop: "20px", marginBottom: "20px" }}>
						{/* Title */}
						<TextControl
							label={__("Title", "orbit-one")}
							value={title || ""}
							onChange={(value) => setAttributes({ title: value })}
						/>

						{/* Title: Bold, Italic, Underline */}
						<div
							className="oone-formatting-control"
							style={{
								marginBottom: "10px",
							}}
						>
							<p>{__("Title Text Formatting", "orbit-one")}</p>
							<ButtonGroup>
								<Button
									icon={formatBold}
									isPressed={titleBold}
									onClick={() => setAttributes({ titleBold: !titleBold })}
								/>
								<Button
									icon={formatItalic}
									isPressed={titleItalics}
									onClick={() => setAttributes({ titleItalics: !titleItalics })}
								/>
								<Button
									icon={formatUnderline}
									isPressed={titleUnderline}
									onClick={() =>
										setAttributes({
											titleUnderline: !titleUnderline,
										})
									}
								/>
							</ButtonGroup>
						</div>

						{/* Title Alignment */}
						<div className="oone-alignment-control" style={{ gap: "10px" }}>
							<p>{__("Title Alignment", "orbit-one")}</p>
							<ButtonGroup>
								<Tooltip text={__("Align Left", "orbit-one")}>
									<Button
										isPressed={titleAlign === "left"}
										onClick={() => setAttributes({ titleAlign: "left" })}
										icon={alignLeft}
									/>
								</Tooltip>

								<Tooltip text={__("Align Center", "orbit-one")}>
									<Button
										isPressed={titleAlign === "center"}
										onClick={() => setAttributes({ titleAlign: "center" })}
										icon={alignCenter}
									/>
								</Tooltip>

								<Tooltip text={__("Align Right", "orbit-one")}>
									<Button
										isPressed={titleAlign === "right"}
										onClick={() => setAttributes({ titleAlign: "right" })}
										icon={alignRight}
									/>
								</Tooltip>
							</ButtonGroup>
						</div>

						{/* Title Font Size */}
						<div className="flex gap-5">
							{/* Font Size */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									flex: 1,
								}}
							>
								<TextControl
									label={__("Font Size", "clean-kerala-project")}
									value={titleFontSize}
									onChange={(value) =>
										setAttributes({ titleFontSize: parseInt(value) })
									}
									type="number"
									units={["px"]}
								/>
							</div>

							{/* Mobile Font Size */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									flex: 1,
								}}
							>
								<TextControl
									label={__("Mobile Font Size", "clean-kerala-project")}
									value={mobileTitleFontSize}
									onChange={(value) =>
										setAttributes({
											mobileTitleFontSize: parseInt(value),
										})
									}
									type="number"
									units={["px"]}
								/>
							</div>
						</div>

						{/* Title Line Height */}
						<RangeControl
							label={__("Title Line Height", "orbit-one")}
							value={titleLineHeight}
							onChange={(value) => setAttributes({ titleLineHeight: value })}
							min={0}
							max={3}
							step={0.1}
							help={__(
								"Uses a multiplier of the line height.",
								"orbit-one",
							)}
						/>

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
								{activeColorPicker === "titleColor" ? "Close" : "Choose Color"}
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
										onSelect={(key) => setAttributes({ titleColor: key })}
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
					</div>
				</PanelBody>

				{/* Features List */}
				<PanelBody title="Features List" initialOpen={false}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{
								name: "content",
								title: __("Content", "orbit-one"),
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
								{/* Content */}
								{tab.name === "content" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{options.map((option, index) => (
											<div
												key={index}
												style={{
													paddingTop: "10px",
													display: "flex",
													flexDirection: "column",
													alignItems: "center", // ✅ fixed alignOptions → alignItems
												}}
											>
												<div
													style={{
														display: "flex",
														flexDirection: "row",
														justifyContent: "space-between",
														alignItems: "center",
														width: "100%",
													}}
												>
													<div
														style={{
															display: "flex",
															flexDirection: "row",
															alignItems: "center",
														}}
													>
														<strong>{option.item}</strong>
													</div>

													<div className="flex">
														{/* ✅ NEW: Move Up Button */}
														<Tooltip text="Move Up">
															<Button
																icon={arrowUp}
																onClick={() => moveOption(index, "up")}
																disabled={index === 0}
																isSmall
																style={{ marginRight: "4px" }}
															/>
														</Tooltip>

														{/* ✅ NEW: Move Down Button */}
														<Tooltip text="Move Down">
															<Button
																icon={arrowDown}
																onClick={() => moveOption(index, "down")}
																disabled={index === options.length - 1}
																isSmall
																style={{ marginRight: "10px" }}
															/>
														</Tooltip>
														<Button
															variant="link"
															onClick={() => toggleEditOption(index)}
															style={{
																marginRight: "10px",
																display: "flex",
																alignItems: "center",
																gap: "6px",
																color: "#9813ca",
																borderRadius: "8px",
																cursor: "pointer",
																transition: "all 0.2s ease-in-out",
															}}
															onMouseEnter={(e) => {
																e.target.style.color = "#eed4fa";
															}}
															onMouseLeave={(e) => {
																e.target.style.color = "#9813ca";
															}}
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="16"
																height="16"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M3 17.25V21h3.75l11.04-11.04-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
															</svg>
														</Button>
														{options.length > 2 && (
															<Button
																variant="link"
																onClick={() => deleteItem(index)}
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: "6px",
																	color: "#B60707",
																	borderRadius: "8px",
																	cursor: "pointer",
																	transition: "all 0.2s ease-in-out",
																}}
																onMouseEnter={(e) => {
																	e.target.style.color = "#FF6767";
																}}
																onMouseLeave={(e) => {
																	e.target.style.color = "#B60707";
																}}
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="16"
																	height="16"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
																</svg>
															</Button>
														)}
													</div>
												</div>

												{/* Edit input for option.item */}
												{selectedOptionIndex === index && (
													<div
														key={index}
														style={{
															marginBottom: "12px",
															width: "100%",
														}}
													>
														<TextControl
															value={option.item || ""}
															onChange={(value) =>
																updateOption(index, "item", value)
															}
														/>
													</div>
												)}
											</div>
										))}

										{/* Add Option Button */}
										<Button
											variant="primary"
											onClick={addOption}
											style={{
												backgroundColor: "#9813ca",
												color: "#eed4fa",
												width: "100px",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												marginTop: "10px",
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
											Add Option
										</Button>
									</div>
								)}

								{/* Layout */}
								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* ✅ --- ADDED TOGGLE CONTROL --- */}
										<ToggleControl
											label={__("Show Tick Icons", "orbit-one")}
											checked={showTickIcons}
											onChange={(value) =>
												setAttributes({ showTickIcons: value })
											}
											help={__(
												"Show or hide the tick icon next to each list item.",
												"orbit-one",
											)}
										/>

										{/* Options Font Size */}
										<div className="flex gap-5">
											{/* Font Size */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Font Size", "clean-kerala-project")}
													value={optionsFontSize}
													onChange={(value) =>
														setAttributes({ optionsFontSize: parseInt(value) })
													}
													type="number"
													units={["px"]}
												/>
											</div>

											{/* Mobile Font Size */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Mobile Font Size", "clean-kerala-project")}
													value={mobileOptionsFontSize}
													onChange={(value) =>
														setAttributes({
															mobileOptionsFontSize: parseInt(value),
														})
													}
													type="number"
													units={["px"]}
												/>
											</div>
										</div>

										{/* Items Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Items Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={optionsAlign === "left"}
														onClick={() =>
															setAttributes({ optionsAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={optionsAlign === "center"}
														onClick={() =>
															setAttributes({ optionsAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={optionsAlign === "right"}
														onClick={() =>
															setAttributes({ optionsAlign: "right" })
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
													isPressed={optionsBold}
													onClick={() =>
														setAttributes({ optionsBold: !optionsBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={optionsItalics}
													onClick={() =>
														setAttributes({ optionsItalics: !optionsItalics })
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={optionsUnderline}
													onClick={() =>
														setAttributes({
															optionsUnderline: !optionsUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>

										{/* Tick Icon Size */}
										{showTickIcons && (
											<>
												{/* Tick Icon Size */}
												<RangeControl
													label={__(
														"Tick Icon Size",
														"orbit-one",
													)}
													value={tickIconSize}
													onChange={(value) =>
														setAttributes({ tickIconSize: value })
													}
													min={0}
													max={100}
													step={1}
													help={__(
														"Uses a multiplier of the font size.",
														"orbit-one",
													)}
												/>

												{/* Mobile Tick Icon Size */}
												<RangeControl
													label={__(
														"Mobile Tick Icon Size",
														"orbit-one",
													)}
													value={mobileTickIconSize}
													onChange={(value) =>
														setAttributes({ mobileTickIconSize: value })
													}
													min={0}
													max={100}
													step={1}
													help={__(
														"Uses a multiplier of the font size.",
														"orbit-one",
													)}
												/>
											</>
										)}
									</div>
								)}

								{/* Color */}
								{tab.name === "color" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* --- Tick Icon Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Tick Icon Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("tickIconColor")}
												style={{
													background: resolveColor(tickIconColor) || "#333",
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
												{activeColorPicker === "tickIconColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "tickIconColor" && (
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
															setAttributes({ tickIconColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(tickIconColor)}
														onChangeComplete={(color) =>
															setAttributes({ tickIconColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Tick Icon Background Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Tick Icon Background", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("tickBgColor")}
												style={{
													background: resolveColor(tickBgColor) || "#333",
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
												{activeColorPicker === "tickBgColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "tickBgColor" && (
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
																				setAttributes({ tickBgColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(tickBgColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					tickBgColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(tickBgColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					tickBgColor: preset
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
																			tickBgColor: "transparent",
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

										{/* --- Item Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Item Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("itemColor")}
												style={{
													background: resolveColor(itemColor) || "#333",
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
												{activeColorPicker === "itemColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "itemColor" && (
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
															setAttributes({ itemColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(itemColor)}
														onChangeComplete={(color) =>
															setAttributes({ itemColor: color.hex })
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
				</PanelBody>

				{/* Button Settings */}
				<PanelBody title="Button Settings" initialOpen={false}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{
								name: "typography",
								title: __("Typography", "orbit-one"),
							},
							{
								name: "color",
								title: __("Color", "orbit-one"),
							},
						]}
					>
						{(tab) => (
							<>
								{/* Typography */}
								{tab.name === "typography" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Button Text */}
										<TextControl
											label={__("Button Text", "orbit-one")}
											value={buttonText || ""}
											onChange={(value) => setAttributes({ buttonText: value })}
										/>

										{/* Button: Bold, Italic, Underline */}
										<div
											className="oone-formatting-control"
											style={{
												marginBottom: "10px",
											}}
										>
											<p>
												{__(
													"Button Text Formatting",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Button
													icon={formatBold}
													isPressed={buttonTextBold}
													onClick={() =>
														setAttributes({ buttonTextBold: !buttonTextBold })
													}
												/>
												<Button
													icon={formatItalic}
													isPressed={buttonTextItalics}
													onClick={() =>
														setAttributes({
															buttonTextItalics: !buttonTextItalics,
														})
													}
												/>
												<Button
													icon={formatUnderline}
													isPressed={buttonTextUnderline}
													onClick={() =>
														setAttributes({
															buttonTextUnderline: !buttonTextUnderline,
														})
													}
												/>
											</ButtonGroup>
										</div>

										{/* Button Text Font Size */}
										<RangeControl
											label={__(
												"Button Text Font Size",
												"orbit-one",
											)}
											value={buttonFontSize}
											onChange={(value) =>
												setAttributes({ buttonFontSize: value })
											}
											min={0}
											max={100}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Mobile Button Text Font Size */}
										<RangeControl
											label={__(
												"Mobile Button Text Font Size",
												"orbit-one",
											)}
											value={mobileButtonFontSize}
											onChange={(value) =>
												setAttributes({ mobileButtonFontSize: value })
											}
											min={0}
											max={100}
											step={1}
											help={__(
												"Uses a multiplier of the font size.",
												"orbit-one",
											)}
										/>

										{/* Link URL */}
										<TextControl
											label={__("Link URL", "orbit-one")}
											value={buttonLink || ""}
											onChange={(value) => setAttributes({ buttonLink: value })}
										/>

										{/* Button Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Button Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={buttonAlign === "left"}
														onClick={() =>
															setAttributes({ buttonAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={buttonAlign === "center"}
														onClick={() =>
															setAttributes({ buttonAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={buttonAlign === "right"}
														onClick={() =>
															setAttributes({ buttonAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Border Controls */}
										<SelectControl
											label={__("Border Style", "orbit-one")}
											value={buttonBorder}
											options={[
												{ label: "Solid", value: "solid" },
												{ label: "Dashed", value: "dashed" },
												{ label: "Dotted", value: "dotted" },
												{ label: "Double", value: "double" },
												{ label: "None", value: "none" },
											]}
											onChange={(value) =>
												setAttributes({ buttonBorder: value })
											}
										/>

										<RangeControl
											label={__("Border Size (px)", "orbit-one")}
											value={buttonBorderSize}
											onChange={(value) =>
												setAttributes({ buttonBorderSize: value })
											}
											min={0}
											max={5}
										/>

										{/* Button Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__(
													"Button Border Radius (px)",
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

								{/* Color */}
								{tab.name === "color" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* --- Button Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Button Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("buttonColor")}
												style={{
													background: resolveColor(buttonColor) || "#333",
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
												{activeColorPicker === "buttonColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "buttonColor" && (
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
																				setAttributes({ buttonColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(buttonColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					buttonColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(buttonColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					buttonColor: preset
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
																			buttonColor: "transparent",
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

										{/* --- Button Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Button Hover Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("buttonHoverColor")}
												style={{
													background: resolveColor(buttonHoverColor) || "#333",
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
												{activeColorPicker === "buttonHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "buttonHoverColor" && (
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
																				setAttributes({ buttonHoverColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(buttonHoverColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					buttonHoverColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(buttonHoverColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					buttonHoverColor: preset
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
																			buttonHoverColor: "transparent",
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

										{/* --- Button Text Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Button Text Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("buttonTextColor")}
												style={{
													background: resolveColor(buttonTextColor) || "#333",
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
												{activeColorPicker === "buttonTextColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "buttonTextColor" && (
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
															setAttributes({ buttonTextColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(buttonTextColor)}
														onChangeComplete={(color) =>
															setAttributes({ buttonTextColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Button Text Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Button Text Hover Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("buttonTextHoverColor")
												}
												style={{
													background:
														resolveColor(buttonTextHoverColor) || "#333",
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
												{activeColorPicker === "buttonTextHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "buttonTextHoverColor" && (
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
															setAttributes({ buttonTextHoverColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(buttonTextHoverColor)}
														onChangeComplete={(color) =>
															setAttributes({ buttonTextHoverColor: color.hex })
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
				</PanelBody>

				{/* Card Settings */}
				<PanelBody title="Card Settings" initialOpen={false}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{
								name: "background",
								title: __("Background", "orbit-one"),
							},
							{
								name: "image",
								title: __("Image", "orbit-one"),
							},
							{
								name: "layout",
								title: __("Layout", "orbit-one"),
							},
						]}
					>
						{(tab) => (
							<>
								{/* Background */}
								{tab.name === "background" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* --- Gradient Overlay Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Gradient Overlay Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() => toggleColorPicker("gradientOverlay")}
												style={{
													background: resolveColor(gradientOverlay) || "#333",
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
												{activeColorPicker === "gradientOverlay"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "gradientOverlay" && (
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
																				setAttributes({ gradientOverlay: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(gradientOverlay)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					gradientOverlay: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(gradientOverlay)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					gradientOverlay: preset
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
																			gradientOverlay: "transparent",
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

										{/* Gradient Opacity */}
										<RangeControl
											label={__("Gradient Opacity", "orbit-one")}
											value={gradientOpacity}
											onChange={(value) =>
												setAttributes({ gradientOpacity: value })
											}
											min={0}
											max={1}
											step={0.1}
										/>

										{/* Max Width */}
										<RangeControl
											label={__("Max Width", "orbit-one")}
											value={maxWidth}
											onChange={(value) => setAttributes({ maxWidth: value })}
											min={0}
											max={1200}
											step={10}
										/>
									</div>
								)}

								{/* Image  */}
								{tab.name === "image" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "5px",
										}}
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
												{image ? (
													<img
														src={getResolvedAsset(image)}
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
															border: "2px dashed #ccc",
															borderRadius: "6px",
															color: "#999",
															fontStyle: "italic",
														}}
													>
														No image selected
													</div>
												)}

												{/* ✅ ADDED: TextControl for Alt Text */}
												{image && (
													<TextControl
														label={__(
															"Image Alt Text",
															"orbit-one",
														)}
														value={imageAlt}
														onChange={(value) =>
															setAttributes({ imageAlt: value })
														}
														help={__(
															"Describe the purpose of the image for accessibility.",
															"orbit-one",
														)}
														style={{ width: "90%" }}
													/>
												)}

												<MediaUpload
													onSelect={(media) =>
														setAttributes({ image: media.url })
													}
													allowedTypes={["image"]}
													render={({ open }) => (
														<div style={{ display: "flex", gap: "10px" }}>
															<Button
																variant="link"
																onClick={open}
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: "6px",
																	color: "#fff",
																	backgroundColor: "#9813ca",
																	padding: "6px 12px",
																	borderRadius: "8px",
																	cursor: "pointer",
																	textDecoration: "none",
																	transition: "all 0.2s ease-in-out",
																}}
																onMouseEnter={(e) => {
																	e.currentTarget.style.backgroundColor =
																		"#eed4fa";
																}}
																onMouseLeave={(e) => {
																	e.currentTarget.style.backgroundColor =
																		"#9813ca";
																}}
															>
																{image ? "Change Image" : "Select Image"}
															</Button>

															{image && (
																<Button
																	variant="link"
																	onClick={() => setAttributes({ image: "" })}
																	style={{
																		display: "flex",
																		alignItems: "center",
																		gap: "6px",
																		color: "#fff",
																		backgroundColor: "#B60707",
																		padding: "6px 12px",
																		borderRadius: "8px",
																		cursor: "pointer",
																		textDecoration: "none",
																		transition: "all 0.2s ease-in-out",
																	}}
																	onMouseEnter={(e) => {
																		e.currentTarget.style.backgroundColor =
																			"#FF6767";
																	}}
																	onMouseLeave={(e) => {
																		e.currentTarget.style.backgroundColor =
																			"#B60707";
																	}}
																>
																	Remove Image
																</Button>
															)}
														</div>
													)}
												/>
											</div>
										</MediaUploadCheck>
									</div>
								)}

								{/* Layout */}
								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Card Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={align === "left"}
														onClick={() => setAttributes({ align: "left" })}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={align === "center"}
														onClick={() => setAttributes({ align: "center" })}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={align === "right"}
														onClick={() => setAttributes({ align: "right" })}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Margin(px) */}
										<div>
											<label
												style={{
													marginTop: "20px",
													paddingBottom: "10px",
												}}
											>
												{__("Margin (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="margin"
												values={margin}
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
												{__("Mobile Margin (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="mobileMargin"
												values={mobileMargin}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "20px",
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

										{/* Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__("Border Radius (px)", "orbit-one")}
											</label>
											<CornerRadiusControls
												values={borderRadius}
												updateCorners={updateCorners}
												attributeName="borderRadius"
											/>
										</div>
									</div>
								)}
							</>
						)}
					</TabPanel>
				</PanelBody>
			</InspectorControls>

			{/* Add confirmation dialog for delete actions */}
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
							Are you sure you want to delete this <strong>Option</strong>?
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
										itemIndex: null,
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
									if (confirmDelete.type === "Item") {
										const newOptions = options.filter(
											(_, i) => i !== confirmDelete.index,
										);
										setAttributes({ options: newOptions });
										if (selectedOptionIndex === confirmDelete.index) {
											setSelectedOptionIndex(null);
										}
									}
									setConfirmDelete({
										show: false,
										type: null,
										index: null,
										itemIndex: null,
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
				<Component attributes={attributes} useEditor={true} />
			</div>
		</div>
	);
}
