import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = "krf6hsgu";
const UPLOAD_PRESET = "annonces-app";

const id = new URLSearchParams(window.location.search).get("id");

const annonceRef = doc(db, "annonces", id);

const annonceSnap = await getDoc(annonceRef);

if (annonceSnap.exists()) {

const annonce = annonceSnap.data();

document.getElementById("nom").value = annonce.nom;

document.getElementById("prix").value = annonce.prix;

}

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

await updateDoc(annonceRef,{

nom:document.getElementById("nom").value,

prix:Number(document.getElementById("prix").value),

image:imageUrl

});

alert("Annonce modifiée avec succès");

window.location.href="mes-annonces.html";

});