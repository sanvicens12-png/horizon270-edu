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
// 3. AUTH — REGISTRE
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
        data
    };

}


// =========================================================
// 4. AUTH — LOGIN
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
// 5. AUTH — LOGOUT
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
// 6. USUARI ACTUAL
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
            error.message
        );

        return null;

    }


    return user;

}


// =========================================================
// 7. CREAR PERFIL
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
// 8. OBTENIR PERFIL
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
// 9. ACTUALITZAR PERFIL
// =========================================================

async function updateProfile(
    userId,
    displayName,
    email
) {

    try {

        // -----------------------------------------
        // Actualitzar AUTH
        // -----------------------------------------

        const { data: authData, error: authError } =
            await supabaseClient.auth.updateUser({

                email: email,

                data: {
                    display_name: displayName
                }

            });


        if (authError) {

            console.error(
                "Error actualitzant Auth:",
                authError.message
            );

            return {
                success: false,
                error: authError.message
            };

        }


        // -----------------------------------------
        // Actualitzar PROFILE
        // -----------------------------------------

        const { data: profileData, error: profileError } =
            await supabaseClient
                .from("profiles")
                .update({

                    display_name: displayName

                })
                .eq("id", userId)
                .select()
                .single();


        if (profileError) {

            console.error(
                "Error actualitzant profile:",
                profileError.message
            );

            return {
                success: false,
                error: profileError.message
            };

        }


        return {

            success: true,

            authData,

            profileData

        };

    }

    catch (error) {

        console.error(
            "Error inesperat:",
            error
        );

        return {

            success: false,

            error:
                error.message ||
                "Error inesperat."

        };

    }

}


// =========================================================
// 10. FOTO DE PERFIL
// =========================================================

async function uploadAvatar(
    userId,
    file
) {

    if (!file) {

        return {
            success: false,
            error: "No s'ha seleccionat cap imatge."
        };

    }


    // -----------------------------------------
    // Validacions
    // -----------------------------------------

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        return {

            success: false,

            error:
                "Format no compatible. Utilitza JPG, PNG o WebP."

        };

    }


    if (file.size > 5 * 1024 * 1024) {

        return {

            success: false,

            error:
                "La imatge no pot superar els 5 MB."

        };

    }


    // -----------------------------------------
    // Nom del fitxer
    // -----------------------------------------

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const filePath =
        `${userId}/avatar.${extension}`;


    // -----------------------------------------
    // Pujar a Storage
    // -----------------------------------------

    const { error: uploadError } =
        await supabaseClient.storage
            .from("avatars")
            .upload(
                filePath,
                file,
                {
                    upsert: true,
                    contentType: file.type
                }
            );


    if (uploadError) {

        console.error(
            "Error pujant avatar:",
            uploadError.message
        );

        return {

            success: false,

            error:
                uploadError.message

        };

    }


    // -----------------------------------------
    // URL pública
    // -----------------------------------------

    const { data } =
        supabaseClient.storage
            .from("avatars")
            .getPublicUrl(filePath);


    const avatarUrl =
        data.publicUrl;


    // -----------------------------------------
    // Guardar URL al perfil
    // -----------------------------------------

    const { error: profileError } =
        await supabaseClient
            .from("profiles")
            .update({

                avatar_url: avatarUrl

            })
            .eq("id", userId);


    if (profileError) {

        console.error(
            "Error guardant avatar:",
            profileError.message
        );

        return {

            success: false,

            error:
                profileError.message

        };

    }


    return {

        success: true,

        avatarUrl

    };

}


// =========================================================
// 11. LOGIN MODAL
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
// 12. REGISTRE — PAS 1
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
// 13. REGISTRE — PAS 2
// =========================================================

