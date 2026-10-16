
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

        if (!response.ok) {
            throw new Error("Impossible de charger la liste des villes.");
        }

        villes = await response.json();

    } catch (error) {
        console.error("Erreur lors du chargement des villes :", error);
    }
}

chargerVilles();

villeInput.addEventListener("input", () => {
    // Effacer l'ancienne sélection quand la ville change
    delete villeInput.dataset.ville;
    delete villeInput.dataset.codePostal;

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

            listeVilles.style.display = "none";
        };

        listeVilles.appendChild(div);
    });

    listeVilles.style.display = resultat.length ? "block" : "none";
});

// Compression image
async function compresserImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(
            new Error("Impossible de lire l'image.")
        );

        reader.onload = (e) => {
            const img = new Image();

            img.onerror = () => reject(
                new Error("Impossible de charger l'image.")
            );

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX = 1000;

                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX) {
                    height *= MAX / width;
                    width = MAX;
                } else if (height > MAX) {
                    width *= MAX / height;
                    height = MAX;
                }

                canvas.width = Math.round(width);
                canvas.height = Math.round(height);

                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Impossible de compresser l'image."));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    blob => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Échec de la compression."));
                        }
                    },
                    "image/jpeg",
                    0.4
                );
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

btnAjouter.addEventListener("click", async () => {
    const nom = document.getElementById("nom").value.trim();
    const prix = document.getElementById("prix").value;
    const ville = villeInput.dataset.ville || "";
    const image = document.getElementById("image").files[0];

    if (nom === "" || prix === "" || !image) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (!ville) {
        alert("Veuillez choisir une ville dans la liste.");
        return;
    }

    const villeChoisie = villes.find(
        v => v.ville.toLowerCase() === ville.toLowerCase()
    );

    if (!villeChoisie) {
        alert("Veuillez choisir une ville dans la liste officielle.");
        return;
    }

    const codePostal = villeChoisie.code_postal;

    if (!auth.currentUser) {
        alert("Vous devez vous connecter.");
        window.location.href = "login.html";
        return;
    }

    if (btnAjouter.disabled) {
        return;
    }

    btnAjouter.disabled = true;

    try {
        btnAjouter.textContent = "Compression de l'image...";

        const imageCompressee = await compresserImage(image);

        const formData = new FormData();
        formData.append("file", imageCompressee, "annonce.jpg");
        formData.append("upload_preset", UPLOAD_PRESET);

        btnAjouter.textContent = "Envoi de l'image...";

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || !data.secure_url) {
            throw new Error(
                data.error?.message || "Échec de l'envoi de l'image vers Cloudinary."
            );
        }

        const imageOptimisee = data.secure_url.replace(
            "/upload/",
            "/upload/f_auto,q_auto:low,w_350/"
        );

        btnAjouter.textContent = "Enregistrement de l'annonce...";

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

    } catch (error) {
        console.error("ERREUR COMPLETE :", error);

        alert("Erreur : " + error.message);

        btnAjouter.disabled = false;
        btnAjouter.textContent = "Publier";
    }
});
