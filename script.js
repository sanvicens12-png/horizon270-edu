// =========================================================
// HORIZON270.EDU
// Supabase + Authentication + Profiles + Dashboard
// VERSIÓ ACTUALITZADA — PERFIL REALMENT GUARDAT A SUPABASE
// =========================================================


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
    "https://cecouhunurwkncfcjjor.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_mU_871SdiMJgSA1LHCLEAg_my7qG2oq";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =========================================================
// UTILITATS
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showMessage(message, type = "") {

    const element =
        document.getElementById("authMessage");

    if (!element) return;

    element.className =
        "auth-message " + type;

    element.textContent =
        message;
}


// =========================================================
// ACCOUNT LABELS
// =========================================================

const accountLabels = {

    student: "Estudiant",

    teacher: "Professor",

    center: "Centre educatiu",

    family: "Família",

    professional: "Professional educatiu"

};


// =========================================================
// AUTH — REGISTRE
// =========================================================

async function registerUser(
    email,
    password,
    displayName
) {

    const { data, error } =
        await supabaseClient.auth.signUp({

            email,
            password,

            options: {

                data: {

                    display_name:
                        displayName

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

        data

    };

}


// =========================================================
// AUTH — LOGIN
// =========================================================

async function loginUser(
    email,
    password
) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email,
            password

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

        data

    };

}


// =========================================================
// AUTH — LOGOUT
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
// USUARI ACTUAL
// =========================================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } =
        await supabaseClient.auth.getUser();


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
// CREAR PERFIL
// =========================================================

async function createProfile(
    userId,
    displayName,
    accountType
) {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .insert({

                id: userId,

                display_name:
                    displayName,

                account_type:
                    accountType,

                is_active: true

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Error creant perfil:",
            error.message
        );

        return {

            success: false,

            error: error.message

        };

    }


    return {

        success: true,

        data

    };

}


// =========================================================
// OBTENIR PERFIL
// =========================================================

async function getProfile(userId) {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();


    if (error) {

        console.error(
            "Error obtenint perfil:",
            error.message
        );

        return null;

    }


    return data;

}


// =========================================================
// ACTUALITZAR PERFIL — SUPABASE
// =========================================================

async function updateProfile(
    userId,
    displayName
) {

    const cleanName =
        String(displayName || "").trim();


    if (!cleanName) {

        return {

            success: false,

            error:
                "El nom no pot estar buit."

        };

    }


    if (cleanName.length > 80) {

        return {

            success: false,

            error:
                "El nom és massa llarg."

        };

    }


    // -----------------------------------------------------
    // 1. Actualitzar la taula profiles
    // -----------------------------------------------------

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .update({

                display_name:
                    cleanName

            })
            .eq("id", userId)
            .select()
            .single();


    if (error) {

        console.error(
            "Error actualitzant profiles:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }


    // -----------------------------------------------------
    // 2. Actualitzar també auth.users metadata
    // -----------------------------------------------------

    const {
        data: authData,
        error: authError
    } =
        await supabaseClient.auth.updateUser({

            data: {

                display_name:
                    cleanName

            }

        });


    if (authError) {

        console.warn(
            "El perfil s'ha actualitzat, però auth metadata no:",
            authError.message
        );

    }


    return {

        success: true,

        data,

        authData

    };

}


// =========================================================
// LOGIN MODAL
// =========================================================

function showLogin() {

    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");


    if (!modal || !content) return;


    content.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                HORIZON270.EDU
            </span>

            <h2>
                Iniciar sessió
            </h2>

            <p>
                Accedeix al teu espai educatiu.
            </p>


            <form id="loginForm">

                <div class="auth-field">

                    <label for="loginEmail">
                        Correu electrònic
                    </label>

                    <input
                        id="loginEmail"
                        type="email"
                        autocomplete="email"
                        placeholder="tu@exemple.com"
                        required
                    >

                </div>


                <div class="auth-field">

                    <label for="loginPassword">
                        Contrasenya
                    </label>

                    <input
                        id="loginPassword"
                        type="password"
                        autocomplete="current-password"
                        placeholder="La teva contrasenya"
                        required
                    >

                </div>


                <button
                    type="submit"
                    class="btn primary auth-submit"
                >
                    Iniciar sessió
                </button>

            </form>


            <div
                id="authMessage"
                class="auth-message"
            ></div>


            <p class="auth-switch">

                No tens compte?

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


    document
        .getElementById("loginForm")
        .addEventListener(
            "submit",
            handleLogin
        );

}


// =========================================================
// REGISTRE — PAS 1
// =========================================================

function showSignup() {

    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");


    if (!modal || !content) return;


    content.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                HORIZON270.EDU
            </span>

            <h2>
                Crear compte
            </h2>

            <p>
                Primer, explica'ns quin tipus de compte vols.
            </p>


            <div class="account-type-grid">


                <button
                    type="button"
                    class="account-type"
                    onclick="selectAccountType('student')"
                >

                    <span class="account-type-icon">
                        🎓
                    </span>

                    <strong>
                        Estudiant
                    </strong>

                    <small>
                        Estudia amb Horizon AI encara que
                        el teu centre no utilitzi Horizon270.edu.
                    </small>

                </button>


                <button
                    type="button"
                    class="account-type"
                    onclick="selectAccountType('teacher')"
                >

                    <span class="account-type-icon">
                        👨‍🏫
                    </span>

                    <strong>
                        Professor
                    </strong>

                    <small>
                        Gestiona el teu espai educatiu.
                    </small>

                </button>


                <button
                    type="button"
                    class="account-type"
                    onclick="selectAccountType('center')"
                >

                    <span class="account-type-icon">
                        🏫
                    </span>

                    <strong>
                        Centre educatiu
                    </strong>

                    <small>
                        Escola, institut, acadèmia o
                        centre educatiu independent.
                    </small>

                </button>


                <button
                    type="button"
                    class="account-type"
                    onclick="selectAccountType('family')"
                >

                    <span class="account-type-icon">
                        👨‍👩‍👧
                    </span>

                    <strong>
                        Família
                    </strong>

                    <small>
                        Connecta't amb l'espai educatiu
                        del teu fill o filla.
                    </small>

                </button>


                <button
                    type="button"
                    class="account-type"
                    onclick="selectAccountType('professional')"
                >

                    <span class="account-type-icon">
                        🧑‍💼
                    </span>

                    <strong>
                        Professional educatiu
                    </strong>

                    <small>
                        Orientació, suport i altres
                        funcions educatives.
                    </small>

                </button>


            </div>


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

}


// =========================================================
// REGISTRE — PAS 2
// =========================================================

function selectAccountType(accountType) {

    const label =
        accountLabels[accountType] ||
        "Usuari";


    const modalContent =
        document.getElementById(
            "modalContent"
        );


    if (!modalContent) return;


    modalContent.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                ${escapeHTML(label)}
            </span>

            <h2>
                Crea el teu compte
            </h2>

            <p>
                Completa les dades per continuar.
            </p>


            <form id="signupForm">


                <div class="auth-field">

                    <label for="signupName">
                        Nom
                    </label>

                    <input
                        id="signupName"
                        type="text"
                        autocomplete="name"
                        placeholder="El teu nom"
                        maxlength="80"
                        required
                    >

                </div>


                <div class="auth-field">

                    <label for="signupEmail">
                        Correu electrònic
                    </label>

                    <input
                        id="signupEmail"
                        type="email"
                        autocomplete="email"
                        placeholder="tu@exemple.com"
                        required
                    >

                </div>


                <div class="auth-field">

                    <label for="signupPassword">
                        Contrasenya
                    </label>

                    <input
                        id="signupPassword"
                        type="password"
                        autocomplete="new-password"
                        minlength="6"
                        placeholder="Mínim 6 caràcters"
                        required
                    >

                </div>


                <input
                    type="hidden"
                    id="signupAccountType"
                    value="${escapeHTML(accountType)}"
                >


                <button
                    type="submit"
                    class="btn primary auth-submit"
                >
                    Crear compte
                </button>


            </form>


            <div
                id="authMessage"
                class="auth-message"
            ></div>


            <button
                type="button"
                class="back-button"
                onclick="showSignup()"
            >
                ← Tornar a seleccionar tipus
            </button>

        </div>

    `;


    document
        .getElementById("signupForm")
        .addEventListener(
            "submit",
            handleSignup
        );

}


// =========================================================
// HANDLE SIGNUP
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


    const accountType =
        document
            .getElementById("signupAccountType")
            .value;


    if (!name) {

        showMessage(
            "Escriu el teu nom.",
            "error"
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            "La contrasenya ha de tenir almenys 6 caràcters.",
            "error"
        );

        return;

    }


    showMessage(
        "Creant el compte..."
    );


    const result =
        await registerUser(
            email,
            password,
            name
        );


    if (!result.success) {

        showMessage(
            "No s'ha pogut crear el compte: " +
            result.error,
            "error"
        );

        return;

    }


    // -----------------------------------------------------
    // CONFIRMACIÓ DE CORREU
    // -----------------------------------------------------

    if (
        result.data.user &&
        !result.data.session
    ) {

        showMessage(
            "Compte creat. Revisa el teu correu per confirmar-lo.",
            "success"
        );

        return;

    }


    if (!result.data.session) {

        showMessage(
            "El compte s'ha creat, però encara no hi ha una sessió activa.",
            "error"
        );

        return;

    }


    // -----------------------------------------------------
    // CREAR PERFIL
    // -----------------------------------------------------

    const profileResult =
        await createProfile(
            result.data.user.id,
            name,
            accountType
        );


    if (!profileResult.success) {

        showMessage(
            "El compte s'ha creat, però no s'ha pogut crear el perfil: " +
            profileResult.error,
            "error"
        );

        return;

    }


    showMessage(
        "Compte creat. Entrant..."
    );


    setTimeout(() => {

        closeModal();

        showDashboard(
            result.data.user,
            profileResult.data
        );

    }, 400);

}


// =========================================================
// HANDLE LOGIN
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


    showMessage(
        "Iniciant sessió..."
    );


    const result =
        await loginUser(
            email,
            password
        );


    if (!result.success) {

        showMessage(
            "No s'ha pogut iniciar sessió: " +
            result.error,
            "error"
        );

        return;

    }


    const profile =
        await getProfile(
            result.data.user.id
        );


    showMessage(
        "Sessió iniciada. Entrant..."
    );


    setTimeout(() => {

        closeModal();

        showDashboard(
            result.data.user,
            profile
        );

    }, 400);

}


// =========================================================
// MODAL
// =========================================================

function closeModal() {

    const modal =
        document.getElementById("modal");


    if (modal) {

        modal.classList.add("hidden");

    }

}


// =========================================================
// DASHBOARD
// =========================================================

function showDashboard(
    user,
    profile = null
) {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");

    const navbar =
        document.querySelector(".navbar");


    if (!main) return;


    main.style.display =
        "none";


    if (footer) {

        footer.style.display =
            "none";

    }


    // -----------------------------------------------------
    // AMAGAR LA NAVBAR DE LANDING
    // -----------------------------------------------------

    if (navbar) {

        navbar.style.display =
            "none";

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
        profile?.display_name ||
        metadata.display_name ||
        user?.email?.split("@")[0] ||
        "Usuari";


    const accountType =
        profile?.account_type ||
        "student";


    dashboard.innerHTML = `

        <div class="dashboard-shell">


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

                    <div class="dashboard-account-type">

                        ${escapeHTML(
                            accountLabels[accountType] ||
                            "Usuari"
                        )}

                    </div>


                    <button
                        class="dashboard-logout"
                        onclick="handleLogout()"
                    >
                        Tancar sessió
                    </button>

                </div>

            </aside>


            <section class="dashboard-content">

                <header class="dashboard-header">

                    <div>

                        <span class="eyebrow">
                            ${escapeHTML(
                                accountLabels[accountType] ||
                                "HORIZON270.EDU"
                            )}
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


                <div
                    id="dashboard-view"
                    class="dashboard-view"
                ></div>

            </section>

        </div>

    `;


    document.body.appendChild(
        dashboard
    );


    showDashboardHome(
        document.getElementById(
            "dashboard-view"
        )
    );

}


// =========================================================
// DASHBOARD HOME
// =========================================================

function showDashboardHome(view) {

    if (!view) return;


    view.innerHTML = `

        <div class="dashboard-grid">


            <article class="dashboard-card dashboard-card-main">

                <div class="dashboard-card-icon">
                    ✦
                </div>

                <span class="dashboard-card-label">
                    HORIZON270.EDU
                </span>

                <h2>
                    El teu aprenentatge,
                    <span>al teu ritme.</span>
                </h2>

                <p>
                    Aquí començarà el teu espai personal
                    d'aprenentatge, gestió i seguiment.
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
                    Encara no hi ha dades.
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
                HORIZON270.EDU
            </span>

            <h2>
                El teu espai
                <span>educatiu.</span>
            </h2>

            <p>
                A mesura que connectem les diferents parts
                de la plataforma, aquí apareixeran classes,
                activitats, calendari, progrés i molt més.
            </p>

        </section>

    `;

}


// =========================================================
// DASHBOARD SECTIONS
// =========================================================

function dashboardSection(section) {

    const view =
        document.getElementById(
            "dashboard-view"
        );


    if (!view) return;


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


    const names = [

        "home",
        "classes",
        "tasks",
        "calendar",
        "ai",
        "profile"

    ];


    const index =
        names.indexOf(section);


    if (
        index >= 0 &&
        buttons[index]
    ) {

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
            "Aquí apareixeran les classes i els espais educatius als quals estiguis connectat."
        );

    }


    else if (section === "tasks") {

        showDashboardPlaceholder(
            view,
            "Tasques",
            "Aquí apareixeran activitats, deures, exercicis i treballs."
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
// PLACEHOLDER
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

        </section>

    `;

}


// =========================================================
// HORIZON AI
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
                    a comprendre i aprendre.
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
                        La IA educativa s'integrarà
                        aquí en la següent fase.
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
// PROFILE
// =========================================================

async function showDashboardProfile(view) {

    if (!view) return;


    const user =
        await getCurrentUser();


    if (!user) {

        showLanding();

        return;

    }


    const profile =
        await getProfile(
            user.id
        );


    const metadata =
        user.user_metadata || {};


    const displayName =
        profile?.display_name ||
        metadata.display_name ||
        user.email?.split("@")[0] ||
        "Usuari";


    const type =
        profile?.account_type ||
        "student";


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
                        TIPUS DE COMPTE
                    </span>

                    <strong>
                        ${escapeHTML(
                            accountLabels[type] ||
                            "Usuari"
                        )}
                    </strong>


                    <span class="profile-label">
                        CORREU ELECTRÒNIC
                    </span>

                    <strong>
                        ${escapeHTML(
                            user.email || ""
                        )}
                    </strong>


                </div>

            </div>


            <!-- EDITAR PERFIL -->

            <div
                class="profile-card"
                style="margin-top:20px;"
            >

                <div style="width:100%;">

                    <span class="profile-label">
                        CONFIGURACIÓ
                    </span>

                    <h3
                        style="
                            margin:8px 0 20px;
                            font-size:1.4rem;
                        "
                    >
                        Editar perfil
                    </h3>


                    <form
                        id="editProfileForm"
                    >

                        <div class="auth-field">

                            <label for="editDisplayName">
                                Nom
                            </label>

                            <input
                                id="editDisplayName"
                                type="text"
                                value="${escapeHTML(displayName)}"
                                maxlength="80"
                                autocomplete="name"
                                required
                            >

                        </div>


                        <div class="auth-field">

                            <label>
                                Correu electrònic
                            </label>

                            <input
                                type="email"
                                value="${escapeHTML(user.email || "")}"
                                disabled
                            >

                        </div>


                        <div
                            id="profileSaveMessage"
                            class="auth-message"
                        ></div>


                        <button
                            type="submit"
                            class="btn primary"
                        >
                            Guardar canvis
                        </button>

                    </form>

                </div>

            </div>

        </section>

    `;


    document
        .getElementById(
            "editProfileForm"
        )
        .addEventListener(
            "submit",
            handleProfileUpdate
        );

}


// =========================================================
// HANDLE PROFILE UPDATE
// =========================================================

async function handleProfileUpdate(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "editDisplayName"
        );


    const message =
        document.getElementById(
            "profileSaveMessage"
        );


    if (!input || !message) return;


    const newName =
        input.value.trim();


    if (!newName) {

        message.className =
            "auth-message error";

        message.textContent =
            "El nom no pot estar buit.";

        return;

    }


    if (newName.length > 80) {

        message.className =
            "auth-message error";

        message.textContent =
            "El nom és massa llarg.";

        return;

    }


    message.className =
        "auth-message";

    message.textContent =
        "Guardant canvis...";


    const user =
        await getCurrentUser();


    if (!user) {

        message.className =
            "auth-message error";

        message.textContent =
            "La sessió ha caducat.";

        return;

    }


    const result =
        await updateProfile(
            user.id,
            newName
        );


    if (!result.success) {

        message.className =
            "auth-message error";

        message.textContent =
            "No s'han pogut guardar els canvis: " +
            result.error;

        return;

    }


    message.className =
        "auth-message success";

    message.textContent =
        "Canvis guardats correctament.";


    // -----------------------------------------------------
    // Actualitzar la interfície immediatament
    // -----------------------------------------------------

    updateDashboardUserName(
        newName
    );


    // -----------------------------------------------------
    // Tornar a carregar el perfil
    // -----------------------------------------------------

    setTimeout(() => {

        dashboardSection(
            "profile"
        );

    }, 500);

}


// =========================================================
// ACTUALITZAR NOM DEL DASHBOARD
// =========================================================

function updateDashboardUserName(
    newName
) {

    const header =
        document.querySelector(
            ".dashboard-header h1"
        );


    if (header) {

        header.textContent =
            `Hola, ${newName}.`;

    }


    const avatar =
        document.querySelector(
            ".dashboard-header .avatar"
        );


    if (avatar) {

        avatar.textContent =
            newName
                .charAt(0)
                .toUpperCase();

    }

}


// =========================================================
// LOGOUT
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
// REMOVE DASHBOARD
// =========================================================

function removeDashboard() {

    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (dashboard) {

        dashboard.remove();

    }

}


// =========================================================
// LANDING
// =========================================================

function showLanding() {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");

    const navbar =
        document.querySelector(".navbar");


    if (main) {

        main.style.display =
            "";

    }


    if (footer) {

        footer.style.display =
            "";

    }


    if (navbar) {

        navbar.style.display =
            "";

    }


    removeDashboard();

}


// =========================================================
// NAVIGATION
// =========================================================

async function updateNavigation() {

    const user =
        await getCurrentUser();


    const navActions =
        document.querySelector(
            ".nav-actions"
        );


    if (!navActions) return;


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


    const name =
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Compte";


    navActions.innerHTML = `

        <span class="user-email">
            ${escapeHTML(name)}
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
// OPEN DASHBOARD
// =========================================================

async function openDashboard() {

    const user =
        await getCurrentUser();


    if (!user) {

        showLogin();

        return;

    }


    const profile =
        await getProfile(
            user.id
        );


    closeModal();

    showDashboard(
        user,
        profile
    );

}


// =========================================================
// AUTH STATE
// =========================================================

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Auth:",
            event
        );


        if (session) {

            updateNavigation();

        }

        else {

            removeDashboard();

            showLanding();

            updateNavigation();

        }

    }
);


// =========================================================
// SCROLL
// =========================================================

function scrollToSection(
    sectionId
) {

    const section =
        document.getElementById(
            sectionId
        );


    if (!section) return;


    section.scrollIntoView({

        behavior: "smooth"

    });

}


// =========================================================
// INIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Horizon270.edu iniciat."
        );


        const {
            data: { session }
        } =
            await supabaseClient.auth.getSession();


        if (session) {

            const profile =
                await getProfile(
                    session.user.id
                );


            showDashboard(
                session.user,
                profile
            );

        }


        await updateNavigation();

    }
);
