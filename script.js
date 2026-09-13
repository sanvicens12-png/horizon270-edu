// =========================================================
// HORIZON270.EDU
// Supabase + Authentication + UI
// =========================================================


// =========================================================
// 1. SUPABASE
// =========================================================

const SUPABASE_URL = "https://cecouhunurwkncfcjjor.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_mU_871SdiMJgSA1LHCLEAg_my7qG2oq";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =========================================================
// 2. REGISTER
// =========================================================

async function registerUser(email, password, displayName) {

    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,
            password: password,

            options: {
                data: {
                    display_name: displayName
                }
            }

        });


    if (error) {

        console.error(
            "Error de registre:",
            error.message
        );

        return {
            success: false,
            error: error.message
        };
    }


    return {
        success: true,
        data: data
    };
}


// =========================================================
// 3. LOGIN
// =========================================================

async function loginUser(email, password) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,
            password: password

        });


    if (error) {

        console.error(
            "Error d'inici de sessió:",
            error.message
        );

        return {
            success: false,
            error: error.message
        };
    }


    return {
        success: true,
        data: data
    };
}


// =========================================================
// 4. LOGOUT
// =========================================================

async function logoutUser() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Error tancant sessió:",
            error.message
        );

        return false;
    }


    return true;
}


// =========================================================
// 5. CURRENT USER
// =========================================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Error obtenint l'usuari:",
            error.message
        );

        return null;
    }


    return user;
}


// =========================================================
// 6. SHOW LOGIN
// =========================================================

function showLogin() {

    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");


    content.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                HORIZON270.EDU
            </span>

            <h2>
                Iniciar sessió
            </h2>

            <p>
                Accedeix al teu compte de Horizon270.edu.
            </p>


            <form id="loginForm">

                <label for="loginEmail">
                    Correu electrònic
                </label>

                <input
                    id="loginEmail"
                    type="email"
                    placeholder="tu@exemple.com"
                    required
                >


                <label for="loginPassword">
                    Contrasenya
                </label>

                <input
                    id="loginPassword"
                    type="password"
                    placeholder="La teva contrasenya"
                    required
                >


                <button
                    type="submit"
                    class="btn primary"
                >
                    Iniciar sessió
                </button>

            </form>


            <div
                id="authMessage"
                class="auth-message"
            ></div>


            <p class="auth-switch">

                Encara no tens compte?

                <button
                    type="button"
                    onclick="showSignup()"
                >
                    Crear compte
                </button>

            </p>

        </div>

    `;


    modal.classList.remove("hidden");


    const form =
        document.getElementById("loginForm");


    form.addEventListener(
        "submit",
        handleLogin
    );
}


// =========================================================
// 7. SHOW SIGNUP
// =========================================================

function showSignup() {

    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");


    content.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                HORIZON270.EDU
            </span>

            <h2>
                Crear compte
            </h2>

            <p>
                Crea el teu compte de Horizon270.edu.
            </p>


            <form id="signupForm">


                <label for="signupName">
                    Nom
                </label>

                <input
                    id="signupName"
                    type="text"
                    placeholder="El teu nom"
                    required
                >


                <label for="signupEmail">
                    Correu electrònic
                </label>

                <input
                    id="signupEmail"
                    type="email"
                    placeholder="tu@exemple.com"
                    required
                >


                <label for="signupPassword">
                    Contrasenya
                </label>

                <input
                    id="signupPassword"
                    type="password"
                    placeholder="Mínim 6 caràcters"
                    minlength="6"
                    required
                >


                <button
                    type="submit"
                    class="btn primary"
                >
                    Crear compte
                </button>


            </form>


            <div
                id="authMessage"
                class="auth-message"
            ></div>


            <p class="auth-switch">

                Ja tens un compte?

                <button
                    type="button"
                    onclick="showLogin()"
                >
                    Iniciar sessió
                </button>

            </p>

        </div>

    `;


    modal.classList.remove("hidden");


    const form =
        document.getElementById("signupForm");


    form.addEventListener(
        "submit",
        handleSignup
    );
}


