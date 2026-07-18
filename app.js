import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const liste = document.getElementById("liste");

const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");
const btnLogout = document.getElementById("btnLogout");
const btnAjouter = document.getElementById("btnAjouter");

async function afficherAnnonces() {

    liste.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "annonces"));

    querySnapshot.forEach((document) => {

        const annonce = document.data();

        liste.innerHTML += `
            <div class="card">

                <img
                    src="${annonce.image || 'bouton-daccueil.png'}"
                    class="photoAnnonce"
                    alt="Image annonce">

                <div class="info">

                    <h3>${annonce.nom}</h3>

                    <p><strong>Prix :</strong> ${annonce.prix} DH</p>

                    <p><strong>Date :</strong> ${annonce.date}</p>

                    <p><strong>ID :</strong> ${document.id}</p>

                </div>

            </div>
        `;

    });

}

onAuthStateChanged(auth, (user) => {

    afficherAnnonces();

    if (user) {

        btnLogin.style.display = "none";
        btnSignup.style.display = "none";
        btnLogout.style.display = "inline-block";
        btnAjouter.style.display = "inline-block";

    } else {

        btnLogin.style.display = "inline-block";
        btnSignup.style.display = "inline-block";
        btnLogout.style.display = "none";
        btnAjouter.style.display = "none";

    }

});

btnLogout.addEventListener("click", async () => {

    await signOut(auth);

    alert("Déconnexion réussie");

    window.location.href = "index.html";

});

window.voirAnnonces = function () {

    document.getElementById("annonces").scrollIntoView({
        behavior: "smooth"
    });

};