# Firebase Emulator Setup

⚠️ Important: You cannot mix emulator and production environments. When using the emulator, all Firebase services (Firestore, Auth, Storage) must use the emulator. Similarly, when using production, all services must use production endpoints.

## Development Modes

1. With Emulator (Local Development):
   ```bash
   npm run dev:local  # Starts both emulator and Next.js
   ```

2. Without Emulator (Production Mode):
   ```bash
   npm run dev  # Starts only Next.js, uses production Firebase
   ```

Diese Anleitung erklärt, wie man die Firebase Emulatoren für die lokale Entwicklung einrichtet.

## Voraussetzungen

1. Java installieren (wird für die Emulatoren benötigt)
   - Besuchen Sie: https://www.oracle.com/java/technologies/downloads/#jdk17-mac
   - Laden Sie den passenden Installer herunter:
     - Für M1/M2 Macs: macOS ARM64 DMG
     - Für Intel Macs: macOS x64 DMG
   - Führen Sie den Installer aus

2. Überprüfen Sie die Java-Installation:
```bash
java -version
```

## Einrichtung

1. Erstellen Sie die folgenden Dateien im Projektverzeichnis:

`firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099,
      "host": "127.0.0.1"
    },
    "firestore": {
      "port": 8080,
      "host": "127.0.0.1"
    },
    "storage": {
      "port": 9199,
      "host": "127.0.0.1"
    },
    "ui": {
      "enabled": true,
      "port": 4000,
      "host": "127.0.0.1"
    }
  }
}
```

`firestore.rules`:
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

`storage.rules`:
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

`firestore.indexes.json`:
```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

## Verwendung

1. Entwicklung mit Emulatoren und Next.js:
```bash
npm run dev:local
```
Dies startet:
- Firebase Emulatoren (Firestore, Auth, Storage)
- Exportiert Produktionsdaten
- Importiert die Daten in die Emulatoren
- Startet den Next.js Entwicklungsserver
- Zeigt die Emulator UI unter localhost:4000

2. Nur die Emulatoren starten:
```bash
npm run dev:emulator
```

3. Nur Produktionsdaten exportieren:
```bash
npm run export:data
```

## Ports

- Firestore: localhost:8080
- Auth: localhost:9099
- Storage: localhost:9199
- Emulator UI: localhost:4000
- Next.js: localhost:3000

## Wichtige Hinweise

- Die Emulatoren verwenden keine echten Firebase-Ressourcen
- Alle Daten in den Emulatoren sind temporär und werden beim Neustart zurückgesetzt
- Die Emulator-Konfigurationsdateien sind in .gitignore aufgeführt und müssen für jeden Entwickler lokal erstellt werden
- Im Produktionsbetrieb wird automatisch die echte Firebase-Instanz verwendet

## Fehlerbehebung

1. Wenn die Emulatoren nicht starten:
   - Prüfen Sie, ob Java installiert ist: `java -version`
   - Stellen Sie sicher, dass alle Ports verfügbar sind
   - Überprüfen Sie die Firewall-Einstellungen

2. Bei Problemen mit dem Datenexport:
   - Überprüfen Sie die Firebase-Authentifizierung
   - Stellen Sie sicher, dass die Service-Account-Datei korrekt eingerichtet ist

3. Bei Next.js Verbindungsproblemen:
   - Überprüfen Sie, ob die Emulator-Hosts und Ports in der Firebase-Admin-Initialisierung korrekt sind
   - Stellen Sie sicher, dass NODE_ENV auf 'development' gesetzt ist
