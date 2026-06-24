import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
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
	justifyTop,
	justifyCenterVertical,
	justifyBottom,
} from "@wordpress/icons";

// Shared libs test
const { Copy } = window.oone_shared?.lucide || {};
import { getCountries } from "libphonenumber-js";
import i18nIsoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "react-phone-number-input/style.css";
import Component from "./view";
// Register the English locale
i18nIsoCountries.registerLocale(enLocale);

/**
 * Resolves simple keys AND gradient strings with keys.
 * @param {string} colorValue The saved attribute value (e.g., "primary" or "linear-gradient(90deg, primary, accent)")
 * @returns {string} A valid CSS color value.
 */
const resolveColor = (colorValue) => {
	const oonePalette = window.oonePalette || {};
	if (!colorValue) return "transparent"; // Handle empty/null

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
						label={__(corner.replace(/([A-Z])/g, " $1"), "orbit-one")}
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

const FONT_FAMILY_OPTIONS = [
	{ label: "Default (Theme)", value: "inherit" },
	// Modern System Sans-Serif
	{
		label: "Inter / System Sans",
		value:
			"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	},
	// Professional Serif
	{ label: "Playfair Display", value: "'Playfair Display', serif" },
	{ label: "Merriweather", value: "Merriweather, serif" },
	// Modern Sans-Serif (Google Fonts)
	{ label: "Poppins", value: "'Poppins', sans-serif" },
	{ label: "Montserrat", value: "'Montserrat', sans-serif" },
	{ label: "Roboto", value: "'Roboto', sans-serif" },
	{ label: "Open Sans", value: "'Open Sans', sans-serif" },
	// Display/Heading Fonts
	{ label: "Oswald", value: "'Oswald', sans-serif" },
	{ label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
	{ label: "Lora", value: "Lora, serif" },
	// Monospace
	{ label: "Fira Code", value: "'Fira Code', monospace" },
];

export default function Edit({ attributes, setAttributes }) {
	const [isLoading, setIsLoading] = useState(true);
	const [activeColorPicker, setActiveColorPicker] = useState(null);
	const [url, setUrl] = useState("");
	const [data, setData] = useState(null);
	const [error, setError] = useState();
	const [copied, setCopied] = useState(false);
	const [copyMessage, setCopyMessage] = useState("");

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
		formId,
		formSource,
		formFields,
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
		imageOpacity,
		mobileViewBreakPoint,
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
		subjectFieldLabel,
		messageFieldLabel,
		messageFieldPlaceholder,
		firstNameFieldPlaceholder,
		lastNameFieldPlaceholder,
		emailFieldPlaceholder,
		defaultCountry,
		subjects,
		labelColor,
		inputBorder,
		inputBorderRadius,
		inputMobileBorderRadius,
		inputBorderColor,
		inputBorderFocusColor,
		subjectDropdownArrowColor,
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
		newSubject,
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

	const [activeTab, setActiveTab] = useState("fieldNames"); // Default tab
	const [isContentPanelOpen, setIsContentPanelOpen] = useState(false);

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
	}, [isLoading]); // Keep isLoading dependency

	// ✅ --- NEW CLEANED-UP useEffect ---
	useEffect(() => {
		const initialUpdates = {};

		// 1. Initialize Block ID if it's missing.
		if (!blockId) {
			initialUpdates.blockId =
				"oone-smart-contact-form-" +
				Date.now() +
				"-" +
				Math.floor(Math.random() * 1000);
		}

		// 2. Apply all updates at once if needed.
		if (Object.keys(initialUpdates).length > 0) {
			setAttributes(initialUpdates);
		}

		// 3. Finish loading and allow the component to render.
		setIsLoading(false);
	}, []); // The empty array [] ensures this runs only ONCE.

	// Show a loading state until the initialization useEffect has finished.
	if (isLoading) {
		return (
			<div {...useBlockProps()}>
				<p style={{ padding: "20px", textAlign: "center" }}>
					Initializing Smart Form...
				</p>
			</div>
		);
	}

	// Now that we're past the loading guard, we can safely create variables.
	const safeSubjects = Array.isArray(subjects) ? subjects : [];
	const countryNames = i18nIsoCountries.getNames("en", { select: "official" });
	const countryCodes = getCountries();
	const countryOptions = countryCodes.map((code) => ({
		label: countryNames[code] || code,
		value: code,
	}));

	const toggleColorPicker = (picker) => {
		setActiveColorPicker(activeColorPicker === picker ? null : picker);
	};

	const fetchFormData = async () => {
		setError("");
		setData(null);
		setIsLoading(true); // Start loading spinner

		try {
			const adminNonce = window.ooneAjaxBridge?.adminNonce;
			if (!adminNonce) {
				throw new Error(
					"WordPress security token missing. Please try reloading your editor window page.",
				);
			}

			// ✅ Bypassed apiFetch completely. Format payload into an asynchronous FormData instance.
			const ajaxPayload = new FormData();
			ajaxPayload.append("action", "oone_extract_google_form_data");
			ajaxPayload.append("_ajax_nonce", adminNonce);
			ajaxPayload.append("url", url);

			// Execute standard browser context request directly targeting native admin-ajax.php
			const response = await fetch(
				window.ooneAjaxBridge?.ajaxUrl || "/wp-admin/admin-ajax.php",
				{
					method: "POST",
					body: ajaxPayload,
				},
			);

			if (!response.ok) {
				throw new Error(
					`Server tracking returned status error code: ${response.status}`,
				);
			}

			const jsonResponse = await response.json();

			// Native WordPress AJAX responses return an error condition payload wrapping structural failures
			if (!jsonResponse.success) {
				throw new Error(
					jsonResponse.data?.message ||
						"Extraction process failed on data mapping bounds.",
				);
			}

			const result = jsonResponse.data; // Access returned structural payload components cleanly

			if (!result.action || !Array.isArray(result.entries)) {
				throw new Error("Invalid form data structure");
			}

			// ✅ MAPPING LOGIC: Maps extracted keys directly into attributes
			const newAttributes = {
				googleFormLink: result.action,
				formFields: result.entries,
			};

			const labelFieldMappings = [
				{ labelAttr: "subjectFieldLabel", nameAttr: "subjectFieldName" },
				{ labelAttr: "messageFieldLabel", nameAttr: "messageFieldName" },
				{
					labelAttr: "firstNameFieldPlaceholder",
					nameAttr: "firstNameFieldName",
				},
				{
					labelAttr: "lastNameFieldPlaceholder",
					nameAttr: "lastNameFieldName",
				},
			];

			labelFieldMappings.forEach(({ labelAttr, nameAttr }) => {
				const labelToFind = (attributes[labelAttr] || "").trim().toLowerCase();
				if (!labelToFind) return;
				const matchedEntry = result.entries.find(
					(entry) => entry.label.trim().toLowerCase() === labelToFind,
				);
				if (matchedEntry) {
					newAttributes[nameAttr] = matchedEntry.name;
				}
			});

			// Regex-based fallback mapping
			const emailEntry = result.entries.find((entry) =>
				/Email/i.test(entry.label),
			);
			if (emailEntry) newAttributes.emailFieldName = emailEntry.name;

			const phoneEntry = result.entries.find((entry) =>
				/Phone|Phone Number|Mobile|Contact Number/i.test(entry.label),
			);
			if (phoneEntry) newAttributes.phoneNumberFieldName = phoneEntry.name;

			const formSourceEntry = result.entries.find((entry) =>
				/Form Source/i.test(entry.label),
			);
			if (formSourceEntry)
				newAttributes.formSourceFieldName = formSourceEntry.name;

			const buttonTextEntry = result.entries.find((entry) =>
				/Button Text/i.test(entry.label),
			);
			if (buttonTextEntry)
				newAttributes.buttonTextFieldName = buttonTextEntry.name;

			const entryIdEntry = result.entries.find((entry) =>
				/Entry ID|Submission ID|Unique ID/i.test(entry.label),
			);
			if (entryIdEntry) newAttributes.entryIdFieldName = entryIdEntry.name;

			// Save everything to attributes
			setAttributes(newAttributes);
			setData(result);
		} catch (err) {
			console.error("Orbit One Scraper Error:", err);
			setError(err.message || "Failed to fetch form data. Check URL.");
		} finally {
			setIsLoading(false); // Stop loading regardless of success/fail
		}
	};

	const addSubject = () => {
		if (newSubject && !safeSubjects.includes(newSubject)) {
			setAttributes({
				subjects: [...safeSubjects, newSubject],
				newSubject: "",
			});
		}
	};

	const handleCopy = (text) => {
		if (typeof text !== "string") return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopied(true);
				setCopyMessage("Copied to clipboard!");
				window.setTimeout(() => {
					setCopied(false);
					setCopyMessage("");
				}, 2000);
			})
			.catch((err) => {
				console.error("Clipboard copy failed:", err);
			});
	};

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
	const getBorderRadiusString = (obj) =>
		obj
			? `${obj.topLeft}px ${obj.topRight}px ${obj.bottomRight}px ${obj.bottomLeft}px`
			: "0px";

	const moveSubject = (index, direction) => {
		const newSubjects = [...safeSubjects];
		const targetIndex = direction === "up" ? index - 1 : index + 1;

		// Boundary check
		if (targetIndex < 0 || targetIndex >= newSubjects.length) return;

		// Swap elements
		[newSubjects[index], newSubjects[targetIndex]] = [
			newSubjects[targetIndex],
			newSubjects[index],
		];

		setAttributes({ subjects: newSubjects });
	};
	return (
		<div {...useBlockProps({ className: "storycraft-contact-form" })}>
			{/* Sidebar Controls */}
			<InspectorControls>
				{/* GENERAL PANEL */}
				<PanelBody title={__("General", "orbit-one")} initialOpen={true}>
					{/* Title */}
					<TextControl
						label={__("Form Title", "orbit-one")}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
						help={__(
							"Enter the main heading displayed above the form (e.g., 'Contact Us').",
						)}
					/>

					{/* Form Source */}
					<TextControl
						label={__("Form Source", "orbit-one")}
						value={formSource}
						onChange={(value) => setAttributes({ formSource: value })}
						help={__(
							"An internal label to identify where submissions are from (e.g., 'Home Page'). For your tracking purposes only.",
						)}
					/>

					{/* Form Id */}
					<TextControl
						label={__("Form Identifier", "orbit-one")}
						value={formId}
						onChange={(value) => setAttributes({ formId: value })}
						help={__(
							"Optional. Enter a unique name (e.g., 'Form 1') or ID to identify this specific form. This is useful for tracking where submissions came from.",
						)}
					/>
				</PanelBody>

				{/* 🎨 CONTENT PANEL */}
				<PanelBody
					title={__("Content", "orbit-one")}
					opened={isContentPanelOpen}
					onToggle={() => setIsContentPanelOpen(!isContentPanelOpen)}
				>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						initialTabName={activeTab} // Use state here
						onSelect={(tabName) => setActiveTab(tabName)} // Update state when user clicks manually
						tabs={[
							{ name: "fieldNames", title: "General" },
							{ name: "subjects", title: "Subjects" },
							{ name: "color", title: "Color" },
						]}
					>
						{(tab) => (
							<>
								{tab.name === "fieldNames" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
										{/* NEW: Label Font Family */}
										<SelectControl
											label={__("Label Font Family", "orbit-one")}
											value={labelFontFamily}
											options={FONT_FAMILY_OPTIONS}
											onChange={(value) =>
												setAttributes({ labelFontFamily: value })
											}
										/>

										{/* Label Font Size */}
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
													value={labelFontSize}
													onChange={(value) =>
														setAttributes({ labelFontSize: parseInt(value) })
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
													value={mobileLabelFontSize}
													onChange={(value) =>
														setAttributes({
															mobileLabelFontSize: parseInt(value),
														})
													}
													type="number"
													units={["px"]}
												/>
											</div>
										</div>

										{/* Fields Gap */}
										<div className="flex gap-5">
											{/* Input Fields Gap */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Input Fields Gap", "orbit-one")}
													value={inputFieldsGap}
													onChange={(value) =>
														setAttributes({ inputFieldsGap: parseInt(value) })
													}
													type="number"
													units={["px"]}
												/>
											</div>

											{/* Input Fields Mobile Gap */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flex: 1,
												}}
											>
												<TextControl
													label={__("Input Fields Mobile Gap", "orbit-one")}
													value={inputFieldsMobileGap}
													onChange={(value) =>
														setAttributes({
															inputFieldsMobileGap: parseInt(value),
														})
													}
													type="number"
													units={["px"]}
												/>
											</div>
										</div>

										{/* Subject Field Label */}
										<TextControl
											label={__("Subject Field Label", "orbit-one")}
											value={subjectFieldLabel}
											onChange={(value) =>
												setAttributes({ subjectFieldLabel: value })
											}
										/>
										{/* Message Field Label */}
										<TextControl
											label={__("Message Field Label", "orbit-one")}
											value={messageFieldLabel}
											onChange={(value) =>
												setAttributes({ messageFieldLabel: value })
											}
										/>
										{/* Message Placeholder */}
										<TextControl
											label={__("Message Placeholder", "orbit-one")}
											value={messageFieldPlaceholder}
											onChange={(value) =>
												setAttributes({ messageFieldPlaceholder: value })
											}
										/>

										{/* First Name Placeholder */}
										<TextControl
											label={__("First Name Placeholder", "orbit-one")}
											value={firstNameFieldPlaceholder}
											onChange={(value) =>
												setAttributes({ firstNameFieldPlaceholder: value })
											}
										/>
										{/* Last Name Placeholder */}
										<TextControl
											label={__("Last Name Placeholder", "orbit-one")}
											value={lastNameFieldPlaceholder}
											onChange={(value) =>
												setAttributes({ lastNameFieldPlaceholder: value })
											}
										/>
										{/* Email Placeholder */}
										<TextControl
											label={__("Email Placeholder", "orbit-one")}
											value={emailFieldPlaceholder}
											onChange={(value) =>
												setAttributes({ emailFieldPlaceholder: value })
											}
										/>

										{/* Default Country Code */}
										<SelectControl
											label={__("Default Country Code", "orbit-one")}
											value={defaultCountry}
											options={countryOptions}
											onChange={(value) =>
												setAttributes({ defaultCountry: value })
											}
										/>

										{/* Input Border */}
										<RangeControl
											label={__("Input Border", "orbit-one")}
											value={inputBorder}
											onChange={(value) =>
												setAttributes({ inputBorder: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the border size. Default is 1.",
												"orbit-one",
											)}
										/>

										{/* Input Placeholder Scale */}
										<RangeControl
											label={__("Input Placeholder Scale", "orbit-one")}
											value={placeholderScale}
											onChange={(value) =>
												setAttributes({ placeholderScale: value })
											}
											min={0}
											max={2}
											step={0.1}
											help={__(
												"Uses a multiplier of the input place holder font size. Default is 1.",
												"orbit-one",
											)}
										/>

										{/* Input Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Input Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="inputPadding"
												values={inputPadding}
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
												{__("Input Mobile Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="inputMobilePadding"
												values={inputMobilePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Input Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__("Input  Border Radius (px)", "orbit-one")}
											</label>
											<CornerRadiusControls
												values={inputBorderRadius}
												updateCorners={updateCorners}
												attributeName="inputBorderRadius"
											/>
										</div>

										{/* Input MobileBorder Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__("Input Mobile Border Radius (px)", "orbit-one")}
											</label>
											<CornerRadiusControls
												values={inputMobileBorderRadius}
												updateCorners={updateCorners}
												attributeName="inputMobileBorderRadius"
											/>
										</div>

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
												label={__("Enable Shadow", "orbit-one")}
												checked={inputShadow.enabled}
												onChange={(value) =>
													setAttributes({
														inputShadow: { ...inputShadow, enabled: value },
													})
												}
											/>

											{inputShadow.enabled && (
												<>
													{/* Offset X */}
													<RangeControl
														label={__("Offset X", "orbit-one")}
														value={inputShadow.offsetX}
														onChange={(value) =>
															setAttributes({
																inputShadow: {
																	...inputShadow,
																	offsetX: value,
																},
															})
														}
														min={-50}
														max={50}
													/>

													{/* Offset Y */}
													<RangeControl
														label={__("Offset Y", "orbit-one")}
														value={inputShadow.offsetY}
														onChange={(value) =>
															setAttributes({
																inputShadow: {
																	...inputShadow,
																	offsetY: value,
																},
															})
														}
														min={-50}
														max={50}
													/>

													{/* Blur */}
													<RangeControl
														label={__("Blur", "orbit-one")}
														value={inputShadow.blur}
														onChange={(value) =>
															setAttributes({
																inputShadow: { ...inputShadow, blur: value },
															})
														}
														min={0}
														max={100}
													/>

													{/* Spread */}
													<RangeControl
														label={__("Spread", "orbit-one")}
														value={inputShadow.spread}
														onChange={(value) =>
															setAttributes({
																inputShadow: {
																	...inputShadow,
																	spread: value,
																},
															})
														}
														min={-50}
														max={50}
													/>

													{/* Opacity */}
													<RangeControl
														label={__("Opacity", "orbit-one")}
														value={inputShadow.opacity}
														onChange={(value) =>
															setAttributes({
																inputShadow: {
																	...inputShadow,
																	opacity: value,
																},
															})
														}
														min={0}
														max={1}
														step={0.05}
													/>

													{/* Shadow Color Picker */}
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "5px",
															marginBottom: "10px",
														}}
													>
														<label>{__("Shadow Color", "orbit-one")}</label>
														<Button
															onClick={() =>
																toggleColorPicker("inputShadow.color")
															}
															style={{
																backgroundColor: inputShadow.color || "#333",
																color: "#FFFFFF",
																textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
																border: "1px solid #ddd",
																padding: "8px 16px",
																borderRadius: "6px",
																fontWeight: "bold",
																transition: "all 0.3s ease",
																boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
																cursor: "pointer",
																fontSize: "14px",
															}}
														>
															{activeColorPicker === "inputShadow.color"
																? __("Close Picker", "orbit-one")
																: __("Choose Color", "orbit-one")}
														</Button>
														{activeColorPicker === "inputShadow.color" && (
															<ColorPicker
																color={inputShadow.color}
																onChangeComplete={(color) =>
																	setAttributes({
																		inputShadow: {
																			...inputShadow,
																			color: color.hex,
																		},
																	})
																}
																disableAlpha
															/>
														)}
													</div>
												</>
											)}
										</div>
									</div>
								)}

								{tab.name === "subjects" && (
									<div style={{ marginTop: "10px" }}>
										{/* SECTION: Add New Subject */}
										<div style={{ marginBottom: "20px", padding: "0 10px" }}>
											<label
												style={{
													fontWeight: "600",
													color: "#1e1e1e",
													display: "block",
													marginBottom: "8px",
													fontSize: "13px",
												}}
											>
												{__("Quick Add Subject", "orbit-one")}
											</label>

											<div style={{ display: "flex", gap: "8px" }}>
												<div style={{ flex: 1 }}>
													<TextControl
														value={newSubject || ""}
														onChange={(value) =>
															setAttributes({ newSubject: value })
														}
														placeholder={__(
															"e.g. Technical Support",
															"orbit-one",
														)}
														__nextHasNoMarginBottom
													/>
												</div>
												<Button
													variant="primary"
													onClick={addSubject}
													style={{ backgroundColor: "#9813ca", height: "36px" }}
												>
													{__("Add", "orbit-one")}
												</Button>
											</div>
										</div>

										{/* SECTION: Modern Sortable List */}
										<div style={{ padding: "0 10px" }}>
											<label
												style={{
													fontWeight: "600",
													color: "#1e1e1e",
													display: "block",
													marginBottom: "12px",
													fontSize: "13px",
												}}
											>
												{__("Manage Order & Items", "orbit-one")}
											</label>

											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: "8px",
												}}
											>
												{safeSubjects.map((subject, index) => (
													<div
														key={index}
														style={{
															display: "flex",
															alignItems: "center",
															background: "#fff",
															border: "1px solid #e0e0e0",
															borderRadius: "6px",
															padding: "6px 10px",
															boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
														}}
													>
														{/* 1. SORT ACTIONS (Left side, compact) */}
														<div
															style={{
																display: "flex",
																flexDirection: "column",
																marginRight: "12px",
															}}
														>
															<Button
																icon="arrow-up-alt2"
																onClick={() => moveSubject(index, "up")}
																disabled={index === 0}
																label="Move Up"
																showTooltip
																style={{
																	height: "16px",
																	minWidth: "24px",
																	padding: 0,
																	color: index === 0 ? "#ddd" : "#9813ca",
																	boxShadow: "none", // Removes WP default shadow
																}}
															/>
															<Button
																icon="arrow-down-alt2"
																onClick={() => moveSubject(index, "down")}
																disabled={index === safeSubjects.length - 1}
																label="Move Down"
																showTooltip
																style={{
																	height: "16px",
																	minWidth: "24px",
																	padding: 0,
																	marginTop: "-4px", // Tighter spacing
																	color:
																		index === safeSubjects.length - 1
																			? "#ddd"
																			: "#9813ca",
																	boxShadow: "none",
																}}
															/>
														</div>

														{/* 2. SUBJECT TEXT */}
														<span
															style={{
																flex: 1,
																fontSize: "13px",
																fontWeight: "500",
																color: "#1e1e1e",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
															}}
														>
															{subject}
														</span>

														{/* 3. DELETE ACTION (Right side, clean) */}
														<Button
															icon="dismiss" // cleaner than "no-alt"
															isDestructive
															variant="link"
															onClick={() => {
																setAttributes({
																	subjects: safeSubjects.filter(
																		(_, i) => i !== index,
																	),
																});
															}}
															style={{
																color: "#999",
																padding: "4px",
																minWidth: "auto",
																height: "auto",
																textDecoration: "none", // Kills that bottom line/underscore
																boxShadow: "none",
															}}
															onMouseEnter={(e) =>
																(e.target.style.color = "#cc1818")
															}
															onMouseLeave={(e) =>
																(e.target.style.color = "#999")
															}
														/>
													</div>
												))}

												{safeSubjects.length === 0 && (
													<p
														style={{
															color: "#666",
															fontStyle: "italic",
															textAlign: "center",
															padding: "20px",
															background: "#f9f9f9",
															borderRadius: "8px",
															border: "1px dashed #ccc",
														}}
													>
														{__("No subjects added yet.", "orbit-one")}
													</p>
												)}
											</div>
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
										{/* --- Label Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Label Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("labelColor")}
												style={{
													background: resolveColor(labelColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "labelColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "labelColor" && (
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
															setAttributes({ labelColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(labelColor)}
														onChangeComplete={(color) =>
															setAttributes({ labelColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Input Border Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Input Border Color", "orbit-one")}
											</label>
											<Button
												onClick={() => toggleColorPicker("inputBorderColor")}
												style={{
													background: resolveColor(inputBorderColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "inputBorderColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "inputBorderColor" && (
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
															setAttributes({ inputBorderColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(inputBorderColor)}
														onChangeComplete={(color) =>
															setAttributes({ inputBorderColor: color.hex })
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Input Border Focus Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Input Border Focus Color", "orbit-one")}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("inputBorderFocusColor")
												}
												style={{
													background:
														resolveColor(inputBorderFocusColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "inputBorderFocusColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "inputBorderFocusColor" && (
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
															setAttributes({ inputBorderFocusColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(inputBorderFocusColor)}
														onChangeComplete={(color) =>
															setAttributes({
																inputBorderFocusColor: color.hex,
															})
														}
														disableAlpha
													/>
												</div>
											)}
										</div>

										{/* --- Subject Dropdown Arrow Color --- */}
										<div style={{ marginBottom: "15px" }}>
											<label
												style={{
													display: "block",
													marginBottom: "8px",
													fontWeight: "500",
												}}
											>
												{__("Subject Dropdown Arrow Color", "orbit-one")}
											</label>
											<Button
												onClick={() =>
													toggleColorPicker("subjectDropdownArrowColor")
												}
												style={{
													background:
														resolveColor(subjectDropdownArrowColor) || "#333",
													color: "#FFFFFF",
													textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
													border: "1px solid #ddd",
													padding: "8px 16px",
													borderRadius: "6px",
													transition: "all 0.3s ease",
													boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
													cursor: "pointer",
													fontSize: "14px",
													width: "100%",
													justifyContent: "center",
												}}
											>
												{activeColorPicker === "subjectDropdownArrowColor"
													? "Close"
													: "Choose Color"}
											</Button>
											{activeColorPicker === "subjectDropdownArrowColor" && (
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
															setAttributes({ subjectDropdownArrowColor: key })
														}
													/>
													<ColorPicker
														color={resolveColor(subjectDropdownArrowColor)}
														onChangeComplete={(color) =>
															setAttributes({
																subjectDropdownArrowColor: color.hex,
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

				{/* 📐 LAYOUT & STYLE PANEL */}
				<PanelBody
					title={__("Layout & Style", "orbit-one")}
					initialOpen={false}
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

										{/* Horizontal Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Left", "orbit-one")}>
													<Button
														isPressed={align === "left"}
														onClick={() => setAttributes({ align: "left" })}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={align === "center"}
														onClick={() => setAttributes({ align: "center" })}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip text={__("Align Right", "orbit-one")}>
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
											<p>{__("Vertical Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Top", "orbit-one")}>
													<Button
														isPressed={verticalAlign === "top"}
														onClick={() =>
															setAttributes({ verticalAlign: "top" })
														}
														icon={justifyTop}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={verticalAlign === "center"}
														onClick={() =>
															setAttributes({ verticalAlign: "center" })
														}
														icon={justifyCenterVertical}
													/>
												</Tooltip>

												<Tooltip text={__("Align Bottom", "orbit-one")}>
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
												{__("Mobile Border Radius (px)", "orbit-one")}
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
												label={__("Enable Shadow", "orbit-one")}
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
														label={__("Offset X", "orbit-one")}
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
														label={__("Offset Y", "orbit-one")}
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
														label={__("Blur", "orbit-one")}
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
														label={__("Spread", "orbit-one")}
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
														label={__("Opacity", "orbit-one")}
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
													label={__("Image Alt Text", "orbit-one")}
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
										{/* NEW: Title Font Family */}
										<SelectControl
											label={__("Title Font Family", "orbit-one")}
											value={titleFontFamily}
											options={FONT_FAMILY_OPTIONS}
											onChange={(value) =>
												setAttributes({ titleFontFamily: value })
											}
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
													label={__("Mobile Font Size", "orbit-one")}
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
											label={__("Enable Title Gradient", "orbit-one")}
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
												label={__("Enable Title Animation", "orbit-one")}
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
											label={__("Desktop Line Height", "orbit-one")}
											value={titleLineHeight}
											onChange={(value) =>
												setAttributes({ titleLineHeight: value })
											}
											min={0.8}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the font size. Default is 1.5.",
												"orbit-one",
											)}
										/>

										{/* Mobile Line Height */}
										<RangeControl
											label={__("Mobile Line Height", "orbit-one")}
											value={mobileTitleLineHeight}
											onChange={(value) =>
												setAttributes({ mobileTitleLineHeight: value })
											}
											min={0.8}
											max={3}
											step={0.1}
											help={__(
												"Applies on screens smaller than your breakpoint.",
												"orbit-one",
											)}
										/>

										{/* Horizontal Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px" }}
										>
											<p>{__("Title Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Left", "orbit-one")}>
													<Button
														isPressed={titleAlign === "left"}
														onClick={() =>
															setAttributes({ titleAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={titleAlign === "center"}
														onClick={() =>
															setAttributes({ titleAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip text={__("Align Right", "orbit-one")}>
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
											<p>{__("Title Vertical Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Top", "orbit-one")}>
													<Button
														isPressed={titleVerticalAlign === "top"}
														onClick={() =>
															setAttributes({ titleVerticalAlign: "top" })
														}
														icon={justifyTop}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={titleVerticalAlign === "center"}
														onClick={() =>
															setAttributes({ titleVerticalAlign: "center" })
														}
														icon={justifyCenterVertical}
													/>
												</Tooltip>

												<Tooltip text={__("Align Bottom", "orbit-one")}>
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
											<div style={{ marginBottom: "15px" }}>
												<label
													style={{
														display: "block",
														marginBottom: "8px",
														fontWeight: "500",
													}}
												>
													{__("Title Gradient", "orbit-one")}
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
														width: "100%",
														justifyContent: "center",
													}}
												>
													{activeColorPicker === "titleGradientColor"
														? "Close"
														: "Choose Gradient"}
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
											</div>
										) : (
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
												{__("Mobile Title Padding (px)", "orbit-one")}
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

				{/* BUTTON PANEL */}
				<PanelBody title="Buttons" initialOpen={false}>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
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
								{tab.name === "layout" && (
									<div style={{ marginTop: "20px", marginBottom: "20px" }}>
										{/* Button Text */}
										<TextControl
											label={__("Button Text", "orbit-one")}
											value={buttonText}
											onChange={(value) => setAttributes({ buttonText: value })}
										/>

										{/* Button Font Size */}
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
													value={buttonFontSize}
													onChange={(value) =>
														setAttributes({ buttonFontSize: parseInt(value) })
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
													label={__("Mobile Font Size", "orbit-one")}
													value={buttonMobileFontSize}
													onChange={(value) =>
														setAttributes({
															buttonMobileFontSize: parseInt(value),
														})
													}
													type="number"
												/>
											</div>
										</div>

										{/* Button Takes Full Width */}
										<ToggleControl
											label={__("Button Takes Full Width", "orbit-one")}
											checked={buttonTakesFullWidth}
											onChange={(value) =>
												setAttributes({
													buttonTakesFullWidth: value,
												})
											}
										/>

										{/* Button Horizontal Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px", marginTop: "15px" }}
										>
											<p>{__("Button Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Left", "orbit-one")}>
													<Button
														isPressed={buttonAlign === "left"}
														onClick={() =>
															setAttributes({ buttonAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={buttonAlign === "center"}
														onClick={() =>
															setAttributes({ buttonAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip text={__("Align Right", "orbit-one")}>
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

										{/* Button Text Alignment */}
										<div
											className="oone-alignment-control"
											style={{ gap: "10px", marginTop: "15px" }}
										>
											<p>{__("Button Text Alignment", "orbit-one")}</p>
											<ButtonGroup>
												<Tooltip text={__("Align Left", "orbit-one")}>
													<Button
														isPressed={buttonTextAlign === "left"}
														onClick={() =>
															setAttributes({ buttonTextAlign: "left" })
														}
														icon={alignLeft}
													/>
												</Tooltip>

												<Tooltip text={__("Align Center", "orbit-one")}>
													<Button
														isPressed={buttonTextAlign === "center"}
														onClick={() =>
															setAttributes({ buttonTextAlign: "center" })
														}
														icon={alignCenter}
													/>
												</Tooltip>

												<Tooltip text={__("Align Right", "orbit-one")}>
													<Button
														isPressed={buttonTextAlign === "right"}
														onClick={() =>
															setAttributes({ buttonTextAlign: "right" })
														}
														icon={alignRight}
													/>
												</Tooltip>
											</ButtonGroup>
										</div>

										{/* Button Padding(px) */}
										<div>
											<label
												style={{
													marginTop: "10px",
													paddingBottom: "10px",
												}}
											>
												{__("Button Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="buttonPadding"
												values={buttonPadding}
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
												{__("Button Mobile Padding (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="buttonMobilePadding"
												values={buttonMobilePadding}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Button Margin(px) */}
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
												{__("Button Margin (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="buttonMargin"
												values={buttonMargin}
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
												{__("Mobile Button Margin (px)", "orbit-one")}
											</label>
											<BoxModelControls
												type="buttonMobileMargin"
												values={buttonMobileMargin}
												updateBoxModel={updateBoxModel}
											/>
										</div>

										{/* Button Border */}
										<RangeControl
											label={__("Button Border", "orbit-one")}
											value={buttonBorder}
											onChange={(value) =>
												setAttributes({ buttonBorder: value })
											}
											min={0}
											max={3}
											step={0.1}
											help={__(
												"Uses a multiplier of the border size. Default is 1.",
												"orbit-one",
											)}
										/>

										{/* Button Border Radius (px) */}
										<div>
											<label
												style={{ paddingTop: "10px", paddingBottom: "10px" }}
											>
												{__("Button Border Radius (px)", "orbit-one")}
											</label>
											<CornerRadiusControls
												values={buttonBorderRadius}
												updateCorners={updateCorners}
												attributeName="buttonBorderRadius"
											/>
										</div>
									</div>
								)}
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
												{__("Button Text Hover Color", "orbit-one")}
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

				{/* ✅ ADD THIS NEW PANEL FOR LOADER STYLES */}
				<PanelBody
					title={__("Loading Indicator", "orbit-one")}
					initialOpen={false}
				>
					{/* --- Spinner Ring Color --- */}
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "500",
							}}
						>
							{__("Spinner Ring Color", "orbit-one")}
						</label>
						<Button
							onClick={() => toggleColorPicker("spinnerRingColor")}
							style={{
								background: resolveColor(spinnerRingColor) || "#333",
								color: "#FFFFFF",
								textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
								border: "1px solid #ddd",
								padding: "8px 16px",
								borderRadius: "6px",
								transition: "all 0.3s ease",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
								cursor: "pointer",
								fontSize: "14px",
								width: "100%",
								justifyContent: "center",
							}}
						>
							{activeColorPicker === "spinnerRingColor"
								? "Close"
								: "Choose Color"}
						</Button>
						{activeColorPicker === "spinnerRingColor" && (
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
									onSelect={(key) => setAttributes({ spinnerRingColor: key })}
								/>
								<ColorPicker
									color={resolveColor(spinnerRingColor)}
									onChangeComplete={(color) =>
										setAttributes({ spinnerRingColor: color.hex })
									}
									disableAlpha
								/>
							</div>
						)}
					</div>

					{/* --- Spinner Dot Color --- */}
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "500",
							}}
						>
							{__("Spinner Dot Color", "orbit-one")}
						</label>
						<Button
							onClick={() => toggleColorPicker("spinnerDotColor")}
							style={{
								background: resolveColor(spinnerDotColor) || "#333",
								color: "#FFFFFF",
								textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
								border: "1px solid #ddd",
								padding: "8px 16px",
								borderRadius: "6px",
								transition: "all 0.3s ease",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
								cursor: "pointer",
								fontSize: "14px",
								width: "100%",
								justifyContent: "center",
							}}
						>
							{activeColorPicker === "spinnerDotColor"
								? "Close"
								: "Choose Color"}
						</Button>
						{activeColorPicker === "spinnerDotColor" && (
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
									onSelect={(key) => setAttributes({ spinnerDotColor: key })}
								/>
								<ColorPicker
									color={resolveColor(spinnerDotColor)}
									onChangeComplete={(color) =>
										setAttributes({ spinnerDotColor: color.hex })
									}
									disableAlpha
								/>
							</div>
						)}
					</div>

					{/* --- Loading Text Color --- */}
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "500",
							}}
						>
							{__("Loading Text Color", "orbit-one")}
						</label>
						<Button
							onClick={() => toggleColorPicker("loadingTextColor")}
							style={{
								background: resolveColor(loadingTextColor) || "#333",
								color: "#FFFFFF",
								textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
								border: "1px solid #ddd",
								padding: "8px 16px",
								borderRadius: "6px",
								transition: "all 0.3s ease",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
								cursor: "pointer",
								fontSize: "14px",
								width: "100%",
								justifyContent: "center",
							}}
						>
							{activeColorPicker === "loadingTextColor"
								? "Close"
								: "Choose Color"}
						</Button>
						{activeColorPicker === "loadingTextColor" && (
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
									onSelect={(key) => setAttributes({ loadingTextColor: key })}
								/>
								<ColorPicker
									color={resolveColor(loadingTextColor)}
									onChangeComplete={(color) =>
										setAttributes({ loadingTextColor: color.hex })
									}
									disableAlpha
								/>
							</div>
						)}
					</div>

					{/* --- Dots Color --- */}
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "500",
							}}
						>
							{__("Loading Dots Color", "orbit-one")}
						</label>
						<Button
							onClick={() => toggleColorPicker("dotsColor")}
							style={{
								background: resolveColor(dotsColor) || "#333",
								color: "#FFFFFF",
								textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
								border: "1px solid #ddd",
								padding: "8px 16px",
								borderRadius: "6px",
								transition: "all 0.3s ease",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
								cursor: "pointer",
								fontSize: "14px",
								width: "100%",
								justifyContent: "center",
							}}
						>
							{activeColorPicker === "dotsColor" ? "Close" : "Choose Color"}
						</Button>
						{activeColorPicker === "dotsColor" && (
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
									onSelect={(key) => setAttributes({ dotsColor: key })}
								/>
								<ColorPicker
									color={resolveColor(dotsColor)}
									onChangeComplete={(color) =>
										setAttributes({ dotsColor: color.hex })
									}
									disableAlpha
								/>
							</div>
						)}
					</div>
				</PanelBody>

				{/* GOOGLE FORM MAPPING PANEL */}
				<PanelBody title="Google Form Mapping" initialOpen={false}>
					{/* Google Form Link */}
					<TextControl
						label={__("Google Form Link", "orbit-one")}
						value={googleFormLink}
						onChange={(value) => setAttributes({ googleFormLink: value })}
					/>
					{/* Subject Field Name */}
					<TextControl
						label={__("Subject Element Name", "orbit-one")}
						value={subjectFieldName}
						onChange={(value) => setAttributes({ subjectFieldName: value })}
					/>
					{/* Message Field Name */}
					<TextControl
						label={__("Message Element Name", "orbit-one")}
						value={messageFieldName}
						onChange={(value) => setAttributes({ messageFieldName: value })}
					/>
					{/* First Name Field Name */}
					<TextControl
						label={__("First Name Element Name", "orbit-one")}
						value={firstNameFieldName}
						onChange={(value) => setAttributes({ firstNameFieldName: value })}
					/>
					{/* Last Name Field Name */}
					<TextControl
						label={__("Last Name Element Name", "orbit-one")}
						value={lastNameFieldName}
						onChange={(value) => setAttributes({ lastNameFieldName: value })}
					/>
					{/* Email Field Name */}
					<TextControl
						label={__("Email Element Name", "orbit-one")}
						value={emailFieldName}
						onChange={(value) => setAttributes({ emailFieldName: value })}
					/>
					{/* Phone Number Field Name */}
					<TextControl
						label={__("Phone Number Element Name", "orbit-one")}
						value={phoneNumberFieldName}
						onChange={(value) => setAttributes({ phoneNumberFieldName: value })}
					/>
					{/* Form Source Field Name */}
					<TextControl
						label={__("Form Source Element Name", "orbit-one")}
						value={formSourceFieldName}
						onChange={(value) => setAttributes({ formSourceFieldName: value })}
					/>
					{/* Button Text Field Name */}
					<TextControl
						label={__("Button Text Element Name", "orbit-one")}
						value={buttonTextFieldName}
						onChange={(value) => setAttributes({ buttonTextFieldName: value })}
					/>
					<TextControl
						label={__("Entry ID Element Name", "orbit-one")}
						value={entryIdFieldName}
						onChange={(value) => setAttributes({ entryIdFieldName: value })}
						help={__(
							"The 'name' attribute of the field that will store the unique submission ID.",
							"orbit-one",
						)}
					/>
				</PanelBody>

				{/* 📐 BUSINESS INFORMATION PANEL */}
				<PanelBody
					title={__("Business Information", "orbit-one")}
					initialOpen={false}
				>
					<TabPanel
						className="storycraft-tabs"
						activeClass="active-tab"
						tabs={[
							{ name: "information", title: "Information" },
							{ name: "logo", title: "Company Logo" },
						]}
					>
						{(tab) => (
							<>
								{tab.name === "information" && (
									<div
										style={{
											marginTop: "10px",
											marginBottom: "10px",
											padding: "10px",
										}}
									>
										{/* Business Name */}
										<TextControl
											label={__("Business Name", "orbit-one")}
											value={businessName}
											onChange={(value) =>
												setAttributes({ businessName: value })
											}
										/>
										{/* Business Phone Number */}
										<TextControl
											label={__("Business Phone Number", "orbit-one")}
											value={businessPhone}
											onChange={(value) =>
												setAttributes({ businessPhone: value })
											}
										/>
										{/* Business Email */}
										<TextControl
											label={__("Business Email", "orbit-one")}
											value={businessEmail}
											onChange={(value) =>
												setAttributes({ businessEmail: value })
											}
										/>
										{/* ✅ Contact Type (as a Dropdown) */}
										<SelectControl
											label={__("Contact Type", "orbit-one")}
											value={contactType}
											options={[
												{
													label: "Customer Support",
													value: "Customer Support",
												},
												{
													label: "Technical Support",
													value: "Technical Support",
												},
												{ label: "Sales", value: "Sales" },
												{ label: "Billing Support", value: "Billing Support" },
												{ label: "Human Resources", value: "Human Resources" },
												{ label: "General Inquiry", value: "General Inquiry" },
											]}
											onChange={(value) =>
												setAttributes({ contactType: value })
											}
											help={__(
												"Select the purpose of this contact point.",
												"orbit-one",
											)}
										/>

										{/* ✅ Area Served (Text field with help text) */}
										<TextControl
											label={__("Area Served", "orbit-one")}
											value={areaServed}
											onChange={(value) => setAttributes({ areaServed: value })}
											placeholder="e.g., IN, US, Worldwide"
											help={__(
												"Enter country codes or names. Leave blank if not applicable.",
												"orbit-one",
											)}
										/>

										{/* ✅ Available Languages (Text field with help text) */}
										<TextControl
											label={__("Available Languages", "orbit-one")}
											value={availableLanguage}
											onChange={(value) =>
												setAttributes({ availableLanguage: value })
											}
											placeholder="e.g., English, Malayalam"
											help={__(
												"Enter languages, separated by commas.",
												"orbit-one",
											)}
										/>
									</div>
								)}

								{tab.name === "logo" && (
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
												{businessLogo ? (
													<img
														src={businessLogo}
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
														No business logo selected
													</div>
												)}

												{/* ✅ ADDED: TextControl for Alt Text */}
												{businessLogo && (
													<TextControl
														label={__("Logo Alt Text", "orbit-one")}
														value={businessLogoAltText}
														onChange={(value) =>
															setAttributes({ businessLogoAltText: value })
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
														setAttributes({ businessLogo: media.url })
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
																{businessLogo ? "Change Image" : "Select Image"}
															</Button>

															{businessLogo && (
																<Button
																	variant="link"
																	onClick={() =>
																		setAttributes({ businessLogo: "" })
																	}
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
																	Remove Logo
																</Button>
															)}
														</div>
													)}
												/>
											</div>
										</MediaUploadCheck>
									</div>
								)}
							</>
						)}
					</TabPanel>
				</PanelBody>
			</InspectorControls>

			{/* Form Preview in Editor */}
			<div class="oone-block-editor-preview">
				<Component
					attributes={attributes}
					useEditor={true}
					onSubjectClick={() => {
						setActiveTab("subjects");
						setIsContentPanelOpen(true);
					}}
				/>
			</div>

			{/* Fetching Form Data */}
			<div
				style={{
					maxWidth: "600px",
					margin: "40px auto",
					textAlign: "left",
					background: "#ffffff",
					padding: "20px",
					borderRadius: "12px",
					boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						background: "#eed4fa",
						padding: "20px",
						borderRadius: "10px",
						boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
						marginBottom: "20px",
						textAlign: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<h3
							style={{
								marginBottom: "20px",
								color: "#9813ca",
								fontSize: "30px",
							}}
						>
							Google Sheet Connector
						</h3>
					</div>
					<input
						type="text"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Enter google form prefill link"
						style={{
							width: "100%",
							padding: "8px",
							fontSize: "16px",
							border: `${inputBorder}px solid ${resolveColor(
								inputBorderColor,
								"#ccc",
							)}`,
							borderRadius: inputBorderRadius
								? getBorderRadiusString(inputBorderRadius)
								: "8px",
							background: "#f9f9f9",
							boxSizing: "border-box",
							marginBottom: "30px",
						}}
						onFocus={(e) => {
							e.target.style.border = `${inputBorder}px solid ${resolveColor(
								inputBorderFocusColor,
								"#44d9f9",
							)}`; // ✅ UPDATED
							e.target.style.boxShadow = inputShadow.enabled
								? `${inputShadow.offsetX}px ${inputShadow.offsetY}px ${inputShadow.blur}px ${inputShadow.spread}px rgba(0,0,0,${inputShadow.opacity})`
								: "none";
						}}
						onBlur={(e) => {
							e.target.style.border = `${inputBorder}px solid ${resolveColor(
								inputBorderColor,
								"#ccc",
							)}`; // ✅ UPDATED
							e.target.style.boxShadow = "none";
						}}
					/>
					<button
						onClick={fetchFormData}
						style={{
							width: "100%",
							background: "#9813ca",
							color: "#f8e9ff",
							fontSize: "20px",
							padding: "10px",
							border:
								buttonBorder > 0
									? `${buttonBorder}px solid ${resolveColor(
											buttonTextColor,
											"inherit",
									  )}`
									: "none",
							borderRadius: buttonBorderRadius
								? getBorderRadiusString(buttonBorderRadius)
								: "",
							textAlign: "center",
							transition: "all 0.3s ease",
							margin: "0 auto",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#f8e9ff";
							e.currentTarget.style.color = "#9813ca";
							if (buttonBorder > 0) {
								e.currentTarget.style.border = `${buttonBorder}px solid #9813ca`;
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#9813ca";
							e.currentTarget.style.color = "#f8e9ff";
							if (buttonBorder > 0) {
								e.currentTarget.style.border = `${buttonBorder}px solid #f8e9ff`;
							}
						}}
					>
						Sync Google Sheet
					</button>

					{error && (
						<p
							style={{
								color: "red",
								marginTop: "10px",
								textAlign: "center",
								fontSize: "14px",
							}}
						>
							{error}
						</p>
					)}
				</div>

				{googleFormLink && formFields?.length > 0 && (
					<div
						style={{
							background: "#eed4fa",
							padding: "20px",
							borderRadius: "10px",
							boxShadow: "0 4px 12px rgba(152, 19, 202, 0.2)",
							marginTop: "20px",
						}}
					>
						<h3
							style={{
								marginBottom: "10px",
								color: "#9813ca",
								fontSize: "24px",
							}}
						>
							<strong>Google Form:</strong>{" "}
							<span
								style={{
									color: "#c154e8",
									fontSize: "14px",
								}}
							>
								{googleFormLink}
							</span>
						</h3>

						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								marginTop: "15px",
								overflowX: "auto",
							}}
						>
							{/* Header */}
							<div
								style={{
									display: "flex",
									background: "#9813ca",
									color: "#ffffff",
									fontWeight: "bold",
									fontSize: "14px",
								}}
							>
								<div style={{ flex: 1, padding: "10px", textAlign: "left" }}>
									Label
								</div>
								<div style={{ flex: 1, padding: "10px", textAlign: "left" }}>
									Name
								</div>
							</div>

							{copied && (
								<div
									style={{
										position: "fixed",
										bottom: "30px",
										left: "50%",
										transform: "translateX(-50%)",
										padding: "10px 20px",
										backgroundColor: "#9813ca",
										color: "#ffffff",
										borderRadius: "5px",
										zIndex: 9999,
										fontWeight: "bold",
										transition: "opacity 0.5s ease-out",
										opacity: 1,
									}}
								>
									{copyMessage}
								</div>
							)}

							{(formFields || [])
								.sort((a, b) => {
									const numA = a.label.match(/^\d+/);
									const numB = b.label.match(/^\d+/);
									if (numA && !numB) return -1;
									if (!numA && numB) return 1;
									if (numA && numB) return numA[0] - numB[0];
									return a.label.localeCompare(b.label);
								})
								.map((input, index) => (
									<div
										key={index}
										style={{
											display: "flex",
											padding: "10px",
											borderBottom: "1px solid #ddd",
											background: index % 2 === 0 ? "#ffffff" : "#f8e9ff",
										}}
									>
										<div
											style={{
												flex: 1,
												padding: "8px",
												textAlign: "left",
												fontSize: "14px",
												fontWeight: "bold",
												color: "#9813ca",
											}}
										>
											{input.label}
										</div>

										<div
											style={{
												flex: 1,
												padding: "8px",
												textAlign: "left",
												fontSize: "14px",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span>{input.name}</span>
											<div
												onClick={() => handleCopy(input.name)}
												title="Copy to clipboard"
												style={{
													cursor: "pointer",
													display: "inline-flex",
													marginLeft: "8px",
													color: "#9813ca",
													fontSize: "16px",
													transition: "all 0.2s ease-in-out",
												}}
												onMouseEnter={(e) =>
													(e.currentTarget.style.color = "#c154e8")
												}
												onMouseLeave={(e) =>
													(e.currentTarget.style.color = "#9813ca")
												}
											>
												<Copy size={18} />
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