// =========================================================
// 8. HANDLE SIGNUP
// =========================================================

async function handleSignup(event) {

    event.preventDefault();


    const name =
        document.getElementById("signupName").value.trim();


    const email =
        document.getElementById("signupEmail").value.trim();


    const password =
        document.getElementById("signupPassword").value;


    const message =
        document.getElementById("authMessage");


    message.textContent =
        "Creant el compte...";


    const result =
        await registerUser(
            email,
            password,
            name
        );


    if (!result.success) {

        message.textContent =
            "No s'ha pogut crear el compte: " +
            result.error;

        return;
    }


    /*
     * Supabase pot requerir confirmació
     * del correu electrònic abans de permetre
     * iniciar sessió.
     */

    if (
        result.data.user &&
        !result.data.session
    ) {

        message.textContent =
            "Compte creat. Revisa el teu correu electrònic per confirmar-lo.";

        return;
    }


    message.textContent =
        "Compte creat correctament!";


    setTimeout(() => {

        closeModal();

    }, 1200);
}


// =========================================================
// 9. HANDLE LOGIN
// =========================================================

async function handleLogin(event) {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail").value.trim();


    const password =
        document.getElementById("loginPassword").value;


    const message =
        document.getElementById("authMessage");


    message.textContent =
        "Iniciant sessió...";


    const result =
        await loginUser(
            email,
            password
        );


    if (!result.success) {

        message.textContent =
            "No s'ha pogut iniciar sessió: " +
            result.error;

        return;
    }


    message.textContent =
        "Sessió iniciada correctament.";


    setTimeout(() => {

        closeModal();

        updateNavigation();

    }, 700);
}


// =========================================================
// 10. CLOSE MODAL
// =========================================================

function closeModal() {

    const modal =
        document.getElementById("modal");


    modal.classList.add("hidden");
}


// =========================================================
// 11. UPDATE NAVIGATION
// =========================================================

async function updateNavigation() {

    const user =
        await getCurrentUser();


    const navActions =
        document.querySelector(".nav-actions");


    if (!navActions) {
        return;
    }


    if (!user) {

        navActions.innerHTML = `

            <button
                class="btn secondary"
                onclick="showLogin()"
            >
                Iniciar sessió
            </button>

            <button
                class="btn primary"
                onclick="showSignup()"
            >
                Crear compte
            </button>

        `;

        return;
    }


    navActions.innerHTML = `

        <span class="user-email">
            ${escapeHTML(user.email)}
        </span>

        <button
            class="btn secondary"
            onclick="handleLogout()"
        >
            Tancar sessió
        </button>

    `;
}


// =========================================================
// 12. LOGOUT FROM UI
// =========================================================

async function handleLogout() {

    const success =
        await logoutUser();


    if (!success) {

        alert(
            "No s'ha pogut tancar la sessió."
        );

        return;
    }


    updateNavigation();
}


// =========================================================
// 13. ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================================
// 14. SUPABASE AUTH STATE
// =========================================================

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Auth event:",
            event
        );


        if (session) {

            console.log(
                "Usuari connectat:",
                session.user.email
            );

        } else {

            console.log(
                "Cap usuari connectat."
            );
        }


        updateNavigation();
    }
);


// =========================================================
// 15. SCROLL
// =========================================================

function scrollToSection(sectionId) {

    const section =
        document.getElementById(sectionId);


    if (!section) {
        return;
    }


    section.scrollIntoView({
        behavior: "smooth"
    });
}


// =========================================================
// 16. TEST SUPABASE
// =========================================================

async function testSupabaseConnection() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Error connectant amb Supabase:",
            error.message
        );

        return;
    }


    if (user) {

        console.log(
            "Supabase connectat.",
            "Usuari:",
            user.email
        );

    } else {

        console.log(
            "Supabase connectat correctament."
        );
    }
}


// =========================================================
// 17. START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Horizon270.edu iniciat."
        );


        await testSupabaseConnection();


        await updateNavigation();

    }
);
