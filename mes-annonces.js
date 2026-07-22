import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const liste = document.getElementById("liste");

async function afficherMesAnnonces() {

    liste.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "annonces"));

    querySnapshot.forEach((document) => {

        const annonce = document.data();

        if (auth.currentUser && annonce.userId === auth.currentUser.uid) {

            liste.innerHTML += `
                <div class="card">

                    <img
                        src="${annonce.image
                             ? annonce.image.replace('/upload/', '/upload/f_auto,q_auto,w_500/')
                        : 'bouton-daccueil.png'}"
                        class="photoAnnonce"
                        alt="${annonce.nom}"
                        loading="lazy"
                        width="300"
                        height="200">

                    <div class="info">

                        <h3>${annonce.nom}</h3>

                        <p><strong>ID :</strong> ${document.id}</p>

                        <p><strong>Prix :</strong> ${annonce.prix} DH</p>

                        <p>
                            <strong>Ville :</strong>
                                📍 ${annonce.ville} • ${annonce.codePostal}
                        </p>

                        <p><strong>Date :</strong> ${annonce.date}</p>
                        <button
                            class="modifier"
                            onclick="modifierAnnonce('${document.id}')">
                            Modifier
                        </button>

                        <button
                            class="supprimer"
                            onclick="supprimerAnnonce('${document.id}')">
                            Supprimer
                        </button>

                    </div>

                </div>
            `;

        }

    });

}

onAuthStateChanged(auth, (user) => {

    if (user) {

        afficherMesAnnonces();

    } else {

        window.location.href = "login.html";

    }

});

window.modifierAnnonce = function(id){

    window.location.href = `modifier.html?id=${id}`;

};

window.supprimerAnnonce = async function(id){

    const confirmation = confirm("Voulez-vous supprimer cette annonce ?");

    if(!confirmation) return;

    await deleteDoc(doc(db,"annonces",id));

    alert("Annonce supprimée !");

    location.reload();

};