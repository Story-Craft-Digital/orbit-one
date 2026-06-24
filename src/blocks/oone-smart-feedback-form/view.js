import { Flex } from "@wordpress/components";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
const { confetti } = window.oone_shared || {};

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

function Component({ attributes }) {
	const {
		blockId,
		formId,
		formSource,
		width,
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
		mobileViewBreakPoint,
		imageOpacity,
		overlayColor,
		overlayOpacity,
		shadow,
		title,
		titleFontSize,
		mobileTitleFontSize,
		titleLineHeight,
		mobileTitleLineHeight,
		titleGradient,
		titleAnimation,
		titleColor,
		titleGradientColor,
		titleVerticalAlign,
		titleAlign,
		titleBold,
		titleItalics,
		titleUnderline,
		titlePadding,
		mobileTitlePadding,
		labelFontSize,
		mobileLabelFontSize,
		messageFieldLabel,
		messageFieldPlaceholder,
		firstNameFieldPlaceholder,
		lastNameFieldPlaceholder,
		emailFieldPlaceholder,
		defaultCountry,
		subject,
		labelColor,
		inputBorder,
		inputBorderRadius,
		inputMobileBorderRadius,
		inputBorderColor,
		inputBorderFocusColor,
		inputShadow,
		buttonFontSize,
		buttonMobileFontSize,
		buttonAlign,
		buttonTextAlign,
		buttonMargin,
		buttonTakesFullWidth,
		buttonMobileMargin,
		buttonBorderRadius,
		buttonBorder,
		buttonText,
		buttonColor,
		buttonHoverColor,
		buttonTextColor,
		buttonTextHoverColor,
		buttonPadding,
		buttonMobilePadding,
		googleFormLink,
		subjectFieldName,
		messageFieldName,
		firstNameFieldName,
		lastNameFieldName,
		emailFieldName,
		phoneNumberFieldName,
		formSourceFieldName,
		buttonTextFieldName,
		entryIdFieldName,
		businessName,
		businessLogo,
		businessLogoAltText,
		businessPhone,
		businessEmail,
		contactType,
		areaServed,
		availableLanguage,
		spinnerRingColor,
		spinnerDotColor,
		loadingTextColor,
		dotsColor,
		inputPadding,
		inputMobilePadding,
		placeholderScale,
		titleFontFamily,
		labelFontFamily,
		inputFieldsGap,
		inputFieldsMobileGap,
	} = attributes;

	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState({});
	const [emailError, setEmailError] = useState("");
	const emailRef = useRef(null);
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

	const typoCorrections = {
		"gamil.com": "gmail.com",
		"gmial.com": "gmail.com",
		"gmai.com": "gmail.com",
		"gmail.con": "gmail.com",
		"gmail.co": "gmail.com",
		"gnail.com": "gmail.com",
		"gmal.com": "gmail.com",
		"gmil.com": "gmail.com",

		"yaho.com": "yahoo.com",
		"yhoo.com": "yahoo.com",
		"yaoo.com": "yahoo.com",
		"yahho.com": "yahoo.com",

		"outlok.com": "outlook.com",
		"outllok.com": "outlook.com",
		"outloo.com": "outlook.com",
		"outllook.com": "outlook.com",

		"hotmai.com": "hotmail.com",
		"hotmal.com": "hotmail.com",
		"hotmial.com": "hotmail.com",
		"hotnail.com": "hotmail.com",

		"icloud.con": "icloud.com",
		"icoud.com": "icloud.com",

		"zohoo.com": "zoho.com",

		"protonmail.con": "protonmail.com",
		"protomail.com": "protonmail.com",

		"live.con": "live.com",
		"liv.com": "live.com",

		"me.con": "me.com",

		"aol.con": "aol.com",
		"ao.com": "aol.com",

		"fastmai.com": "fastmail.com",
		"fastmal.com": "fastmail.com",

		"msn.con": "msn.com",
		"msnn.com": "msn.com",

		"comcast.con": "comcast.net",

		"verison.net": "verizon.net",
		"verzion.net": "verizon.net",

		"att.con": "att.net",
	};

	const validateEmail = (email) => {
		setEmailError(""); // Clear previous error
		const emailParts = email.split("@");

		if (emailParts.length === 2) {
			const domain = emailParts[1].toLowerCase();

			// Suggest correction for known typos
			if (typoCorrections[domain]) {
				const correctedEmail = `${emailParts[0]}@${typoCorrections[domain]}`;
				setEmailError(
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							setEmail(correctedEmail); // Update the email input field
							setEmailError(""); // Clear the email error after correction
						}}
						style={{
							color: "red",
							textDecoration: "none",
							border: "none", // Ensures no border when clicked
							outline: "none", // Removes any focus outline
							transition: "transform 0.2s ease", // Smooth scaling transition
						}}
						onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")} // Scale up on hover
						onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} // Return to normal size
						onFocus={(e) => e.target.blur()} // Ensures no focus state is shown
					>
						Did you mean {correctedEmail}?
					</a>,
				);
			}

			// Basic domain format validation (must contain at least one dot after @)
			else if (
				!domain.includes(".") ||
				domain.startsWith(".") ||
				domain.endsWith(".")
			) {
				setEmailError("Invalid email format. Please check the domain.");
			}
		} else {
			setEmailError("Invalid email format. Please check the email address.");
		}
	};

	const showConfetti = () => {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});
	};

	const successAnimation = () => {
		const msg = document.getElementById("success-message");
		if (!msg) return;

		msg.animate(
			[
				{ opacity: 0, transform: "scale(0.5)" },
				{ opacity: 1, transform: "scale(1)" },
			],
			{
				duration: 600,
				easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Perfect translation of GSAP's back.out curve
				fill: "forwards",
			},
		);
	};

	const failureAnimation = () => {
		const msg = document.getElementById("failure-message");
		if (!msg) return;

		msg.animate(
			[
				{ opacity: 0, transform: "scale(0.5)" },
				{ opacity: 1, transform: "scale(1)" },
			],
			{
				duration: 600,
				easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
				fill: "forwards",
			},
		);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const entryId = `oone-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		let newErrors = {};
		const form = event.target;

		// --- 1. VALIDATION ---
		if (!form.firstName.value.trim())
			newErrors.firstName = "First name is required";
		if (!form.lastName.value.trim())
			newErrors.lastName = "Last name is required";
		if (!email.trim()) newErrors.email = "Email is required";
		if (!phone) newErrors.phone = "Phone number is required";
		if (!form.message.value.trim())
			newErrors.message = "Message cannot be empty";

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			const firstErrorField = Object.keys(newErrors)[0];
			document.getElementById(firstErrorField)?.focus();
			return;
		}

		if (emailError) {
			document.getElementById("email")?.focus();
			return;
		}

		// --- 2. UI PREPARATION ---
		const formWrapper = form.closest(".oone-smart-feedback-form-block-wrapper");
		const loadingMessage = formWrapper.querySelector(".loading-message-visual");
		const successMessage = formWrapper.querySelector(".success-form-visual");
		const failureMessage = formWrapper.querySelector(".failure-form-visual");
		const submitButton = form.querySelector("button[type='submit']");

		// Show loading state
		submitButton.disabled = true;
		form.style.display = "none";
		loadingMessage.style.display = "block";

		// --- 3. DATA PREPARATION ---
		const formData = {
			blockName: "Orbit One Smart Feedback Form",
			entryId: entryId,
			firstName: form.firstName.value,
			lastName: form.lastName.value,
			email: email,
			phone: phone,
			subject: subject,
			message: form.message.value,
			formSource: formSource,
			buttonText: buttonText,
		};
		console.log(formData);

		// --- 4. STEP A: SUBMISSION TO NATIVE WORDPRESS AJAX ---
		let localSuccess = false;
		try {
			const ajaxPayload = new FormData();
			ajaxPayload.append("action", "oone_lead_form_submit");
			ajaxPayload.append(
				"_ajax_nonce",
				window.ooneAjaxBridge?.publicNonce || "",
			);
			ajaxPayload.append("formId", formId);
			ajaxPayload.append("blockId", blockId);
			ajaxPayload.append("entryId", entryId);
			ajaxPayload.append("formsource", formSource);

			Object.keys(formData).forEach((key) => {
				ajaxPayload.append(`formData[${key}]`, formData[key]);
			});

			const response = await fetch(
				window.ooneAjaxBridge?.ajaxUrl || "/wp-admin/admin-ajax.php",
				{
					method: "POST",
					body: ajaxPayload,
				},
			);

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					localSuccess = true;
				}
			}
		} catch (error) {
			console.error("Local tracking database save operation bypassed:", error);
		}

		// --- 5. STEP B: CLIENT-SIDE DIRECT DISPATCH TO GOOGLE FORMS ---
		if (googleFormLink && googleFormLink.includes("formResponse")) {
			const googlePayload = new FormData();

			const fieldMap = {
				[firstNameFieldName]: formData.firstName,
				[lastNameFieldName]: formData.lastName,
				[emailFieldName]: formData.email,
				[phoneNumberFieldName]: formData.phone,
				[subjectFieldName]: formData.subject,
				[messageFieldName]: formData.message,
				[formSourceFieldName]: formData.formSource,
				[buttonTextFieldName]: formData.buttonText,
				[entryIdFieldName]: formData.entryId,
			};

			Object.entries(fieldMap).forEach(([fieldName, value]) => {
				if (
					fieldName &&
					typeof fieldName === "string" &&
					fieldName.startsWith("entry.")
				) {
					googlePayload.append(fieldName, value || "");
				}
			});

			// ✅ DEBUG: Log here, INSIDE the if-block, where googlePayload exists
			console.log("Sending payload to Google for Form ID:", formId);
			for (let [key, value] of googlePayload.entries()) {
				console.log(`${key}: ${value}`);
			}

			try {
				await fetch(googleFormLink, {
					method: "POST",
					mode: "no-cors",
					body: googlePayload,
				});
				console.log("Google Form integration sync successful.");
			} catch (googleError) {
				console.error("Google form push failed:", googleError);
			}
		} else if (googleFormLink) {
			console.warn(
				"Orbit Desk: Google link provided but it does not end in /formResponse. Google will reject this submission.",
			);
		}

		// --- 6. HANDLE COMPLETED VIEW STATE TRANSITIONS ---
		if (localSuccess) {
			setTimeout(() => {
				loadingMessage.style.display = "none";
				successMessage.style.display = "block";
				showConfetti();
				successAnimation();
			}, 1500);
		} else {
			setTimeout(() => {
				loadingMessage.style.display = "none";
				failureMessage.style.display = "block";
				failureAnimation();
			}, 1500);
		}
	};

	useEffect(() => {
		// 1. Find the unique wrapper for this block instance
		const wrapper = document
			.getElementById(`oone-smart-feedback-form-block-main-div${blockId}`)
			?.closest(".oone-smart-feedback-form-block-wrapper");

		if (!wrapper) return;

		// 2. Prevent injecting the same script multiple times
		if (wrapper.querySelector(`script[data-block-schema="${blockId}"]`)) return;

		// 4. Build the structured data object conditionally
		const blockData = {
			"@context": "https://schema.org",
			"@type": "Organization", // Use "LocalBusiness" for physical locations

			// Use the specific business name, fall back to the form title, then a default
			name: businessName || title || "Contact Us",
			url: window.location.href,

			// Conditionally add the logo as an ImageObject if a URL exists
			// This is better for SEO as it includes alt text.
			...(businessLogo && {
				logo: {
					"@type": "ImageObject",
					url: businessLogo,
					...(businessLogoAltText && { alternateName: businessLogoAltText }),
				},
			}),

			// Build the contact point with conditional properties
			contactPoint: [
				{
					"@type": "ContactPoint",
					contactType: contactType || "Customer Support", // Default to "Customer Support"

					// Only add telephone if the businessPhone attribute is not empty
					...(businessPhone && { telephone: businessPhone }),

					// Only add email if the businessEmail attribute is not empty
					...(businessEmail && { email: businessEmail }),

					// Only add areaServed if it's not empty
					...(areaServed && { areaServed: areaServed }),

					// Only add languages if the string is not empty
					// This also correctly formats the string into an array for the schema
					...(availableLanguage && {
						availableLanguage: availableLanguage
							.split(",")
							.map((lang) => lang.trim()),
					}),
				},
			],
		};

		// 5. Create and inject the script tag
		const blockScript = document.createElement("script");
		blockScript.type = "application/ld+json";
		blockScript.dataset.blockSchema = blockId; // Unique marker for this block
		blockScript.textContent = JSON.stringify(blockData, null, 2);

		wrapper.appendChild(blockScript);

		// Using [attributes] ensures this hook re-runs if any attribute changes.
	}, [attributes]);

	// ✅ Utils
	const getBoxModelString = (obj) =>
		obj ? `${obj.top}px ${obj.right}px ${obj.bottom}px ${obj.left}px` : "0px";
	const getBorderRadiusString = (obj) =>
		obj
			? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
			: "0px";

	const resolvedBorderColor = resolveColor(inputBorderColor, "#ccc");
	const resolvedFocusColor = resolveColor(inputBorderFocusColor, "#44d9f9");

	// Helper to convert hex to rgba
	const hexToRgba = (hex, opacity) => {
		hex = hex.replace("#", "");
		const r = parseInt(
			hex.length === 3 ? hex.charAt(0) + hex.charAt(0) : hex.substring(0, 2),
			16,
		);
		const g = parseInt(
			hex.length === 3 ? hex.charAt(1) + hex.charAt(1) : hex.substring(2, 4),
			16,
		);
		const b = parseInt(
			hex.length === 3 ? hex.charAt(2) + hex.charAt(2) : hex.substring(4, 6),
			16,
		);
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	};

	let resolvedShadowColor = resolveColor(inputShadow.color, "#000000");
	// Check if it's a gradient or complex value; if so, default to black for shadow
	if (resolvedShadowColor.includes("gradient")) {
		resolvedShadowColor = "#000000";
	}

	const resolvedShadow = inputShadow.enabled
		? `${inputShadow.offsetX}px ${inputShadow.offsetY}px ${
				inputShadow.blur
		  }px ${inputShadow.spread}px ${hexToRgba(
				resolvedShadowColor,
				inputShadow.opacity,
		  )}`
		: "none";

	const currentInputPadding = isMobile ? inputMobilePadding : inputPadding;
	const inputPaddingString = getBoxModelString(currentInputPadding);
	const currentLabelFontSize = isMobile
		? mobileLabelFontSize || 14
		: labelFontSize || 20;
	const calculatedPlaceholderSize = currentLabelFontSize * placeholderScale;

	const dynamicPhoneInputStyles = `
    .oone-phone-input.PhoneInput {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.4) !important;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: ${inputBorder || 1}px solid ${resolvedBorderColor};
        border-radius: ${
					isMobile
						? getBorderRadiusString(inputMobileBorderRadius)
						: getBorderRadiusString(inputBorderRadius)
				};
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        padding: 0;
        position: relative;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: hidden; /* Added this to help contain the child elements */
    }
    
    .oone-phone-input.PhoneInput--focus {
			border-color: ${resolvedFocusColor};
			box-shadow: ${resolvedShadow};
    }
    
    .oone-phone-input.PhoneInput--error {
        border-color: red !important;
    }
    
    .oone-phone-input .PhoneInputCountry {
        padding: ${inputPaddingString} !important;
        display: flex;
        align-items: center; 
        gap: 6px;
        flex-shrink: 0;
        position: relative;
        cursor: pointer;
    }
    

    .oone-phone-input .PhoneInputCountryIcon {
        width: ${isMobile ? "22px" : "26px"};
        height: ${isMobile ? "15px" : "18px"};
        display: block;
        object-fit: contain;
        flex-shrink: 0;
    }
    
    .oone-phone-input .PhoneInputCountrySelectArrow {
        width: 12px;
        height: 12px;
        opacity: 0.7;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
        background-repeat: no-repeat;
        background-position: center;
        border: none !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    .oone-phone-input .PhoneInputCountrySelect {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 2;
        border: 0;
        opacity: 0;
        cursor: pointer;
        margin: 0;
    }
    
    .oone-phone-input .PhoneInputInput {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent !important;
        padding: ${inputPaddingString} !important;
        font-size: ${calculatedPlaceholderSize}px !important;
        color: inherit;
        width: 100%;
        box-sizing: border-box;
    }

    /* === NEW RULE TO FIX AUTOFILL === */
    .oone-phone-input .PhoneInputInput:-webkit-autofill,
    .oone-phone-input .PhoneInputInput:-webkit-autofill:hover, 
    .oone-phone-input .PhoneInputInput:-webkit-autofill:focus, 
    .oone-phone-input .PhoneInputInput:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0px 1000px #f9f9f9 inset !important; /* Overrides the yellow/blue background */
        box-shadow: 0 0 0px 1000px #f9f9f9 inset !important;
        border-top-right-radius: ${
					isMobile
						? `${inputMobileBorderRadius.topRight}px`
						: `${inputBorderRadius.topRight}px`
				} !important; /* Apply radius to the inner input's corner */
        border-bottom-right-radius: ${
					isMobile
						? `${inputMobileBorderRadius.bottomRight}px`
						: `${inputBorderRadius.bottomRight}px`
				} !important; /* Apply radius to the inner input's corner */
    }
    
    .oone-phone-input .PhoneInputCountry > span:not(.PhoneInputCountryIcon):not(.PhoneInputCountrySelectArrow) {
        display: none;
    }
