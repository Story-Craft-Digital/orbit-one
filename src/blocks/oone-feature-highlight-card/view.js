import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// 🎨 --- START: REUSABLE PALETTE CODE --- 🎨

/**
 * ✅ UPDATED: Resolves simple keys AND gradient strings with keys.
 * @param {string} colorValue The saved attribute value (e.g., "primary" or "linear-gradient(90deg, primary, accent)")
 * @param {string} fallback A fallback color.
 * @returns {string} A valid CSS color value.
 */
const resolveColor = (colorValue, fallback = "inherit") => {
	// ✅ GET PALETTE HERE: Get the fresh palette every time.
	const oonePalette = window.oonePalette || {};

	if (!colorValue) {
		return colorValue === undefined ? fallback : "transparent";
	}

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

// ✅ NEW: Helper for converting hex/palette key to RGBA for the filter
const hexToRgba = (colorValue, opacity) => {
	const hex = resolveColor(colorValue, "#000000"); // Resolve key to hex

	if (!hex || typeof hex !== "string" || hex.includes("gradient")) {
		// Fallback for gradients or invalid values
		return `rgba(0, 0, 0, ${opacity})`;
	}

	let c = hex.substring(1).split("");
	if (c.length === 3) {
		c = [c[0], c[0], c[1], c[1], c[2], c[2]];
	}
	c = "0x" + c.join("");
	return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${opacity})`;
};

// 🎨 --- END: REUSABLE PALETTE CODE --- 🎨

function Component({ attributes, useEditor }) {
	const {
		blockId,
		// Core & Image
		image,
		imageAlt,
		gradientOverlay,
		gradientOpacity,
		borderRadius,

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
		maxWidth,
	} = attributes;

	const [isMobile, setIsMobile] = useState(window.innerWidth < 440);

	// 1. Get the tool safely
	const resolveAsset = window.oone_shared?.utils?.resolveAsset;

	// 2. Added check to useMemo to prevent the "length" error
	const getResolvedAsset = useCallback(
		(assetValue) => {
			if (!assetValue) return "";
			return typeof resolveAsset === "function"
				? resolveAsset(assetValue)
				: assetValue;
		},
		[resolveAsset],
	);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 440);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// ✅ NEW: useEffect for adding SEO-friendly structured data
	useEffect(() => {
		// Only run this on the frontend, not in the editor
		if (useEditor || !blockId) return;

		// Define a unique prefix for this specific block type
		const blockSlug = "oone-feature-highlight-card";

		// Create a unique and descriptive ID for the script tag
		const scriptId = `${blockSlug}-schema-${blockId}`;

		// Avoid adding duplicate scripts
		if (document.getElementById(scriptId)) {
			return;
		}

		// Map the options array to Schema.org ListItem format
		const itemListElements = options.map((option, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: option.item,
		}));

		// Build the final schema object
		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: title,
			image: image,
			itemListElement: itemListElements,
		};

		// Add the main button URL to the schema if it's a valid link
		if (buttonLink && buttonLink.trim() !== "" && buttonLink.trim() !== "#") {
			schema.url = buttonLink;
		}

		// Create the script element
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = scriptId;
		script.innerHTML = JSON.stringify(schema, null, 2); // Use null, 2 for pretty printing (optional)
		document.head.appendChild(script);

		// Cleanup function to remove the script if the component unmounts
		return () => {
			const scriptTag = document.getElementById(scriptId);
			if (scriptTag) {
				scriptTag.remove();
			}
		};
	}, [title, options, image, buttonLink, blockId, useEditor]); // Re-run if these attributes change

	const getBoxModelString = (pad) => {
		if (!pad) return "0px";
		const { top = "0px", right = "0px", bottom = "0px", left = "0px" } = pad;
		return `${top}px ${right}px ${bottom}px ${left}px`;
	};

	const getBorderRadiusString = (obj) =>
		obj
			? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
			: "0px";

	// --- INLINE STYLE OBJECTS ---

	const sectionStyles = {
		display: "flex",
		width: "100%",
		justifyContent:
			align === "left"
				? "flex-start"
				: align === "right"
				? "flex-end"
				: "center",
	};

	const cardStyles = {
		position: "relative",
		width: "90%",
		maxWidth: `${maxWidth}px`,
		overflow: "hidden",
		boxShadow:
			"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
		backgroundImage: `url(${getResolvedAsset(image)})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
		borderRadius: getBorderRadiusString(borderRadius),
		padding: isMobile
			? mobilePadding
				? getBoxModelString(mobilePadding)
				: "12px"
			: padding
			? getBoxModelString(padding)
			: "20px",
		margin: isMobile
			? mobileMargin
				? getBoxModelString(mobileMargin)
				: "12px"
			: margin
			? getBoxModelString(margin)
			: "20px",
	};

	const overlayStyles = {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 0,
		background: resolveColor(gradientOverlay, "#000000"),
		opacity: gradientOpacity,
	};

	const contentStyles = {
		position: "relative",
		zIndex: 10,
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "flex-start",
		height: "100%",
		gap: isMobile ? "8px" : "12px",
	};

	const titleStyles = {
		width: "100%", // Needed for text-align
		textAlign: titleAlign, // ✅ NEW
		fontWeight: titleBold ? "bold" : "normal", // ✅ NEW
		fontStyle: titleItalics ? "italic" : "normal", // ✅ NEW
		textDecoration: titleUnderline ? "underline" : "none", // ✅ NEW
		lineHeight: titleLineHeight,
		fontSize: isMobile ? `${mobileTitleFontSize}px` : `${titleFontSize}px`,
		color: resolveColor(titleColor, "#FFF"), // ✅ UPDATED
	};

	const listStyles = {
		display: "flex",
		flexDirection: "column",
		gap: isMobile ? "1rem" : "1.25rem",
		fontSize: isMobile ? mobileOptionsFontSize : optionsFontSize, // from text-sm sm:text-base
		lineHeight: isMobile ? "1.25rem" : "1.5rem", // from text-sm sm:text-base
		paddingLeft: isMobile ? 0 : "0.5rem",
		paddingRight: isMobile ? 0 : "0.5rem",
		marginLeft: 0,
		marginRight: 0,
		width: "100%",
	};

	const listItemStyles = {
		display: "flex",
		alignItems: "center",
		// ✅ Handle Option Alignment
		justifyContent:
			optionsAlign === "center"
				? "center"
				: optionsAlign === "right"
				? "flex-end"
				: "flex-start",
		gap: isMobile ? "0.5rem" : "0.75rem",
		color: resolveColor(itemColor, "#FFF"), // ✅ UPDATED
		textAlign: optionsAlign, // ✅ NEW
		fontWeight: optionsBold ? "bold" : "normal", // ✅ NEW
		fontStyle: optionsItalics ? "italic" : "normal", // ✅ NEW
		textDecoration: optionsUnderline ? "underline" : "none", // ✅ NEW
	};

	const currentTickSize = isMobile ? mobileTickIconSize : tickIconSize;

	const tickWrapperStyles = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: `${currentTickSize}px`, // ✅ UPDATED
		height: `${currentTickSize}px`, // ✅ UPDATED
		borderRadius: "9999px",
		flexShrink: 0,
		background: resolveColor(tickBgColor), // ✅ UPDATED
	};

	const tickIconStyles = {
		width: `${currentTickSize * 0.6}px`, // ✅ Scale icon relative to wrapper
		height: `${currentTickSize * 0.6}px`,
		stroke: resolveColor(tickIconColor, "#FFF"), // ✅ UPDATED
	};

	const itemTextStyles = {
		lineHeight: 1.375,
	};

	const buttonStyles = {
		padding: isMobile ? "8px 16px" : "8px 14px",
		fontSize: `${isMobile ? mobileButtonFontSize : buttonFontSize}px`, // ✅ NEW
		background: resolveColor(buttonColor, "transparent"), // ✅ UPDATED

		// ✅ NEW Border Styles
		borderWidth: `${buttonBorderSize}px`,
		borderStyle: buttonBorder || "solid",
		borderColor: resolveColor(buttonTextColor, "white"), // Initial border matches text

		color: resolveColor(buttonTextColor, "white"), // ✅ UPDATED
		borderRadius: buttonsBorderRadius
			? getBorderRadiusString(buttonsBorderRadius)
			: "",

		// ✅ NEW Text Formatting
		fontWeight: buttonTextBold ? "bold" : "normal",
		fontStyle: buttonTextItalics ? "italic" : "normal",
		textDecoration: buttonTextUnderline ? "underline" : "none",

		boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		transition: "background-color 0.3s, color 0.3s, border-color 0.3s",
		cursor: "pointer",
	};

	return (
		<section style={sectionStyles}>
			<div style={cardStyles}>
				{/* Gradient Overlay */}
				<div style={overlayStyles} />

				{/* Content */}
				<div style={contentStyles}>
					<h2 style={titleStyles}>{title}</h2>

					{/* List */}
					<ul style={listStyles}>
						{options.map((option, index) => (
							<li key={index} style={listItemStyles}>
								{showTickIcons && (
									<span style={tickWrapperStyles}>
										<svg
											style={tickIconStyles}
											fill="none"
											stroke="currentColor"
											strokeWidth="3"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</span>
								)}
								<span style={itemTextStyles}>{option.item}</span>
							</li>
						))}
					</ul>

					{/* Button */}
					<div
						style={{
							width: "100%",
							display: "flex",
							justifyContent:
								buttonAlign === "left"
									? "flex-start"
									: buttonAlign === "right"
									? "flex-end"
									: "center",
						}}
					>
						<a // ✅ Changed to <a> tag for accessibility
							href={useEditor ? undefined : buttonLink || "#"} // Only add href on frontend
							onClick={(e) => useEditor && e.preventDefault()} // Prevent click in editor
							rel={useEditor ? undefined : "noopener noreferrer"}
							style={buttonStyles}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = resolveColor(
									buttonHoverColor,
									"#f1f5f9",
								); // ✅ UPDATED
								e.currentTarget.style.color = resolveColor(
									buttonTextHoverColor,
									"#0ea5e9",
								); // ✅ UPDATED
								if (buttonBorderSize > 0) {
									e.currentTarget.style.borderColor = resolveColor(
										buttonTextHoverColor,
										"#0ea5e9",
									);
								}
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = resolveColor(
									buttonColor,
									"transparent",
								); // ✅ UPDATED
								e.currentTarget.style.color = resolveColor(
									buttonTextColor,
									"#ffffff",
								); // ✅ UPDATED
								if (buttonBorderSize > 0) {
									e.currentTarget.style.borderColor = resolveColor(
										buttonTextColor,
										"white",
									);
								}
							}}
						>
							{buttonText}
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}

// --- FRONTEND DOM INITIALIZATION (UNCHANGED) ---
if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-feature-highlight-card-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-feature-highlight-card-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
