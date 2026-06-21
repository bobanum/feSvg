# Interface d'édition de filtres SVG

Panneaux flottants (noeuds) comme les materiaux dans les logiciels 3D, avec une prévisualisation en temps réel du résultat.
    - Panneau en HTML positionnement absolu, avec possibilité de le déplacer et de le redimensionner.
    - Liens entre les composants en SVG
    - Entrée (in, in2) et sortie (result) pour chaque composant, permettant de connecter les composants entre eux.
Formulaire général pour les paramètres de base du filtre (nom, description, etc.).
Liste déroulante pour sélectionner le type de filtre à ajouter, avec un bouton "Ajouter un filtre".
Possibilité d'utiliser une filtre comme un composant d'un autre filtre, en sélectionnant le filtre dans la liste des composants disponibles.
Librairie de filtres prédéfinis, avec possibilité de les ajouter à la liste des composants disponibles.
Possibilité de publier les filtres créés, avec un système de partage et de notation.
Parsing du code SVG pour permettre l'importation de filtres existants, avec une interface de visualisation et d'édition des composants du filtre importé.
Exportation du code SVG du filtre créé, avec une interface de visualisation du code généré.

## Interface utilisateur
- Login oAuth pour la gestion des utilisateurs et de leurs filtres.
- Tableau de bord pour la gestion des filtres créés, avec possibilité de les éditer
- Liste des filtres créés, avec possibilité de les trier et de les filtrer par nom, date de création, etc.
- Système de notation et de commentaires pour les filtres publiés, avec possibilité de répondre aux commentaires.
- Système de partage des filtres, avec possibilité de les partager sur les réseaux sociaux ou par email.
- Système de favoris pour les filtres, avec possibilité de les ajouter à une liste de favoris pour un accès rapide.
- Possibilité de suivre les créateurs de filtres, avec une page de profil pour chaque créateur affichant ses filtres publiés et ses statistiques.

## Mécanique
- API REST pour la gestion des filtres, avec des endpoints pour la création, l'édition, la suppression, la publication, etc.
- JS vanilla

## Un panneau (noeud)
- Header avec le nom du composant et menu &vellip; pour les actions (dupliquer, supprimer, etc.)
- À gauche : Points d'ancrage in et in2, avec possibilité de les connecter à d'autres composants
- À droite : Point d'ancrage result, avec possibilité de le connecter à d'autres composants
- Au centre : Formulaire pour les paramètres du composant, avec des champs spécifiques à chaque type de composant (ex : radius pour feGaussianBlur, etc.)
- Footer avec zone pour draguer ou redimensionner le panneau.
- Clic : Sélection du composant, affichage de ses paramètres dans le formulaire central.
- Possibilité de "réduire" le panneau pour ne laisser que le header visible, avec un indicateur visuel du nombre de connexions entrantes et sortantes.
- Peut être désactivé (grisé) pour ne pas prendre en compte son effet dans le résultat final, sans le supprimer du graphe de filtres.

## Noeud spéciaux
- SourceGraphic et SourceAlpha : Noeuds d'entrée pour les données graphiques, avec possibilité de les connecter à d'autres composants.
- Noeud de visualisation du résultat : Affiche le résultat du filtre en temps réel, avec possibilité de choisir la forme, de zoomer et de déplacer l'image.
- Noeud de filtres externes. Permet d'ajouter des filtres complets.

## Les composants de filtres SVG
- `<feBlend>`
- `<feColorMatrix>`
- `<feComponentTransfer>`
  - `<feFuncR>`
  - `<feFuncG>`
  - `<feFuncB>`
  - `<feFuncA>`
- `<feComposite>`
- `<feConvolveMatrix>`
- `<feDiffuseLighting>`, `<feSpecularLighting>`
  - `<feDistantLight>`
  - `<fePointLight>`
  - `<feSpotLight>`
- `<feDisplacementMap>`
- `<feDropShadow>`
- `<feFlood>`
- `<feGaussianBlur>`
- `<feImage>`
- `<feMerge>`
  - `<feMergeNode>`
- `<feMorphology>`
- `<feOffset>`
- `<feTile>`
- `<feTurbulence>`

## Codage
- Utilisation de Vite pour la gestion du projet et des dépendances.
- Utilisation de SVG.js pour la manipulation des éléments SVG et la création de l'interface d'édition.
- Utilisation de HTML pour la création des panneaux flottants et de l'interface utilisateur.
- Utilisation de CSS pour la création des panneaux flottants et de l'interface utilisateur.
  - Imbrication des regles.
  - Normalisation avec @import
  - Utilisation de variables CSS pour les couleurs, les tailles, etc.
  - Couleurs en HSL pour une meilleure gestion des teintes et des contrastes.
- Utilisation de JavaScript pour la gestion des interactions, la connexion entre les composants, et la génération du code SVG final.
  - Orienté objet pour la gestion des composants et des filtres.
  - Web components si pertinent.
  - Utilisation de Fetch API pour les appels à l'API REST.
  - Normalisation.
- API en PHP
- Base de données MySQL pour la gestion des utilisateurs et des filtres créés.
  - Table "users" pour la gestion des utilisateurs (id, username, email, password_hash, etc.)
  - Table "filters" pour la gestion des filtres créés (id, user_id, name, description, svg_code, created_at, updated_at, etc.)
- Utilisation de Git pour la gestion du code source et des versions.

# Sérialisation des filtres
- Les informations de graphes seront intégrés avec un XMLNS spécifique dans le code SVG, permettant de stocker les informations de connexions entre les composants, les paramètres spécifiques à chaque composant, etc.
- Exemple de sérialisation :
```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:feSvg="http://www.feSvg.com">
  <filter id="myFilter" feSvg:type="custom" feSvg:name="My Custom Filter" feSvg:description="A custom filter created with feSvg" feSvg:createdAt="2024-06-01T12:00:00Z" feSvg:updatedAt="2024-06-01T12:00:00Z" feSvg:author="John Doe">
    <feSvg:SourceAlpha result="SourceAlpha" x="0" y="0" />
    <feGaussianBlur id="feGaussianBlur1" stdDeviation="5" feSvg:x="0" feSvg:y="0" result="blur-result" />
    <feBlend id="feBlend1" mode="multiply" />
    <feColorMatrix id="feColorMatrix1" type="matrix" values="..." />
    <feComponentTransfer id="feComponentTransfer1">
      <feFuncR type="linear" slope="1" intercept="0" />
      <feFuncG type="linear" slope="1" intercept="0" />
      <feFuncB type="linear" slope="1" intercept="0" />
      <feFuncA type="linear" slope="1" intercept="0" />
    </feComponentTransfer>
    <feSvg:preview in="blur-result" x="0" y="0" width="200" height="200" />
  </filter>
</svg>
```