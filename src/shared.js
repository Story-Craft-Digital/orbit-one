// Import base libraries
import * as lucide from "lucide-react";
import * as motionLib from "framer-motion";
import confetti from "canvas-confetti";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

import {
	// Social & Brands
	FaWhatsapp,
	FaFacebookF,
	FaTwitter,
	FaInstagram,
	FaLinkedinIn,
	FaYoutube,
	FaPinterestP,
	FaGithub,
	FaTiktok,
	// Contact & Communication
	FaPhone,
	FaEnvelope,
	FaMapMarkerAlt,
	FaGlobe,
	FaFax,
	// Actions & Editing
	FaCopy,
	FaCut,
	FaPaste,
	FaEdit,
	FaTrashAlt,
	FaPlus,
	FaMinus,
	FaSyncAlt,
	FaSearch,
	FaPrint,
	FaDownload,
	FaUpload,
	FaShareAlt,
	FaExternalLinkAlt,
	// UI & Navigation
	FaHome,
	FaCog,
	FaBars,
	FaTimes,
	FaCheck,
	FaInfoCircle,
	FaQuestionCircle,
	FaExclamationTriangle,
	FaSpinner,
	FaEllipsisH,
	FaArrowLeft,
	FaArrowRight,
	FaArrowUp,
	FaArrowDown,
	FaChevronLeft,
	FaChevronRight,
	FaChevronUp,
	FaChevronDown,
	// Users & People
	FaUser,
	FaUserCircle,
	FaUserPlus,
	FaUserCog,
	FaUsers,
	// Media
	FaPlay,
	FaPause,
	FaStop,
	FaVideo,
	FaImage,
	FaHeadphones,
	FaVolumeUp,
	FaVolumeMute,
	// E-commerce
	FaShoppingCart,
	FaCreditCard,
	FaTag,
	FaStar,
	FaRegStar,
	// Files & Folders
	FaFile,
	FaFilePdf,
	FaFileWord,
	FaFileImage,
	FaFolder,
	FaFolderOpen,
} from "react-icons/fa";

// From Material Design (md) - Excellent for modern UI and actions
import {
	// Common UI
	MdSettings,
	MdAccountCircle,
	MdDelete,
	MdSave,
	MdHome,
	MdDashboard,
	MdMenu,
	MdClose,
	MdLogin,
	MdLogout,
	// Actions
	MdContentCopy,
	MdLink,
	MdAttachFile,
	MdFilterList,
	MdVisibility,
	MdVisibilityOff,
	MdDragIndicator,
	MdRefresh,
	MdSearch,
	// Users
	MdPerson,
	MdGroup,
	// Alerts
	MdDone,
	MdError,
	MdWarning,
	// Other
	MdDarkMode,
	MdLightMode,
} from "react-icons/md";

// From Bootstrap Icons (bi) - Clean, modern, and versatile
import {
	// UI & Layout
	BiGrid,
	BiList,
	BiLayoutSidebar,
	BiWindow,
	BiTable,
	// General Actions
	BiPaperclip,
	BiCalendar,
	BiBell,
	BiBookmark,
	BiLock,
	BiUnlock,
	// E-commerce
	BiCart,
	BiBagCheck,
	BiCreditCard2Front,
	// Arrows & Chevrons
	BiArrowBack,
	BiArrowFromLeft,
	BiChevronDown,
	BiChevronUp,
} from "react-icons/bi";

// From Simple Icons (si) - The BEST for specific brand logos
import {
	// Design & Tech
	SiFigma,
	SiAdobephotoshop,
	SiAdobeillustrator,
	SiVisualstudiocode,
	// Development
	SiWordpress,
	SiReact,
	SiJavascript,
	SiHtml5,
	SiCss3,
	SiGit,
	SiGithub,
	SiNodedotjs,
	// Business & Communication
	SiGoogle,
	SiMicrosoft,
	SiSlack,
	SiZoom,
	SiGooglechrome,
} from "react-icons/si";

