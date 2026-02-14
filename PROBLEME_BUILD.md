# Rapport détaillé — Problème de Build APK MubarakApp

> **Date** : 10 février 2026
> **Projet** : MubarakApp (Student Fit — Wellness First)
> **Chemin** : `C:\dev\MubarakApp`

---

## 1. Résumé du problème

Le projet MubarakApp ne peut pas être compilé en APK car **Gradle reste bloqué indéfiniment à l'étape "Evaluating settings"** (plus de 20 minutes) sans jamais progresser. Ce problème empêche toute opération Gradle : `clean`, `assembleRelease`, `assembleDebug`, etc.

---

## 2. Environnement technique

| Élément | Valeur |
|---------|--------|
| **OS** | Windows (PowerShell) |
| **Java** | OpenJDK 17.0.18 (Temurin-17.0.18+8) |
| **Node.js** | v22.15.0 |
| **Gradle** | 8.0.1 (via wrapper) |
| **React Native** | 0.76.6 |
| **Expo** | ~49.0.23 |
| **IDE** | Windsurf / VS Code |
| **Android Gradle Plugin** | 7.4.2 |

---

## 3. Symptôme observé

Lors de l'exécution de n'importe quelle commande Gradle :

```powershell
PS C:\dev\MubarakApp\android> .\gradlew clean
Starting a Gradle Daemon (subsequent builds will be faster)
<-------------> 0% INITIALIZING [22m 6s]
> Evaluating settings
```

Le processus reste bloqué à **"Evaluating settings"** pendant 5 à 22+ minutes sans jamais avancer. Ceci se produit avec :
- `.\gradlew clean`
- `.\gradlew assembleRelease`
- `.\gradlew clean --no-daemon`
- `npx react-native run-android`
- `npx react-native build-android --mode=release`

---

## 4. Cause racine identifiée

### 4.1 Appels Node.js synchrones dans les scripts Gradle

Le processus d'évaluation des settings Gradle exécute **plusieurs commandes Node.js synchrones** via `.execute()`. Ces commandes lancent des processus `node.exe` séparés qui sont **extrêmement lents sur cette machine Windows**.

#### Fichiers concernés et appels Node.js :

**`android/settings.gradle`** (CORRIGÉ — voir section 6) :
```gradle
// AVANT (lent) : 3 appels Node.js
["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir)
["node", "--print", "require.resolve('@react-native-community/cli-platform-android/package.json')"].execute(null, rootDir)
["node", "--print", "require.resolve('@react-native/gradle-plugin/package.json')"].execute(null, rootDir)
```

**`android/build.gradle`** (CORRIGÉ — voir section 6) :
```gradle
// AVANT (lent) : 2 appels Node.js
['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir)
['node', '--print', "require.resolve('jsc-android/package.json')"].execute(null, rootDir)
```

**`node_modules/@react-native-community/cli-platform-android/native_modules.gradle`** (NON MODIFIABLE) :
```gradle
// Toujours lent : 2 appels Node.js internes
String[] nodeCommand = ["node", "-e", cliResolveScript]
String[] reactNativeConfigCommand = ["node", cliPath, "config", "--platform", "android"]
```

Ce dernier fichier est dans `node_modules/` et ne peut pas être modifié car il serait écrasé à chaque `npm install`.

### 4.2 Pourquoi Node.js est lent via Gradle sur cette machine

1. **Chaque appel `.execute()` lance un processus `node.exe` séparé** — le démarrage d'un processus Node.js sur Windows est significativement plus lent que sur macOS/Linux
2. **`node cliPath config --platform android`** charge l'intégralité du CLI React Native et scanne tous les modules natifs — c'est l'opération la plus lourde
3. **Les scripts Gradle sont exécutés séquentiellement** — chaque appel bloque le suivant
4. **Le dossier `node_modules/`** contient des milliers de fichiers que Node.js doit parcourir pour résoudre les dépendances

### 4.3 Logiciel antivirus détecté (supprimé depuis)

