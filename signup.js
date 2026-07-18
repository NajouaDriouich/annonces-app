import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btnSignup = document.getElementById("btnSignup");

btnSignup.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email === "" || password === ""){
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email
        });

        alert("Inscription réussie !");

        window.location.href = "index.html";

    } catch(error) {
        if (error.code === "auth/email-already-in-use") {
            alert("Cet email est déjà utilisé.");
        }
        else if (error.code === "auth/weak-password") {
            alert("Le mot de passe doit contenir au moins 6 caractères.");
        }
        else if (error.code === "auth/invalid-email") {
            alert("Adresse email invalide.");
        }
        else {
            alert(error.message);
        }
    }
    });