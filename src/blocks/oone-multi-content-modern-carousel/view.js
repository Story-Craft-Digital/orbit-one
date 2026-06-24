import React, { useCallback, useEffect, useRef, useState } from "react";
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

/**
 * A self-contained Slide component to handle its own hover state.
 */
const Slide = ({
	item,
	index,
	onSlideClick,
	useEditor,
	isDragging,
	didDrag,
	dimensions,
	slideBaseStyle,
	slideTitleStyle,
	additionalStyles,
	slideBorderRadius,
	uniteSlideSettings,
	globalSlideTitleColor,
	globalSlideFilterColor,
	globalSlideBackgroundColor,
	globalSlideFontSize,
}) => {
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

	const getBorderRadiusString = (obj, scale) => {
		if (!obj) return `${16 * scale}px`;
		return `${obj.topLeft * scale}px ${obj.topRight * scale}px ${
			obj.bottomRight * scale
		}px ${obj.bottomLeft * scale}px`;
	};

	const hasLink =
		!useEditor &&
		item.link &&
		item.link.trim() !== "" &&
		item.link.trim() !== "#";

	const Wrapper = hasLink ? "a" : "div";

	const wrapperProps = {
		onClick: (e) => {
			if (useEditor) {
				onSlideClick(index);
				return;
			}
			// If a drag just occurred, prevent the default click action (like following a link).
			if (didDrag) {
				e.preventDefault();
			}
		},
		draggable: "false",
		style: {
			display: "block",
			textDecoration: "none",
			cursor:
				useEditor || hasLink ? "pointer" : isDragging ? "grabbing" : "grab",
		},
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
	};

	// Only add the 'href' attribute if the wrapper is an 'a' tag.
	if (hasLink) {
		wrapperProps.href = item.link;
	}

	const finalBackgroundColor = uniteSlideSettings
		? globalSlideBackgroundColor
		: item.backgroundColor;
	const finalFilterColor = uniteSlideSettings
		? globalSlideFilterColor
		: item.filterColor;
	const finalTitleColor = uniteSlideSettings
		? globalSlideTitleColor
		: item.titleColor;
	const finalFontSize = uniteSlideSettings
		? globalSlideFontSize
		: item.fontSize;

	const dynamicSlideStyle = {
		...slideBaseStyle,
		...additionalStyles,
		width: `${dimensions.cardWidth}px`,
		minWidth: `${dimensions.cardWidth}px`,
		height: `${dimensions.cardHeight}px`,
		borderRadius: getBorderRadiusString(
			slideBorderRadius,
			dimensions.fontScale,
		),
		marginBottom: `${30 * dimensions.fontScale}px`,
		marginTop: `${30 * dimensions.fontScale}px`,
		background: resolveColor(finalBackgroundColor, "#ffffff"),
	};

	const gradientStyle =
		item.textPosition === "top"
			? `linear-gradient(to bottom, ${hexToRgba(
					resolveColor(finalFilterColor),
					0.8,
			  )}, transparent)`
			: `linear-gradient(to top, ${hexToRgba(
					resolveColor(finalFilterColor),
					0.8,
			  )}, transparent)`;

	return (
		<Wrapper {...wrapperProps}>
			<div style={dynamicSlideStyle}>
				{item.image && (
					<img
						src={getResolvedAsset(item.image)}
						alt={item.imgAlt || item.title}
						draggable="false"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							objectFit: "cover",
							pointerEvents: "none",
							borderRadius: getBorderRadiusString(
								slideBorderRadius,
								dimensions.fontScale,
							),
							transition: "transform 0.3s ease-in-out",
							transform: isHovered ? "scale(1.1)" : "scale(1)",
						}}
					/>
				)}
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						backgroundImage: gradientStyle,
						alignItems: "center",
						justifyContent:
							item.textPosition === "top" ? "flex-start" : "flex-end",
						padding: `${25 * dimensions.fontScale}px`,
						borderRadius: getBorderRadiusString(
							slideBorderRadius,
							dimensions.fontScale,
						),
					}}
				>
					<h3
						style={{
							...slideTitleStyle,
							color: resolveColor(finalTitleColor, "#000"),
							maxWidth: `100%`,
							fontSize: `${finalFontSize * dimensions.fontScale}px`,
						}}
					>
						{item.title}
					</h3>
				</div>
			</div>
		</Wrapper>
	);
};

