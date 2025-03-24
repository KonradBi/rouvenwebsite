# Rouven Zietz - Journalist & Storyteller Website

Dies ist der Code für die persönliche Website von Rouven Zietz.

## Lokale Entwicklung

### Voraussetzungen
- Node.js installiert
- http-server global installiert (`npm install -g http-server`)

### Setup und Start des Entwicklungsservers

1. Repository klonen:
```bash
git clone [repository-url]
cd rouven-webseite
```

2. Server starten:
```bash
http-server -p 3000 --cors -c-1 -C -a localhost
```

### Wichtige Parameter für den Server
- `-p 3000`: Port 3000 verwenden
- `--cors`: CORS aktivieren
- `-c-1`: Cache deaktivieren
- `-C`: Cache-Control Header setzen
- `-a localhost`: Nur auf localhost binden

### Troubleshooting

Wenn der Server nicht startet oder die Änderungen nicht angezeigt werden:

1. Alle Node.js Prozesse beenden:
```bash
# Windows PowerShell
Get-Process -Name "node" | Stop-Process -Force
```

2. Sicherstellen, dass Port 3000 frei ist:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

3. Server mit strikten Cache-Deaktivierungs-Optionen neu starten:
```bash
http-server -p 3000 --cors -c-1 -C -a localhost
```

4. Browser-Cache leeren:
   - Neues Inkognito-Fenster öffnen
   - Strg+F5 für Hard Refresh
   - Browser-Cache in den Entwicklertools leeren

### Bekannte Probleme und Lösungen

1. **Weißer Bildschirm / Keine Styles**
   - Überprüfen Sie die Browser-Konsole (F12) auf Fehler
   - Stellen Sie sicher, dass alle Dateien korrekt geladen werden
   - Führen Sie einen Hard Refresh durch (Strg+F5)

2. **Port bereits in Verwendung**
   - Alle Node.js Prozesse beenden
   - Alternativ einen anderen Port verwenden (z.B. `-p 3001`)

3. **Änderungen werden nicht angezeigt**
   - Server neu starten mit Cache-Deaktivierung
   - Browser-Cache leeren
   - Entwicklertools öffnen und "Disable cache" aktivieren

_Last updated: March 23, 2023_ 