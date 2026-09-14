// =========================================================
// HORIZON270.EDU
// Supabase + Authentication + Profiles + Dashboard
// =========================================================


// =========================================================
// 1. SUPABASE
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
// 2. UTILITATS
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

    element.textContent = message;
}


// =========================================================
// 3. ETIQUETES DELS COMPTES
// =========================================================

const ACCOUNT_LABELS = {

    student: "Estudiant",

    teacher: "Professor",

    center: "Centre educatiu",

    family: "Família",

    professional: "Professional educatiu"

};


// =========================================================
// 4. REGISTRE SUPABASE
// =========================================================

async function registerUser(
    email,
    password,
    displayName,
    accountType
) {

    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {

                    display_name: displayName,

                    account_type: accountType

                }

            }

        });


    if (error) {

        console.error(
            "Error de registre:",
            error
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
// 5. LOGIN
// =========================================================

async function loginUser(
    email,
    password
) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error(
            "Error d'inici de sessió:",
            error
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
// 6. LOGOUT
// =========================================================

async function logoutUser() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Error tancant sessió:",
            error
        );

        return false;

    }


    return true;

}


// =========================================================
// 7. USUARI ACTUAL
// =========================================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Error obtenint usuari:",
            error
        );

        return null;

    }


    return user;

}


// =========================================================
// 8. CREAR PERFIL
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

                display_name: displayName,

                account_type: accountType,

                is_active: true

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Error creant perfil:",
            error
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
// 9. OBTENIR PERFIL
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
            error
        );

        return null;

    }


    return data;

}


// =========================================================
// 10. ASSEGURAR QUE EXISTEIX PERFIL
// =========================================================

async function ensureProfile(
    user,
    fallbackAccountType = "student"
) {

    if (!user) return null;


    let profile =
        await getProfile(user.id);


    if (profile) {

        return profile;

    }


    const metadata =
        user.user_metadata || {};


    const displayName =
        metadata.display_name ||
        user.email?.split("@")[0] ||
        "Usuari";


    const accountType =
        metadata.account_type ||
        fallbackAccountType;


    const result =
        await createProfile(
            user.id,
            displayName,
            accountType
        );


    if (!result.success) {

        console.error(
            "No s'ha pogut crear el perfil:",
            result.error
        );

        return null;

    }


    return result.data;

}


// =========================================================
// 11. LOGIN MODAL
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


    const form =
        document.getElementById("loginForm");


    if (form) {

        form.addEventListener(
            "submit",
            handleLogin
        );

    }

}


// =========================================================
// 12. REGISTRE — TIPUS DE COMPTE
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
                Selecciona el tipus de compte.
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
                        Gestiona classes, activitats,
                        materials i alumnes.
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
// 13. REGISTRE — DADES
// =========================================================

