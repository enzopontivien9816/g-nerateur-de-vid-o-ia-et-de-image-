# VIDEOX AI
Application Node.js / Express déployable sur Render.
- 50 crédits vidéo par jour et par adresse IP (mémoire serveur, remis à zéro chaque jour UTC).
- Préparation de prompts vidéo (25 crédits par projet).
- Génération d'images via un service tiers public, sans garantie de disponibilité ni de gratuité permanente.
- Assistant de prompts gratuit.
- Panel Créateur sécurisé côté serveur.
## Render
Build: npm install
Start: npm start
Variable secrète obligatoire: CREATOR_PASSWORD (à saisir dans Render > Environment, jamais dans GitHub).
La génération vidéo MP4 nécessite une clé API d'un fournisseur vidéo et l'intégration de son endpoint. Les projets préparés ne génèrent pas encore de MP4.
Les quotas en mémoire sont réinitialisés si le service redémarre; pour une production réelle, utiliser une base de données.
