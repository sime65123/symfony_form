# Formulaire de Client Robuste et Adaptatif

## Instructions pour lancer le projet

1. **Cloner le dépôt**
2. **Installer les dépendances** :
   ```bash
   cd app
   composer install
   ```
3. **Lancer en local** :
   ```bash
   php -S 127.0.0.1:8000 -t public
   ```
4. Accéder à l'application sur [http://localhost:8000](http://localhost:8000)

---

## Règles de validation du formulaire

- **Nom complet** : Obligatoire, entre 3 et 50 caractères
- **Email** : Obligatoire, format email valide
- **Téléphone** : Obligatoire, uniquement des chiffres, entre 9 et 12 caractères, format 6XXXXXXXX ou 2376XXXXXXXX
- **Date de naissance** : Obligatoire, doit être dans le passé
- **Adresse** : Obligatoire, autocomplete via API OpenStreetMap (photon.komoot.io), sélection d'une suggestion
- **Validation côté client (JS)** et **côté serveur (Symfony)**
- **Messages d'erreur** clairs et visibles sous chaque champ
- **Résumé sécurisé** des données affiché en cas de succès

---

## Logique de changement de thème (jour/nuit)

- Le thème du formulaire s'adapte automatiquement à l'heure locale du navigateur :
  - **De 6h à 18h** : thème bleu clair (jour)
  - **De 18h à 6h** : thème sombre (nuit)
- Le changement de thème est géré dynamiquement en JavaScript, sans rechargement de page
- Le style s'adapte aussi bien sur desktop que sur mobile

---

## Problèmes rencontrés / Limites techniques

- Les labels flottants peuvent être incompatibles avec certains navigateurs ou avec la pré-remplissage côté serveur, d'où l'utilisation de placeholders pour garantir l'accessibilité et la compatibilité.
- L'autocomplete d'adresse dépend de l'API Photon (OpenStreetMap) : si l'API est lente ou indisponible, la suggestion d'adresse peut être affectée.
- Le formulaire ne sauvegarde pas les données côté client (version HTML statique), mais la version Symfony sauvegarde dans `data.json` et `data.csv`.
- Le design a été optimisé pour la clarté, la modernité et la responsivité.
- Le sélecteur de langue ne traduit que l'interface front (pas les messages backend). 