function selectAccountType(accountType) {

    const labels = {

        student: "Estudiant",

        teacher: "Professor",

        center: "Centre educatiu",

        family: "Família",

        professional: "Professional educatiu"

    };


    const modalContent =
        document.getElementById(
            "modalContent"
        );


    modalContent.innerHTML = `

        <div class="auth-container">

            <span class="eyebrow">
                ${escapeHTML(
                    labels[accountType]
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


    document
        .getElementById("signupForm")
        .addEventListener(
            "submit",
            handleSignup
        );

}


// =========================================================
// 14. HANDLE SIGNUP
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
            "El compte s'ha creat, però no hi ha una sessió activa.",
            "error"
        );

        return;

    }


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

        updateNavigation();

    }, 400);

}


// =========================================================
// 15. HANDLE LOGIN
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


    closeModal();

    showDashboard(
        result.data.user,
        profile
    );


    updateNavigation();

}


// =========================================================
// 16. MODAL
// =========================================================

function closeModal() {

    const modal =
        document.getElementById("modal");


    if (modal) {

        modal.classList.add("hidden");

    }

}


// =========================================================
// 17. DASHBOARD
// =========================================================

function showDashboard(
    user,
    profile = null
) {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");

    const publicNav =
        document.querySelector("header.navbar nav");


    if (!main) return;


    main.style.display = "none";


    if (footer) {

        footer.style.display = "none";

    }


    // -----------------------------------------------------
    // AMAGAR FUNCIONS / IA / COMUNITAT
    // -----------------------------------------------------

    if (publicNav) {

        publicNav.style.display = "none";

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


    const avatarUrl =
        profile?.avatar_url ||
        "";


    const accountLabels = {

        student: "Estudiant",

        teacher: "Professor",

        center: "Centre educatiu",

        family: "Família",

        professional: "Professional educatiu"

    };


    const avatarHTML = avatarUrl

        ? `
            <img
                src="${escapeHTML(avatarUrl)}"
                alt="Foto de perfil"
                class="avatar-image"
            >
          `

        : `
            ${escapeHTML(
                displayName
                    .charAt(0)
                    .toUpperCase()
            )}
          `;


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


                    <button
                        class="dashboard-profile"
                        onclick="dashboardSection('profile')"
                        title="Obrir perfil"
                    >

                        <div class="avatar">

                            ${avatarHTML}

                        </div>

                    </button>

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
// 18. DASHBOARD HOME
// =========================================================

function showDashboardHome(view) {

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
// 19. DASHBOARD SECTIONS
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

    const user =
        await getCurrentUser();


    if (!user) return;


    const profile =
        await getProfile(
            user.id
        );


    const metadata =
        user.user_metadata || {};


    const displayName =
        profile?.display_name ||
        metadata.display_name ||
        "Usuari";


    const labels = {

        student: "Estudiant",

        teacher: "Professor",

        center: "Centre educatiu",

        family: "Família",

        professional: "Professional educatiu"

    };


    const type =
        profile?.account_type ||
        "student";


    const avatarUrl =
        profile?.avatar_url ||
        "";


    const avatarHTML = avatarUrl

        ? `
            <img
                src="${escapeHTML(avatarUrl)}"
                alt="Foto de perfil"
                class="profile-avatar-image"
            >
          `

        : `
            ${escapeHTML(
                displayName
                    .charAt(0)
                    .toUpperCase()
            )}
          `;


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

                    ${avatarHTML}

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
                            labels[type] ||
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


            <div class="profile-edit-card">

                <div class="profile-edit-header">

                    <span class="eyebrow">
                        CONFIGURACIÓ
                    </span>

                    <h3>
                        Editar perfil
                    </h3>

                    <p>
                        Actualitza les teves dades personals.
                    </p>

                </div>


                <form
                    id="profileEditForm"
                    class="profile-edit-form"
                >

                    <div class="auth-field">

                        <label for="profileName">
                            Nom
                        </label>

                        <input
                            id="profileName"
                            type="text"
                            value="${escapeHTML(displayName)}"
                            maxlength="80"
                            required
                        >

                    </div>


                    <div class="auth-field">

                        <label for="profileEmail">
                            Correu electrònic
                        </label>

                        <input
                            id="profileEmail"
                            type="email"
                            value="${escapeHTML(user.email || "")}"
                            required
                        >

                    </div>


                    <div class="auth-field">

                        <label for="profileAvatar">
                            Foto de perfil
                        </label>

                        <input
                            id="profileAvatar"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                        >

                        <small>
                            JPG, PNG o WebP · màxim 5 MB
                        </small>

                    </div>


                    <button
                        type="submit"
                        class="btn primary"
                    >
                        Guardar canvis
                    </button>


                    <div
                        id="profileMessage"
                        class="auth-message"
                    ></div>

                </form>

            </div>

        </section>

    `;


    document
        .getElementById("profileEditForm")
        .addEventListener(
            "submit",
            handleProfileUpdate
        );

}