// Initialize the global object
if (typeof window !== "undefined") {
	window.oone_shared = {
		lucide,
		confetti,
		motion: motionLib,
		flatpickr,

		utils: {
			// Inside shared.js utils
			resolveAsset: (value) => {
				const settings = window.ooneSettings || {};
				const pluginUrl = settings.pluginUrl || "";
				const assetMap = settings.assetMap || {}; 
				if (assetMap[value]) {
					return `${pluginUrl}${assetMap[value]}`;
				}
				return value;
			},
		},

		// A structured object containing all your curated icons
		icons: {
			fa: {
				// Social & Brands
				FaWhatsapp,
				FaFacebookF,
				FaTwitter,
				FaInstagram,
				FaLinkedinIn,
				FaYoutube,
				FaPinterestP,
				FaGithub,
				FaTiktok,
				// Contact & Communication
				FaPhone,
				FaEnvelope,
				FaMapMarkerAlt,
				FaGlobe,
				FaFax,
				// Actions & Editing
				FaCopy,
				FaCut,
				FaPaste,
				FaEdit,
				FaTrashAlt,
				FaPlus,
				FaMinus,
				FaSyncAlt,
				FaSearch,
				FaPrint,
				FaDownload,
				FaUpload,
				FaShareAlt,
				FaExternalLinkAlt,
				// UI & Navigation
				FaHome,
				FaCog,
				FaBars,
				FaTimes,
				FaCheck,
				FaInfoCircle,
				FaQuestionCircle,
				FaExclamationTriangle,
				FaSpinner,
				FaEllipsisH,
				FaArrowLeft,
				FaArrowRight,
				FaArrowUp,
				FaArrowDown,
				FaChevronLeft,
				FaChevronRight,
				FaChevronUp,
				FaChevronDown,
				// Users & People
				FaUser,
				FaUserCircle,
				FaUserPlus,
				FaUserCog,
				FaUsers,
				// Media
				FaPlay,
				FaPause,
				FaStop,
				FaVideo,
				FaImage,
				FaHeadphones,
				FaVolumeUp,
				FaVolumeMute,
				// E-commerce
				FaShoppingCart,
				FaCreditCard,
				FaTag,
				FaStar,
				FaRegStar,
				// Files & Folders
				FaFile,
				FaFilePdf,
				FaFileWord,
				FaFileImage,
				FaFolder,
				FaFolderOpen,
			},
			md: {
				// Common UI
				MdSettings,
				MdAccountCircle,
				MdDelete,
				MdSave,
				MdHome,
				MdDashboard,
				MdMenu,
				MdClose,
				MdLogin,
				MdLogout,
				// Actions
				MdContentCopy,
				MdLink,
				MdAttachFile,
				MdFilterList,
				MdVisibility,
				MdVisibilityOff,
				MdDragIndicator,
				MdRefresh,
				MdSearch,
				// Users
				MdPerson,
				MdGroup,
				// Alerts
				MdDone,
				MdError,
				MdWarning,
				// Other
				MdDarkMode,
				MdLightMode,
			},
			bi: {
				// UI & Layout
				BiGrid,
				BiList,
				BiLayoutSidebar,
				BiWindow,
				BiTable,
				// General Actions
				BiPaperclip,
				BiCalendar,
				BiBell,
				BiBookmark,
				BiLock,
				BiUnlock,
				// E-commerce
				BiCart,
				BiBagCheck,
				BiCreditCard2Front,
				// Arrows & Chevrons
				BiArrowBack,
				BiArrowFromLeft,
				BiChevronDown,
				BiChevronUp,
			},
			si: {
				// Design & Tech
				SiFigma,
				SiAdobephotoshop,
				SiAdobeillustrator,
				SiVisualstudiocode,
				// Development
				SiWordpress,
				SiReact,
				SiJavascript,
				SiHtml5,
				SiCss3,
				SiGit,
				SiGithub,
				SiNodedotjs,
				// Business & Communication
				SiGoogle,
				SiMicrosoft,
				SiSlack,
				SiZoom,
				SiGooglechrome,
			},
		},
	};
}
