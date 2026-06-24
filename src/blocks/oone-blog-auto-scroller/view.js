import { __ } from "@wordpress/i18n";
import { RichText } from "@wordpress/block-editor";
import React, {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
} from "react";
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

function Component({
	attributes,
	useEditor = false,
	onTitleChange,
	onTextChange,
}) {
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
		textAlign,
		textIndent,
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
		primaryButtonBorder,
		primaryButton,
		secondaryButton,
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
	const scrollRef = useRef(null);
	const [isScrollable, setIsScrollable] = useState(false);
	const animationRef = useRef(null);
	const accumulatedRef = useRef(0);
	const containerRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

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


	console.log("IMAGE:", image);
	console.log("RESOLVED:", getResolvedAsset(image));
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

	// ✅ Auto-scroll logic with seamless loop
	useEffect(() => {
		const container = scrollRef.current;
		if (!container || useEditor || parseFloat(scrollSpeed) === 0) return;

		const scroll = () => {
			if (!isHovered) {
				accumulatedRef.current += parseFloat(scrollSpeed);
				if (accumulatedRef.current >= 1) {
					const pixels = Math.floor(accumulatedRef.current);
					container.scrollTop += pixels;
					accumulatedRef.current -= pixels;

					// Midpoint reset for seamless loop
					if (container.scrollTop >= container.scrollHeight / 2) {
						container.scrollTop = 0;
					}
				}
			}
			animationRef.current = requestAnimationFrame(scroll);
		};

		animationRef.current = requestAnimationFrame(scroll);
		setIsScrollable(container.scrollHeight > container.clientHeight);

		return () => cancelAnimationFrame(animationRef.current);
	}, [scrollSpeed, isHovered, text, useEditor]);

	// ✅ Utils
	const getBoxModelString = (obj) =>
		obj ? `${obj.top}px ${obj.right}px ${obj.bottom}px ${obj.left}px` : "0px";
	const getBorderRadiusString = (obj) =>
		obj
			? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
			: "0px";

	// ✅ Button renderer
	const renderButton = ({ link, text, bg, hBg, clr, hClr, pad, mPad, brd }) => {
		const resolvedBg = resolveColor(bg);
		const resolvedHBg = resolveColor(hBg);
		const resolvedClr = resolveColor(clr);
		const resolvedHClr = resolveColor(hClr);

		return (
			<a
				href={link}
				style={{
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					textDecoration: "none",
					background: resolvedBg,
					color: resolvedClr,
					padding: getBoxModelString(isMobile ? mPad : pad),
					fontSize: `${isMobile ? buttonsMobileFontSize : buttonsFontSize}px`,
					border: brd > 0 ? `${brd}px solid ${resolvedClr}` : "none",
					borderRadius: getBorderRadiusString(buttonsBorderRadius),
					textAlign: buttonsTextAlign,
					width: isMobile ? "100%" : "auto",
					transition: "all 0.3s ease",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = resolvedHBg;
					e.currentTarget.style.color = resolvedHClr;
					if (brd > 0) e.currentTarget.style.borderColor = resolvedHClr;
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = resolvedBg;
					e.currentTarget.style.color = resolvedClr;
					if (brd > 0) e.currentTarget.style.borderColor = resolvedClr;
				}}
			>
				{text}
			</a>
		);
	};

	const lines =
		typeof text === "string"
			? text.split(/\n|<br\s*\/?>/gi).filter((line) => line.trim() !== "")
			: [];

	// NEW: useEffect for SEO-friendly structured data
	useEffect(() => {
		// This hook should only run on the frontend.
		// Since this component is only rendered on the frontend, we don't need a `useEditor` check.
		if (!blockId) return;

		// Define a unique slug for this specific block type
		const blockSlug = "oone-blog-auto-scroller";
		const existingScriptId = `${blockSlug}-schema-${blockId}`;

		// Prevent adding the script multiple times
		if (document.getElementById(existingScriptId)) {
			return;
		}

		// Prepare the schema based on the block's attributes
		const schema = {
			"@context": "https://schema.org",
			"@type": "WebPageElement", // A schema for a distinct section of a page
			name: title, // The title of the section
			text: text, // The text content of the section
			image: image, // The background image associated with the section
		};

		// Clean up empty properties before stringifying
		if (!schema.name) delete schema.name;
		if (!schema.text) delete schema.text;
		if (!schema.image) delete schema.image;

		// If there's nothing to describe, don't add the script
		if (Object.keys(schema).length <= 2) {
			// 2 because @context and @type are always there
			return;
		}

		// Create and inject the script tag
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = existingScriptId;
		script.innerHTML = JSON.stringify(schema);
		document.head.appendChild(script);

		// Cleanup function to remove the script when the component unmounts
		return () => {
			const scriptTag = document.getElementById(existingScriptId);
			if (scriptTag) {
				scriptTag.remove();
			}
		};
	}, [blockId, title, text, image]);

	return (
		<div
			id={`oone-blog-auto-scroller-main-div${blockId}`}
			style={{
				display: "flex",
				width: "100%",
				justifyContent:
					align === "left"
						? "flex-start"
						: align === "right"
						? "flex-end"
						: "center",
				alignItems:
					verticalAlign === "top"
						? "flex-start"
						: verticalAlign === "bottom"
						? "flex-end"
						: "center",
			}}
		>
			<div
				ref={containerRef}
				style={{
					width: "100%",
					maxWidth: `${width}px`,
					height: `${isMobile ? mobileHeight : height}px`,
					margin: getBoxModelString(isMobile ? mobileMargin : margin),
					borderRadius: isMobile
						? getBorderRadiusString(mobileBorderRadius)
						: getBorderRadiusString(borderRadius),
					backgroundColor: resolveColor(backgroundColor),
					boxShadow: shadow.enabled
						? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${
								shadow.spread
						  }px ${hexToRgba(shadow.color, shadow.opacity)}`
						: "none",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* ✅ BACKGROUND & OVERLAY LAYER (Lower stack) */}
				{image && (
					<div
						className="absolute inset-0"
						style={{
							position: "absolute",
							inset: 0,
							zIndex: 0,
							pointerEvents: "none", // Ensures background doesn't block clicks
						}}
					>
						{/* The Image */}
						<div
							style={{
								position: "absolute",
								inset: 0,
								backgroundImage: `url(${getResolvedAsset(image)})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								backgroundRepeat: "no-repeat",
								opacity: imageOpacity !== undefined ? imageOpacity : 1,
								zIndex: 1,
							}}
						/>
						{/* The Overlay */}
						<div
							style={{
								position: "absolute",
								inset: 0,
								background: resolveColor(overlayColor, "transparent"),
								opacity: overlayOpacity,
								zIndex: 2, // Above image, below content
							}}
						/>
					</div>
				)}

				<div
					style={{
						position: "relative",
						zIndex: 10,
						display: "flex",
						flexDirection: "column",
						height: "100%",
						width: "100%",
						padding: getBoxModelString(isMobile ? mobilePadding : padding),
					}}
				>
					{/* Title */}
					{title && (
						<div
							style={{
								display: "flex",
								width: "100%",
								alignItems:
									titleVerticalAlign === "top"
										? "flex-start"
										: titleVerticalAlign === "bottom"
										? "flex-end"
										: "center",
								justifyContent:
									titleAlign === "left"
										? "flex-start"
										: titleAlign === "right"
										? "flex-end"
										: "center",
								padding: getBoxModelString(
									isMobile ? mobileTitlePadding : titlePadding,
								),
							}}
						>
							{/* ✅ WE KEEP YOUR H2 WRAPPER LOGIC HERE */}
							{useEditor ? (
								<RichText
									tagName="h2" // This makes RichText behave like an H2
									value={title}
									onChange={onTitleChange}
									placeholder={__("Enter title...", "oone-core")}
									style={{
										fontSize: isMobile
											? `${mobileTitleFontSize}px`
											: `${titleFontSize}px`,
										lineHeight: isMobile
											? mobileTitleLineHeight
											: titleLineHeight,
										fontWeight: titleBold ? "bold" : "normal",
										fontStyle: titleItalics ? "italic" : "normal",
										background:
											titleAnimation || titleGradient
												? resolveColor(
														titleGradientColor,
														"linear-gradient(90deg, #000000, #ffffff, #000000)",
												  )
												: "unset",
										WebkitBackgroundClip:
											titleAnimation || titleGradient ? "text" : "unset",
										WebkitTextFillColor:
											titleAnimation || titleGradient
												? "transparent"
												: resolveColor(titleColor, "#000000"),
										backgroundSize: titleAnimation ? "200% 100%" : "100% 100%",
										backgroundRepeat: titleAnimation ? "repeat-x" : "no-repeat",
										animation: titleAnimation
											? "gradientMove 1s linear infinite"
											: "none",
										position: "relative",
										display: "inline-block",
										margin: 0,
										textAlign: titleAlign,
									}}
								>
									{/* ✅ UNDERLINE INSIDE RICHTEXT (Editor View) */}
									{titleUnderline && (
										<span
											style={{
												display: "block",
												height: `${
													(isMobile ? mobileTitleFontSize : titleFontSize) * 0.1
												}px`,
												width: "100%",
												background:
													titleAnimation || titleGradient
														? resolveColor(titleGradientColor)
														: resolveColor(titleColor, "#000000"),
												position: "absolute",
												bottom: `${
													-(isMobile ? mobileTitleFontSize : titleFontSize) *
													0.05
												}px`,
												left: 0,
											}}
										/>
									)}
								</RichText>
							) : (
								<h2
									style={{
										fontSize: isMobile
											? `${mobileTitleFontSize}px`
											: `${titleFontSize}px`,
										lineHeight: isMobile
											? mobileTitleLineHeight
											: titleLineHeight,
										fontWeight: titleBold ? "bold" : "normal",
										fontStyle: titleItalics ? "italic" : "normal",
										background:
											titleAnimation || titleGradient
												? resolveColor(
														titleGradientColor,
														"linear-gradient(90deg, #000000, #ffffff, #000000)",
												  )
												: "unset",
										WebkitBackgroundClip:
											titleAnimation || titleGradient ? "text" : "unset",
										WebkitTextFillColor:
											titleAnimation || titleGradient
												? "transparent"
												: resolveColor(titleColor, "#000000"),
										backgroundSize: titleAnimation ? "200% 100%" : "100% 100%",
										backgroundRepeat: titleAnimation ? "repeat-x" : "no-repeat",
										animation: titleAnimation
											? "gradientMove 1s linear infinite"
											: "none",
										position: "relative",
										display: "inline-block",
										margin: 0,
										textAlign: titleAlign,
									}}
								>
									{title}
									{/* ✅ UNDERLINE INSIDE H2 (Frontend View) */}
									{titleUnderline && (
										<span
											style={{
												display: "block",
												height: `${
													(isMobile ? mobileTitleFontSize : titleFontSize) * 0.1
												}px`,
												width: "100%",
												background:
													titleAnimation || titleGradient
														? resolveColor(titleGradientColor)
														: resolveColor(titleColor, "#000000"),
												position: "absolute",
												bottom: `${
													-(isMobile ? mobileTitleFontSize : titleFontSize) *
													0.05
												}px`,
												left: 0,
											}}
										/>
									)}
								</h2>
							)}
						</div>
					)}

					{/* Margin wrapper */}
					<div
						style={{
							margin: getBoxModelString(
								isMobile ? textMobileMargin : textMargin,
							),
							display: "flex",
							flexDirection: "column",
							flex: 1,
							minHeight: 0,
						}}
					>
						{/* ✅ Scrollable text container */}
						<div
							ref={scrollRef}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
							className="overflow-y-auto no-scrollbar"
							style={{
								flex: 1,
								minHeight: 0,
								position: "relative",
								// ✅ Editor gets scrollbar to edit, Front-end is hidden for auto-scroll
								overflowY: useEditor ? "auto" : "hidden",
								maskImage:
									isScrollable && !useEditor
										? "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
										: "none",
								WebkitMaskImage:
									isScrollable && !useEditor
										? "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
										: "none",
							}}
						>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									textAlign: textAlign,
									gap: `${
										(isMobile ? mobileTextLineHeight : textLineHeight) * 0.8
									}em`,
									whiteSpace: "pre-wrap",
									fontSize: isMobile
										? `${mobileTextFontSize}px`
										: `${textFontSize}px`,
									lineHeight: isMobile ? mobileTextLineHeight : textLineHeight,
									color: resolveColor(textColor, "#000000"),
								}}
							>
								{useEditor ? (
									<RichText
										tagName="div"
										value={text}
										onChange={onTextChange}
										placeholder={__("Enter scrolling text...", "oone-core")}
										style={{
											textAlign: textAlign,
											textIndent: `${textIndent}%`,
										}}
									/>
								) : (
									// Inside the !useEditor part of the paragraph container:
									<>
										{/* ✅ FRONTEND LOOP */}
										{[1, 2].map((iteration) => (
											<React.Fragment key={iteration}>
												{lines.map((line, i) => (
													<p
														key={`${iteration}-${i}`}
														style={{
															margin: 0,
															textAlign: textAlign, // ✅ Applied here for each paragraph
															textIndent: `${textIndent}%`, // ✅ Applied here for each paragraph
															whiteSpace: "pre-wrap",
														}}
													>
														{line}
													</p>
												))}
											</React.Fragment>
										))}
									</>
								)}
							</div>
						</div>
					</div>

					{/* Buttons */}
					{(primaryButton || secondaryButton) && (
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: isMobile ? `${buttonsMobileGap}px` : `${buttonsGap}px`,
								margin: getBoxModelString(
									isMobile ? buttonsMobileMargin : buttonsMargin,
								),
								justifyContent: isMobile ? "center" : buttonsAlign,
								alignItems: "center",
								marginTop: "auto",
							}}
						>
							{primaryButton &&
								renderButton({
									link: primaryButtonLink,
									text: primaryButtonText,
									bg: primaryButtonColor,
									hBg: primaryButtonHoverColor,
									clr: primaryButtonTextColor,
									hClr: primaryButtonTextHoverColor,
									pad: primaryButtonPadding,
									mPad: primaryButtonMobilePadding,
									brd: primaryButtonBorder,
								})}
							{secondaryButton &&
								renderButton({
									link: secondaryButtonLink,
									text: secondaryButtonText,
									bg: secondaryButtonColor,
									hBg: secondaryButtonHoverColor,
									clr: secondaryButtonTextColor,
									hClr: secondaryButtonTextHoverColor,
									pad: secondaryButtonPadding,
									mPad: secondaryButtonMobilePadding,
									brd: secondaryButtonBorder,
								})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// --- FRONTEND DOM INITIALIZATION ---
if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-blog-auto-scroller-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-blog-auto-scroller-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
