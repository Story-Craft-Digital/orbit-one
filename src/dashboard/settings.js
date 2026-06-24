// 1. API Key Visibility Toggle
const apiKeyToggle = document.querySelector(".api-key-toggle");
if (apiKeyToggle) {
	const apiKeyInput = document.getElementById("google_maps_api_key");
	const eyeOpen = apiKeyToggle.querySelector(".eye-open");
	const eyeClosed = apiKeyToggle.querySelector(".eye-closed");

	apiKeyToggle.addEventListener("click", function () {
		if (apiKeyInput.type === "password") {
			apiKeyInput.type = "text";
			eyeOpen.classList.add("hidden");
			eyeClosed.classList.remove("hidden");
		} else {
			apiKeyInput.type = "password";
			eyeOpen.classList.remove("hidden");
			eyeClosed.classList.add("hidden");
		}
	});
}

// 2. Live Color Preset Previews
const colorPickers = document.querySelectorAll(".color-picker-input");
colorPickers.forEach((picker) => {
	picker.addEventListener("input", function () {
		this.parentElement.style.backgroundColor = this.value;
	});
});

// 3. Edit-in-Place for Palette Label Identifiers
const palettes = document.querySelectorAll(".palette-container");
palettes.forEach((palette) => {
	const editButton = palette.querySelector(".edit-palette-button");
	const textSpan = palette.querySelector(".palette-label-text");
	const textInput = palette.querySelector(".palette-label-input");

	if (editButton && textSpan && textInput) {
		editButton.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			textSpan.classList.add("hidden");
			textInput.classList.remove("hidden");
			textInput.focus();
			textInput.select();
		});

		const switchToTextView = () => {
			textSpan.textContent = textInput.value;
			textSpan.classList.remove("hidden");
			textInput.classList.add("hidden");
		};

		textInput.addEventListener("blur", switchToTextView);
		textInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				textInput.blur();
			}
		});
	}
});

// 4. System Statistics Report Clipboard Handlers
const copyBtn = document.getElementById("oone-copy-system-status");
const copyBtnText = document.getElementById("copy-btn-text");
const statusArea = document.getElementById("oone-system-status-textarea");

if (copyBtn && statusArea) {
	copyBtn.addEventListener("click", function () {
		const text = statusArea.value;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				const originalText = copyBtnText.textContent;
				copyBtnText.textContent = "Report Copied!";
				copyBtn.classList.replace("bg-purple-600", "bg-emerald-600");

				setTimeout(() => {
					copyBtnText.textContent = originalText;
					copyBtn.classList.replace("bg-emerald-600", "bg-purple-600");
				}, 2000);
			})
			.catch((err) => {
				console.error("Failed to copy: ", err);
			});
	});
}

// 5. Custom Safety Confirmation Modal Layouts
const confirmModal = document.getElementById("oone-confirm-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");
const iconContainer = document.getElementById("modal-icon-container");

document.querySelectorAll(".oone-confirm-trigger").forEach((trigger) => {
	trigger.addEventListener("click", function (e) {
		e.preventDefault();
		const targetUrl = this.getAttribute("href");
		const title = this.getAttribute("data-title");
		const desc = this.getAttribute("data-desc");
		const type = this.getAttribute("data-type");

		modalTitle.textContent = title;
		modalDesc.textContent = desc;
		modalConfirm.setAttribute("href", targetUrl);

		if (type === "danger") {
			iconContainer.className =
				"w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4";
			iconContainer.innerHTML =
				'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
			modalConfirm.className =
				"flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200";
		} else {
			iconContainer.className =
				"w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4";
			iconContainer.innerHTML =
				'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
			modalConfirm.className =
				"flex-1 py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200";
		}

		confirmModal.classList.remove("hidden");
	});
});

if (modalCancel) {
	modalCancel.addEventListener("click", () =>
		confirmModal.classList.add("hidden"),
	);
}
