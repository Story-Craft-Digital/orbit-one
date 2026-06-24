// Global scope utility assignments for row interactions
window.ooneCopy = function (text, btn) {
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).then(() => {
			showCopyFeedback(btn);
		});
	} else {
		let textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-999999px";
		textArea.style.top = "-999999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand("copy");
			showCopyFeedback(btn);
		} catch (err) {
			console.error("Unable to copy", err);
		}
		document.body.removeChild(textArea);
	}
};

window.ooneCloseModal = function () {
	const modal = document.getElementById("oone-lead-modal");
	if (modal) {
		modal.classList.add("hidden");
		modal.classList.remove("flex");
	}
	document.body.classList.remove("oone-modal-active");
};

function showCopyFeedback(btn) {
	const originalHTML = btn.innerHTML;
	btn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
    `;
	setTimeout(() => {
		btn.innerHTML = originalHTML;
	}, 1500);
}

// Attach listeners cleanly to row entries
const viewButtons = document.querySelectorAll(".oone-view-lead-btn");
if (viewButtons.length > 0) {
	viewButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const d = btn.dataset;
			const meta = JSON.parse(d.meta);

			document.getElementById("m-name").textContent = d.name;
			document.getElementById("m-id").textContent = "#" + d.id;

			const cleanPhone = d.phone.replace(/\D/g, "");
			document.getElementById("m-wa").href = `https://wa.me/${cleanPhone}`;
			document.getElementById("m-tel").href = `tel:${d.phone}`;
			document.getElementById("m-mail").href = `mailto:${d.email}`;

			let html = "";
			const escHtml = (str) => {
				const p = document.createElement("p");
				p.textContent = str;
				return p.innerHTML;
			};

			Object.entries(meta).forEach(([key, value]) => {
				if (value) {
					const safeKey = escHtml(key.replace(/_/g, " "));
					const safeValue = escHtml(String(value));

					html += `
            <div class="mb-4 border-b border-slate-100 pb-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${safeKey}</label>
                <div class="text-sm font-bold text-slate-700">${safeValue}</div>
            </div>
        `;
				}
			});

			document.getElementById("m-meta-container").innerHTML = html;

			const modal = document.getElementById("oone-lead-modal");
			modal.classList.remove("hidden");
			modal.classList.add("flex");
			document.body.classList.add("oone-modal-active");
		});
	});
}

const overlay = document.getElementById("oone-lead-overlay");
if (overlay) {
	overlay.onclick = window.ooneCloseModal;
} // ✅ ADDED: Dynamic Timezone Converter Engine
function ooneLocalizeDashboardTimestamps() {
	document
		.querySelectorAll(".SCD-local-time-tracker")
		.forEach(function (container) {
			const utcString = container.getAttribute("data-utc");
			if (!utcString) return;

			// Automatically shifts hours matching the browser's geography settings
			const localDate = new Date(utcString);

			// Parse date layout locally ("May 20, 2026")
			const formattedDate = localDate.toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			});

			// Parse time layout locally ("7:45 PM")
			const formattedTime = localDate.toLocaleTimeString(undefined, {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});

			const dateSpan = container.querySelector(".date-display-span");
			const timeSpan = container.querySelector(".time-display-span");

			if (dateSpan) dateSpan.textContent = formattedDate;
			if (timeSpan) timeSpan.textContent = formattedTime;
		});
}

// Execute the localization scan immediately when the DOM tree mounts
if (document.readyState === "loading") {
	document.addEventListener(
		"DOMContentLoaded",
		ooneLocalizeDashboardTimestamps,
	);
} else {
	ooneLocalizeDashboardTimestamps();
}
