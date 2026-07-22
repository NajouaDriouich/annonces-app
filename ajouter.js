import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = "krf6hsgu";
const UPLOAD_PRESET = "annonces-app";

const btnAjouter = document.getElementById("btnAjouter");
const villeInput = document.getElementById("ville");
const listeVilles = document.getElementById("listeVilles");

let villes = [];

// Charger les villes
async function chargerVilles() {

    try {
        const response = await fetch("./data/maroc_villes_complet.json");

        villes = await response.json();

    } catch (error) {

        console.error("Erreur lors du chargement des villes :", error);

    }

}

chargerVilles();

villeInput.addEventListener("input", () => {

    const recherche = villeInput.value.toLowerCase().trim();

    listeVilles.innerHTML = "";

    if (recherche.length < 2) {

        listeVilles.style.display = "none";
        return;

    }

    const resultat = villes
        .filter(v => v.ville.toLowerCase().includes(recherche))
        .slice(0, 10);

    resultat.forEach(v => {

        const div = document.createElement("div");

        div.className = "suggestion";

       div.innerHTML = `
              <strong>${v.ville}</strong>
              <br>
              <small>📮 ${v.code_postal}</small>
       `;

        div.onclick = () => {

            villeInput.value = v.ville;

            villeInput.dataset.ville = v.ville;
            villeInput.dataset.codePostal = v.code_postal;

            console.log("Choisie :", v.ville);
            console.log("Code postal :", v.code_postal);

            listeVilles.style.display = "none";

        };

        listeVilles.appendChild(div);

    });

    listeVilles.style.display =
        resultat.length ? "block" : "none";

});

// Compression image
async function compresserImage(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = function (e) {

            const img = new Image();

            img.src = e.target.result;

            img.onload = function () {

                const canvas = document.createElement("canvas");

                const MAX = 1000;

                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX) {

                    height *= MAX / width;
                    width = MAX;

                }

                else if (height > MAX) {

                    width *= MAX / height;
                    height = MAX;

                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(

                    (blob) => resolve(blob),

                    "image/jpeg",

                    0.4

                );

            };

        };

    });

}
btnAjouter.addEventListener("click", async () => {

    const nom = document.getElementById("nom").value.trim();
    const prix = document.getElementById("prix").value;
    const ville = villeInput.dataset.ville || "";
    const image = document.getElementById("image").files[0];

    let codePostal = villeInput.dataset.codePostal || "";

    // Vérifier que la ville existe dans la liste officielle
    const villeChoisie = villes.find(
    v => v.ville.toLowerCase() === ville.toLowerCase()
);

if (!villeChoisie) {

    alert("Veuillez choisir une ville dans la liste.");

    return;

}

codePostal = villeChoisie.code_postal;

console.log("Code final envoyé Firebase :", codePostal);

    if (nom === "" || prix === "" || !image) {

        alert("Veuillez remplir tous les champs.");

        return;

    }

    if (!auth.currentUser) {

        alert("Vous devez vous connecter.");

        window.location.href = "login.html";

        return;

    }

    btnAjouter.disabled = true;

    btnAjouter.textContent = "Publication...";

    try {

        const imageCompressee = await compresserImage(image);

        const formData = new FormData();

        formData.append("file", imageCompressee, image.name);

        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {

                method: "POST",

                body: formData

            }

        );

       const data = await response.json();

// Optimisation de l'image Cloudinary
const imageOptimisee = data.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto:low,w_350/"
);

await addDoc(collection(db, "annonces"), {

    nom: nom,

    prix: Number(prix),

    ville: ville,

    codePostal: codePostal,

    date: new Date().toLocaleDateString("fr-FR"),

    image: imageOptimisee,

    userId: auth.currentUser.uid

});

        alert("Annonce ajoutée avec succès !");

        window.location.href = "index.html";

    }

    catch (error) {

    console.error("ERREUR COMPLETE :", error);

    alert("Erreur : " + error.message);

    btnAjouter.disabled = false;

    btnAjouter.textContent = "Publier";

}
});