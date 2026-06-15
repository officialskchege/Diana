export function renderOnboardingForm(mountEl, { onSubmit }) {
  mountEl.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "card";

  formCard.innerHTML = `
    <div class="cardHeader">
      <h2>First Launch</h2>
      <span class="kbd">setup</span>
    </div>
    <div class="cardBody">
      <div class="col">
        <div class="field">
          <label>Full Name</label>
          <input type="text" id="fullName" placeholder="Bruce" autocomplete="name" />
        </div>
        <div class="field">
          <label>Nickname (used by Diana)</label>
          <input type="text" id="nickname" placeholder="Bruce" autocomplete="nickname" />
        </div>

        <div class="row" style="justify-content:flex-end">
          <button class="btn btnPrimary" id="saveProfile">Save</button>
        </div>
        <div style="color: var(--muted); font-size: 13px; line-height: 1.4">
          You can edit this later in settings.
        </div>
      </div>
    </div>
  `;

  mountEl.appendChild(formCard);

  const btn = formCard.querySelector("#saveProfile");
  btn.addEventListener("click", () => {
    const fullName =
      (formCard.querySelector("#fullName").value || "").trim() || "Bruce";
    const nickname =
      (formCard.querySelector("#nickname").value || "").trim() || "Bruce";

    onSubmit({ fullName, nickname });
    mountEl.dispatchEvent(new Event("profile:submitted"));
  });
}