function selectAccountType(accountType) {

    if (!ACCOUNT_LABELS[accountType]) {

        console.error(
            "Tipus de compte desconegut:",
            accountType
        );

        return;

    }


    const modalContent =
        document.getElementById("modalContent");


    if (!modalContent) return;


    modalContent.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                ${escapeHTML(
                    ACCOUNT_LABELS[accountType]
                )}
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
                ← Tornar
            </button>

        </div>

    `;


    const form =
        document.getElementById("signupForm");


    if (form) {

        form.addEventListener(
            "submit",
            handleSignup
        );

    }

}


// =========================================================
// 14. HANDLE SIGNUP
// =========================================================

async function handleSignup(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("signupName")
            ?.value
            .trim();


    const email =
        document
            .getElementById("signupEmail")
            ?.value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            ?.value;


    const accountType =
        document
            .getElementById("signupAccountType")
            ?.value;


    if (!name) {

        showMessage(
            "Escriu el teu nom.",
            "error"
        );

        return;

    }


    if (!email) {

        showMessage(
            "Escriu el teu correu electrònic.",
            "error"
        );

        return;

    }


    if (!password || password.length < 6) {

        showMessage(
            "La contrasenya ha de tenir almenys 6 caràcters.",
            "error"
        );

        return;

    }


    if (!ACCOUNT_LABELS[accountType]) {

        showMessage(
            "Selecciona un tipus de compte.",
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
            name,
            accountType
        );


    if (!result.success) {

        showMessage(
            "No s'ha pogut crear el compte: " +
            result.error,
            "error"
        );

        return;

    }


    const user =
        result.data?.user;


    const session =
        result.data?.session;


    /*
     * CAS 1:
     * Supabase requereix confirmació del correu.
     */

    if (user && !session) {

        showMessage(
            "Compte creat correctament. Revisa el teu correu per confirmar-lo i després inicia sessió.",
            "success"
        );

        return;

    }


    /*
     * CAS 2:
     * No tenim sessió.
     */

    if (!user || !session) {

        showMessage(
            "El compte s'ha creat, però encara no hi ha una sessió activa.",
            "error"
        );

        return;

    }


    /*
     * CAS 3:
     * Hi ha sessió.
     * Creem el perfil.
     */

    const profileResult =
        await createProfile(
            user.id,
            name,
            accountType
        );


    /*
     * Si el perfil ja existia, intentem recuperar-lo.
     */

    if (!profileResult.success) {

        console.warn(
            "No s'ha pogut crear el perfil:",
            profileResult.error
        );


        const existingProfile =
            await getProfile(
                user.id
            );


        if (existingProfile) {

            closeModal();

            showDashboard(
                user,
                existingProfile
            );

            updateNavigation();

            return;

        }


        showMessage(
            "El compte s'ha creat, però hi ha hagut un problema creant el perfil. Torna a iniciar sessió.",
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
            user,
            profileResult.data
        );

        updateNavigation();

    }, 500);

}


// =========================================================
// 15. HANDLE LOGIN
// =========================================================

async function handleLogin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            ?.value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            ?.value;


    if (!email || !password) {

        showMessage(
            "Omple tots els camps.",
            "error"
        );

        return;

    }


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


    const user =
        result.data?.user;


    if (!user) {

        showMessage(
            "No s'ha pogut obtenir l'usuari.",
            "error"
        );

        return;

    }


    /*
     * Recuperem el perfil.
     */

    const profile =
        await ensureProfile(
            user
        );


    showMessage(
        "Sessió iniciada. Entrant..."
    );


    setTimeout(() => {

        closeModal();

        showDashboard(
            user,
            profile
        );

        updateNavigation();

    }, 400);

}


// =========================================================
// 16. MODAL
// =========================================================

function closeModal() {

    const modal =
        document.getElementById("modal");


    if (!modal) return;


    modal.classList.add("hidden");

}


// =========================================================
// 17. DASHBOARD
// =========================================================

function showDashboard(
    user,
    profile = null
) {

    if (!user) return;


    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");


    if (main) {

        main.style.display = "none";

    }


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
        user.user_metadata || {};


    const displayName =
        profile?.display_name ||
        metadata.display_name ||
        user.email?.split("@")[0] ||
        "Usuari";


    const accountType =
        profile?.account_type ||
        metadata.account_type ||
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
                            ACCOUNT_LABELS[accountType] ||
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
                                ACCOUNT_LABELS[accountType] ||
                                "HORIZON270.EDU"
                            )}

                        </span>


                        <h1>

                            Hola,
                            ${escapeHTML(displayName)}.

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
// 18. HOME DASHBOARD
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
// 19. NAVEGACIÓ DASHBOARD
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


    switch (section) {

        case "home":

            showDashboardHome(
                view
            );

            break;


        case "classes":

            showDashboardPlaceholder(
                view,
                "Classes",
                "Aquí apareixeran les classes i els espais educatius als quals estiguis connectat."
            );

            break;


        case "tasks":

            showDashboardPlaceholder(
                view,
                "Tasques",
                "Aquí apareixeran activitats, deures, exercicis i treballs."
            );

            break;


        case "calendar":

            showDashboardPlaceholder(
                view,
                "Calendari",
                "Aquí apareixeran classes, exàmens, reunions i activitats."
            );

            break;


        case "ai":

            showDashboardAI(
                view
            );

            break;


        case "profile":

            showDashboardProfile(
                view
            );

            break;

    }

}


// =========================================================
// 20. PLACEHOLDER
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
// 21. HORIZON AI
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
// 22. PERFIL
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
        metadata.account_type ||
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
                            ACCOUNT_LABELS[type] ||
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


        </section>

    `;

}


// =========================================================
// 23. LOGOUT
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
// 24. ELIMINAR DASHBOARD
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
// 25. MOSTRAR LANDING
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
// 26. ACTUALITZAR NAVBAR
// =========================================================

async function updateNavigation() {

    const navActions =
        document.querySelector(
            ".nav-actions"
        );


    if (!navActions) return;


    const user =
        await getCurrentUser();


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
// 27. OBRIR DASHBOARD
// =========================================================

async function openDashboard() {

    const user =
        await getCurrentUser();


    if (!user) {

        showLogin();

        return;

    }


    const profile =
        await ensureProfile(
            user
        );


    closeModal();


    showDashboard(
        user,
        profile
    );

}


// =========================================================
// 28. AUTH STATE
// =========================================================

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "Auth:",
            event
        );


        if (session) {

            await updateNavigation();

        }

        else {

            removeDashboard();

            showLanding();

            await updateNavigation();

        }

    }
);


// =========================================================
// 29. SCROLL
// =========================================================

function scrollToSection(sectionId) {

    const section =
        document.getElementById(
            sectionId
        );


    if (!section) return;


    section.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// =========================================================
// 30. TANCAR MODAL CLICANT FORA
// =========================================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById("modal");


        if (!modal) return;


        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);


// =========================================================
// 31. ESC PER TANCAR MODAL
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closeModal();

    }
);


// =========================================================
// 32. INIT
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
                await ensureProfile(
                    session.user
                );


            showDashboard(
                session.user,
                profile
            );

        }


        await updateNavigation();

    }
);