// =========================================================
// 23. GUARDAR PERFIL
// =========================================================

async function handleProfileUpdate(event) {

    event.preventDefault();


    const user =
        await getCurrentUser();


    if (!user) {

        return;

    }


    const name =
        document
            .getElementById("profileName")
            .value
            .trim();


    const email =
        document
            .getElementById("profileEmail")
            .value
            .trim();


    const fileInput =
        document.getElementById(
            "profileAvatar"
        );


    const file =
        fileInput?.files?.[0] || null;


    const message =
        document.getElementById(
            "profileMessage"
        );


    if (!name) {

        message.className =
            "auth-message error";

        message.textContent =
            "El nom no pot estar buit.";

        return;

    }


    if (!email) {

        message.className =
            "auth-message error";

        message.textContent =
            "Escriu un correu electrònic.";

        return;

    }


    message.className =
        "auth-message";

    message.textContent =
        "Guardant canvis...";


    // -----------------------------------------------------
    // Actualitzar nom + email
    // -----------------------------------------------------

    const result =
        await updateProfile(
            user.id,
            name,
            email
        );


    if (!result.success) {

        message.className =
            "auth-message error";

        message.textContent =
            "No s'han pogut guardar els canvis: " +
            result.error;

        return;

    }


    // -----------------------------------------------------
    // Actualitzar foto
    // -----------------------------------------------------

    if (file) {

        message.textContent =
            "Pujant la foto de perfil...";


        const avatarResult =
            await uploadAvatar(
                user.id,
                file
            );


        if (!avatarResult.success) {

            message.className =
                "auth-message error";

            message.textContent =
                "Dades guardades, però no s'ha pogut pujar la foto: " +
                avatarResult.error;

            await refreshDashboard();

            return;

        }

    }


    message.className =
        "auth-message success";

    message.textContent =
        "Canvis guardats correctament.";


    setTimeout(
        async () => {

            await refreshDashboard();

        },
        700
    );

}


// =========================================================
// 24. REFRESH DASHBOARD
// =========================================================

async function refreshDashboard() {

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


    removeDashboard();


    showDashboard(
        user,
        profile
    );


    updateNavigation();

}


// =========================================================
// 25. LOGOUT
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
// 26. REMOVE DASHBOARD
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
// 27. LANDING
// =========================================================

function showLanding() {

    const main =
        document.querySelector("main");

    const footer =
        document.querySelector("footer");

    const publicNav =
        document.querySelector(
            "header.navbar nav"
        );


    if (main) {

        main.style.display = "";

    }


    if (footer) {

        footer.style.display = "";

    }


    // Tornar a mostrar Funcions / IA / Comunitat

    if (publicNav) {

        publicNav.style.display = "";

    }


    removeDashboard();

}


// =========================================================
// 28. NAVIGATION
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
// 29. OPEN DASHBOARD
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


    updateNavigation();

}


// =========================================================
// 30. AUTH STATE
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
// 31. SCROLL
// =========================================================

function scrollToSection(sectionId) {

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