/**
 * Main Carousel Component - Works in both editor and frontend.
 */
function Component({ attributes, useEditor = false, onSlideClick = () => {} }) {
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

	// --- STATE AND REFS ---
	const presetSlideHeight = 450;
	const presetSlideWidth = 320;
	const scrollRef = useRef(null);
	const [progress, setProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const autoScrollInterval = useRef(null);
	const [dimensions, setDimensions] = useState({
		cardWidth: presetSlideWidth,
		cardHeight: presetSlideHeight,
		fontScale: 1,
	});
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(
		slides.length > minSlidesToShow,
	);
	const [targetScroll, setTargetScroll] = useState(0);
	const [didDrag, setDidDrag] = useState(false);

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

	// --- LOGIC HOOKS ---
	useEffect(() => {
		const updateDimensions = () => {
			if (!scrollRef.current) return;
			const containerWidth = scrollRef.current.offsetWidth;
			const baseRequiredWidth =
				presetSlideWidth * minSlidesToShow + (minSlidesToShow - 1) * slideGap;

			if (containerWidth > 0 && containerWidth < baseRequiredWidth) {
				const fontScale = containerWidth / minSlidesToShow / presetSlideWidth;
				const scaledGap = slideGap * fontScale;
				const totalGap = (minSlidesToShow - 1) * scaledGap;
				const adjustedWidth = (containerWidth - totalGap) / minSlidesToShow;
				setDimensions({
					cardWidth: adjustedWidth,
					cardHeight: (adjustedWidth * presetSlideHeight) / presetSlideWidth,
					fontScale,
				});
			} else {
				setDimensions({
					cardWidth: presetSlideWidth,
					cardHeight: presetSlideHeight,
					fontScale: 1,
				});
			}
		};

		const debouncedUpdate = setTimeout(updateDimensions, 50);
		window.addEventListener("resize", updateDimensions);

		return () => {
			clearTimeout(debouncedUpdate);
			window.removeEventListener("resize", updateDimensions);
		};
	}, [minSlidesToShow, slideGap, slides]);

	// ✅ Utils
	const getBoxModelString = (obj) =>
		obj ? `${obj.top}px ${obj.right}px ${obj.bottom}px ${obj.left}px` : "0px";
	const getScaledBoxModelString = (obj, scale = 1) => {
		if (!obj) {
			return "0px";
		}
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

	const getScrollDistance = () =>
		dimensions.cardWidth + dimensions.fontScale * slideGap;

	const scrollLeft = useCallback(() => {
		if (!scrollRef.current) return;
		// Calculate the new target based on the CURRENT scroll position
		const newTargetScroll = scrollRef.current.scrollLeft - getScrollDistance();
		// Update the state; the animation loop will handle the smooth scroll
		setTargetScroll(newTargetScroll);
	}, [dimensions, slideGap]); // Dependencies are correct

	const scrollRight = useCallback(() => {
		if (!scrollRef.current) return;
		// Calculate the new target based on the CURRENT scroll position
		const newTargetScroll = scrollRef.current.scrollLeft + getScrollDistance();
		// Update the state; the animation loop will handle the smooth scroll
		setTargetScroll(newTargetScroll);
	}, [dimensions, slideGap]);

	const handleMouseDown = (e) => {
		if (useEditor) return;
		setIsDragging(true);
		setDidDrag(false); // ✅ Reset drag status on every new click
		const scrollContainer = scrollRef.current;
		if (!scrollContainer) return;

		setStartX(e.pageX - scrollContainer.offsetLeft);
		setScrollPosition(scrollContainer.scrollLeft);
		setTargetScroll(scrollContainer.scrollLeft);
	};

	const handleMouseUp = () => {
		if (useEditor) return;
		setIsDragging(false);
	};

	useEffect(() => {
		const handleKeyDown = (e) => {
			// Do nothing if the mouse is not hovered over the carousel
			if (!isHovered) {
				return;
			}

			// Check which key was pressed
			if (e.key === "ArrowLeft") {
				e.preventDefault(); // Prevent the browser from scrolling the whole page
				scrollLeft();
			} else if (e.key === "ArrowRight") {
				e.preventDefault(); // Prevent the browser from scrolling the whole page
				scrollRight();
			}
		};

		// Add the event listener to the whole document
		document.addEventListener("keydown", handleKeyDown);

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isHovered, scrollLeft, scrollRight]);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!isDragging || !scrollRef.current) return;
			e.preventDefault();
			const x = e.pageX - scrollRef.current.offsetLeft;
			const walk = x - startX;

			// If the mouse has moved more than a few pixels, we consider it a drag
			if (Math.abs(walk) > 5 && !didDrag) {
				setDidDrag(true);
			}

			setTargetScroll(scrollPosition - walk);
		};

		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, startX, scrollPosition, didDrag]);

	// ✅ 1. This hook listens for the wheel and SETS THE TARGET
	useEffect(() => {
		const scrollContainer = scrollRef.current;
		if (!scrollContainer) return;

		const handleWheelScroll = (e) => {
			if (!isHovered) return;

			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
			const scrollAmount = e.deltaX + e.deltaY;

			// --- FINAL FIX LOGIC ---

			// Check if we are trying to scroll "left" (or up with a mouse wheel)
			if (scrollAmount < 0) {
				// If the scroll position is greater than 0, we can scroll left.
				if (scrollLeft > 0) {
					e.preventDefault(); // Hijack the scroll
					setTargetScroll((current) => current + scrollAmount);
				}
				// If scrollLeft is 0, we do NOTHING, and the page is allowed to scroll up.
				return;
			}

			// Check if we are trying to scroll "right" (or down with a mouse wheel)
			if (scrollAmount > 0) {
				// Check if we are not yet at the end. Use a small buffer for precision.
				if (scrollLeft < scrollWidth - clientWidth - 1) {
					e.preventDefault(); // Hijack the scroll
					setTargetScroll((current) => current + scrollAmount);
				}
				// If we are at the end, we do NOTHING, and the page is allowed to scroll down.
				return;
			}
		};

		scrollContainer.addEventListener("wheel", handleWheelScroll, {
			passive: false,
		});
		return () =>
			scrollContainer.removeEventListener("wheel", handleWheelScroll);
	}, [isHovered]);

	// ✅ 2. This hook runs an animation loop to SMOOTHLY SCROLL to the target
	useEffect(() => {
		let animationFrameId;
		const scrollContainer = scrollRef.current;
		const animateScroll = () => {
			if (scrollContainer) {
				const currentScroll = scrollContainer.scrollLeft;
				const distance = targetScroll - currentScroll;
				if (Math.abs(distance) < 0.5) {
					scrollContainer.scrollLeft = targetScroll;
				} else {
					scrollContainer.scrollLeft += distance * 0.1;
					animationFrameId = requestAnimationFrame(animateScroll);
				}
			}
		};
		animationFrameId = requestAnimationFrame(animateScroll);
		return () => cancelAnimationFrame(animationFrameId);
	}, [targetScroll]);

	useEffect(() => {
		const scrollContainer = scrollRef.current;
		const updateScrollability = () => {
			if (!scrollContainer) return;
			setCanScrollLeft(scrollContainer.scrollLeft > 5);
			setCanScrollRight(
				scrollContainer.scrollLeft <
					scrollContainer.scrollWidth - scrollContainer.clientWidth - 5,
			);
		};
		scrollContainer?.addEventListener("scroll", updateScrollability);
		updateScrollability();
		return () =>
			scrollContainer?.removeEventListener("scroll", updateScrollability);
	}, [dimensions, slides]);

	useEffect(() => {
		// Stop if auto-scrolling is disabled or not enough slides
		if (!autoScrolling || slides.length <= minSlidesToShow) return;

		// Handle the edge case where scrollSpeed is 0 to prevent errors
		if (scrollSpeed <= 0) {
			return; // Do nothing if speed is zero or less
		}

		// Calculate the interval duration. Higher speed = lower interval time.
		const intervalDuration = 3000 / scrollSpeed; // Example: speed of 2 = 1500ms

		autoScrollInterval.current = setInterval(() => {
			if (!isHovered && !isDragging && scrollRef.current) {
				// Check if at the end of the carousel
				const atEnd =
					scrollRef.current.scrollLeft >=
					scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1;

				if (atEnd) {
					// If at the end, smoothly scroll back to the start
					scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
				} else {
					// Otherwise, scroll to the next slide
					scrollRight();
				}
			}
		}, intervalDuration); // <-- USE THE CALCULATED DURATION HERE

		// Cleanup function to clear the interval
		return () => clearInterval(autoScrollInterval.current);
	}, [
		autoScrolling,
		isHovered,
		isDragging,
		slides.length,
		minSlidesToShow,
		scrollRight,
		scrollSpeed, // <-- ADD scrollSpeed TO THE DEPENDENCY ARRAY
	]);

	useEffect(() => {
		const slider = scrollRef.current;
		if (!slider) return;
		const handleScroll = () => {
			const maxScroll = slider.scrollWidth - slider.clientWidth;
			setProgress(maxScroll > 0 ? (slider.scrollLeft / maxScroll) * 100 : 0);
		};
		slider.addEventListener("scroll", handleScroll);
		return () => slider.removeEventListener("scroll", handleScroll);
	}, []);

	// ✅ NEW: useEffect for adding SEO-friendly structured data
	useEffect(() => {
		// Only run this on the frontend, not in the editor
		if (useEditor || !blockId) return;

		// ✅ Define a unique prefix for this specific block type
		const blockSlug = "oone-multi-content-modern-carousel";

		// ✅ Create a more descriptive ID
		const existingScriptId = `${blockSlug}-schema-${blockId}`;

		if (document.getElementById(existingScriptId)) {
			return;
		}

		const itemListElements = slides.map((slide, index) => {
			// ✅ FIX: Create the object first
			const listItem = {
				"@type": "ListItem",
				position: index + 1,
				name: slide.title,
				image: slide.image,
			};

			// ✅ FIX: Add the conditional property *before* returning
			if (slide.link && slide.link.trim() !== "" && slide.link.trim() !== "#") {
				listItem.url = slide.link;
			}

			// ✅ FIX: Now, return the completed object
			return listItem;
		});

		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: title,
			itemListElement: itemListElements,
		};

		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.id = existingScriptId;
		script.innerHTML = JSON.stringify(schema);
		document.head.appendChild(script);

		// Cleanup function
		return () => {
			const scriptTag = document.getElementById(existingScriptId);
			if (scriptTag) {
				scriptTag.remove();
			}
		};
	}, [slides, title, blockId, useEditor]);

	// --- STYLE OBJECTS ---
	const mainContainerStyle = {
		position: "relative",
		userSelect: "none",
		background: resolveColor(backgroundColor, "transparent"),
		padding: getBoxModelString(isMobile ? mobilePadding : padding),
	};
	const titleStyle = {
		fontWeight: titleBold ? "bold" : "normal",
		fontStyle: titleItalics ? "italic" : "normal",
		textDecoration: titleUnderline ? "underline" : "none",
		textAlign: titleAlign || "center",
		fontSize: `${titleFontSize * dimensions.fontScale}px`,
		margin: 0,
		lineHeight: titleLineHeight,
		padding: getScaledBoxModelString(titlePadding, dimensions.fontScale),
		color: resolveColor(titleColor, "#000"),
	};
	const slideAreaWrapperStyle = {
		position: "relative",
		width: "100%",
		overflow: "hidden",
	};
	const scrollAreaStyle = {
		display: "flex",
		overflowX: "auto",
		gap: `${dimensions.fontScale * slideGap}px`,
		cursor: useEditor ? "default" : isDragging ? "grabbing" : "grab",
		scrollbarWidth: "none",
		msOverflowStyle: "none",
		WebkitOverflowScrolling: "touch",
		justifyContent: !canScrollLeft && !canScrollRight ? "center" : "flex-start",
	};
	scrollAreaStyle["&::-webkit-scrollbar"] = { display: "none" };
	const slideBaseStyle = {
		flexShrink: 0,
		overflow: "hidden",
		transition: "transform 0.3s ease-in-out",
		boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
		position: "relative",
	};
	const slideTitleStyle = {
		fontWeight: "600",
		textAlign: "center",
		lineHeight: 1.2,
		wordBreak: "break-word",
		margin: 0,
	};
	const buttonBaseStyle = {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)",
		backgroundColor: "rgba(0,0,0,0.3)",
		width: `${buttonSize * dimensions.fontScale}px`,
		height: `${buttonSize * dimensions.fontScale}px`,
		padding: 0,
		border: "none",
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
		cursor: "pointer",
		color: "white",
		transition: "background-color 0.2s ease, transform 0.2s ease",
	};

	return (
		<div
			ref={containerRef}
			style={mainContainerStyle}
			role="region"
			aria-roledescription="carousel"
			aria-label={title}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				handleMouseUp();
			}}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
		>
			<h2 style={titleStyle}>{title}</h2>
			<div style={slideAreaWrapperStyle}>
				{canScrollLeft && (
					<button
						onClick={scrollLeft}
						aria-label="Previous Slide"
						style={{ ...buttonBaseStyle, left: "10px" }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							style={{ width: "50%", height: "50%" }}
						>
							<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
						</svg>
					</button>
				)}
				<ul
					ref={scrollRef}
					style={{
						...scrollAreaStyle,
						listStyle: "none",
						padding: 0,
						margin: 0,
					}}
					role="group"
					aria-label="Slides"
				>
					{slides.map((item, index) => (
						<li key={item.id || index} style={{ display: "inline-block" }}>
							<Slide
								key={item.id || index}
								item={item}
								index={index}
								onSlideClick={onSlideClick}
								isDragging={isDragging}
								didDrag={didDrag}
								dimensions={dimensions}
								slideBorderRadius={slideBorderRadius}
								useEditor={useEditor}
								slideBaseStyle={slideBaseStyle}
								slideTitleStyle={slideTitleStyle}
								additionalStyles={{
									marginLeft:
										index === 0
											? `${titlePadding.left * dimensions.fontScale}px`
											: "0px",
									marginRight:
										index === slides.length - 1
											? `${titlePadding.right * dimensions.fontScale}px`
											: "0px",
								}}
								uniteSlideSettings={uniteSlideSettings}
								globalSlideTitleColor={slideTitleColor}
								globalSlideFilterColor={slideFilterColor}
								globalSlideBackgroundColor={slideBackgroundColor}
								globalSlideFontSize={slideTitleFontSize}
							/>
						</li>
					))}
				</ul>
				{canScrollRight && (
					<button
						onClick={scrollRight}
						aria-label="Next Slide"
						style={{ ...buttonBaseStyle, right: "10px" }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							style={{ width: "50%", height: "50%" }}
						>
							<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
						</svg>
					</button>
				)}
			</div>
			{/* ✅ RESPONSIVE PROGRESS BAR */}
			{progressbar && (canScrollLeft || canScrollRight) && (
				<div
					style={{
						padding: `${20 * dimensions.fontScale}px`,
					}}
				>
					<div
						style={{
							backgroundColor: "#e0e0e0",
							borderRadius: `${4 * dimensions.fontScale}px`,
							height: `${6 * dimensions.fontScale}px`,
							margin: "auto",
							maxWidth: "400px",
						}}
					>
						<div
							style={{
								width: `${progress}%`,
								height: "100%",
								background: resolveColor(progressbarColor, "#000"), // ✅ UPDATED
								borderRadius: `${4 * dimensions.fontScale}px`,
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

// --- FRONTEND DOM INITIALIZATION ---
if (typeof window !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		document
			.querySelectorAll(".oone-multi-content-modern-carousel-block-wrapper")
			.forEach((wrapper) => {
				const raw = wrapper.getAttribute("data-attributes");
				if (!raw) return;
				const attributes = JSON.parse(raw);
				const blockId = attributes.blockId;
				const rootElement = wrapper.querySelector(
					`#oone-multi-content-modern-carousel-block-root-component-${blockId}`,
				);
				if (rootElement && !rootElement.hasChildNodes()) {
					const root = createRoot(rootElement);
					root.render(<Component attributes={attributes} useEditor={false} />);
				}
			});
	});
}

export default Component;
