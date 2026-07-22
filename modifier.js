import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = "krf6hsgu";
const UPLOAD_PRESET = "annonces-app";
const villeInput = document.getElementById("ville");
const listeVilles = document.getElementById("listeVilles");

let villes = [];

async function chargerVilles() {

    const response = await fetch("./data/maroc_villes_complet.json");

    villes = await response.json();

}

await chargerVilles();

const id = new URLSearchParams(window.location.search).get("id");

const annonceRef = doc(db, "annonces", id);

const annonceSnap = await getDoc(annonceRef);

if (annonceSnap.exists()) {

const annonce = annonceSnap.data();

document.getElementById("nom").value = annonce.nom;

document.getElementById("prix").value = annonce.prix;
villeInput.value = annonce.ville;

villeInput.dataset.ville = annonce.ville;

villeInput.dataset.codePostal = annonce.codePostal;

}
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
            <strong>${v.ville}</strong><br>
            <small>${v.code_postal}</small>
        `;

        div.onclick = () => {

            villeInput.value = v.ville;

            villeInput.dataset.ville = v.ville;

            villeInput.dataset.codePostal = v.code_postal;

            listeVilles.style.display = "none";

        };

        listeVilles.appendChild(div);

    });

    listeVilles.style.display = resultat.length ? "block" : "none";

});

document.getElementById("btnModifier").addEventListener("click", async () => {

let imageUrl = annonceSnap.data().image;

const image = document.getElementById("image").files[0];

if(image){

const formData = new FormData();

formData.append("file", image);

formData.append("upload_preset", UPLOAD_PRESET);

const response = await fetch(

`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

{

method:"POST",

body:formData

}

);
const data = await response.json();

imageUrl = data.secure_url;

}
const ville = villeInput.dataset.ville || villeInput.value;

const villeChoisie = villes.find(
    v => v.ville.toLowerCase() === ville.toLowerCase()
);

const codePostal = villeChoisie
    ? villeChoisie.code_postal
    : annonceSnap.data().codePostal;

await updateDoc(annonceRef,{

    nom: document.getElementById("nom").value,

    prix: Number(document.getElementById("prix").value),

    ville: ville,

    codePostal: codePostal,

    image: imageUrl

});
alert("Annonce modifiée avec succès");

window.location.href = "mes-annonces.html";

});