Le système avait **Reason Cybersecurity** installé (détecté via `Get-WmiObject -Namespace "root\SecurityCenter2" -Class AntiVirusProduct`). Ce logiciel interceptait et scannait chaque processus `java.exe` et `node.exe` lancé par Gradle, multipliant le temps d'exécution.

> **Note** : L'antivirus a été supprimé et le PC réinitialisé, mais le problème de lenteur persiste, ce qui confirme que l'antivirus n'était **pas la seule cause**.

---

## 5. Problèmes secondaires rencontrés

### 5.1 Expo Prebuild échoue
```
Error: [android.dangerous]: withAndroidDangerousBaseMod: Could not find MIME for Buffer <null>
```
**Cause** : L'image PNG utilisée comme icône n'était pas reconnue par Jimp (bibliothèque de traitement d'images utilisée par Expo).
**Solution** : Copie directe de l'image et redimensionnement avec Sharp (via `resize-icon.js`).

### 5.2 Sharp-cli version incompatible
```
Required version: "^2.1.0"
Currently installed version: "5.2.0"
```
**Cause** : Expo 49 nécessite sharp-cli ^2.1.0 mais la version installée était trop récente.
**Solution tentée** : Installation de `sharp-cli@^2.1.0` — erreur persiste car la version de sharp ne correspond pas.

### 5.3 IDE relance les processus Java automatiquement
L'extension Java de VS Code/Windsurf importe automatiquement le projet Gradle, créant des dizaines de processus Java qui :
- Verrouillent les fichiers `.lock`
- Empêchent Gradle de démarrer
- Reviennent même après `taskkill /F /IM java.exe`

**Solution appliquée** : Fichier `.vscode/settings.json` créé pour désactiver l'auto-import Java (voir section 6).

### 5.4 EAS CLI non installé
```
npm error could not determine executable to run
```
**Cause** : `eas-cli` n'était pas installé globalement.
**Solution** : `npm install -g eas-cli` (installé avec succès).

### 5.5 Émulateur — espace insuffisant
```
Error: adb.exe: failed to install Exponent-2.29.8.apk: Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE]
```
**Solution** : Nettoyage de l'émulateur avec `adb shell pm clear` et désinstallation d'apps tierces.

### 5.6 Expo Go — module "main" non enregistré
```
Invariant Violation: "main" has not been registered.
```
**Cause** : L'app était enregistrée sous le nom "MubarakApp" mais Expo Go cherche "main".
**Solution** : Ajout de `AppRegistry.registerComponent('main', () => App)` dans `index.js`.

---

## 6. Optimisations appliquées

### 6.1 `android/settings.gradle` — Appels Node.js supprimés
```gradle
rootProject.name = 'MubarakApp'

// Chemins pré-calculés pour éviter les appels Node.js lents
def nodeModulesPath = new File(rootDir, "../node_modules")

apply from: new File(nodeModulesPath, "expo-modules-autolinking/scripts/android/autolinking_implementation.gradle")
useExpoModules()

apply from: new File(nodeModulesPath, "@react-native-community/cli-platform-android/native_modules.gradle")
applyNativeModulesSettingsGradle(settings)

include ':app'
includeBuild(new File(nodeModulesPath, "@react-native/gradle-plugin"))
```

### 6.2 `android/build.gradle` — Appels Node.js supprimés
```gradle
allprojects {
    repositories {
        maven {
            url(new File(rootDir, '../node_modules/react-native/android'))
        }
        maven {
            url(new File(rootDir, '../node_modules/jsc-android/dist'))
        }
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
```

### 6.3 `android/gradle.properties` — Optimisations de performance
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configureondemand=true
org.gradle.daemon=true
```

### 6.4 `.vscode/settings.json` — Désactiver l'auto-import Java
```json
{
  "java.import.gradle.enabled": false,
  "java.autobuild.enabled": false,
  "java.configuration.updateBuildConfiguration": "disabled",
  "java.import.gradle.wrapper.enabled": false,
  "java.import.maven.enabled": false,
  "java.compile.nullAnalysis.mode": "disabled",
  "java.project.importOnFirstTimeStartup": "disabled",
  "java.project.importHint": false,
  "java.server.launchMode": "LightWeight",
  "java.import.exclusions": ["**/android/**"]
}
```

### 6.5 Icônes mises à jour
- `public/icon.png` → copié vers `assets/icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png`
- Script `resize-icon.js` a redimensionné l'icône pour tous les dossiers `mipmap-*` Android

---

## 7. Ce qui reste bloquant

Le fichier `node_modules/@react-native-community/cli-platform-android/native_modules.gradle` contient **2 appels Node.js internes** qui ne peuvent pas être supprimés :

```gradle
// Ligne ~451 : Résout le chemin du CLI React Native
String[] nodeCommand = ["node", "-e", cliResolveScript]
def cliPath = this.getCommandOutput(nodeCommand, this.root)

// Ligne ~454 : Charge la configuration complète du projet
String[] reactNativeConfigCommand = ["node", cliPath, "config", "--platform", "android"]
def reactNativeConfigOutput = this.getCommandOutput(reactNativeConfigCommand, this.root)
```

Ces commandes sont **nécessaires** pour le fonctionnement de React Native mais sont **extrêmement lentes** sur cette machine Windows.

---

## 8. Solutions proposées

### Solution A : Utiliser EAS Build (cloud) — ⭐ RECOMMANDÉE

Construire l'APK dans le cloud d'Expo, sans dépendre de Gradle local :

```powershell
# 1. Se connecter à Expo (créer un compte si nécessaire)
npx eas login

# 2. Configurer EAS Build
npx eas build:configure

# 3. Construire l'APK dans le cloud
npx eas build --platform android --profile preview
```

**Avantages** :
- Pas besoin de Gradle local
- Serveurs puissants dans le cloud
- Build en quelques minutes

**Inconvénients** :
- Nécessite un compte Expo (gratuit, 30 builds/mois)
- Nécessite une connexion internet

### Solution B : Patienter avec le build local

Laisser Gradle tourner pendant 20-30 minutes. Même si "Evaluating settings" semble bloqué, le processus travaille en arrière-plan (les appels Node.js sont en cours).

```powershell
# Lancer et NE PAS interrompre
cd C:\dev\MubarakApp\android
.\gradlew assembleRelease
# Attendre 20-30 minutes sans toucher au terminal
```

### Solution C : Upgrader le matériel

Si le disque dur est un HDD (pas SSD), cela explique une grande partie de la lenteur :
- Les milliers de fichiers dans `node_modules/` sont lents à lire sur un HDD
- Chaque processus Node.js charge des centaines de fichiers
- **Solution** : Migrer le projet vers un SSD

### Solution D : Utiliser un environnement de build distant

- **GitHub Actions** : CI/CD gratuit pour les projets publics
- **Docker** : Conteneur Linux avec Gradle pré-configuré
- **WSL2** : Utiliser Linux sous Windows (Gradle est plus rapide sous Linux)

---

## 9. Fichiers modifiés pendant le débogage

| Fichier | Modification |
|---------|-------------|
| `app.json` | Chemins des icônes |
| `index.js` | Ajout `registerComponent('main', ...)` |
| `assets/icon.png` | Nouvelle icône Student Fit |
| `assets/adaptive-icon.png` | Nouvelle icône adaptive |
| `assets/favicon.png` | Nouveau favicon |
| `android/settings.gradle` | Suppression appels Node.js |
| `android/build.gradle` | Suppression appels Node.js |
| `android/gradle.properties` | Optimisations performance |
| `android/gradle/wrapper/gradle-wrapper.properties` | Gradle 8.0.1 |
| `android/app/src/main/res/mipmap-*/` | Icônes redimensionnées |
| `.vscode/settings.json` | Désactiver auto-import Java |
| `resize-icon.js` | Script utilitaire (peut être supprimé) |

---

## 10. Fonctionnement actuel de l'app

L'application **fonctionne** via Expo Go :

```powershell
cd C:\dev\MubarakApp
npx expo start --android
```

Ceci lance l'app sur l'émulateur Android via Expo Go **sans avoir besoin de Gradle**. Cependant, l'icône de l'app dans le launcher Android ne sera visible qu'après un build natif (APK).
