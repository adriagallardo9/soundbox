# 🎵 SoundBoxd · Xarxa Social i Diari de Valoració Musical

> **Autor**: Adrià Gallardo  
> **Cicle / Mòdul**: MP0492 · AEA2 · Repte 1  
> **Repositori**: [https://github.com/adriagallardo9/soundbox](https://github.com/adriagallardo9/soundbox)  
> **Tauler de Projectes**: [GitHub Projects](https://github.com/users/adriagallardo9/projects/1)  
> **Prototip Penpot**: [Penpot Workspace](https://design.penpot.app/#/workspace?team-id=d8ac01df-6646-81d2-8008-a4c6d59a03d6&file-id=3e981c57-46d6-803d-8008-beb68d47e09d)

---

## 📖 Descripció del Projecte

**SoundBoxd** és una aplicació web social adreçada a melòmans i melòmanes que volen catalogar, puntuar i compartir les seves opinions sobre àlbums i cançons. Inspirada en la dinàmica de *Letterboxd* per al cinema, SoundBoxd permet mantenir un diari personal d'escolta, redactar ressenyes detallades, calcular la nota mitjana comunitària dels discos i organitzar col·leccions temàtiques.

---

## 🚀 Funcionalitats Implementades (Repte 1)

| Codi | Funcionalitat | Descripció | Estat |
| :--- | :--- | :--- | :---: |
| **RF-01** | **Registre d'usuari** | Formulari de registre amb nom d'usuari, nom complet, correu i contrasenya. Creació automàtica i inici de sessió immediat. | ✅ Completat |
| **RF-02** | **Inici de sessió** | Autenticació amb correu i contrasenya, gestió d'estat de sessió i selector d'usuaris per a proves ràpides. | ✅ Completat |
| **RF-03** | **Cerca d'àlbums i cançons** | Integració amb l'API de Spotify (cerca per títol, artista o any) amb fallback automàtic al catàleg local (**Pla B**). | ✅ Completat |
| **RF-04** | **Consultar fitxa d'àlbum** | Fitxa detallada amb portada d'alta resolució, llista de temes (tracklist), fragments d'àudio de 30s, nota mitjana i ressenyes. | ✅ Completat |
| **RF-05** | **Puntuar i ressenyar** | Modal interactiu amb selector d'estrelles (1 a 5) i camp de ressenya amb comptador (fins a 2000 caràcters) i validacions. | ✅ Completat |
| **RF-06** | **Escoltar més tard** | Botó per desar àlbums a la *Listenlist* / llista de pendents i consulta des del perfil privat. | ✅ Completat |
| **RF-07** | **Llistes personalitzades** | Creació, edició i compartició de llistes temàtiques d'àlbums (públiques o privades). | ✅ Completat |
| **RF-08** | **Modificar / Eliminar ressenyes** | Els usuaris poden modificar o esborrar les seves pròpies ressenyes en qualsevol moment, actualitzant la nota mitjana. | ✅ Completat |
| **RF-09** | **Moderació de continguts** | Panell d'administrador per supervisar i eliminar ressenyes inadequades (**Eliminar Admin**). | ✅ Completat |

---

## 🛠️ Stack Tecnològic

- **Entorn de Construcció**: [Vite](https://vitejs.dev/) (ultraràpid, HMR instantani).
- **Frontend Framework**: [React.js](https://react.dev/) (components funcionals, React Hooks i Context API).
- **Estils i Disseny Adaptatiu**: [Tailwind CSS](https://tailwindcss.com/) (disseny 100% responsive, dark mode modern).
- **Iconografia**: [Lucide Icons](https://lucide.dev/) (`lucide-react`).
- **Persistència i Dades**: Model relacional amb claus foranes i integritat en cascada emmagatzemat a `localStorage` amb càrrega de dades d'exemple (seed data). Script SQL disponible a `docs/bd/schema.sql`.
- **Integració Externa**: Spotify Web API + Pla B (Mode Local / Fallback transparent).

---

## 📦 Estructura del Repositori

```text
soundbox/
├── .github/
│   └── workflows/
│       └── ci.yml             # Pipeline de CI/CD amb GitHub Actions
├── docs/
│   ├── bd/
│   │   └── schema.sql         # Script SQL de la base de dades relacional
│   ├── diagrams/
│   │   ├── UML_CASES_D_US.md  # Diagrama i traçabilitat de casos d'ús
│   │   └── MODEL_ER.md        # Model Entitat-Relació i diccionari de dades
│   └── mockups/               # Captures i enllaç al prototip de Penpot
├── public/
│   └── soundbox-logo.svg      # Logotip vectorial de SoundBoxd
├── src/
│   ├── components/            # Components reutilitzables
│   │   ├── AlbumCard.jsx      # Targeta de disc amb nota i botó ràpid de listenlist
│   │   ├── AlbumGrid.jsx      # Graella adaptable amb estats de càrrega
│   │   ├── RatingStars.jsx    # Selector i visualitzador d'estrelles (1-5)
│   │   ├── ReviewCard.jsx     # Ressenya amb opcions d'autor i de moderació admin
│   │   ├── ReviewModal.jsx    # Modal de valoració (CU-03) amb validació en vermell
│   │   ├── PlaylistModal.jsx  # Modal per crear llistes temàtiques (RF-07)
│   │   ├── AddToPlaylistModal.jsx # Selector ràpid per afegir un disc a una llista
│   │   ├── Navbar.jsx         # Capçalera amb cerca en directe, selector demo i navegació
│   │   ├── Footer.jsx         # Peu de pàgina amb crèdits i enllaços del projecte
│   │   └── ToastContainer.jsx # Notificacions emergents accessibles
│   ├── context/
│   │   ├── AuthContext.jsx    # Gestió de sessió d'usuari i rols (User vs Admin)
│   │   ├── DataContext.jsx    # Gestió reactiva de ressenyes, notes i llistes
│   │   └── NotificationContext.jsx # Notificacions Toast globals
│   ├── pages/
│   │   ├── HomePage.jsx       # Pantalla 1: Feed principal, populars i ressenyes recents
│   │   ├── RegisterPage.jsx   # Pantalla 2: Formulari de creació de compte (RF-01)
│   │   ├── LoginPage.jsx      # Pantalla 3: Inici de sessió amb accessos ràpids (RF-02)
│   │   ├── SearchPage.jsx     # Pantalla 4: Cercador i graella de resultats (RF-03)
│   │   ├── AlbumDetailPage.jsx# Pantalla 5: Fitxa completa amb tracklist i ressenyes (RF-04)
│   │   ├── ProfilePage.jsx    # Pantalla 7: Perfil, diari, pendents i col·leccions (RF-06, RF-07)
│   │   ├── PlaylistsPage.jsx  # Explorador de llistes temàtiques públiques
│   │   ├── PlaylistDetailPage.jsx # Detall d'àlbums continguts en una llista
│   │   └── AdminModerationPage.jsx # Panell de moderació d'administrador (RF-09)
│   ├── services/
│   │   ├── mockData.js        # Catàleg inicial de discos, usuaris i ressenyes
│   │   ├── storageService.js  # Lògica relacional BDD i cascada en LocalStorage
│   │   └── spotifyApi.js      # Connexió Spotify API i Pla B (Bloc 6.3)
│   ├── App.jsx                # Enrutador principal i muntatge de vistes
│   ├── index.css              # Directrius Tailwind CSS i estils base
│   └── main.jsx               # Punt d'entrada de l'aplicació
├── .env.example               # Variables d'entorn d'exemple
├── .gitignore                 # Arxius exclosos del control de versions
├── index.html                 # Pàgina arrel HTML5
├── LICENSE                    # Llicència de codi obert MIT
├── package.json               # Dependències del projecte
├── postcss.config.js          # Configuració de PostCSS
├── tailwind.config.js         # Configuració de colors de marca i tema fosc
└── vite.config.js             # Configuració de Vite
```

---

## ⚡ Com Executar el Projecte

### 1. Instal·lar Dependències
```bash
npm install
```

### 2. Executar en Mode Desenvolupament
```bash
npm run dev
```
L'aplicació s'obrirà a `http://localhost:3000/`.

### 3. Compilar per a Producció
```bash
npm run build
```

### 4. Inicialitzar Base de Dades SQLite
```bash
npm run db:init
```
Crea i pobla la base de dades relacional `soundbox.db` a partir de `docs/bd/schema_sqlite.sql`.

---

## 👥 Credencials d'Usuaris de Prova (Demo)

Per facilitar la comprovació dels diferents rols i permisos, podeu utilitzar els següents usuaris o fer servir el desplegable ràpid de la barra de navegació superior:

| Rol | Usuari | Correu | Contrasenya | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| **Usuari Estàndard** | `meloman_cat` | `meloman@soundbox.cat` | `password123` | Escriure ressenyes, gestionar llista de pendents, crear llistes temàtiques. |
| **Administrador** | `adria_admin` | `admin@soundbox.cat` | `adminpassword` | Accés al Panell de Moderació (`RF-09`) per eliminar qualsevol ressenya inapropiada. |

---

## 🛡️ Gestió d'Errors de l'API (Pla B - Bloc 6.3)

Si no es configuren credencials de Spotify o si l'API de Spotify pateix caigudes de xarxa o limitacions de quota:
1. L'aplicació notifica l'usuari mitjançant una alerta no bloquejant:  
   *"No s'ha pogut connectar amb el catàleg extern de Spotify. Mostrant contingut desemmagatzemat localment."*
2. S'activa automàticament el **Mode Local / Cache**, servint els discos emmagatzemats a la base de dades local.
3. Les imatges que puguin fallar tenen un sistema de substitutori (*placeholder fallback*) per evitar icones trencades.
