import { auth, db } from "./firebase.js";
import {
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const liste = document.getElementById("liste");
async function afficherAnnonces() {
    liste.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "annonces"));
    console.log("Nombre d'annonces :", querySnapshot.size);
    querySnapshot.forEach((document) => {
        const annonce = document.data();
        liste.innerHTML += `
            <div class="card">
                <h3>${annonce.nom}</h3>
                <p><strong>Prix :</strong> ${annonce.prix} DH</p>
                <p><strong>Date :</strong> ${annonce.date}</p>
                <p><strong>ID :</strong> ${document.id}</p>
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
const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");
const btnLogout = document.getElementById("btnLogout");
const btnAjouter = document.getElementById("btnAjouter");
btnLogout.addEventListener("click", async () => {

    await signOut(auth);

    alert("Déconnexion réussie");

    window.location.href = "accueil.html";

});
window.voirAnnonces = function () {

    document.getElementById("annonces").scrollIntoView({
        behavior: "smooth"
    });

}