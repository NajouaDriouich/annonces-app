import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const liste = document.getElementById("liste");

async function afficherMesAnnonces() {

    liste.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "annonces"));

    querySnapshot.forEach((document) => {

        const annonce = document.data();

        if (auth.currentUser && annonce.userId === auth.currentUser.uid) {

            liste.innerHTML += `
<div class="card">

    <img src="${annonce.image || 'bouton-daccueil.png'}" class="photoAnnonce" alt="Image de l'annonce">

    <div class="info">

        <h3>${annonce.nom}</h3>

        <p><strong>ID :</strong> ${document.id}</p>

        <p><strong>Prix :</strong> ${annonce.prix} DH</p>

        <p><strong>Date :</strong> ${annonce.date}</p>

        <button class="modifier"
            onclick="modifierAnnonce('${document.id}','${annonce.nom}',${annonce.prix})">
            Modifier
        </button>

        <button class="supprimer"
            onclick="supprimerAnnonce('${document.id}')">
            Supprimer
        </button>

    </div>

</div>
`;

        }

    });

}

afficherMesAnnonces();
window.modifierAnnonce = async function(id, ancienNom, ancienPrix) {

    const nouveauNom = prompt("Nouveau nom :", ancienNom);

    if (nouveauNom == null) return;

    const nouveauPrix = prompt("Nouveau prix :", ancienPrix);

    if (nouveauPrix == null) return;

    await updateDoc(doc(db, "annonces", id), {
        nom: nouveauNom,
        prix: Number(nouveauPrix)
    });

    alert("Annonce modifiée avec succès !");

    location.reload();
}

window.supprimerAnnonce = async function(id) {

    const confirmation = confirm("Voulez-vous supprimer cette annonce ?");

    if (!confirmation) return;

    await deleteDoc(doc(db, "annonces", id));

    alert("Annonce supprimée.");

    location.reload();
}
