# MCCIBS Mobile Application

Une application mobile basée sur Flutter pour MCCI Business School qui permet aux étudiants d’accéder à leurs informations académiques, de recevoir des notifications, et plus encore.

## Features

- Authentification des étudiants
- Accès à la carte étudiante numérique
- Notifications en temps réel
- Gestion du profil
- Support multiplateforme (iOS & Android)

## Tech Stack

- **Frontend**: Flutter
- **Backend**: Node.js with Express
- **Base de données**: MongoDB
- **Authentication**: JWT
- **Stockage de fichiers**: Stockage local

## Project Structure

```
mccibs_mobile_app_v2/
├── lib/                    # Flutter application code
│   ├── models/            # Modèles de données
│   ├── screens/           # Écrans de l’interface utilisateur
│   └── services/          # Intégrations API et services
├── backend/               # Serveur backend Node.js
│   ├── routes/           # Routes API
│   ├── uploads/          # Téléversement de fichiers
│   └── public/           # Fichiers statiques
└── ios/ & android/       # Code spécifique aux plateformes
```

## Démarrage

### Prérequis

- Flutter SDK
- Node.js
- MongoDB
- Android Studio (développement Android)

### Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/Remie030101/MccibsApp.git
cd MccibsApp
```

2. Installer les dépendances Flutter:
```bash
flutter pub get
```

3. Installer les dépendances du backend:
```bash
cd backend
npm install
```

4. Configurer les variables d’environnement:
   - Créer un fichier .env dans le répertoire backend
   - Ajouter les variables nécessaires (URL de la base de données, secret JWT, etc.

5. Lancer le serveur backend:
```bash
cd backend
npm start
```

6. Lancer l’application Flutter:
```bash
flutter run
```

