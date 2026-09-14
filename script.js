// =========================================================
// HORIZON270.EDU
// Supabase + Authentication + Dashboard
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

    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");


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

                <div>
                    <label for="loginEmail">
                        Correu electrònic
                    </label>

                    <input
                        id="loginEmail"
                        type="email"
                        placeholder="tu@exemple.com"
                        autocomplete="email"
                        required
                    >
                </div>


                <div>
                    <label for="loginPassword">
                        Contrasenya
                    </label>

                    <input
                        id="loginPassword"
                        type="password"
                        placeholder="La teva contrasenya"
                        autocomplete="current-password"
                        required
                    >
                </div>


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

    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");


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


                <div>

                    <label for="signupName">
                        Nom
                    </label>

                    <input
                        id="signupName"
                        type="text"
                        placeholder="El teu nom"
                        autocomplete="name"
                        maxlength="80"
                        required
                    >

                </div>


                <div>

                    <label for="signupEmail">
                        Correu electrònic
                    </label>

                    <input
                        id="signupEmail"
                        type="email"
                        placeholder="tu@exemple.com"
                        autocomplete="email"
                        required
                    >

                </div>


                <div>

                    <label for="signupPassword">
                        Contrasenya
                    </label>

                    <input
                        id="signupPassword"
                        type="password"
                        placeholder="Mínim 6 caràcters"
                        autocomplete="new-password"
                        minlength="6"
                        required
                    >

                </div>


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
        document
            .getElementById("signupName")
            .value
            .trim();


    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            .value;


    const message =
        document.getElementById("authMessage");


    if (!name) {

        message.textContent =
            "Escriu el teu nom.";

        return;

    }


    if (password.length < 6) {

        message.textContent =
            "La contrasenya ha de tenir almenys 6 caràcters.";

        return;

    }


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
     * Si Supabase requereix confirmació
     * del correu, encara no existeix
     * una sessió activa.
     */

    if (
        result.data.user &&
        !result.data.session
    ) {

        message.innerHTML = `

            <div class="auth-success">

                <strong>
                    Compte creat correctament.
                </strong>

                <p>
                    Revisa el teu correu electrònic
                    per confirmar el compte.
                </p>

            </div>

        `;

        return;

    }


    /*
     * Si tenim sessió immediatament,
     * entrem directament al Dashboard.
     */

    if (result.data.session) {

        message.textContent =
            "Compte creat. Entrant...";


        setTimeout(() => {

            closeModal();

            showDashboard(
                result.data.user
            );

        }, 400);

    }

}


// =========================================================
// 9. HANDLE LOGIN
// =========================================================

async function handleLogin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


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
        "Sessió iniciada. Entrant...";


    setTimeout(() => {

        closeModal();

        showDashboard(
            result.data.user
        );

    }, 400);

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
// 11. LANDING PAGE
// =========================================================

function showLanding() {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");


    if (main) {

        main.style.display = "";

    }


    if (footer) {

        footer.style.display = "";

    }


    removeDashboard();

}


// =========================================================
// 12. DASHBOARD
// =========================================================

