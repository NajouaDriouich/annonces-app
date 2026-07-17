import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btnAjouter = document.getElementById("btnAjouter");

btnAjouter.addEventListener("click", async () => {

    const nom = document.getElementById("nom").value;
    const prix = document.getElementById("prix").value;
   const image = document.getElementById("image").value;

    if (nom === "" || prix === "" || !image) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (!auth.currentUser) {
        alert("Vous devez vous connecter.");
        window.location.href = "login.html";
        return;
    }
    let imageBase64 = "";

const reader = new FileReader();

reader.readAsDataURL(image);

reader.onload = async function () {

    imageBase64 = reader.result;

    try {

        await addDoc(collection(db, "annonces"), {

            nom: nom,
            prix: Number(prix),
            date: new Date().toLocaleDateString("fr-FR"),
            image: imageBase64,
            userId: auth.currentUser.uid

        });

        alert("Annonce ajoutée avec succès !");
        window.location.href = "accueil.html";

    } catch (error) {

        alert(error.message);

    }

};
}); 
