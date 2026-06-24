import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";

// ADD THESE LINES
// --- Get Shared Libraries from Core ---
const oone = window.oone_shared || {};

// Destructure the libraries you need
const { motion: motionLib, icons } = oone;

// Get specific components from the libraries
const { motion, AnimatePresence } = motionLib || {};
const { FaArrowRight, FaArrowLeft } = icons?.fa || {};
// --- End Shared Libraries ---

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
		// 'linear-gradient(90deg, primary, accent)' -> 'linear-gradient(90deg, #9813ca, #2e1065)'
		return resolvedGradient;
	}

	// 3. It's already a valid hex, rgb, or full CSS gradient
	return colorValue;
};

const toRgba = (colorValue, alpha = 1) => {
	const resolved = resolveColor(colorValue);
	if (resolved.includes("gradient")) return resolved;
	let hex = resolved.replace("#", "");
	if (hex.length === 3)
		hex = hex
			.split("")
			.map((ch) => ch + ch)
			.join("");
	const num = parseInt(hex, 16);
	const r = (num >> 16) & 0xff;
	const g = (num >> 8) & 0xff;
	const b = num & 0xff;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ✅ Utils
const getBoxModelString = (obj) =>
	obj ? `${obj.top}px ${obj.right}px ${obj.bottom}px ${obj.left}px` : "0px";

const getScaledBoxModelString = (obj, scale = 1) => {
	if (!obj) {
		return "0px";
	}

	// Apply scale to each value, defaulting to 0 if a property is missing
	const top = (obj.top || 0) * scale;
	const right = (obj.right || 0) * scale;
	const bottom = (obj.bottom || 0) * scale;
	const left = (obj.left || 0) * scale;

	return `${top}px ${right}px ${bottom}px ${left}px`;
};
const getBorderRadiusString = (obj) =>
	obj
		? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
		: "0px";

function Component({ attributes, useEditor = false, onSlideClick = () => {} }) {
	const {
		slides = [],
		titleFontSize = 58,
		descriptionFontSize = 30,
		buttonFontSize = 22,
		titleBold = false,
		titleItalics = false,
		titleUnderline = false,
		descriptionBold = false,
		descriptionItalics = false,
		descriptionUnderline = false,
		buttonBold = false,
		buttonItalics = false,
		buttonUnderline = false,
		uniteSlideSettings = false,
		overlayColor = "light",
		overlayOpacity = 0.7,
		buttonsBorderRadius = 50,
		padding = 100,
		mobilePadding = 50,
		titleLineHeight = 1.2,
		descriptionMargin = 30,
		titlePadding = 0,
		titleAlign = "left",
		buttonsAlign = "left",
		descriptionLineHeight = 1.5,
		descriptionAlign = "left",
		slideTitleColor = "accent",
		slideDescriptionColor = "neutral",
		slideBtn1textColor = "white",
		slideBtn2textColor = "primary",
		slideBtn1Color = "primary",
		slideBtn2Color = "secondary",
		arrowColor = "white",
		arrowBgColor = "neutral",
		buttonSize = "40",
		scrollSpeed = 0.5,
	} = attributes;

	const [current, setCurrent] = useState(0);
	const [imageIndex, setImageIndex] = useState(0);
	const [scale, setScale] = useState(1);
	const autoSlideTimerRef = useRef(null);

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

	const darkenColor = (hex) => {
		if (!hex || hex.includes("gradient")) return hex;
		let c = hex.replace("#", "");
		if (c.length === 3)
			c = c
				.split("")
				.map((ch) => ch + ch)
				.join("");
		const num = parseInt(c, 16);
		const r = Math.max(0, (num >> 16) & (0xff - 30));
		const g = Math.max(0, ((num >> 8) & 0xff) - 30);
		const b = Math.max(0, (num & 0xff) - 30);
		return `rgb(${r}, ${g}, ${b})`;
	};

	useEffect(() => {
		const handleResize = () => {
			const w = window.innerWidth;
			setScale(w < 480 ? 0.55 : w < 768 ? 0.7 : w < 1024 ? 0.85 : 1);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	// 💡 This is the new, combined function to start the timer
	const startAutoSlide = () => {
		if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current); // 💡 Use new ref name

		// 💡 This is the new logic
		if (scrollSpeed > 0 && slides.length > 1) {
			// 💡 Check for positive speed and not in editor
			const interval = (5.1 - scrollSpeed) * 1000; // 💡 Use scrollSpeed correctly
			autoSlideTimerRef.current = setInterval(() => {
				// 💡 Use new ref name

				// 💡 We use nested functional state updaters
				// 💡 This is the 100% correct React way to prevent "stale state" bugs
				setImageIndex((prevImageIndex) => {
					let nextImageIndex; // 💡 Declare a variable to hold the next index

					setCurrent((prevCurrent) => {
						const currentSlide = slides[prevCurrent]; // 💡 Get the *actual* current slide
						const hasMultipleImages = currentSlide?.images?.length > 1; // 💡 Check if it has images

						if (
							hasMultipleImages &&
							prevImageIndex < currentSlide.images.length - 1
						) {
							// 💡 --- Case 1: It has images, and this is NOT the last image ---
							nextImageIndex = prevImageIndex + 1; // 💡 Set the next image index
							return prevCurrent; // 💡 Keep the slide the same
						} else {
							// 💡 --- Case 2: It's the last image OR this slide has no images ---
							nextImageIndex = 0; // 💡 Reset image index
							return (prevCurrent + 1) % slides.length; // 💡 Go to the next slide
						}
					});

					return nextImageIndex; // 💡 Return the new image index
				});
			}, interval);
		}
	};

	// 💡 This function is now simplified to only use the one timer
	const resetAutoSlide = () => {
		if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current); // 💡 Use new ref name
		// if (imageCycleRef.current) clearInterval(imageCycleRef.current); 💡 (This line is deleted)
		startAutoSlide();
	};

	const nextSlide = () => {
		setCurrent((prev) => (prev + 1) % slides.length);
		setImageIndex(0);
		resetAutoSlide();
	};

	const prevSlide = () => {
		setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
		setImageIndex(0);
		resetAutoSlide();
	};

	useEffect(() => {
		startAutoSlide();
		return () => {
			if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current); // 💡 Use new ref name
			// if (imageCycleRef.current) clearInterval(imageCycleRef.current); 💡 (This line is deleted)
		};
	}, [scrollSpeed, slides.length, useEditor]);

	const slide = slides[current] || {};
	const contentPadding =
		scale < 0.8
			? getScaledBoxModelString(mobilePadding, scale)
			: getScaledBoxModelString(padding, scale);

	// Handle buttons with flat properties
	const buttons = [];
	if (slide.btn1text) {
		buttons.push({
			text: slide.btn1text,
			link: slide.btn1link || "#",
			color: slide.btn1Color,
			textColor: uniteSlideSettings
				? resolveColor(slideBtn1textColor)
				: resolveColor(slide.btn1textColor || slideBtn1textColor),
			type: 1,
		});
	}
	if (slide.btn2text) {
		buttons.push({
			text: slide.btn2text,
			link: slide.btn2link || "#",
			color: slide.btn2Color,
			textColor: uniteSlideSettings
				? resolveColor(slideBtn2textColor)
				: resolveColor(slide.btn2textColor || slideBtn2textColor), // Pass individual text color
			type: 2,
		});
	}

	const overlayRgba1 = toRgba(overlayColor, overlayOpacity);
	const overlayRgba2 = toRgba(overlayColor, overlayOpacity * 0.6);

	// Resolve colors respecting uniteSlideSettings
	const titleColor = uniteSlideSettings
		? resolveColor(slideTitleColor)
		: resolveColor(slide.titleColor || slideTitleColor);

	const descriptionColor = uniteSlideSettings
		? resolveColor(slideDescriptionColor)
		: resolveColor(slide.descriptionColor || slideDescriptionColor);

	const titleStyle = {
		fontSize: `${titleFontSize * scale}px`,
		lineHeight: titleLineHeight,
		fontWeight: titleBold ? 700 : 400,
		fontStyle: titleItalics ? "italic" : "normal",
		textDecoration: titleUnderline ? "underline" : "none",
		color: titleColor,
		letterSpacing: "0.5px",
		textAlign: titleAlign,
		padding: getScaledBoxModelString(titlePadding, scale),
		transition: "all 0.3s ease",
	};

	const descriptionStyle = {
		fontSize: `${descriptionFontSize * scale}px`,
		lineHeight: descriptionLineHeight,
		maxWidth: `${800 * scale}px`,
		color: descriptionColor,
		fontWeight: descriptionBold ? 700 : 400,
		fontStyle: descriptionItalics ? "italic" : "normal",
		textDecoration: descriptionUnderline ? "underline" : "none",
		transition: "all 0.3s ease",
		display: "inline-block", // This allows the parent to align it
	};

	const descriptionContainerStyle = {
		margin: getScaledBoxModelString(descriptionMargin, scale),
		textAlign: descriptionAlign,
		width: "100%", // Make sure it takes the full width
	};

	const buttonBaseStyle = {
		display: "inline-block",
		fontSize: `${buttonFontSize * scale}px`,
		padding: `${10 * scale}px ${20 * scale}px`,
		borderRadius: getBorderRadiusString(buttonsBorderRadius),
		fontWeight: buttonBold ? 700 : 600,
		fontStyle: buttonItalics ? "italic" : "normal",
		textDecoration: buttonUnderline ? "underline" : "none",
		cursor: "pointer",
		transition: "all 0.3s ease",
		boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
	};

	const buttonsContainerStyle = {
		display: "flex",
		gap: `${20 * scale}px`,
		alignItems: "center",
		flexWrap: "wrap",
		width: "100%", // Ensures the container spans the full width
		// 💡 This line maps your 'buttonsAlign' attribute to the correct CSS
		justifyContent:
			buttonsAlign === "center"
				? "center"
				: buttonsAlign === "right"
				? "flex-end"
				: "flex-start",

		margin: getScaledBoxModelString(descriptionMargin, scale),
	};

	const arrowBaseStyle = {
		position: "absolute",
		zIndex: 50,
		color: resolveColor(arrowColor),
		top: "50%",
		transform: "translateY(-50%)",
		background: toRgba(arrowBgColor, 0.5),
		borderRadius: "50%",
		border: "none",
		cursor: "pointer",
		transition: "all 0.3s ease",

		// 💡 --- START OF CHANGES ---
		width: `${buttonSize * scale}px`, // Use buttonSize for width
		height: `${buttonSize * scale}px`, // Use buttonSize for height
		padding: 0, // Set padding to 0
		display: "flex", // Add flex properties to center the icon
		alignItems: "center",
		justifyContent: "center",
		fontSize: `${buttonSize * 0.5 * scale}px`, // Make icon size relative (0.5 = 50%)
		// 💡 --- END OF CHANGES ---
	};

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				overflow: "hidden",
				height: `${90 * scale}vh`,
				transition: "height 0.3s ease",
			}}
		>
			{/* Background Images */}
			<AnimatePresence>
				{slides[current]?.images?.[imageIndex] && (
					<motion.div
						key={`${current}-${imageIndex}`}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundSize: "cover",
							backgroundPosition: "center",
							pointerEvents: "none",
							backgroundImage: `url(${getResolvedAsset(
								slides[current].images[imageIndex],
							)})`,
							filter: "brightness(0.9)",
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1 }}
					/>
				)}
			</AnimatePresence>

			{/* Gradient Overlay */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `linear-gradient(to right, ${overlayRgba1}, ${overlayRgba2}, transparent)`,
					pointerEvents: "none",
				}}
			/>

			{/* Content */}
			<div
				style={{
					position: "absolute",
					left: `${60 * scale}px`,
					width: `calc(100% - ${120 * scale}px)`,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					color: "#ffffff",
					pointerEvents: "auto",
					padding: contentPadding,
					zIndex: 10,
					transition: "all 0.3s ease",
				}}
			>
				<motion.h2
					style={titleStyle}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					{slide.title}
				</motion.h2>

				<motion.div
					style={descriptionContainerStyle}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<p style={descriptionStyle}>{slide.description}</p>
				</motion.div>

				{buttons.length > 0 && (
					<div style={buttonsContainerStyle}>
						{buttons.map((btn, i) => {
							let baseColor;
							if (uniteSlideSettings) {
								baseColor = resolveColor(
									btn.type === 1 ? slideBtn1Color : slideBtn2Color,
									"#2563eb",
								);
							} else {
								baseColor = resolveColor(
									btn.color ||
										(btn.type === 1 ? slideBtn1Color : slideBtn2Color),
									"#2563eb",
								);
							}
							return (
								<a
									key={i}
									href={btn.link}
									style={{
										...buttonBaseStyle,
										background: baseColor,
										color: btn.textColor,
									}}
									onMouseEnter={(e) => {
										const hoverColor = baseColor.includes("gradient")
											? baseColor
											: darkenColor(baseColor);
										e.currentTarget.style.background = hoverColor;
										e.currentTarget.style.transform = "translateY(-2px)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = baseColor;
										e.currentTarget.style.transform = "translateY(0)";
									}}
								>
									{btn.text}
								</a>
							);
						})}
					</div>
				)}
			</div>

			<button
				onClick={prevSlide}
				style={{
					...arrowBaseStyle,
					left: `${20 * scale}px`,
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = toRgba(arrowBgColor, 0.8);
					e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = toRgba(arrowBgColor, 0.5);
					e.currentTarget.style.transform = "translateY(-50%)";
				}}
				aria-label="Previous Slide"
			>
				<FaArrowLeft />
			</button>

			<button
				onClick={nextSlide}
				style={{
					...arrowBaseStyle,
					right: `${20 * scale}px`,
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = toRgba(arrowBgColor, 0.8);
					e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = toRgba(arrowBgColor, 0.5);
					e.currentTarget.style.transform = "translateY(-50%)";
				}}
				aria-label="Next Slide"
			>
				<FaArrowRight />
			</button>

			{/* Dots */}
			{slides.length > 1 && (
				<div
					style={{
						position: "absolute",
						bottom: scale < 0.7 ? "20px" : `${30 * scale}px`, // Increased distance from bottom
						width: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: "12px", // Fixed gap for better touch precision
						zIndex: 100, // Higher z-index to stay above everything
						pointerEvents: "auto",
					}}
				>
					{slides.map((_, i) => (
						<button
							key={i}
							onClick={(e) => {
								e.stopPropagation();
								setCurrent(i);
								setImageIndex(0);
								resetAutoSlide();
							}}
							style={{
								// FIXED Dimensions to prevent oval stretching
								width: "10px",
								height: "10px",
								padding: 0,
								margin: 0,
								borderRadius: "50%",
								// Colors: White with a subtle dark border for visibility on light images
								background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
								border:
									i === current
										? "1px solid rgba(0,0,0,0.1)"
										: "1px solid rgba(0,0,0,0.05)",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Added shadow for "depth"
								cursor: "pointer",
								transition: "all 0.3s ease",
								transform: i === current ? "scale(1.3)" : "scale(1)",
								flexShrink: 0, // CRITICAL: Prevents them from turning into ovals
							}}
							aria-label={`Go to slide ${i + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// --- FRONTEND DOM INITIALIZATION ---
if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-multi-image-hero-carousel-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-multi-image-hero-carousel-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