`;
	const dynamicLoaderStyles = `
    #loading-message-${blockId} .spinner-border::before {
		background: ${resolveColor(spinnerDotColor, "#19508d")};
        box-shadow: 0 0 10px ${resolveColor(
					spinnerDotColor,
					"#19508d",
				)}, 0 0 20px ${resolveColor(spinnerRingColor, "#44d9f9")};
    }
    #loading-message-${blockId} #loading-text {
			color: ${resolveColor(loadingTextColor, "#19508d")};
		}
		#loading-message-${blockId} .dots span {
			background-color: ${resolveColor(dotsColor, "#19508d")};
		}
`;
	return (
		<div
			id={`oone-smart-feedback-form-block-main-div${blockId}`}
			style={{
				display: "flex",
				width: "100%",
				minHeight: "100%",
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
			{/* ✅ FIX 2 & 3: Inject the dynamic styles into the component */}

			<style>{dynamicPhoneInputStyles}</style>
			<div
				ref={containerRef}
				style={{
					// 4. Change width to '100%' but ensure it doesn't fight the flex alignment
					width: "100%",
					maxWidth: width ? `${width}px` : "600px",
					margin: getBoxModelString(isMobile ? mobileMargin : margin),
					boxShadow:
						shadow.enabled && !image
							? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px rgba(0,0,0,${shadow.opacity})`
							: "none",
					borderRadius: isMobile
						? getBorderRadiusString(mobileBorderRadius)
						: getBorderRadiusString(borderRadius),
					// 5. Critical: Ensure margin doesn't override flex centering
					marginLeft:
						align === "left" ? "0" : align === "right" ? "auto" : "auto",
					marginRight:
						align === "right" ? "0" : align === "left" ? "auto" : "auto",
				}}
			>
				<form
					className="oone-smart-feedback-form-block storycraft-contact-form storycraft-form"
					id={`oone-smart-feedback-form-block-form${formId}`}
					style={{
						width: "100%",
						padding: getBoxModelString(isMobile ? mobilePadding : padding),
						borderRadius: isMobile
							? getBorderRadiusString(mobileBorderRadius)
							: getBorderRadiusString(borderRadius),
						// ✅ Background logic modified:
						position: "relative",
						overflow: "hidden",
						backgroundColor: resolveColor(backgroundColor, "transparent"),
						boxShadow:
							shadow.enabled && image
								? `inset 0 0 0 2000px rgba(0,0,0,0), ${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px rgba(0,0,0,${shadow.opacity})`
								: "none",
						margin: 0,
					}}
					action={googleFormLink}
					onSubmit={handleSubmit}
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
						className="relative flex flex-col w-full h-full"
						style={{
							position: "relative",
							zIndex: 10, // Forces everything inside to stay on top
						}}
					>
						{/* Title */}
						{title && (
							<div
								style={{
									display: "flex",
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
										fontFamily: titleFontFamily,

										// 🔹 Gradient text setup
										background: titleGradient
											? resolveColor(titleGradientColor) // ✅ UPDATED
											: "unset",
										WebkitBackgroundClip: titleGradient ? "text" : "unset",
										WebkitTextFillColor: titleGradient
											? "transparent"
											: resolveColor(titleColor, "inherit"), // ✅ UPDATED

										backgroundSize: titleAnimation ? "200% 100%" : "100% 100%",
										backgroundRepeat: titleAnimation ? "repeat-x" : "no-repeat",
										animation: titleAnimation
											? "gradientMove 1s linear infinite"
											: "none",
										position: "relative",
										display: "inline-block",
									}}
								>
									{title}

									{/* Underline */}
									{titleUnderline && (
										<span
											style={{
												display: "block",
												height: `${
													(isMobile ? mobileTitleFontSize : titleFontSize) * 0.1
												}px`, // 10% of font size
												width: "100%",
												marginTop: "0px",
												background: titleGradient
													? resolveColor(titleGradientColor) // ✅ UPDATED
													: resolveColor(titleColor, "inherit"), // ✅ UPDATED
												backgroundSize: titleAnimation
													? "200% 100%"
													: "100% 100%",
												backgroundRepeat: titleAnimation
													? "repeat-x"
													: "no-repeat",
												animation: titleAnimation
													? "gradientMove 1s linear infinite"
													: "none",
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
							</div>
						)}

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: isMobile ? inputFieldsMobileGap : inputFieldsGap,
							}}
						>
							<div
								className="form-group"
								style={{
									display: "flex",
									flexDirection: "column",
									gap: `${
										isMobile ? inputFieldsMobileGap / 2 : inputFieldsGap / 2
									}px !important`,
									width: "100%",
								}}
							>
								<label
									htmlFor="message"
									style={{
										display: "block",
										textAlign: "left",
										fontSize: isMobile
											? mobileLabelFontSize || "14px"
											: labelFontSize || "14px",
										fontWeight: 600,
										color: resolveColor(labelColor, "#555"),
										marginBottom: "4px",
										fontFamily: labelFontFamily,
									}}
								>
									{messageFieldLabel ||
										__("Message", "story-craft-google-form-integration")}
								</label>
								<textarea
									id="message"
									name={messageFieldName || ""}
									placeholder={messageFieldPlaceholder || "Enter Your Message"}
									onChange={(e) => setErrors({ ...errors, message: "" })}
									className={errors.message ? "error" : ""}
									style={{
										width: "100%",
										borderRadius: isMobile
											? getBorderRadiusString(inputMobileBorderRadius)
											: getBorderRadiusString(inputBorderRadius),
										border: errors.message
											? "2px solid red"
											: `${inputBorder}px solid ${resolveColor(
													inputBorderColor,
													"#ccc",
											  )}`,
										background: "rgba(255, 255, 255, 0.4)",
										backdropFilter: "blur(8px)",
										WebkitBackdropFilter: "blur(8px)",
										transition:
											"border 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
										boxSizing: "border-box",
										minHeight: "120px",
										resize: "none",
										padding: inputPaddingString,
										fontSize: `${calculatedPlaceholderSize}px`,
										lineHeight: "1.5",
										height: "auto",
									}}
									onFocus={(e) => {
										e.target.style.border = `${inputBorder}px solid ${resolveColor(
											inputBorderFocusColor,
											"#44d9f9",
										)}`; // ✅ UPDATED
										e.target.style.boxShadow = inputShadow.enabled
											? resolvedShadow
											: "none";
									}}
									onBlur={(e) => {
										e.target.style.border = errors.message
											? "2px solid red"
											: `${inputBorder}px solid ${resolveColor(
													inputBorderColor,
													"#ccc",
											  )}`; // ✅ UPDATED
										e.target.style.boxShadow = "none";
									}}
								></textarea>
								{errors.message && (
									<div
										className="text-danger"
										style={{
											color: "#f44336",
											fontSize: "14px",
											marginTop: "2px",
											width: "100%",
											textAlign: "left",
											fontWeight: 700,
										}}
									>
										{errors.message}
									</div>
								)}
							</div>

							<div
								className="name-fields"
								style={{
									display: "flex",
									width: "100%",
									gap: "16px",
								}}
							>
								<div
									className="form-group"
									style={{
										flex: 1,
										gap: `${
											isMobile ? inputFieldsMobileGap / 2 : inputFieldsGap / 2
										}px !important`,
									}}
								>
									<label
										htmlFor="firstName"
										style={{
											display: "block",
											textAlign: "left",
											fontSize: isMobile
												? mobileLabelFontSize || "14px"
												: labelFontSize || "14px",
											fontWeight: 600,
											color: resolveColor(labelColor, "#555"),
											fontFamily: labelFontFamily,
										}}
									>
										First Name
									</label>
									<input
										id="firstName"
										type="text"
										name={firstNameFieldName || ""}
										placeholder={firstNameFieldPlaceholder || "First Name"}
										onChange={(e) => setErrors({ ...errors, firstName: "" })}
										className={errors.firstName ? "error" : ""}
										style={{
											width: "100%",
											borderRadius: isMobile
												? getBorderRadiusString(inputMobileBorderRadius)
												: getBorderRadiusString(inputBorderRadius),
											border: errors.firstName
												? "2px solid red"
												: `${inputBorder}px solid ${resolveColor(
														inputBorderColor,
														"#ccc",
												  )}`,

											background: "rgba(255, 255, 255, 0.4)",
											backdropFilter: "blur(8px)",
											WebkitBackdropFilter: "blur(8px)",
											transition:
												"border 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
											boxSizing: "border-box",
											padding: inputPaddingString,
											fontSize: `${calculatedPlaceholderSize}px`,
											lineHeight: "1.5",
											height: "auto",
										}}
										onFocus={(e) => {
											e.target.style.border = `${inputBorder}px solid ${resolveColor(
												inputBorderFocusColor,
												"#44d9f9",
											)}`; // ✅ UPDATED
											e.target.style.boxShadow = inputShadow.enabled
												? resolvedShadow
												: "none";
										}}
										onBlur={(e) => {
											e.target.style.border = errors.firstName
												? "2px solid red"
												: `${inputBorder}px solid ${resolveColor(
														inputBorderColor,
														"#ccc",
												  )}`; // ✅ UPDATED
											e.target.style.boxShadow = "none";
										}}
									/>
									{errors.firstName && (
										<div
											className="text-danger"
											style={{
												color: "#f44336",
												fontSize: "14px",
												marginTop: "2px",
												width: "100%",
												textAlign: "left",
												fontWeight: 700,
											}}
										>
											{errors.firstName}
										</div>
									)}
								</div>
								<div
									className="form-group"
									style={{
										flex: 1,
										gap: `${
											isMobile ? inputFieldsMobileGap / 2 : inputFieldsGap / 2
										}px !important`,
									}}
								>
									<label
										htmlFor="lastName"
										style={{
											display: "block",
											textAlign: "left",
											fontSize: isMobile
												? mobileLabelFontSize || "14px"
												: labelFontSize || "14px",
											fontWeight: 600,
											color: resolveColor(labelColor, "#555"),
											fontFamily: labelFontFamily,
										}}
									>
										Last Name
									</label>
									<input
										id="lastName"
										type="text"
										name={lastNameFieldName || ""}
										placeholder={lastNameFieldPlaceholder || "Last Name"}
										onChange={(e) => setErrors({ ...errors, lastName: "" })}
										className={errors.lastName ? "error" : ""}
										style={{
											width: "100%",
											borderRadius: isMobile
												? getBorderRadiusString(inputMobileBorderRadius)
												: getBorderRadiusString(inputBorderRadius),
											border: errors.lastName
												? "2px solid red"
												: `${inputBorder}px solid ${resolveColor(
														inputBorderColor,
														"#ccc",
												  )}`,
											background: "rgba(255, 255, 255, 0.4)",
											backdropFilter: "blur(8px)",
											WebkitBackdropFilter: "blur(8px)",
											transition:
												"border 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
											boxSizing: "border-box",
											padding: inputPaddingString,
											fontSize: `${calculatedPlaceholderSize}px`,
											lineHeight: "1.5",
											height: "auto",
										}}
										onFocus={(e) => {
											e.target.style.border = `${inputBorder}px solid ${resolveColor(
												inputBorderFocusColor,
												"#44d9f9",
											)}`; // ✅ UPDATED
											e.target.style.boxShadow = inputShadow.enabled
												? resolvedShadow
												: "none";
										}}
										onBlur={(e) => {
											e.target.style.border = errors.lastName
												? "2px solid red"
												: `${inputBorder}px solid ${resolveColor(
														inputBorderColor,
														"#ccc",
												  )}`; // ✅ UPDATED
											e.target.style.boxShadow = "none";
										}}
									/>
									{errors.lastName && (
										<div
											className="text-danger"
											style={{
												color: "#f44336",
												fontSize: "14px",
												marginTop: "2px",
												width: "100%",
												textAlign: "left",
												fontWeight: 700,
											}}
										>
											{errors.lastName}
										</div>
									)}
								</div>
							</div>
							<div
								className="email-phone"
								style={{
									display: "flex",
									gap: "16px",
									width: "100%",
								}}
							>
								<div
									className="form-group"
									style={{
										flex: 1,
										minWidth: 0,
										gap: `${
											isMobile ? inputFieldsMobileGap / 2 : inputFieldsGap / 2
										}px !important`,
									}}
								>
									<label
										htmlFor="email"
										style={{
											display: "block",
											textAlign: "left",
											fontSize: isMobile
												? mobileLabelFontSize || "14px"
												: labelFontSize || "14px",
											fontWeight: 600,
											color: resolveColor(labelColor, "#555"),
											fontFamily: labelFontFamily,
										}}
									>
										Email
									</label>
									<input
										ref={emailRef}
										id="email"
										type="email"
										name={emailFieldName || ""}
										placeholder={emailFieldPlaceholder || "Enter Your Email"}
										pattern="^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
										title="Please enter a valid email address"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											validateEmail(e.target.value);
											setErrors({ ...errors, email: "" });
										}}
										className={emailError || errors.email ? "error" : ""}
										style={{
											width: "100%",
											borderRadius: isMobile
												? getBorderRadiusString(inputMobileBorderRadius)
												: getBorderRadiusString(inputBorderRadius),

											border:
												emailError || errors.email
													? "2px solid red"
													: `${inputBorder}px solid ${resolveColor(
															inputBorderColor,
															"#ccc",
													  )}`,
											background: "rgba(255, 255, 255, 0.4)",
											backdropFilter: "blur(8px)",
											WebkitBackdropFilter: "blur(8px)",
											transition:
												"border 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
											boxSizing: "border-box",
											padding: inputPaddingString,
											fontSize: `${calculatedPlaceholderSize}px`,
											lineHeight: "1.5",
											height: "auto",
										}}
										onFocus={(e) => {
											e.target.style.border = `${inputBorder}px solid ${resolveColor(
												inputBorderFocusColor,
												"#44d9f9",
											)}`; // ✅ UPDATED
											e.target.style.boxShadow = inputShadow.enabled
												? resolvedShadow
												: "none";
										}}
										onBlur={(e) => {
											e.target.style.border =
												emailError || errors.email
													? "2px solid red"
													: `${inputBorder}px solid ${resolveColor(
															inputBorderColor,
															"#ccc",
													  )}`; // ✅ UPDATED
											e.target.style.boxShadow = "none";
										}}
									/>
									{emailError && (
										<p style={{ color: "red", fontSize: "14px" }}>
											{emailError}
										</p>
									)}
									{errors.email && (
										<div
											className="text-danger"
											style={{
												color: "#f44336",
												fontSize: "14px",
												marginTop: "2px",
												width: "100%",
												textAlign: "left",
												fontWeight: 700,
											}}
										>
											{errors.email}
										</div>
									)}
								</div>
								<div
									className="form-group"
									style={{
										flex: 1,
										minWidth: 0,
										gap: `${
											isMobile ? inputFieldsMobileGap / 2 : inputFieldsGap / 2
										}px !important`,
									}}
								>
									<label
										htmlFor="phoneNumber"
										style={{
											display: "block",
											textAlign: "left",
											fontSize: isMobile
												? mobileLabelFontSize || "14px"
												: labelFontSize || "14px",
											fontWeight: 600,
											color: resolveColor(labelColor, "#555"),
											fontFamily: labelFontFamily,
										}}
									>
										Phone Number
									</label>
									<PhoneInput
										id="phoneNumber"
										international
										defaultCountry={defaultCountry || "IN"}
										value={phone}
										onChange={(value) => {
											setPhone(value || "");
											setErrors({ ...errors, phone: "" });
										}}
										name={phoneNumberFieldName || ""}
										className="oone-phone-input"
										error={errors.phone}
									/>

									{errors.phone && (
										<div
											className="text-danger"
											style={{
												color: "#f44336",
												fontSize: "14px",
												marginTop: "2px",
												width: "100%",
												textAlign: "left",
												fontWeight: 700,
											}}
										>
											{errors.phone}
										</div>
									)}
								</div>
							</div>
						</div>

						<input
							type="hidden"
							name={formSourceFieldName || "formSource"}
							value={formSource}
						/>
						<input
							type="hidden"
							name={buttonTextFieldName || "buttonText"}
							value={buttonText}
						/>

						<input
							type="hidden"
							name={subjectFieldName || "subject"}
							value={subject}
						/>

						<div
							style={{
								display: "flex",
								width: "100%",
								justifyContent:
									buttonAlign === "left"
										? "flex-start"
										: buttonAlign === "right"
										? "flex-end"
										: "center",
								padding: "0",
							}}
						>
							<button
								type="submit"
								style={{
									width: buttonTakesFullWidth ? "100%" : "auto",
									background: resolveColor(buttonColor), // ✅ UPDATED
									color: resolveColor(buttonTextColor), // ✅ UPDATED
									fontSize: isMobile ? buttonMobileFontSize : buttonFontSize,
									padding: getBoxModelString(
										isMobile ? buttonMobilePadding : buttonPadding,
									),
									margin: getBoxModelString(
										isMobile ? buttonMobileMargin : buttonMargin,
									),
									border:
										buttonBorder > 0
											? `${buttonBorder}px solid ${resolveColor(
													buttonTextColor,
											  )}`
											: "none",
									borderRadius: buttonBorderRadius
										? getBorderRadiusString(buttonBorderRadius)
										: "",
									textAlign:
										buttonTextAlign === "left"
											? "left"
											: buttonTextAlign === "right"
											? "right"
											: buttonTextAlign === "justify"
											? "justify"
											: "center",
									transition: "all 0.3s ease",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background =
										resolveColor(buttonHoverColor); // ✅ UPDATED
									e.currentTarget.style.color =
										resolveColor(buttonTextHoverColor); // ✅ UPDATED
									if (buttonBorder > 0) {
										e.currentTarget.style.border = `${buttonBorder}px solid ${resolveColor(
											buttonTextHoverColor,
										)}`; // ✅ UPDATED
									}
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = resolveColor(buttonColor); // ✅ UPDATED
									e.currentTarget.style.color = resolveColor(buttonTextColor); // ✅ UPDATED
									if (buttonBorder > 0) {
										e.currentTarget.style.border = `${buttonBorder}px solid ${resolveColor(
											buttonTextColor,
										)}`; // ✅ UPDATED
									}
								}}
							>
								{buttonText ||
									__("Send Message", "story-craft-google-form-integration")}
							</button>
						</div>
					</div>
				</form>
				{/* Messages */}
				<div
					id={`loading-message-${blockId}`} // ✅ Use a unique ID
					className="loading-message-visual"
					style={{ display: "none" }}
				>
					{/* ✅ Inject the dynamic styles */}
					<style>{dynamicLoaderStyles}</style>

					<div
						className="spinner-border"
						// ✅ Apply the ring color via inline style
						style={{
							border: `6px solid ${resolveColor(spinnerRingColor, "#44d9f9")}`,
						}} // ✅ UPDATED
					></div>

					<div
						id="loading-text-container"
						className="flex flex-col items-center gap-2"
					>
						<p
							id="loading-text"
							style={{ color: resolveColor(loadingTextColor, "#19508d") }}
						>
							Loading
						</p>{" "}
						{/* ✅ UPDATED */}
						<div className="dots">
							<span
								style={{ backgroundColor: resolveColor(dotsColor, "#19508d") }}
							></span>{" "}
							{/* ✅ UPDATED */}
							<span
								style={{ backgroundColor: resolveColor(dotsColor, "#19508d") }}
							></span>{" "}
							{/* ✅ UPDATED */}
							<span
								style={{ backgroundColor: resolveColor(dotsColor, "#19508d") }}
							></span>{" "}
							{/* ✅ UPDATED */}
						</div>
					</div>
				</div>
				<div
					id="success-message"
					className="success-form-visual message-form-visual"
					style={{ display: "none" }}
				>
					<h4>Your Form has been Submitted Successfully!</h4>
					<p>If you don't receive a confirmation, please contact support.</p>
				</div>

				<div
					id="failure-message"
					className="failure-form-visual message-form-visual"
					style={{ display: "none" }}
				>
					<h4>Your Form Submission has been Failed!</h4>
					<p>
						Your contact information is not shared or not notified to the
						consented person. Please reach out to them by phone.
					</p>
				</div>
			</div>
		</div>
	);
}

document.addEventListener("DOMContentLoaded", function () {
	document
		.querySelectorAll(".oone-smart-feedback-form-block-wrapper")
		.forEach((wrapper) => {
			const attributes = JSON.parse(wrapper.getAttribute("data-attributes"));
			const blockId = attributes.blockId; // Ensure the blockId is available

			// Use the unique id based on blockId for each block
			const rootElement = wrapper.querySelector(
				`#oone-smart-feedback-form-block-root-component-${blockId}`,
			);

			// Ensure this block is not already rendered
			if (rootElement && !rootElement.hasChildNodes()) {
				const root = createRoot(rootElement);
				root.render(<Component attributes={attributes} />);
			}
		});
});

export default Component;
