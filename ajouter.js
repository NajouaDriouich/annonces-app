import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = "krf6hsgu";
const UPLOAD_PRESET = "annonces-app";

const btnAjouter = document.getElementById("btnAjouter");

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

                } else if (height > MAX) {

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
                    0.7
                );

            };

        };

    });

}

btnAjouter.addEventListener("click", async () => {

    const nom = document.getElementById("nom").value.trim();
    const prix = document.getElementById("prix").value;
    const image = document.getElementById("image").files[0];

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

        console.log("Début upload");

        const debut = performance.now();

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const fin = performance.now();

        console.log("Upload terminé");
        console.log("Temps upload :", ((fin - debut) / 1000).toFixed(2), "secondes");

        const data = await response.json();

        console.log("Début Firestore");

        await addDoc(collection(db, "annonces"), {

            nom: nom,
            prix: Number(prix),
            date: new Date().toLocaleDateString("fr-FR"),
            image: data.secure_url,
            userId: auth.currentUser.uid

        });

        console.log("Firestore terminé");

        alert("Annonce ajoutée avec succès !");

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        alert(error.message);

        btnAjouter.disabled = false;
        btnAjouter.textContent = "Publier";

    }

});