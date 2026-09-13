const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

function showSignup() {
  modalContent.innerHTML = `
    <span class="eyebrow">CREAR COMPTE</span>
    <h2 style="margin-top:10px;">Com utilitzaràs Horizon270.edu?</h2>
    <p style="color:#9aa5b5;margin-top:10px;">
      Selecciona el tipus de compte que correspon a la teva situació.
    </p>

    <div class="role-grid">
      <button class="role">🏫<br><strong>Centre educatiu</strong></button>
      <button class="role">👨‍🏫<br><strong>Professor</strong></button>
      <button class="role">👨‍💼<br><strong>Professional</strong></button>
      <button class="role">👨‍🎓<br><strong>Alumne</strong></button>
      <button class="role">👤<br><strong>Estudiant independent</strong></button>
      <button class="role">👨‍👩‍👧<br><strong>Família</strong></button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function showLogin() {
  modalContent.innerHTML = `
    <span class="eyebrow">ACCÉS</span>
    <h2 style="margin-top:10px;">Iniciar sessió</h2>

    <div style="display:grid;gap:14px;margin-top:25px;">
      <input
        type="email"
        placeholder="Correu electrònic"
        style="padding:14px;border-radius:10px;border:1px solid #252d3a;background:#151b25;color:white;"
      >

      <input
        type="password"
        placeholder="Contrasenya"
        style="padding:14px;border-radius:10px;border:1px solid #252d3a;background:#151b25;color:white;"
      >

      <button class="btn primary">Entrar</button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth"
  });
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
