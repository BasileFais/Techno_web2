# Techno_web2

Ce projet présente un catalogue d’appareils photos avec possibilité d’ajouter, modifier et supprimer des appareils.
Il a été développé dans le cadre du cours Tech Web 2, en respectant l’architecture MVC avec TypeScript, JSON pour les données et Jest pour les tests unitaires.

## 🏗 Architecture
- **Model → `Camera.ts`** : gère les données (chargement depuis `data.json`, ajout, modification, suppression).
- **View → `CatalogueView.ts`** : affiche les appareils dans la page et gère les interactions utilisateur (boutons).
- **Controller → `Controller.ts`** : fait le lien entre le modèle et la vue, gère les formulaires (ajout/modif) et les actions (supprimer).
- **Données → `data.json`** : contient la liste des appareils.
- **Style → `style.css`** : design moderne et responsive.

## ▶️ Scripts
```bash
npm ci
npm run build     # compile TypeScript + bundle (esbuild)
npm start         # sert le site localement
npm test          # lance les tests Jest
