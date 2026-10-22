# Diagrama de Casos d'Ús - SoundBoxd

**Mòdul**: MP0492 · AEA2 · Repte 1  
**Autor**: Adrià Gallardo  

## Actors
- **Usuari Anònim**: Navega pel catàleg, cerca àlbums i consulta fitxes i ressenyes públiques.
- **Usuari Registrat** (Hereda d'Usuari Anònim): Pot puntuar, escriure ressenyes, afegir a la llista "Escoltar més tard" i crear col·leccions temàtiques.
- **Administrador**: Pot moderar i eliminar qualsevol ressenya que incompleixi la normativa de la comunitat.

## Diagrama Mermaid de Casos d'Ús

```mermaid
flowchart LR
    UA["👤 Usuari Anònim"]
    UR["🎵 Usuari Registrat"]
    AD["🛡️ Administrador"]

    UR -- extends --> UA

    subgraph SoundBoxd ["Plataforma Web SoundBoxd"]
        CU01_1["CU-01.1: Registre d'usuari"]
        CU01_2["CU-01.2: Autenticar usuari (Login)"]
        CU02_1["CU-02.1: Cercar àlbums i cançons"]
        CU02_2["CU-02.2: Consultar fitxa d'àlbum"]

        CU03["CU-03: Puntuar i ressenyar àlbum"]
        CU04["CU-04: Modificar / Eliminar ressenya pròpia"]
        CU05["CU-05: Crear llista personalitzada"]
        CU06["CU-06: Afegir a 'Escoltar més tard'"]

        CU07["CU-07: Moderar continguts / ressenyes"]
    end

    UA --> CU01_1
    UA --> CU01_2
    UA --> CU02_1
    UA --> CU02_2

    UR --> CU03
    UR --> CU04
    UR --> CU05
    UR --> CU06

    CU03 -.->|<<include>>| CU01_2
    CU05 -.->|<<include>>| CU01_2
    CU06 -.->|<<extend>>| CU02_2

    AD --> CU07
```

## Taula de Traçabilitat
| Codi Cas d'Ús | Títol del Cas d'Ús | Requisit RF Cobert | Actor Principal |
| :--- | :--- | :--- | :--- |
| **CU-01.1** | Registre d'usuari | RF-01 | Usuari Anònim |
| **CU-01.2** | Autenticar usuari (Login) | RF-02 | Usuari Anònim / Registrat |
| **CU-02.1** | Cercar àlbums/cançons | RF-03 | Usuari Anònim |
| **CU-02.2** | Consultar fitxa d'àlbum | RF-04 | Usuari Anònim |
| **CU-03** | Puntuar i ressenyar àlbum | RF-05 | Usuari Registrat |
| **CU-04** | Modificar / Eliminar ressenya | RF-08 | Usuari Registrat |
| **CU-05** | Crear llista personalitzada | RF-07 | Usuari Registrat |
| **CU-06** | Afegir a "Escoltar més tard" | RF-06 | Usuari Registrat |
| **CU-07** | Moderar continguts | RF-09 | Administrador |
