// =========================================================
// HORIZON270.EDU
// Supabase connection + Authentication
// =========================================================

// ---------------------------------------------------------
// 1. SUPABASE CONNECTION
// ---------------------------------------------------------

const SUPABASE_URL = "https://cecouhunurwkncfcjjor.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mU_871SdiMJgSA1LHCLEAg_my7qG2oq";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ---------------------------------------------------------
// 2. REGISTER
// ---------------------------------------------------------

async function registerUser(email, password, displayName) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,

        options: {
            data: {
                display_name: displayName
            }
        }
    });

    if (error) {
        console.error("Error de registre:", error.message);

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


// ---------------------------------------------------------
// 3. LOGIN
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// 4. LOGOUT
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// 5. CURRENT USER
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// 6. AUTH STATE
// ---------------------------------------------------------

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Esdeveniment d'autenticació:",
            event
        );

        if (session) {

            console.log(
                "Usuari connectat:",
                session.user.email
            );

        } else {

            console.log(
                "Cap usuari connectat"
            );
        }
    }
);


// ---------------------------------------------------------
// 7. TEST CONNECTION
// ---------------------------------------------------------

async function testSupabaseConnection() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {

        console.log(
            "Supabase connectat. No hi ha cap sessió activa."
        );

        return;
    }

    if (user) {

        console.log(
            "Supabase connectat. Usuari:",
            user.email
        );

    } else {

        console.log(
            "Supabase connectat correctament."
        );
    }
}


// ---------------------------------------------------------
// 8. START
// ---------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Horizon270.edu iniciat."
        );

        testSupabaseConnection();
    }
);
