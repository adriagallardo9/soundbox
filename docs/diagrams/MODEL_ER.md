# Diagrama Entitat-Relació (Model Relacional) - SoundBoxd

**Mòdul**: MP0492 · AEA2 · Repte 1  
**Fitxer SQL**: `docs/bd/schema.sql`

```mermaid
erDiagram
    USERS ||--o{ REVIEWS : "escriu (1:N)"
    USERS ||--o{ PLAYLISTS : "crea (1:N)"
    USERS ||--o{ LISTENLIST : "desenvolupa (1:N)"
    ALBUMS ||--o{ REVIEWS : "rep (1:N)"
    ALBUMS ||--o{ PLAYLIST_ALBUMS : "està inclòs (1:N)"
    ALBUMS ||--o{ LISTENLIST : "està pendent (1:N)"
    PLAYLISTS ||--o{ PLAYLIST_ALBUMS : "conté (1:N)"

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar role
        timestamp created_at
    }

    ALBUMS {
        varchar id PK "Spotify ID"
        varchar title
        varchar artist
        varchar cover_url
        int release_year
    }

    REVIEWS {
        bigint id PK
        bigint user_id FK
        varchar album_id FK
        decimal rating "1.0 a 5.0"
        text review_text
        timestamp created_at
    }

    PLAYLISTS {
        bigint id PK
        bigint user_id FK
        varchar title
        text description
        boolean is_public
        timestamp created_at
    }

    PLAYLIST_ALBUMS {
        bigint playlist_id PK,FK
        varchar album_id PK,FK
        timestamp added_at
    }

    LISTENLIST {
        bigint user_id PK,FK
        varchar album_id PK,FK
        timestamp added_at
    }
```

## Justificació de la Persistència
1. **Clau d'Spotify com a PK d'Àlbums**: Evita redundàncies i permet emmagatzemar exclusivament les metadades dels discos que han estat avaluats o afegits a llistes.
2. **Relacions N:M amb claus compostes**: Tant `LISTENLIST` com `PLAYLIST_ALBUMS` utilitzen parelles de claus primàries que impedeixen discos duplicats a una mateixa llista.
3. **Integritat referencial `ON DELETE CASCADE`**: Garanteix l'eliminació automàtica de ressenyes i referències associades si un usuari decideix cancel·lar el seu compte.
