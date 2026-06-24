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