function showDashboard(user) {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");


    if (!main) {
        return;
    }


    /*
     * Amaguem la landing.
     */

    main.style.display = "none";


    if (footer) {

        footer.style.display = "none";

    }


    removeDashboard();


    const dashboard =
        document.createElement("div");


    dashboard.id =
        "dashboard";


    dashboard.className =
        "dashboard";


    const metadata =
        user?.user_metadata || {};


    const displayName =
        metadata.display_name ||
        user?.email?.split("@")[0] ||
        "Usuari";


    dashboard.innerHTML = `

        <div class="dashboard-shell">


            <!-- SIDEBAR -->

            <aside class="dashboard-sidebar">

                <div class="dashboard-brand">

                    <div class="logo">
                        Horizon<span>270</span><small>.edu</small>
                    </div>

                </div>


                <nav class="dashboard-nav">

                    <button
                        class="dashboard-nav-item active"
                        onclick="dashboardSection('home')"
                    >
                        <span>⌂</span>
                        <span>Inici</span>
                    </button>


                    <button
                        class="dashboard-nav-item"
                        onclick="dashboardSection('classes')"
                    >
                        <span>▣</span>
                        <span>Classes</span>
                    </button>


                    <button
                        class="dashboard-nav-item"
                        onclick="dashboardSection('tasks')"
                    >
                        <span>✓</span>
                        <span>Tasques</span>
                    </button>


                    <button
                        class="dashboard-nav-item"
                        onclick="dashboardSection('calendar')"
                    >
                        <span>□</span>
                        <span>Calendari</span>
                    </button>


                    <button
                        class="dashboard-nav-item"
                        onclick="dashboardSection('ai')"
                    >
                        <span>✦</span>
                        <span>Horizon AI</span>
                    </button>


                    <button
                        class="dashboard-nav-item"
                        onclick="dashboardSection('profile')"
                    >
                        <span>○</span>
                        <span>Perfil</span>
                    </button>

                </nav>


                <div class="dashboard-sidebar-bottom">

                    <button
                        class="dashboard-logout"
                        onclick="handleLogout()"
                    >
                        Tancar sessió
                    </button>

                </div>

            </aside>


            <!-- CONTENT -->

            <section class="dashboard-content">


                <header class="dashboard-header">

                    <div>

                        <span class="eyebrow">
                            HORIZON270.EDU
                        </span>

                        <h1>
                            Hola, ${escapeHTML(displayName)}.
                        </h1>

                        <p>
                            Benvingut al teu espai educatiu.
                        </p>

                    </div>


                    <div class="dashboard-profile">

                        <div class="avatar">
                            ${escapeHTML(
                                displayName
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                    </div>

                </header>


                <!-- DASHBOARD HOME -->

                <div
                    id="dashboard-view"
                    class="dashboard-view"
                >

                    <div class="dashboard-grid">


                        <article class="dashboard-card dashboard-card-main">

                            <div class="dashboard-card-icon">
                                ✦
                            </div>

                            <span class="dashboard-card-label">
                                HORITZÓ D'APRENENTATGE
                            </span>

                            <h2>
                                El teu aprenentatge,
                                <span>al teu ritme.</span>
                            </h2>

                            <p>
                                Horizon270.edu t'ajudarà a entendre
                                què domines, què necessites reforçar
                                i quin és el següent pas.
                            </p>

                            <button
                                class="btn primary"
                                onclick="dashboardSection('ai')"
                            >
                                Obrir Horizon AI →
                            </button>

                        </article>


                        <article class="dashboard-card">

                            <span class="dashboard-card-label">
                                PROGRÉS
                            </span>

                            <div class="dashboard-stat">
                                —
                            </div>

                            <p>
                                Encara no hi ha dades
                                d'aprenentatge.
                            </p>

                        </article>


                        <article class="dashboard-card">

                            <span class="dashboard-card-label">
                                TASQUES
                            </span>

                            <div class="dashboard-stat">
                                0
                            </div>

                            <p>
                                Tasques pendents
                            </p>

                        </article>


                        <article class="dashboard-card">

                            <span class="dashboard-card-label">
                                CLASSES
                            </span>

                            <div class="dashboard-stat">
                                0
                            </div>

                            <p>
                                Classes connectades
                            </p>

                        </article>


                    </div>


                    <section class="dashboard-welcome">

                        <span class="eyebrow">
                            PRIMER PAS
                        </span>

                        <h2>
                            Configura el teu
                            <span>espai educatiu.</span>
                        </h2>

                        <p>
                            Quan el teu centre, professor o compte
                            personal estigui configurat, aquí apareixeran
                            les teves classes, activitats, calendari,
                            tasques i progrés.
                        </p>

                    </section>

                </div>

            </section>

        </div>

    `;


    document.body.appendChild(
        dashboard
    );

}


// =========================================================
// 13. REMOVE DASHBOARD
// =========================================================

function removeDashboard() {

    const dashboard =
        document.getElementById("dashboard");


    if (dashboard) {

        dashboard.remove();

    }

}


// =========================================================
// 14. DASHBOARD SECTIONS
// =========================================================

