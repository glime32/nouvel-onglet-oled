// raccourcis affichés la première fois (modifiables ensuite depuis la page)
const PAR_DEFAUT = [
  { nom: "youtube", url: "https://www.youtube.com/" },
  { nom: "github", url: "https://github.com/" },
  { nom: "wikipedia", url: "https://fr.wikipedia.org/" },
  { nom: "soundcloud", url: "https://soundcloud.com/" }
];

const CLE = "raccourcis";
const zone = document.getElementById("raccourcis");
const fenetre = document.getElementById("fenetre");
const formulaire = document.getElementById("formulaire");
const champNom = document.getElementById("nom");
const champAdresse = document.getElementById("adresse");

function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const liste = JSON.parse(brut);
      if (Array.isArray(liste)) return liste;
    }
  } catch (e) {}
  return PAR_DEFAUT.slice();
}

function sauver() {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste));
  } catch (e) {}
}

// API favicon de Chrome (permission "favicon"), pas de requête vers un site externe
function icone(url) {
  const adresse = new URL(chrome.runtime.getURL("/_favicon/"));
  adresse.searchParams.set("pageUrl", url);
  adresse.searchParams.set("size", "64");
  return adresse.toString();
}

// "exemple.com" -> "https://exemple.com"
function normaliser(texte) {
  const t = texte.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : "https://" + t;
}

function element(balise, classe, texte) {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  if (texte) e.textContent = texte;
  return e;
}

let liste = charger();

function afficher() {
  zone.replaceChildren();

  liste.forEach((raccourci, index) => {
    const bloc = element("div", "raccourci");

    const lien = element("a", "lien");
    lien.href = raccourci.url;
    const tuile = element("span", "tuile");
    const rond = element("span", "rond");
    const image = element("img");
    image.src = icone(raccourci.url);
    image.alt = "";
    rond.append(image);
    tuile.append(rond);
    lien.append(tuile, element("span", "nom", raccourci.nom));

    const supprimer = element("button", "supprimer", "×");
    supprimer.type = "button";
    supprimer.title = "Supprimer";
    supprimer.addEventListener("click", () => {
      liste.splice(index, 1);
      sauver();
      afficher();
    });

    bloc.append(lien, supprimer);
    zone.append(bloc);
  });

  // la tuile "+" à la fin
  const blocAjout = element("div", "raccourci");
  const ajouter = element("button", "ajouter");
  ajouter.type = "button";
  const tuile = element("span", "tuile");
  tuile.append(element("span", "plus", "+"));
  ajouter.append(tuile, element("span", "nom", "Ajouter"));
  ajouter.addEventListener("click", () => {
    formulaire.reset();
    fenetre.showModal();
    champNom.focus();
  });
  blocAjout.append(ajouter);
  zone.append(blocAjout);
}

formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  const nom = champNom.value.trim();
  const adresse = champAdresse.value.trim();
  if (!nom || !adresse) return;
  liste.push({ nom, url: normaliser(adresse) });
  sauver();
  fenetre.close();
  afficher();
});

document.getElementById("annuler").addEventListener("click", () => fenetre.close());

afficher();
