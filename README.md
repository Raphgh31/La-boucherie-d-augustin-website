# La Boucherie d'Augustin — site web

Site vitrine de **La Boucherie d'Augustin**, boucherie-charcuterie-traiteur
aux Deux Routes, 43200 Saint-Maurice-de-Lignon.

> Statut : **ébauche à valider par le commerçant**, prête à être mise en ligne.

## Pages

| Fichier | Page |
|---|---|
| `index.html` | Accueil |
| `maison.html` | La Maison (histoire, engagements) |
| `etal.html` | L'Étal (rayons, marinades de la vitrine, spécialités) |
| `traiteur.html` | Traiteur & Fêtes (carte des fêtes, commandes) |
| `infos.html` | Infos pratiques (horaires en direct, contact, accès, fidélité, colis) |
| `mentions-legales.html` | Mentions légales |

Site 100 % statique (HTML + CSS + un petit JavaScript), sans dépendance ni
étape de compilation. Les pages s'enchaînent de gauche à droite via la barre
d'onglets, avec un glissement horizontal (et un balayage du doigt sur mobile).

## Mise en ligne en deux clics (GitHub Pages)

1. Sur GitHub : **Settings → Pages**.
2. Dans *Build and deployment*, choisir *Deploy from a branch*, sélectionner la
   branche qui contient le site et le dossier `/ (root)`, puis **Save**.

Le site est en ligne quelques minutes plus tard à l'adresse indiquée par
GitHub. Pour un nom de domaine (ex. `boucherie-augustin.fr`), le saisir dans
*Custom domain* sur la même page.

Alternative : glisser-déposer le dossier du dépôt sur https://app.netlify.com/drop.

## Avant la mise en ligne

- Faire valider par le commerçant : horaires, e-mail, contenu des rayons et prix
  (relevés sur la vitrine et la carte des fêtes, indiqués « à titre indicatif »).
- Compléter l'hébergeur dans `mentions-legales.html`.
- Les horaires « ouvert / fermé » en direct sont définis en haut de
  `assets/js/site.js` (objet `HOURS`) ; les mettre à jour en même temps que
  les tableaux d'horaires des pages.
