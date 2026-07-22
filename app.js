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
const filtreVille = document.getElementById("filtreVille");

async function afficherAnnonces() {
    const villeChoisie = filtreVille.value;

    liste.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "annonces"));


querySnapshot.forEach((document) => {

    const annonce = document.data();

    if (
        villeChoisie === "Toutes" ||
        annonce.ville === villeChoisie
    ) {

        liste.innerHTML += `
            <div class="card">

                <img src="${annonce.image}"
                    class="photoAnnonce"
                    alt="${annonce.nom}"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    width="300"
                    height="220">
                <div class="info">

                    <h3>${annonce.nom}</h3>
                    <p><strong>Prix :</strong> ${annonce.prix} DH</p>

                    <p><strong>Date :</strong> ${annonce.date}</p>

                    <p>
                        <strong>Ville :</strong>
                        📍 ${annonce.ville} • ${annonce.codePostal}
                    </p>

    

                </div>

            </div>
         `;

    }

});
}

onAuthStateChanged(auth, (user) => {

    afficherAnnonces();
    chargerVilles();

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
async function chargerVilles() {

    const querySnapshot = await getDocs(collection(db, "annonces"));

    const villes = [];

    querySnapshot.forEach((doc) => {

        const annonce = doc.data();

        if (!villes.includes(annonce.ville)) {

            villes.push(annonce.ville);

        }

    });

    villes.sort();

    villes.forEach(ville => {

        filtreVille.innerHTML += `
            <option value="${ville}">
                ${ville}
            </option>
        `;

    });

}
filtreVille.addEventListener("change", () => {

    afficherAnnonces();

});