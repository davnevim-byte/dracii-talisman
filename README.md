# ⚔️ Dračí Talisman

Místní multiplayer RPG hra inspirovaná Talismanem a Dračím doupětem.

- **Tablet/PC** → hrací deska (mapa, souboje, dění)
- **Telefon** → karta postavy (inventář, schopnosti, pet)
- Připojení přes **QR kód** nebo kód hry

---

## 🚀 Nastavení (udělej jednou)

### 1. Fork nebo klonuj repozitář

```bash
git clone https://github.com/TVOJE_JMENO/draci-talisman.git
cd draci-talisman
```

### 2. Vytvoř Firebase projekt (zdarma)

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com)
2. Klikni **Add project** → zadej název → Continue
3. **Build → Realtime Database → Create database**
   - Vyber region: `europe-west1`
   - Začni v **test mode** (30 dní bez autentizace, pak nastav pravidla)
4. **Project Settings → General → Your apps → Add app → Web (</>)**
5. Zkopíruj `firebaseConfig` objekt

### 3. Vyplň Firebase config

Otevři soubor `src/firebase.js` a přepiš hodnoty svým configem:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "muj-projekt.firebaseapp.com",
  databaseURL:       "https://muj-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "muj-projekt",
  storageBucket:     "muj-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

### 4. Nahraj na GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 5. Zapni GitHub Pages

1. GitHub repo → **Settings → Pages**
2. **Source: GitHub Actions**
3. Počkej 2-3 minuty → hra bude na adrese:
   `https://TVOJE_JMENO.github.io/draci-talisman/`

---

## 🎮 Jak hrát

### Příprava (5 minut)
1. **Tablet/PC** otevře URL hry → klikne **Vytvořit hru**
2. Vybere postavu, herní mód (Coop/PvP)
3. Zobrazí se **QR kód** a **kód hry**
4. **Každý hráč** na telefonu naskenuje QR nebo zadá kód
5. Všichni potvrdí **Jsem připraven** → Hostitel spustí hru

### Průběh hry
- **Hrací deska** ukazuje mapu, pozice hráčů, souboje
- **Telefon** ukazuje tvou kartu — statistiky, inventář, schopnosti, pet
- Hráči se střídají v tazích
- Každý tah: 🎲 Hod → 🃏 Karta → ⚔️ Event/Souboj → ✅ Konec tahu

### Výhra
- **Coop:** Všichni hráči porazí Pana Zla (Zóna 5)
- **PvP:** Poslední přeživší, nebo první kdo porazí Pana Zla

---

## 📁 Struktura projektu

```
src/
├── App.jsx                  # Hlavní routing
├── firebase.js              # Firebase konfigurace
├── data/
│   └── characters.js        # Postavy, frakce, schopnosti
├── game/
│   ├── gameState.js         # Firebase operace
│   └── worldData.js         # Zóny, příšery, předměty, události
└── screens/
    ├── LobbyScreen.jsx      # Vytvoření/připojení ke hře
    ├── WaitingRoom.jsx      # Čekárna s QR kódem
    ├── BoardScreen.jsx      # Hrací deska (tablet/PC)
    └── PhoneCard.jsx        # Karta postavy (telefon)
```

---

## 🔐 Firebase pravidla (po 30 dnech test mode)

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

---

## 🤖 AI Vypravěč (Anthropic API)

Vypravěč automaticky popisuje každou lokaci, souboj, ochočení i finále hry.

Hra volá Anthropic API přímo z prohlížeče — **API klíč není potřeba nastavovat**, protože využívá stejné připojení jako claude.ai artefakty.

> Pokud hraješ mimo claude.ai a chceš vypravěče, přidej do `src/game/narrator.js` svůj API klíč do hlavičky requestu:
> ```js
> headers: {
>   'Content-Type': 'application/json',
>   'x-api-key': 'TVUJ_API_KLIC',        // přidej toto
>   'anthropic-version': '2023-06-01',    // přidej toto
>   'anthropic-dangerous-direct-browser-access': 'true',  // přidej toto
> }
> ```

---



- [x] Fáze 1 — Infrastruktura (GitHub Pages + Firebase + QR)
- [ ] Fáze 2 — Kompletní postavy a strom hrdinů
- [ ] Fáze 3 — Mapa, zóny, počasí, denní doba
- [ ] Fáze 4 — Bestiář, souboje, pet systém
- [ ] Fáze 5 — AI Vypravěč
- [ ] Fáze 6 — Multiplayer Coop + PvP
- [ ] Fáze 7 — Polish a balancing

---

*Vytvořeno s ❤️ pomocí React + Firebase*
