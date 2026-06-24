function ooneOpenPortal(url) {
	const modal = document.getElementById("oone-portal-modal");
	const confirmBtn = document.getElementById("oone-portal-confirm");
	confirmBtn.href = url;
	modal.classList.remove("hidden");
	modal.classList.add("flex");
	document.body.style.overflow = "hidden";
}

function ooneClosePortal() {
	const modal = document.getElementById("oone-portal-modal");
	modal.classList.add("hidden");
	modal.classList.remove("flex");
	document.body.style.overflow = "";
}
document.addEventListener("DOMContentLoaded", function () {
	// FAQ Accordion Logic
	const triggers = document.querySelectorAll(".faq-trigger");
	triggers.forEach((trigger) => {
		trigger.addEventListener("click", function () {
			const parent = this.closest(".faq-item");
			const isOpen = parent.classList.contains("active");

			document.querySelectorAll(".faq-item").forEach((item) => {
				item.classList.remove("active");

				const btn = item.querySelector(".faq-trigger");
				if (btn) {
					btn.setAttribute("aria-expanded", "false");
				}
			});

			if (!isOpen) {
				parent.classList.add("active");
				this.setAttribute("aria-expanded", "true");
			}
		});
	});

	// Add highlight effect when scrolling to FAQ
	const faqBtn = document.querySelector('button[onclick*="faq"]');
	if (faqBtn) {
		faqBtn.addEventListener("click", function () {
			const faqSection = document.getElementById("faq").closest(".group");
			faqSection.classList.add("faq-focus-highlight");
			setTimeout(() => {
				faqSection.classList.remove("faq-focus-highlight");
			}, 2000);
		});
	}
});
