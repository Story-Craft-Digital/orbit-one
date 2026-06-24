import React, {
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
} from "react";
import { createRoot } from "react-dom/client";

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

/**
 * Gets the first solid color from a resolved color string (for fade effects).
 * @param {string} colorValue The saved attribute value (e.g., "primary" or "#FFF")
 * @param {string} fallback The fallback *solid* color (e.g., "#FFFFFF")
 * @returns {string} A valid CSS *solid* color (hex, rgb, or named).
 */
const getSolidColorForFade = (colorValue, fallback = "#FFFFFF") => {
	// This function is fine because it uses our now-fixed resolveColor()
	let resolved = resolveColor(colorValue, fallback);

	// 2. Handle gradients (find first color)
	if (resolved.includes("gradient")) {
		const match = resolved.match(
			/(#(?:[0-9a-fA-F]{3}){1,2}|rgb(a)?\([\d\s.,%]+\))/,
		);
		if (match) {
			resolved = match[0];
		} else {
			resolved = fallback; // Fallback if gradient is complex
		}
	}

	// 3. Handle 'transparent'
	if (resolved === "transparent") {
		return fallback;
	}

	return resolved;
};

/**
 * Main Auto-Scrolling Carousel Component
 */
function Component({ attributes, useEditor = false, onSlideClick = () => {} }) {
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
		slidesColor,
		slideNameFontSize,
		slideNameLineHeight,
		slideNameBold,
		slideNameItalics,
		slideNameUnderline,
		slideBorderRadius,
		minSlidesToShow,
		slideWidth,
		slideGap,
		scrollSpeed,
		slides = [],
	} = attributes;

	const carouselRefs = useRef([]);

	const presetSlideHeight = 120;
	const presetSlideWidth = 210;
	const aspectRatio = presetSlideHeight / presetSlideWidth;

	const [dimensions, setDimensions] = useState({
		cardWidth: presetSlideWidth,
		cardHeight: presetSlideHeight,
		fontScale: 1,
	});

	const containerRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);

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
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const currentWidth = entry.contentRect.width;
				setIsMobile(currentWidth <= 768); // ✅ Mobile breakpoint set manually
			}
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [containerRef]);

	useEffect(() => {
		const updateDimensions = () => {
			const containerWidth = carouselRefs.current[0]?.offsetWidth || 0;
			const userSetWidth = slideWidth || presetSlideWidth;
			const fullSlideWidth = userSetWidth;
			const aspectRatio = presetSlideHeight / presetSlideWidth; // maintain ratio

			const baseRequiredWidth =
				fullSlideWidth * minSlidesToShow + (minSlidesToShow - 1) * slideGap;

			let newDims;
			if (containerWidth < baseRequiredWidth) {
				const roughAdjustedWidth = containerWidth / minSlidesToShow;
				const fontScale = roughAdjustedWidth / presetSlideWidth;

				const scaledGap = slideGap * fontScale;
				const totalGap = (minSlidesToShow - 1) * scaledGap;
				const adjustedWidth = (containerWidth - totalGap) / minSlidesToShow;

				newDims = {
					cardWidth: adjustedWidth,
					cardHeight: adjustedWidth * aspectRatio,
					fontScale,
				};
			} else {
				newDims = {
					cardWidth: fullSlideWidth,
					cardHeight: fullSlideWidth * aspectRatio,
					fontScale: 1,
				};
			}

			setDimensions(newDims);
		};

		requestAnimationFrame(updateDimensions);
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, [minSlidesToShow, slideGap, slideWidth]);

	// ✅ Updated useEffect for independent, reliable scrolling
	useEffect(() => {
		// Only start if both refs are assigned
		if (
			carouselRefs.current.length < 2 ||
			!carouselRefs.current[0] ||
			!carouselRefs.current[1]
		)
			return;

		let scrollPos1 = 0;
		// Start row 2 at the end so it can scroll backwards immediately
		let scrollPos2 =
			carouselRefs.current[1].scrollWidth - carouselRefs.current[1].clientWidth;

		let animationId;

		const animate = () => {
			const row1 = carouselRefs.current[0];
			const row2 = carouselRefs.current[1];

			if (row1 && row2) {
				const maxScroll1 = row1.scrollWidth - row1.clientWidth;
				const maxScroll2 = row2.scrollWidth - row2.clientWidth;

				// Row 1: Forward
				scrollPos1 += scrollSpeed;
				if (scrollPos1 >= maxScroll1) {
					scrollPos1 = 0;
				}
				row1.scrollLeft = scrollPos1;

				// Row 2: Backward
				scrollPos2 -= scrollSpeed;
				if (scrollPos2 <= 0) {
					scrollPos2 = maxScroll2;
				}
				row2.scrollLeft = scrollPos2;
			}

			animationId = requestAnimationFrame(animate);
		};

		animationId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationId);
	}, [scrollSpeed, slides, dimensions]); // Added dimensions so it restarts if layout changes

	const loopedItems = useMemo(
		() => [
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
			...slides,
		],
		[slides],
	);

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

	useEffect(() => {
		// Only run on frontend, not inside editor
		if (useEditor || !blockId) return;

		const blockSlug = "oone-brand-slide-carousel";
		const existingScriptId = `${blockSlug}-schema-${blockId}`;

		// Avoid duplicates on re-renders
		if (document.getElementById(existingScriptId)) return;

		// Build schema for each slide
		const itemListElements = slides.map((slide, index) => {
			const organizationSchema = {
				"@type": "Organization",
				name: slide.name || "Unnamed Brand",
			};

			// ✅ Logo as proper ImageObject (with alt text if available)
			if (slide.image) {
				organizationSchema.logo = {
					"@type": "ImageObject",
					url: slide.image,
					...(slide.imgAlt ? { alternateName: slide.imgAlt } : {}),
				};
			}

			// ✅ Optional brand link
			if (slide.link && slide.link.trim() !== "" && slide.link.trim() !== "#") {
				organizationSchema.url = slide.link;
			}

			return {
				"@type": "ListItem",
				position: index + 1,
				item: organizationSchema,
			};
		});

		// ✅ Main ItemList schema
		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name:
				[titleOne, titleTwo].filter(Boolean).join(" ") ||
				"Our Partners and Brands",
			description:
				"A showcase of our trusted partners, clients, and brand collaborations.",
			itemListElement: itemListElements,
		};

		// ✅ Inject structured data
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = existingScriptId;
		script.innerHTML = JSON.stringify(schema, null, 2);
		document.head.appendChild(script);

		// ✅ Cleanup on unmount/update
		return () => {
			const scriptTag = document.getElementById(existingScriptId);
			if (scriptTag) scriptTag.remove();
		};
	}, [slides, titleOne, titleTwo, blockId, useEditor]);

	// 🎨 Get the resolved background color once
	const resolvedBgColor = resolveColor(backgroundColor, "transparent");

	return (
		<div
			ref={containerRef}
			style={{
				background: resolvedBgColor,
				padding: getBoxModelString(isMobile ? mobilePadding : padding),
			}}
		>
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Render caption only if it exists */}
				{caption && (
					<h3
						style={{
							width: "100%",
							fontWeight: captionBold ? "bold" : "normal",
							fontStyle: captionItalics ? "italic" : "normal",
							textDecoration: captionUnderline ? "underline" : "none",
							textAlign: captionAlign || "center",
							fontSize: `${captionFontSize * dimensions.fontScale}px`,
							margin: 0,
							lineHeight: captionLineHeight,
							padding: getScaledBoxModelString(
								captionPadding,
								dimensions.fontScale,
							),
							color: resolveColor(captionColor, "#000"),
						}}
					>
						{caption}
					</h3>
				)}

				{/* Render subtitles only if at least one exists */}
				{(titleOne || titleTwo) && (
					<h2
						style={{
							width: "100%",
							fontWeight: titleBold ? "bold" : "normal",
							fontStyle: titleItalics ? "italic" : "normal",
							textDecoration: titleUnderline ? "underline" : "none",
							textAlign: titleAlign || "center",
							fontSize: `${titleFontSize * dimensions.fontScale}px`,
							margin: 0,
							lineHeight: titleLineHeight,
							padding: getScaledBoxModelString(
								titlePadding,
								dimensions.fontScale,
							),
							color: resolveColor(titleColor, "#000"),
						}}
					>
						{titleOne} {titleOne && titleTwo && <br />} {titleTwo}
					</h2>
				)}
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: `${dimensions.fontScale * slideGap}px`,
				}}
			>
				{[0, 1].map((sectionIndex) => {
					// ✅ Create offset only for 2nd row
					const offset = Math.floor(slides.length / 2);

					const rowItems =
						sectionIndex === 0
							? loopedItems
							: [...loopedItems.slice(offset), ...loopedItems.slice(0, offset)];

					return (
						<div
							key={sectionIndex}
							style={{
								position: "relative",
								width: "100%",
								overflow: "hidden",
							}}
						>
							<div
								ref={(el) => (carouselRefs.current[sectionIndex] = el)}
								style={{
									display: "flex",
									overflowX: "auto",
									gap: `${(dimensions.fontScale * slideGap) / 2}px`,
									scrollbarWidth: "none",
									msOverflowStyle: "none",
									maskImage:
										"linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
								}}
							>
								{rowItems.map((item, idx) => (
									<a
										key={idx}
										href={useEditor ? "#" : item.link}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(e) => {
											if (useEditor) {
												e.preventDefault();
												onSlideClick(idx % slides.length);
											}
										}}
										style={{
											textDecoration: "none",
											cursor: "pointer",
											flex: "0 0 auto",
											width: `${dimensions.cardWidth}px`,
											minWidth: `${dimensions.cardWidth}px`,
											height: `${dimensions.cardHeight}px`,
											scrollSnapAlign: "start",
											borderRadius: getBorderRadiusString(slideBorderRadius),
											background: resolveColor(slidesColor, "transparent"),
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											transition: "transform 0.3s ease",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "scale(1.05)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "scale(1)";
										}}
									>
										{/* Logo + Name Wrapper */}
										<div
											style={{
												width: "100%",
												height: "100%",
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<img
												src={getResolvedAsset(item.image)}
												alt={item.imgAlt || item.name || "Brand Logo"}
												style={{
													width: "100%",
													height: "100%",
													objectFit: "contain",
												}}
											/>

											{/* Optional Company Name */}
											{item.name && (
												<span
													style={{
														fontWeight: slideNameBold ? "bold" : "normal",
														fontStyle: slideNameItalics ? "italic" : "normal",
														textDecoration: slideNameUnderline
															? "underline"
															: "none",
														fontSize: `${
															slideNameFontSize * dimensions.fontScale
														}px`,
														margin: 0,
														lineHeight: slideNameLineHeight,
														color: resolveColor(slideNameColor, "#000"),
													}}
												>
													{item.name}
												</span>
											)}
										</div>
									</a>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-brand-slide-carousel-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-brand-slide-carousel-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
