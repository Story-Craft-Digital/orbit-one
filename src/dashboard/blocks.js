document.addEventListener("DOMContentLoaded", function () {
	const modal = document.getElementById("oone-block-modal");
	if (!modal) return;

	const overlay = document.getElementById("oone-block-modal-overlay");
	const modalContent = modal.querySelector(".relative");
	const closeButton = document.getElementById("oone-block-modal-close");
	const previewButtons = document.querySelectorAll(
		".oone-block-preview-trigger",
	);

	const titleEl = document.getElementById("oone-block-modal-title");
	const nameEl = document.getElementById("oone-block-modal-name");
	const descriptionEl = document.getElementById(
		"oone-block-modal-description",
	);
	const desktopImg = document.getElementById("oone-desktop-img");
	const mobileImg = document.getElementById("oone-mobile-img");

	const tabsContainer = document.getElementById("oone-block-modal-tabs");
	if (!tabsContainer) return;
	const tabButtons = tabsContainer.querySelectorAll("button");
	const tabPanels = modal.querySelectorAll(".tab-panel");

	const form = document.getElementById("oone-blocks-form");

	if (form) {
        form.addEventListener("submit", function (e) {
            const btn = document.querySelector(
                'button[name="oone_save_blocks_settings"]',
            );

            if (!btn) return;

            // Instead of disabling, we just add a visual "saving" state
            btn.innerText = "Saving...";
            
            // Allow the form to submit naturally
            // We don't disable it until the event is fully processed
            setTimeout(() => {
                btn.disabled = true;
            }, 50);
        });
    }

	function openModal(button) {
		// Set content
		titleEl.textContent = button.dataset.title;
		nameEl.textContent = button.dataset.name;
		descriptionEl.textContent = button.dataset.description;
		desktopImg.src = button.dataset.desktopSrc;
		mobileImg.src = button.dataset.mobileSrc;

		// Reset to Desktop tab
		switchTab(tabButtons[0]);

		// Reveal Modal
		modal.classList.remove("hidden");
		modal.classList.add("flex");
		document.body.style.overflow = "hidden";

		// Animate in
		requestAnimationFrame(() => {
			overlay.classList.replace("opacity-0", "opacity-100");
			modalContent.classList.replace("opacity-0", "opacity-100");
			modalContent.classList.replace("scale-95", "scale-100");
		});
	}

	function closeModal() {
		overlay.classList.replace("opacity-100", "opacity-0");
		modalContent.classList.replace("opacity-100", "opacity-0");
		modalContent.classList.replace("scale-100", "scale-95");

		setTimeout(() => {
			modal.classList.add("hidden");
			modal.classList.remove("flex");
			desktopImg.src = "";
			mobileImg.src = "";
			document.body.style.overflow = "";
		}, 300);
	}

	function switchTab(clickedTab) {
		const targetTab = clickedTab.dataset.tab;
		const targetPanelId = "oone-block-modal-content-" + targetTab;

		tabButtons.forEach((tab) => {
			const isActive = tab === clickedTab;
			tab.className = isActive
				? "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-purple-600 shadow-sm"
				: "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-700";
		});

		tabPanels.forEach((panel) => {
			panel.classList.toggle("hidden", panel.id !== targetPanelId);
		});
	}

	previewButtons.forEach((btn) => {
		btn.addEventListener("click", () => openModal(btn));
	});

	tabButtons.forEach((btn) =>
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation(); // Stop the click from traveling to the overlay
			switchTab(btn);
		}),
	);

	closeButton.addEventListener("click", closeModal);

	overlay.addEventListener("click", function (e) {
		// Only close if the click was exactly on the dark overlay,
		// not on anything inside the modal.
		if (e.target === overlay) {
			closeModal();
		}
	});
	document.addEventListener(
		"keydown",
		(e) => e.key === "Escape" && closeModal(),
	);
});