function dashboardSection(section) {

    const view =
        document.getElementById(
            "dashboard-view"
        );


    if (!view) {
        return;
    }


    document
        .querySelectorAll(
            ".dashboard-nav-item"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const buttons =
        document.querySelectorAll(
            ".dashboard-nav-item"
        );


    const sectionNames = [
        "home",
        "classes",
        "tasks",
        "calendar",
        "ai",
        "profile"
    ];


    const index =
        sectionNames.indexOf(section);


    if (index >= 0 && buttons[index]) {

        buttons[index]
            .classList.add("active");

    }


    if (section === "home") {

        showDashboardHome(view);

    }

    else if (section === "classes") {

        showDashboardPlaceholder(
            view,
            "Classes",
            "Aquí apareixeran les teves classes i els centres als quals estàs connectat."
        );

    }

    else if (section === "tasks") {

        showDashboardPlaceholder(
            view,
            "Tasques",
            "Aquí apareixeran activitats, deures i treballs pendents."
        );

    }

    else if (section === "calendar") {

        showDashboardPlaceholder(
            view,
            "Calendari",
            "Aquí apareixeran classes, exàmens, reunions i activitats."
        );

    }

    else if (section === "ai") {

        showDashboardAI(view);

    }

    else if (section === "profile") {

        showDashboardProfile(view);

    }

}


// =========================================================
// 15. DASHBOARD HOME
// =========================================================

function showDashboardHome(view) {

    view.innerHTML = `

        <div class="dashboard-grid">

            <article class="dashboard-card dashboard-card-main">

                <div class="dashboard-card-icon">
                    ✦
                </div>

                <span class="dashboard-card-label">
                    HORITZÓ D'APRENENTATGE
                </span>

                <h2>
                    El teu aprenentatge,
                    <span>al teu ritme.</span>
                </h2>

                <p>
                    Horizon270.edu t'ajudarà a entendre
                    què domines, què necessites reforçar
                    i quin és el següent pas.
                </p>

                <button
                    class="btn primary"
                    onclick="dashboardSection('ai')"
                >
                    Obrir Horizon AI →
                </button>

            </article>


            <article class="dashboard-card">

                <span class="dashboard-card-label">
                    PROGRÉS
                </span>

                <div class="dashboard-stat">
                    —
                </div>

                <p>
                    Encara no hi ha dades d'aprenentatge.
                </p>

            </article>


            <article class="dashboard-card">

                <span class="dashboard-card-label">
                    TASQUES
                </span>

                <div class="dashboard-stat">
                    0
                </div>

                <p>
                    Tasques pendents
                </p>

            </article>


            <article class="dashboard-card">

                <span class="dashboard-card-label">
                    CLASSES
                </span>

                <div class="dashboard-stat">
                    0
                </div>

                <p>
                    Classes connectades
                </p>

            </article>

        </div>


        <section class="dashboard-welcome">

            <span class="eyebrow">
                PRIMER PAS
            </span>

            <h2>
                Configura el teu
                <span>espai educatiu.</span>
            </h2>

            <p>
                Quan el teu centre, professor o compte personal
                estigui configurat, aquí apareixeran les teves
                classes, activitats, calendari, tasques i progrés.
            </p>

        </section>

    `;

}


// =========================================================
// 16. DASHBOARD PLACEHOLDER
// =========================================================

function showDashboardPlaceholder(
    view,
    title,
    description
) {

    view.innerHTML = `

        <section class="dashboard-empty">

            <div class="dashboard-empty-icon">
                ✦
            </div>

            <span class="eyebrow">
                HORIZON270.EDU
            </span>

            <h2>
                ${escapeHTML(title)}
            </h2>

            <p>
                ${escapeHTML(description)}
            </p>

            <span class="dashboard-coming">
                Aquesta àrea està preparada per a la
                següent fase de Horizon270.edu.
            </span>

        </section>

    `;

}


// =========================================================
// 17. HORIZON AI AREA
// =========================================================

function showDashboardAI(view) {

    view.innerHTML = `

        <section class="dashboard-ai">

            <div class="dashboard-ai-header">

                <span class="eyebrow">
                    INTEL·LIGÈNCIA ARTIFICIAL
                </span>

                <h2>
                    Horizon <span>AI</span>
                </h2>

                <p>
                    Una IA educativa orientada a ajudar-te
                    a comprendre, no simplement a donar-te
                    una resposta.
                </p>

            </div>


            <div class="dashboard-ai-panel">

                <div class="dashboard-ai-top">

                    <div class="dashboard-ai-brand">

                        <div class="ai-avatar">
                            ✦
                        </div>

                        <div>

                            <strong>
                                Horizon AI
                            </strong>

                            <small>
                                Assistent d'aprenentatge
                            </small>

                        </div>

                    </div>

                    <span class="ai-status">
                        ● Preparada
                    </span>

                </div>


                <div class="dashboard-ai-empty">

                    <div>
                        ✦
                    </div>

                    <h3>
                        Comencem a aprendre.
                    </h3>

                    <p>
                        Aquesta serà la interfície de la IA
                        educativa de Horizon270.edu.
                    </p>

                </div>


                <div class="dashboard-ai-input">

                    <input
                        type="text"
                        placeholder="Escriu què vols entendre..."
                        disabled
                    >

                    <button
                        class="btn primary"
                        disabled
                    >
                        Enviar
                    </button>

                </div>

            </div>

        </section>

    `;

}


// =========================================================
// 18. PROFILE
// =========================================================

async function showDashboardProfile(view) {

    const user =
        await getCurrentUser();


    if (!user) {

        return;

    }


    const metadata =
        user.user_metadata || {};


    const displayName =
        metadata.display_name ||
        "Usuari";


    view.innerHTML = `

        <section class="dashboard-profile-page">

            <span class="eyebrow">
                EL MEU COMPTE
            </span>

            <h2>
                El teu <span>perfil.</span>
            </h2>

            <div class="profile-card">

                <div class="profile-avatar">
                    ${escapeHTML(
                        displayName
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>


                <div class="profile-info">

                    <span class="profile-label">
                        NOM
                    </span>

                    <strong>
                        ${escapeHTML(displayName)}
                    </strong>


                    <span class="profile-label">
                        CORREU ELECTRÒNIC
                    </span>

                    <strong>
                        ${escapeHTML(user.email || "")}
                    </strong>

                </div>

            </div>

        </section>

    `;

}


// =========================================================
// 19. LOGOUT FROM UI
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


    removeDashboard();

    showLanding();

    updateNavigation();

}


