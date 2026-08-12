# Notification push durable — Notre Univers

## Ce qui est maintenant intégré

Le projet contient désormais un service worker FCM (`firebase-messaging-sw.js`), un manifeste PWA (`manifest.webmanifest`), une icône dédiée, l’abonnement persistant des appareils dans Firestore (`pushSubscriptions`) et une Cloud Function (`functions/index.js`) qui envoie une notification lorsque l’autre personne ouvre une nouvelle session.

Le battement de présence de 30 secondes n’envoie pas de notification répétée. La fonction compare le `sessionId` de la nouvelle ouverture avec celui de la session précédente. Une nouvelle ouverture est donc notifiée, tandis que les simples rafraîchissements de présence restent silencieux.

## Action unique dans Firebase Console

Dans Firebase Console, ouvre **Project settings → Cloud Messaging → Web Push certificates**, puis clique sur **Generate key pair**. Copie uniquement la clé publique affichée et remplace la valeur de `window.COSMICLOVE_FCM_VAPID_KEY` dans `push-config.js`.

La clé publique peut être présente dans le frontend. En revanche, une éventuelle clé privée ne doit jamais être placée dans `index.html`, `script.js`, `push-config.js` ou le dépôt public.

## Déploiement du déclencheur serveur

Depuis la racine du projet, installe la CLI Firebase si nécessaire, connecte-toi au compte propriétaire du projet, puis déploie la fonction :

```bash
npm install --global firebase-tools
firebase login
cd /chemin/vers/cosmiclove_work
firebase deploy --only functions:notifyPartnerPresence
```

Le projet est déjà associé à `cosmiclove-ilyes` dans `.firebaserc`. Le projet est actuellement sur le forfait Spark. D’après la documentation Firebase, Cloud Functions n’est pas disponible pour de nouveaux déploiements sur Spark ; le déclencheur automatique nécessite donc Blaze et un compte de facturation. FCM lui-même reste un produit sans coût, mais FCM ne peut pas décider seul qu’un document Firestore a changé : il faut un serveur pour effectuer cet envoi. Si aucune carte bancaire ne doit être ajoutée, ne déploie pas `functions/index.js` : le site peut demander l’autorisation et recevoir des messages envoyés manuellement depuis Firebase, mais il ne peut pas envoyer automatiquement une notification au téléphone fermé lorsqu’un partenaire se connecte. Le code ne crée aucune tâche Manus et ne dépend d’aucun minuteur de session.

## Déploiement du site

Publie ensuite à la racine de ton site Vercel les fichiers `index.html`, `style.css`, `script.js`, `push-config.js`, `firebase-messaging-sw.js`, `manifest.webmanifest` et `cosmiclove-icon.svg`. Le fichier `firebase-messaging-sw.js` doit être accessible exactement à l’adresse `/firebase-messaging-sw.js`, et le site doit être servi en HTTPS.

Sur Android, ouvre le site dans un navigateur compatible, sélectionne ton identité, puis appuie une fois sur le bouton 🔔 et accepte les notifications. Sur iPhone, ouvre le site dans Safari, utilise **Partager → Ajouter à l’écran d’accueil**, lance ensuite l’application depuis cette icône et accepte les notifications. Cette installation PWA est une condition imposée par iOS pour les notifications web en arrière-plan.

## Durée réelle

Il n’y a **aucune expiration programmée** dans cette solution : le service worker reste enregistré, la fonction serveur reste disponible et le jeton FCM est rafraîchi automatiquement à chaque ouverture du site lorsque l’autorisation existe. Comme pour toute notification mobile, le système d’exploitation peut toutefois suspendre une application, révoquer une permission ou couper les notifications en mode économie d’énergie. Aucune solution web ne peut promettre une livraison absolument garantie dans ces situations externes.

## Références officielles

[1]: https://firebase.google.com/docs/cloud-messaging/web/get-started "Firebase Cloud Messaging — démarrage sur le Web"
[2]: https://firebase.google.com/docs/cloud-messaging/web/receive-messages "Firebase Cloud Messaging — réception des messages Web"
[3]: https://firebase.google.com/docs/functions/firestore-events "Firebase Cloud Functions — déclencheurs Firestore"
[4]: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans "Firebase — forfaits Spark et Blaze"

## Logique des notifications relationnelles

La présence n’envoie qu’une notification par nouvelle session : le battement de 30 secondes conserve le même `sessionId` et reste silencieux. Le message envoyé est `Chayma est en ligne dans notre Univers ✨` ou `Ilyess est en ligne dans notre Univers ✨`.

Un changement réel d’humeur déclenche un message du type `Chayma a changé d’humeur 💫` avec le libellé et l’emoji choisis. Le premier chargement de l’humeur ne déclenche pas de notification afin d’éviter un faux positif.

La création d’une lettre déclenche un message du type `Ilyess t’a écrit : Notre prochain souvenir`. Le lecteur des lettres et l’éditeur de la surprise sont indépendants : enregistrer une surprise ne modifie aucune lettre et l’ouverture d’une lettre ne modifie pas la surprise.

Les fonctions concernées sont `notifyPartnerPresence`, `notifyPartnerMood` et `notifyPartnerLetter` dans `functions/index.js`. Leur déploiement automatique reste soumis aux conditions Firebase indiquées plus haut dans ce guide.


## Lancement local après extraction du ZIP

Après extraction, ouvre le dossier qui contient directement `index.html`, `manifest.webmanifest` et `firebase-messaging-sw.js` avec Live Server ou un serveur HTTP. La version corrigée utilise des chemins relatifs : elle fonctionne à la racine Vercel comme dans un sous-dossier local tel que `/CosmicLove_manual_open_v11/`.

Vérifie directement les deux adresses suivantes dans le navigateur :

```text
http://127.0.0.1:5501/CosmicLove_manual_open_v11/manifest.webmanifest
http://127.0.0.1:5501/CosmicLove_manual_open_v11/firebase-messaging-sw.js
```

Elles doivent afficher respectivement le manifeste JSON et le code du service worker, jamais une page 404. L’erreur `AudioContext was not allowed to start` n’est pas un problème de chargement : le navigateur attend simplement un premier clic utilisateur avant d’autoriser le son.
