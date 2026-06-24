import React, {
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
} from "react";
import { createRoot } from "react-dom/client";

/**
 * ✅ Resolves palette-based or gradient colors
 */
const resolveColor = (colorValue, fallback = "inherit") => {
	const oonePalette = window.oonePalette || {};
	if (!colorValue) {
		return colorValue === undefined ? fallback : "transparent";
	}

	if (oonePalette[colorValue]) return oonePalette[colorValue];

	if (typeof colorValue === "string" && colorValue.includes("gradient")) {
		let resolvedGradient = colorValue.replace(
			/(primary|secondary|accent|neutral|light|white)/g,
			(match) => oonePalette[match] || match,
		);
		return resolvedGradient;
	}

	return colorValue;
};

function StarIcon({ size, color, fillPercentage, index }) {
	const gradientId = `starGradient-${index}`;
	return (
		<svg
			viewBox="0 0 576 512"
			width={size}
			height={size}
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				<linearGradient id={gradientId}>
					<stop offset="0%" stopColor={color} />
					<stop offset={`${fillPercentage}%`} stopColor={color} />
					<stop offset={`${fillPercentage}%`} stopColor="#ccc" />
					<stop offset="100%" stopColor="#ccc" />
				</linearGradient>
			</defs>
			<path
				d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
				fill={`url(#${gradientId})`}
			/>
		</svg>
	);
}

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

	const presetSlideWidth = 350;
	const aspectRatio = 180 / 350; // maintain ratio baseline

	const [dimensions, setDimensions] = useState({
		cardWidth: presetSlideWidth,
		fontScale: 1,
	});

	const [maxSlideHeight, setMaxSlideHeight] = useState(0);
	const slideRefs = useRef([]);

	const containerRef = useRef(null);
	const ref1 = useRef(null);
	const ref2 = useRef(null);

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

	// ✅ Responsive width tracking
	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const currentWidth = entry.contentRect.width;
				setIsMobile(currentWidth <= 768);
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// ✅ Handle width scaling and font scaling only
	useEffect(() => {
		const updateDimensions = () => {
			const containerWidth = ref1.current?.offsetWidth || 0;
			const userSetWidth = slideWidth || presetSlideWidth;
			const fullSlideWidth = userSetWidth;
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
					fontScale,
				};
			} else {
				newDims = {
					cardWidth: fullSlideWidth,
					fontScale: 1,
				};
			}
			setDimensions(newDims);
		};

		requestAnimationFrame(updateDimensions);
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, [minSlidesToShow, slideGap, slideWidth]);

	// ✅ Auto-scroll animations
	useEffect(() => {
		const autoScroll = (ref, direction = "left") => {
			let scrollPos = 0;
			const step = scrollSpeed;
			const scroll = () => {
				if (ref.current) {
					if (direction === "left") {
						scrollPos += step;
						if (
							scrollPos >=
							ref.current.scrollWidth - ref.current.clientWidth
						) {
							scrollPos = 0;
						}
					} else {
						scrollPos -= step;
						if (scrollPos <= 0) {
							scrollPos = ref.current.scrollWidth - ref.current.clientWidth;
						}
					}
					ref.current.scrollLeft = scrollPos;
				}
				requestAnimationFrame(scroll);
			};
			scroll();
		};
		autoScroll(ref1, "left");
		setTimeout(() => autoScroll(ref2, "right"), 90);
	}, []);

	// ✅ Dynamically compute tallest slide height based on visible content
	useEffect(() => {
		if (useEditor) return;
		if (!slideRefs.current.length) return;

		const updateHeights = () => {
			const heights = slideRefs.current
				.map((ref) => (ref ? ref.scrollHeight : 0))
				.filter((h) => h > 0);

			if (heights.length === 0) return;
			const tallest = Math.max(...heights);
			setMaxSlideHeight(tallest); // purely content-based
		};

		updateHeights();

		const resizeObserver = new ResizeObserver(updateHeights);
		slideRefs.current.forEach((ref) => ref && resizeObserver.observe(ref));

		window.addEventListener("resize", updateHeights);
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateHeights);
		};
	}, [slides, dimensions.cardWidth, dimensions.fontScale]);

	// ✅ Double slides for looping
	const loopedItems = useMemo(() => [...slides, ...slides, ...slides, ...slides, ...slides, ...slides, ...slides, ...slides, ...slides, ...slides], [slides]);

	// ✅ Utility functions
	const getBoxModelString = (obj) =>
		obj ? `${obj.top}px ${obj.right}px ${obj.bottom}px ${obj.left}px` : "0px";

	const getScaledBoxModelString = (obj, scale = 1) =>
		obj
			? `${(obj.top || 0) * scale}px ${(obj.right || 0) * scale}px ${
					(obj.bottom || 0) * scale
			  }px ${(obj.left || 0) * scale}px`
			: "0px";

	const getBorderRadiusString = (obj) =>
		obj
			? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
			: "0px";

	useEffect(() => {
		// Prevent execution in editor mode
		if (useEditor || !blockId) return;

		const blockSlug = "oone-testimonials-carousel";
		const existingScriptId = `${blockSlug}-schema-${blockId}`;

		// Prevent duplicates
		if (document.getElementById(existingScriptId)) return;

		// Build review list
		const itemListElements = slides.map((slide, index) => {
			const reviewSchema = {
				"@type": "Review",
				author: {
					"@type": "Person",
					name: slide.name,
					image: {
						"@type": "ImageObject",
						url: slide.image || "https://example.com/default-avatar.jpg",
						description: slide.imgAlt || slide.name,
					},
				},
				reviewBody: slide.text,
				reviewRating: {
					"@type": "Rating",
					ratingValue: slide.rating || 0,
					bestRating: 5,
					worstRating: 1,
				},
				itemReviewed: {
					"@type": reviewedEntityType || "LocalBusiness",
					name: reviewedEntityName || "Our Company",
				},
			};

			// Add reviewer link if available
			if (slide.link && slide.link.trim() !== "" && slide.link.trim() !== "#") {
				reviewSchema.author.url = slide.link;
			}

			return {
				"@type": "ListItem",
				position: index + 1,
				item: reviewSchema,
			};
		});

		// Wrap in ItemList
		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name:
				[titleOne, titleTwo].filter(Boolean).join(" ") ||
				"Customer Testimonials",
			description:
				"Authentic customer testimonials and ratings about our services and support.",
			itemListElement: itemListElements,
		};

		// Inject script
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = existingScriptId;
		script.innerHTML = JSON.stringify(schema, null, 2);

		document.head.appendChild(script);

		return () => {
			const scriptTag = document.getElementById(existingScriptId);
			if (scriptTag) scriptTag.remove();
		};
	}, [
		slides,
		titleOne,
		titleTwo,
		reviewedEntityType,
		reviewedEntityName,
		blockId,
		useEditor,
	]);

	return (
		<div
			ref={containerRef}
			style={{
				background: resolveColor(backgroundColor, "transparent"),
				padding: getBoxModelString(isMobile ? mobilePadding : padding),
			}}
		>
			{/* Header section */}
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
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

			{/* Slides */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: `${dimensions.fontScale * slideGap - 15}px`,
				}}
			>
				{[ref1, ref2].map((ref, sectionIndex) => (
					<div
						key={sectionIndex}
						style={{ position: "relative", width: "100%", overflow: "hidden" }}
					>
						<div
							ref={ref}
							style={{
								display: "flex",
								alignItems: "stretch",
								padding: "0 8px 15px",
								overflowX: "auto",
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								gap: `${dimensions.fontScale * slideGap}px`,
								maskImage:
									"linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
								WebkitMaskImage:
									"linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
							}}
						>
							{loopedItems.map((item, idx) => (
								<a
									href={useEditor ? "#" : item.link}
									target="_blank"
									rel="noopener noreferrer"
									key={`${blockId}-slide-${sectionIndex}-${idx}-${item.name}`}
									onClick={(e) => {
										if (useEditor) {
											e.preventDefault();
											onSlideClick(idx % slides.length);
										}
									}}
									style={{
										textDecoration: "none",
										cursor: "pointer",
										display: "flex",
										flexDirection: "column",
										flex: "0 0 auto",
										height: "auto",
										width: `${dimensions.cardWidth}px`,
										minWidth: `${dimensions.cardWidth}px`,
									}}
								>
									<div
										ref={(el) => (slideRefs.current[idx] = el)}
										style={{
											flex: "1 1 auto",
											width: "100%",
											height: maxSlideHeight ? `${maxSlideHeight}px` : "auto",
											minHeight: `${dimensions.cardWidth * aspectRatio}px`,
											padding: getScaledBoxModelString(
												slidePadding,
												dimensions.fontScale,
											),
											gap: `${slideContentGap * dimensions.fontScale * 0.6}px`,
											minHeight: `${dimensions.cardWidth * aspectRatio}px`,
											borderRadius: getBorderRadiusString(slideBorderRadius),
											border: "1px solid rgba(102, 102, 139, 0.24)",
											background: resolveColor(slideBackgroundColor, "#fff"),
											boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
											display: "flex",
											flexDirection: "column",
											justifyContent: "space-between",
											overflow: "hidden",
										}}
									>
										<div>
											<p
												style={{
													fontWeight: slideTextBold ? "bold" : "normal",
													fontStyle: slideTextItalics ? "italic" : "normal",
													textDecoration: slideTextUnderline
														? "underline"
														: "none",
													fontSize: `${
														slideTextFontSize * dimensions.fontScale
													}px`,
													lineHeight: slideTextLineHeight,
													color: resolveColor(slideTextColor, "#333"),
													margin: 0,
												}}
											>
												{item.text}
											</p>
										</div>

										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: `${slideContentGap * dimensions.fontScale}px`,
											}}
										>
											{item.image ? (
												<img
													src={getResolvedAsset(item.image)}
													alt={item.imgAlt || item.name}
													style={{
														width: `${slideImageSize * dimensions.fontScale}px`,
														height: `${
															slideImageSize * dimensions.fontScale
														}px`,
														borderRadius: "50%",
														border: `1px solid ${resolveColor(slideNameColor)}`,
														objectFit: "cover",
													}}
												/>
											) : (
												<div
													style={{
														width: `${slideImageSize * dimensions.fontScale}px`,
														height: `${
															slideImageSize * dimensions.fontScale
														}px`,
														borderRadius: "50%",
														border: `1px solid ${resolveColor(slideNameColor)}`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														backgroundColor: "#f3f3f3",
														color: resolveColor(slideNameColor),
														fontWeight: "bold",
														fontSize: `${
															slideImageSize * dimensions.fontScale * 0.5
														}px`,
														textTransform: "uppercase",
													}}
												>
													{item.name?.[0] || "?"}
												</div>
											)}

											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: `${
														slideContentGap * dimensions.fontScale * 0.5
													}px`,
												}}
											>
												<span
													style={{
														color: resolveColor(slideNameColor),
														fontWeight: slideNameBold ? "bold" : "normal",
														fontStyle: slideNameItalics ? "italic" : "normal",
														textDecoration: slideNameUnderline
															? "underline"
															: "none",
														fontSize: `${
															slideNameFontSize * dimensions.fontScale
														}px`,
														lineHeight: slideNameLineHeight,
													}}
												>
													{item.name}
												</span>
												<div style={{ display: "flex", gap: "4px" }}>
													{Array.from({ length: 5 }, (_, i) => {
														let fillPercent = 0;
														if (i + 1 <= item.rating) fillPercent = 100;
														else if (i < item.rating)
															fillPercent = (item.rating - i) * 100;
														return (
															<StarIcon
																key={`${blockId}-star-${sectionIndex}-${idx}-${i}`}
																index={`${blockId}-rating-${sectionIndex}-${idx}-${i}`}
																size={slideRatingSize * dimensions.fontScale}
																color={slideRatingColor || "#F3BE00"}
																fillPercentage={fillPercent}
															/>
														);
													})}
												</div>
											</div>
										</div>
									</div>
								</a>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-testimonials-carousel-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-testimonials-carousel-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