// =========================================================
// 20. UPDATE NAVIGATION
// =========================================================

async function updateNavigation() {

    const user =
        await getCurrentUser();


    const navActions =
        document.querySelector(
            ".nav-actions"
        );


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


    const displayName =
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Compte";


    navActions.innerHTML = `

        <span class="user-email">
            ${escapeHTML(displayName)}
        </span>


        <button
            class="btn primary"
            onclick="openDashboard()"
        >
            Obrir Horizon →
        </button>

    `;

}


// =========================================================
// 21. OPEN DASHBOARD
// =========================================================

async function openDashboard() {

    const user =
        await getCurrentUser();


    if (!user) {

        showLogin();

        return;

    }


    closeModal();

    showDashboard(user);

}


// =========================================================
// 22. AUTH STATE
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

            updateNavigation();

        }

        else {

            console.log(
                "Cap usuari connectat."
            );

            removeDashboard();

            showLanding();

            updateNavigation();

        }

    }
);


// =========================================================
// 23. ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================================================
// 24. SCROLL
// =========================================================

function scrollToSection(sectionId) {

    const section =
        document.getElementById(
            sectionId
        );


    if (!section) {
        return;
    }


    section.scrollIntoView({
        behavior: "smooth"
    });

}


// =========================================================
// 25. TEST SUPABASE
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

    }

    else {

        console.log(
            "Supabase connectat correctament."
        );

    }

}


// =========================================================
// 26. INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Horizon270.edu iniciat."
        );


        await testSupabaseConnection();


        const {
            data: { session }
        } =
            await supabaseClient.auth.getSession();


        if (session) {

            showDashboard(
                session.user
            );

        }


        await updateNavigation();

    }
);
