import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	RichText,
} from "@wordpress/block-editor";
import "./editor.scss";
import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
import {
	Button,
	ColorPicker,
	GradientPicker,
	PanelBody,
	TabPanel,
	TextControl,
	RangeControl,
	ToggleControl,
	Tooltip,
	ButtonGroup,
	SelectControl,
	TextareaControl,
} from "@wordpress/components";

import {
	formatBold,
	formatItalic,
	formatUnderline,
	alignLeft,
	alignCenter,
	alignRight,
	justifyTop,
	justifyCenterVertical,
	justifyBottom,
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
	const [activeColorPicker, setActiveColorPicker] = useState(null);
	const containerRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	
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
		title,
		text,

		titleFontSize,
		mobileTitleFontSize,
		titleLineHeight,
		mobileTitleLineHeight,
		titleGradient,
		titleAnimation,
		titleColor,
		titleGradientColor,
		titleAlign,
		titleVerticalAlign,
		titleBold,
		titleItalics,
		titleUnderline,
		titlePadding,
		mobileTitlePadding,

		textFontSize,
		mobileTextFontSize,
		textIndent,
		textAlign,
		textLineHeight,
		mobileTextLineHeight,
		textColor,
		textMargin,
		textMobileMargin,

		width,
		height,
		mobileHeight,
		align,
		verticalAlign,
		borderRadius,
		mobileBorderRadius,
		padding,
		mobilePadding,
		margin,
		mobileMargin,

		backgroundColor,
		image,
		imageAlt,
		imageOpacity,
		overlayColor,
		overlayOpacity,
		shadow,

		scrollSpeed,
		mobileViewBreakPoint,

		buttonsBorderRadius,
		buttonsFontSize,
		buttonsMobileFontSize,
		buttonsGap,
		buttonsMobileGap,
		buttonsMargin,
		buttonsMobileMargin,
		buttonsAlign,
		buttonsVerticalAlign,
		buttonsTextAlign,
		primaryButton,
		secondaryButton,
		primaryButtonBorder,
		primaryButtonLink,
		primaryButtonText,
		primaryButtonColor,
		primaryButtonHoverColor,
		primaryButtonTextColor,
		primaryButtonTextHoverColor,
		primaryButtonPadding,
		primaryButtonMobilePadding,
		secondaryButtonBorder,
		secondaryButtonLink,
		secondaryButtonText,
		secondaryButtonColor,
		secondaryButtonHoverColor,
		secondaryButtonTextColor,
		secondaryButtonTextHoverColor,
		secondaryButtonPadding,
		secondaryButtonMobilePadding,
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
				"oone-blog-auto-scroller-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 4. Finish loading
		setIsLoading(false);
	}, []);

	const alignSpaceBetween = (
		<svg width="20" height="20" viewBox="0 0 24 24">
			<rect x="2" y="6" width="4" height="12" fill="currentColor" />
			<rect x="18" y="6" width="4" height="12" fill="currentColor" />
		</svg>
	);

	const alignJustify = (
		<svg width="20" height="20" viewBox="0 0 24 24">
			<rect x="3" y="5" width="18" height="2" fill="currentColor" />
			<rect x="3" y="9" width="18" height="2" fill="currentColor" />
			<rect x="3" y="13" width="18" height="2" fill="currentColor" />
			<rect x="3" y="17" width="18" height="2" fill="currentColor" />
		</svg>
	);

	// Generic update function
	const updateBoxModel = (type, side, value) => {
		setAttributes({
			[type]: {
				...attributes[type],
				[side]: value,
			},
		});
	};

	const toggleColorPicker = (key, index = null) => {
		const id = index !== null ? `${key}-${index}` : key;
		setActiveColorPicker(activeColorPicker === id ? null : id);
	};

	// ✅ Detect screen width
	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const currentWidth = entry.contentRect.width;
				setIsMobile(currentWidth <= mobileViewBreakPoint);
			}
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [mobileViewBreakPoint]);

	// Helper to convert object {top, right, bottom, left} → CSS shorthand
	const getBoxModelString = (pad) => {
		if (!pad) return "0px";
		const { top = "0px", right = "0px", bottom = "0px", left = "0px" } = pad;
		return `${top}px ${right}px ${bottom}px ${left}px`;
	};

	const updateCorners = (attributeName, corner, value) => {
		setAttributes({
			[attributeName]: {
				...attributes[attributeName],
				[corner]: value,
			},
		});
	};

	const getBorderRadiusString = (radius) => {
		if (!radius) return "0px";
		const {
			topLeft = 0,
			topRight = 0,
			bottomRight = 0,
			bottomLeft = 0,
		} = radius;
		return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
	};

	const hexToRgba = (hex, alpha = 1) => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
				{/* 📐 LAYOUT & STYLE PANEL */}
				<PanelBody
					title={__("Layout & Style", "orbit-one")}
					initialOpen={true}
				>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{ name: "layout", title: "Layout" },
							{ name: "background", title: "Background" },
							{ name: "image", title: "Image" },
						]}
					>
						{(tab) => (
							<>
								{tab.name === "layout" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
										{/* MaxWidth & Mobile View Break Point */}
										<div className="flex gap-5">
											{/* MaxWidth */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Max Width", "orbit-one")}
													value={width}
													onChange={(value) =>
														setAttributes({ width: parseInt(value) })
													}
													type="number"
												/>
												<span style={{ fontSize: "12px", color: "#666" }}>
													px
												</span>
											</div>

											{/* Mobile View Break Point */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Mobile View", "orbit-one")}
													value={mobileViewBreakPoint}
													onChange={(value) =>
														setAttributes({
															mobileViewBreakPoint: parseInt(value),
														})
													}
													type="number"
												/>
												<span style={{ fontSize: "12px", color: "#666" }}>
													px
												</span>
											</div>
										</div>

										{/* Height + Mobile Height */}
										<div className="flex gap-5">
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Height", "orbit-one")}
													value={height}
													onChange={(value) =>
														setAttributes({ height: parseInt(value) })
													}
													type="number"
												/>
												<span style={{ fontSize: "12px", color: "#666" }}>
													px
												</span>
											</div>

											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Mob Height", "orbit-one")}
													value={mobileHeight}
													onChange={(value) =>
														setAttributes({ mobileHeight: parseInt(value) })
													}
													type="number"
												/>
												<span style={{ fontSize: "12px", color: "#666" }}>
													px
												</span>
											</div>
										</div>

										{/* Horizontal Alignment */}
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

										{/* Vertical Alignment */}
										<div
											className="oone-vertical-align-control"
											style={{ marginTop: "10px", gap: "10px" }}
										>
											<p>
												{__("Vertical Alignment", "orbit-one")}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Top", "orbit-one")}
												>
													<Button
														isPressed={verticalAlign === "top"}
														onClick={() =>
															setAttributes({ verticalAlign: "top" })
														}
														icon={justifyTop}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={verticalAlign === "center"}
														onClick={() =>
															setAttributes({ verticalAlign: "center" })
														}
														icon={justifyCenterVertical}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Bottom", "orbit-one")}
												>
													<Button
														isPressed={verticalAlign === "bottom"}
														onClick={() =>
															setAttributes({ verticalAlign: "bottom" })
														}
														icon={justifyBottom}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

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

										{/* Scroll Speed */}
										<RangeControl
											label={__("Scroll Speed", "orbit-one")}
											value={scrollSpeed}
											onChange={(value) =>
												setAttributes({ scrollSpeed: value })
											}
											min={0}
											max={2}
											step={0.1}
										/>

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
										{/* Mobile Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__(
													"Mobile Border Radius (px)",
													"orbit-one",
												)}
											</label>
											<CornerRadiusControls
												values={mobileBorderRadius}
												updateCorners={updateCorners}
												attributeName="mobileBorderRadius"
											/>
										</div>
									</div>
								)}

								{tab.name === "background" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
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

										{/* --- Overlay Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Overlay Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("overlayColor")}
												style={{
													background: resolveColor(overlayColor) || "#333",
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
												{activeColorPicker === "overlayColor"
													? "Close"
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
																				setAttributes({ overlayColor: key })
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(overlayColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					overlayColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(overlayColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					overlayColor: preset
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
																			overlayColor: "transparent",
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

										<div
											style={{
												padding: "12px", // padding inside the parent
												border: "1px solid #9813ca", // purple border
												backgroundColor: "#eed4fa", // light purple background
												borderRadius: "8px", // optional rounding
												marginTop: "10px",
												marginBottom: "10px",
											}}
										>
											{/* Toggle On/Off */}
											<ToggleControl
												label={__("Enable Shadow", "your-text-domain")}
												checked={shadow.enabled}
												onChange={(value) =>
													setAttributes({
														shadow: { ...shadow, enabled: value },
													})
												}
											/>

											{shadow.enabled && (
												<>
													{/* Offset X */}
													<RangeControl
														label={__("Offset X", "your-text-domain")}
														value={shadow.offsetX}
														onChange={(value) =>
															setAttributes({
																shadow: {
																	...shadow,
																	offsetX: value,
																},
															})
														}
														min={-50}
														max={50}
													/>

													{/* Offset Y */}
													<RangeControl
														label={__("Offset Y", "your-text-domain")}
														value={shadow.offsetY}
														onChange={(value) =>
															setAttributes({
																shadow: {
																	...shadow,
																	offsetY: value,
																},
															})
														}
														min={-50}
														max={50}
													/>

													{/* Blur */}
													<RangeControl
														label={__("Blur", "your-text-domain")}
														value={shadow.blur}
														onChange={(value) =>
															setAttributes({
																shadow: { ...shadow, blur: value },
															})
														}
														min={0}
														max={100}
													/>

													{/* Spread */}
													<RangeControl
														label={__("Spread", "your-text-domain")}
														value={shadow.spread}
														onChange={(value) =>
															setAttributes({
																shadow: { ...shadow, spread: value },
															})
														}
														min={-50}
														max={50}
													/>

													{/* Opacity */}
													<RangeControl
														label={__("Opacity", "your-text-domain")}
														value={shadow.opacity}
														onChange={(value) =>
															setAttributes({
																shadow: {
																	...shadow,
																	opacity: value,
																},
															})
														}
														min={0}
														max={1}
														step={0.05}
													/>

													{/* --- Shadow Color --- */}
													<div style={{ marginBottom: "15px" }}>
														<label
															style={{
																display: "block",
																marginBottom: "8px",
																fontWeight: "500",
															}}
														>
															{__("Shadow Color", "orbit-one")}
														</label>
														<Button
															onClick={() => toggleColorPicker("shadow.color")}
															style={{
																background:
																	resolveColor(shadow.color) || "#333",
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
															{activeColorPicker === "shadow.color"
																? "Close"
																: "Choose Color"}
														</Button>
														{activeColorPicker === "shadow.color" && (
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
																		setAttributes({
																			shadow: { ...shadow, color: key },
																		})
																	}
																/>
																<ColorPicker
																	color={resolveColor(shadow.color)}
																	onChangeComplete={(color) =>
																		setAttributes({
																			shadow: { ...shadow, color: color.hex },
																		})
																	}
																	disableAlpha
																/>
															</div>
														)}
													</div>
												</>
											)}
										</div>
									</div>
								)}

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
										{/* ✅ ADDED: TextControl for Alt Text */}
										{image && (
											<>
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

												<RangeControl
													label={__("Image Opacity", "orbit-one")}
													value={imageOpacity}
													onChange={(value) =>
														setAttributes({ imageOpacity: value })
													}
													min={0}
													max={1}
													step={0.1}
												/>
											</>
										)}
									</div>
								)}
							</>
						)}
					</TabPanel>
				</PanelBody>

				{/* 🎨 TITLE STYLING PANEL */}
				<PanelBody
					title={__("Title Styling", "orbit-one")}
					initialOpen={false}
				>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{ name: "typography", title: "Typography" },
							{ name: "color", title: "Color" },
							{ name: "spacing", title: "Spacing" },
						]}
					>
						{(tab) => (
							<>
								{tab.name === "typography" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
										{/* Title */}
										<TextControl
											label={__("Title", "orbit-one")}
											value={title}
											onChange={(value) => setAttributes({ title: value })}
										/>
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
													label={__("Font Size", "orbit-one")}
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
													label={__(
														"Mobile Font Size",
														"orbit-one",
													)}
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

										{/* Enable Title Gradient */}
										<ToggleControl
											label={__("Enable Title Gradient", "your-text-domain")}
											checked={titleGradient}
											onChange={(value) =>
												setAttributes({
													titleGradient: value,
													titleAnimation: value,
												})
											}
										/>

										{/* Enable Title Animation */}
										{titleGradient && (
											<ToggleControl
												label={__("Enable Title Animation", "your-text-domain")}
												checked={titleAnimation}
												onChange={(value) =>
													setAttributes({
														titleAnimation: value,
													})
												}
											/>
										)}

										{/* Line Height */}
										{/* Desktop Line Height */}
										<RangeControl
											label={__("Desktop Line Height", "your-text-domain")}
											value={titleLineHeight}
											onChange={(value) =>
												setAttributes({ titleLineHeight: value })
											}
											min={0.8}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the font size. Default is 1.5.",
												"your-text-domain",
											)}
										/>

										{/* Mobile Line Height */}
										<RangeControl
											label={__("Mobile Line Height", "your-text-domain")}
											value={mobileTitleLineHeight}
											onChange={(value) =>
												setAttributes({ mobileTitleLineHeight: value })
											}
											min={0.8}
											max={3}
											step={0.1}
											help={__(
												"Applies on screens smaller than your breakpoint.",
												"your-text-domain",
											)}
										/>

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

										{/* Vertical Alignment */}
										<div
											className="oone-vertical-align-control"
											style={{ marginTop: "10px", gap: "10px" }}
										>
											<p>
												{__(
													"Title Vertical Alignment",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Top", "orbit-one")}
												>
													<Button
														isPressed={titleVerticalAlign === "top"}
														onClick={() =>
															setAttributes({ titleVerticalAlign: "top" })
														}
														icon={justifyTop}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={titleVerticalAlign === "center"}
														onClick={() =>
															setAttributes({ titleVerticalAlign: "center" })
														}
														icon={justifyCenterVertical}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Bottom", "orbit-one")}
												>
													<Button
														isPressed={titleVerticalAlign === "bottom"}
														onClick={() =>
															setAttributes({ titleVerticalAlign: "bottom" })
														}
														icon={justifyBottom}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Bold, Italic, Underline */}
										<div className="oone-formatting-control">
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
									</div>
								)}

								{tab.name === "color" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
										{titleGradient ? (
											// { /* --- Title Gradient Color --- */ }
											<div style={{ marginBottom: "15px" }}>
												<label
													style={{
														display: "block",
														marginBottom: "8px",
														fontWeight: "500",
													}}
												>
													{__(
														"Title Gradient Color",
														"orbit-one",
													)}
												</label>
												<Button
													onClick={() =>
														toggleColorPicker("titleGradientColor")
													}
													style={{
														background:
															resolveColor(titleGradientColor) || "#333",
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
													{activeColorPicker === "titleGradientColor"
														? "Close"
														: "Choose Color"}
												</Button>
												{activeColorPicker === "titleGradientColor" && (
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
																						titleGradientColor: key,
																					})
																				}
																			/>
																			<ColorPicker
																				color={resolveColor(titleGradientColor)}
																				onChangeComplete={(color) =>
																					setAttributes({
																						titleGradientColor: color.hex,
																					})
																				}
																				disableAlpha
																			/>
																		</div>
																	)}
																	{tab.name === "gradient" && (
																		<div style={{ marginTop: "10px" }}>
																			<GradientPicker
																				value={resolveColor(titleGradientColor)}
																				onChange={(gradientCSS) => {
																					const preset = paletteGradients.find(
																						(p) => p.gradient === gradientCSS,
																					);
																					setAttributes({
																						titleGradientColor: preset
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
																				titleGradientColor: "transparent",
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
										) : (
											// { /* --- Title Color --- */ }
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
										)}
									</div>
								)}

								{tab.name === "spacing" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
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
										<div>
											<label
												style={{
													paddingTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__(
													"Mobile Title Padding (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="mobileTitlePadding"
												values={mobileTitlePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>
									</div>
								)}
							</>
						)}
					</TabPanel>
				</PanelBody>

				{/* 📄 TEXT STYLING PANEL */}
				<PanelBody
					title={__("Text Styling", "orbit-one")}
					initialOpen={false}
				>
					{/* Paragraph Text */}
					<TextareaControl
						label={__("Paragraph Content", "orbit-one")}
						help={__(
							"Enter the scrolling body text. New lines will be converted automatically.",
						)}
						value={text}
						onChange={(value) => setAttributes({ text: value })}
						rows={6} // Makes the box taller in the sidebar
					/>
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
								label={__("Font Size", "orbit-one")}
								value={textFontSize}
								onChange={(value) =>
									setAttributes({ textFontSize: parseInt(value) })
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
								label={__("Mobile Font Size", "orbit-one")}
								value={mobileTextFontSize}
								onChange={(value) =>
									setAttributes({ mobileTextFontSize: parseInt(value) })
								}
								type="number"
								units={["px"]}
							/>
						</div>
					</div>

					{/* Line Indent */}
					<RangeControl
						label={__("First Line Indent", "orbit-one")}
						value={textIndent}
						onChange={(value) => setAttributes({ textIndent: value })}
						min={0}
						max={100}
						step={1}
					/>

					{/* Line Height */}
					{/* Desktop Line Height */}
					<RangeControl
						label={__("Desktop Line Height", "your-text-domain")}
						value={textLineHeight}
						onChange={(value) => setAttributes({ textLineHeight: value })}
						min={0.8}
						max={3}
						step={0.1}
						help={__(
							"Uses a multiplier of the font size. Default is 1.5.",
							"your-text-domain",
						)}
					/>

					{/* Mobile Line Height */}
					<RangeControl
						label={__("Mobile Line Height", "your-text-domain")}
						value={mobileTextLineHeight}
						onChange={(value) => setAttributes({ mobileTextLineHeight: value })}
						min={0.8}
						max={3}
						step={0.1}
						help={__(
							"Applies on screens smaller than your breakpoint.",
							"your-text-domain",
						)}
					/>

					{/* Horizontal Alignment */}
					<div className="oone-alignment-control" style={{ gap: "10px" }}>
						<p>{__("Text Alignment", "orbit-one")}</p>
						<ButtonGroup>
							<Tooltip text={__("Align Left", "orbit-one")}>
								<Button
									isPressed={textAlign === "left"}
									onClick={() => setAttributes({ textAlign: "left" })}
									icon={alignLeft}
								/>
							</Tooltip>

							<Tooltip text={__("Align Center", "orbit-one")}>
								<Button
									isPressed={textAlign === "center"}
									onClick={() => setAttributes({ textAlign: "center" })}
									icon={alignCenter}
								/>
							</Tooltip>

							<Tooltip text={__("Align Justify", "orbit-one")}>
								<Button
									isPressed={textAlign === "justify"}
									onClick={() => setAttributes({ textAlign: "justify" })}
									icon={alignJustify}
								/>
							</Tooltip>

							<Tooltip text={__("Align Right", "orbit-one")}>
								<Button
									isPressed={textAlign === "right"}
									onClick={() => setAttributes({ textAlign: "right" })}
									icon={alignRight}
								/>
							</Tooltip>
						</ButtonGroup>
					</div>

					{/* Margin(px) */}
					<div>
						<label
							style={{
								paddingTop: "10px",
								paddingBottom: "10px",
							}}
						>
							{__("Text Margin (px)", "orbit-one")}
						</label>
						<BoxModelControls
							type="textMargin"
							values={textMargin}
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
							{__("Mobile Text Margin (px)", "orbit-one")}
						</label>
						<BoxModelControls
							type="textMobileMargin"
							values={textMobileMargin}
							updateBoxModel={updateBoxModel}
						/>
					</div>

					{/* --- Text Color --- */}
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "500",
							}}
						>
							{__("Text Color", "orbit-one")}
						</label>
						<Button
							onClick={() => toggleColorPicker("textColor")}
							style={{
								background: resolveColor(textColor) || "#333",
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
							{activeColorPicker === "textColor" ? "Close" : "Choose Color"}
						</Button>
						{activeColorPicker === "textColor" && (
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
									onSelect={(key) => setAttributes({ textColor: key })}
								/>
								<ColorPicker
									color={resolveColor(textColor)}
									onChangeComplete={(color) =>
										setAttributes({ textColor: color.hex })
									}
									disableAlpha
								/>
							</div>
						)}
					</div>
				</PanelBody>

				{/* BUTTONS PANEL */}
				<PanelBody title="Buttons" initialOpen={false}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{
								name: "layout",
								title: __("Layout", "orbit-one"),
							},
							...(primaryButton
								? [
										{
											name: "primary",
											title: __("Primary", "orbit-one"),
										},
								  ]
								: []),
							...(secondaryButton
								? [
										{
											name: "secondary",
											title: __("Secondary", "orbit-one"),
										},
								  ]
								: []),
						]}
					>
						{(tab) => (
							<>
								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Enable Primary Button */}
										<ToggleControl
											label={__("Enable Primary Button", "your-text-domain")}
											checked={primaryButton}
											onChange={(value) =>
												setAttributes({
													primaryButton: value,
												})
											}
										/>

										{/* Enable Secondary Button */}
										<ToggleControl
											label={__("Enable Secondary Button", "your-text-domain")}
											checked={secondaryButton}
											onChange={(value) =>
												setAttributes({
													secondaryButton: value,
												})
											}
										/>

										{/* Buttons Font Size */}
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
													label={__("Font Size", "orbit-one")}
													value={buttonsFontSize}
													onChange={(value) =>
														setAttributes({ buttonsFontSize: parseInt(value) })
													}
													type="number"
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
													label={__(
														"Mobile Font Size",
														"orbit-one",
													)}
													value={buttonsMobileFontSize}
													onChange={(value) =>
														setAttributes({
															buttonsMobileFontSize: parseInt(value),
														})
													}
													type="number"
												/>
											</div>
										</div>

										{/* Gap */}
										<div className="flex gap-5">
											{/* Buttons Gap */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Buttons Gap", "orbit-one")}
													value={buttonsGap}
													onChange={(value) =>
														setAttributes({ buttonsGap: parseInt(value) })
													}
													type="number"
													units={["px"]}
												/>
											</div>

											{/* Buttons Mobile Gap */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Mobile Gap", "orbit-one")}
													value={buttonsMobileGap}
													onChange={(value) =>
														setAttributes({ buttonsMobileGap: parseInt(value) })
													}
													type="number"
													units={["px"]}
												/>
											</div>
										</div>

										{/* Buttons Horizontal Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px", marginTop: "15px" }}
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
													text={__(
														"Align Space Between",
														"orbit-one",
													)}
												>
													<Button
														isPressed={buttonsAlign === "space-between"}
														onClick={() =>
															setAttributes({ buttonsAlign: "space-between" })
														}
														icon={alignSpaceBetween}
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

										{/* Buttons Vertical Alignment */}
										<div
											className="oone-vertical-align-control"
											style={{ marginTop: "10px", gap: "10px" }}
										>
											<p>
												{__(
													"Buttons Vertical Alignment",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Top", "orbit-one")}
												>
													<Button
														isPressed={buttonsVerticalAlign === "top"}
														onClick={() =>
															setAttributes({ buttonsVerticalAlign: "top" })
														}
														icon={justifyTop}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Middle", "orbit-one")}
												>
													<Button
														isPressed={buttonsVerticalAlign === "middle"}
														onClick={() =>
															setAttributes({ buttonsVerticalAlign: "middle" })
														}
														icon={justifyCenterVertical}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Bottom", "orbit-one")}
												>
													<Button
														isPressed={buttonsVerticalAlign === "bottom"}
														onClick={() =>
															setAttributes({ buttonsVerticalAlign: "bottom" })
														}
														icon={justifyBottom}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Buttons Text Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px", marginTop: "15px" }}
										>
											<p>
												{__(
													"Buttons Text Alignment",
													"orbit-one",
												)}
											</p>
											<ButtonGroup>
												<Tooltip
													text={__("Align Left", "orbit-one")}
												>
													<Button
														isPressed={buttonsTextAlign === "left"}
														onClick={() =>
															setAttributes({ buttonsTextAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Center", "orbit-one")}
												>
													<Button
														isPressed={buttonsTextAlign === "center"}
														onClick={() =>
															setAttributes({ buttonsTextAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip
													text={__("Align Right", "orbit-one")}
												>
													<Button
														isPressed={buttonsTextAlign === "right"}
														onClick={() =>
															setAttributes({ buttonsTextAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Buttons Margin(px) */}
										<div
											style={{
												marginTop: "15px",
											}}
										>
											<label
												style={{
													paddingTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Buttons Margin (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="buttonsMargin"
												values={buttonsMargin}
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
												{__(
													"Mobile Buttons Margin (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="buttonsMobileMargin"
												values={buttonsMobileMargin}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
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
								{tab.name === "primary" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Primary Button Text */}
										<TextControl
											label={__(
												"Primary Button Text",
												"orbit-one",
											)}
											value={primaryButtonText}
											onChange={(value) =>
												setAttributes({ primaryButtonText: value })
											}
										/>

										{/* Primary Button Link */}
										<TextControl
											label={__(
												"Primary Button Link",
												"orbit-one",
											)}
											value={primaryButtonLink}
											onChange={(value) =>
												setAttributes({ primaryButtonLink: value })
											}
										/>

										{/* Primary Button Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__(
													"Primary Button Padding (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="primaryButtonPadding"
												values={primaryButtonPadding}
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
												{__(
													"Primary Button Mobile Padding (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="primaryButtonMobilePadding"
												values={primaryButtonMobilePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Primary Button Border */}
										<RangeControl
											label={__("Primary Button Border", "your-text-domain")}
											value={primaryButtonBorder}
											onChange={(value) =>
												setAttributes({ primaryButtonBorder: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the border size. Default is 1.",
												"your-text-domain",
											)}
										/>

										{/* --- Primary Button Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Primary Button Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("primaryButtonColor")}
												style={{
													background:
														resolveColor(primaryButtonColor) || "#333",
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
												{activeColorPicker === "primaryButtonColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "primaryButtonColor" && (
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
																					primaryButtonColor: key,
																				})
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(primaryButtonColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					primaryButtonColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(primaryButtonColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					primaryButtonColor: preset
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
																			primaryButtonColor: "transparent",
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

										{/* --- Primary Button Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Primary Button Hover Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("primaryButtonHoverColor")
												}
												style={{
													background:
														resolveColor(primaryButtonHoverColor) || "#333",
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
												{activeColorPicker === "primaryButtonHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "primaryButtonHoverColor" && (
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
																					primaryButtonHoverColor: key,
																				})
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(
																				primaryButtonHoverColor,
																			)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					primaryButtonHoverColor: color.hex,
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
																				primaryButtonHoverColor,
																			)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					primaryButtonHoverColor: preset
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
																			primaryButtonHoverColor: "transparent",
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

										{/* --- Primary Button Text Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Primary Button Text Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("primaryButtonTextColor")
												}
												style={{
													background:
														resolveColor(primaryButtonTextColor) || "#333",
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
												{activeColorPicker === "primaryButtonTextColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "primaryButtonTextColor" && (
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
															setAttributes({ primaryButtonTextColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(primaryButtonTextColor)}
														onChangeComplete={(color) =>
															setAttributes({
																primaryButtonTextColor: color.hex,
															})
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Primary Button Text Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Primary Button Text Hover Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("primaryButtonTextHoverColor")
												}
												style={{
													background:
														resolveColor(primaryButtonTextHoverColor) || "#333",
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
												{activeColorPicker === "primaryButtonTextHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "primaryButtonTextHoverColor" && (
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
															setAttributes({
																primaryButtonTextHoverColor: key,
															})
														}
													/>
													<ColorPicker
														color={resolveColor(primaryButtonTextHoverColor)}
														onChangeComplete={(color) =>
															setAttributes({
																primaryButtonTextHoverColor: color.hex,
															})
														}
														disableAlpha
													/>
												</div>
											)}
										</div>
									</div>
								)}
								{tab.name === "secondary" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Secondary Button Text */}
										<TextControl
											label={__(
												"Secondary Button Text",
												"orbit-one",
											)}
											value={secondaryButtonText}
											onChange={(value) =>
												setAttributes({ secondaryButtonText: value })
											}
										/>

										{/* Secondary Button Link */}
										<TextControl
											label={__(
												"Secondary Button Link",
												"orbit-one",
											)}
											value={secondaryButtonLink}
											onChange={(value) =>
												setAttributes({ secondaryButtonLink: value })
											}
										/>

										{/* Secondary Button Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__(
													"Secondary Button Padding (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="secondaryButtonPadding"
												values={secondaryButtonPadding}
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
												{__(
													"Secondary Button Mobile Padding (px)",
													"orbit-one",
												)}
											</label>
											<BoxModelControls
												type="secondaryButtonMobilePadding"
												values={secondaryButtonMobilePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Secondary Button Border */}
										<RangeControl
											label={__("Secondary Button Border", "your-text-domain")}
											value={secondaryButtonBorder}
											onChange={(value) =>
												setAttributes({ secondaryButtonBorder: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the border size. Default is 1.",
												"your-text-domain",
											)}
										/>

										{/* --- Secondary Button Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Secondary Button Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("secondaryButtonColor")
												}
												style={{
													background:
														resolveColor(secondaryButtonColor) || "#333",
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
												{activeColorPicker === "secondaryButtonColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "secondaryButtonColor" && (
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
															{ name: "color", singlecolor: "Color" },
															{ name: "gradient", singlecolor: "Gradient" },
														]}
													>
														{(tab) => (
															<>
																{tab.name === "color" && (
																	<div style={{ marginTop: "10px" }}>
																		<PaletteButtons
																			onSelect={(key) =>
																				setAttributes({
																					secondaryButtonColor: key,
																				})
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(secondaryButtonColor)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					secondaryButtonColor: color.hex,
																				})
																			}
																			disableAlpha
																		/>
																	</div>
																)}
																{tab.name === "gradient" && (
																	<div style={{ marginTop: "10px" }}>
																		<GradientPicker
																			value={resolveColor(secondaryButtonColor)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					secondaryButtonColor: preset
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
																			secondaryButtonColor: "transparent",
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

										{/* --- Secondary Button Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Secondary Button Hover Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("secondaryButtonHoverColor")
												}
												style={{
													background:
														resolveColor(secondaryButtonHoverColor) || "#333",
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
												{activeColorPicker === "secondaryButtonHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "secondaryButtonHoverColor" && (
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
																					secondaryButtonHoverColor: key,
																				})
																			}
																		/>
																		<ColorPicker
																			color={resolveColor(
																				secondaryButtonHoverColor,
																			)}
																			onChangeComplete={(color) =>
																				setAttributes({
																					secondaryButtonHoverColor: color.hex,
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
																				secondaryButtonHoverColor,
																			)}
																			onChange={(gradientCSS) => {
																				const preset = paletteGradients.find(
																					(p) => p.gradient === gradientCSS,
																				);
																				setAttributes({
																					secondaryButtonHoverColor: preset
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
																			secondaryButtonHoverColor: "transparent",
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

										{/* --- Secondary Button Text Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Secondary Button Text Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("secondaryButtonTextColor")
												}
												style={{
													background:
														resolveColor(secondaryButtonTextColor) || "#333",
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
												{activeColorPicker === "secondaryButtonTextColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "secondaryButtonTextColor" && (
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
															setAttributes({ secondaryButtonTextColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(secondaryButtonTextColor)}
														onChangeComplete={(color) =>
															setAttributes({
																secondaryButtonTextColor: color.hex,
															})
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Secondary Button Text Hover Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__(
													"Secondary Button Text Hover Color",
													"orbit-one",
												)}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("secondaryButtonTextHoverColor")
												}
												style={{
													background:
														resolveColor(secondaryButtonTextHoverColor) ||
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
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "secondaryButtonTextHoverColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker ===
												"secondaryButtonTextHoverColor" && (
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
															setAttributes({
																secondaryButtonTextHoverColor: key,
															})
														}
													/>
													<ColorPicker
														color={resolveColor(secondaryButtonTextHoverColor)}
														onChangeComplete={(color) =>
															setAttributes({
																secondaryButtonTextHoverColor: color.hex,
															})
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
			</InspectorControls>

			{/* Preview */}

			<div className="oone-block-editor-preview">
				<Component
					attributes={{ ...attributes }}
					useEditor={true}
					onTitleChange={(val) => setAttributes({ title: val })}
					onTextChange={(val) => setAttributes({ text: val })}
				/>
			</div>
		</div>
	);
}
