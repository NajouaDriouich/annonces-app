import { auth } from "./firebase.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email === "" || password === ""){
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try{

        await signInWithEmailAndPassword(auth,email,password);

        alert("Connexion réussie !");

        window.location.href="accueil.html";

    }

    catch(error){

        if(error.code==="auth/invalid-credential"){
            alert("Email ou mot de passe incorrect.");
        }
        else{
            alert(error.message);
        }

    }

});