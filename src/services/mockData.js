// Base de dades inicial i catàleg de fallback (Pla B - Bloc 6.3 de la memòria)

export const INITIAL_USERS = [
  {
    id: 1,
    username: 'meloman_cat',
    name: 'Adrià Melòman',
    email: 'meloman@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Col·leccionista de vinils, amant del rock progressiu i la música electrònica.',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 2,
    username: 'adria_admin',
    name: 'Adrià Gallardo',
    email: 'admin@soundbox.cat',
    password: 'adminpassword',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Creador i moderador en cap de SoundBoxd.',
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 3,
    username: 'clara_valls',
    name: 'Clara Valls',
    email: 'clara@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Buscant sons nous cada dia. Pop alternatiu, indie i R&B.',
    created_at: '2026-02-10T14:30:00Z'
  }
];

export const INITIAL_ALBUMS = [
  {
    id: '4aawyAB9vmq31L23',
    title: 'Abbey Road',
    artist: 'The Beatles',
    cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    release_year: 1969,
    genres: ['Rock Clàssic', 'Pop Rock', 'Rock Psicodèlic'],
    description: 'L\'onzè àlbum d\'estudi de la banda de rock britànica The Beatles. Famos per la seva icònica portada al pas de vianants i el medley de la cara B.',
    tracks: [
      { id: 't1', title: 'Come Together', duration: '4:19', preview_url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3' },
      { id: 't2', title: 'Something', duration: '3:02', preview_url: null },
      { id: 't3', title: 'Maxwell\'s Silver Hammer', duration: '3:27', preview_url: null },
      { id: 't4', title: 'Oh! Darling', duration: '3:27', preview_url: null },
      { id: 't5', title: 'Octopus\'s Garden', duration: '2:51', preview_url: null },
      { id: 't6', title: 'I Want You (She\'s So Heavy)', duration: '7:47', preview_url: null },
      { id: 't7', title: 'Here Comes the Sun', duration: '3:05', preview_url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3' },
      { id: 't8', title: 'Because', duration: '2:45', preview_url: null },
      { id: 't9', title: 'Golden Slumbers', duration: '1:31', preview_url: null },
      { id: 't10', title: 'Carry That Weight', duration: '1:36', preview_url: null },
      { id: 't11', title: 'The End', duration: '2:21', preview_url: null }
    ]
  },
  {
    id: '285O1L3A8A2g5L2p3d1',
    title: 'Thriller',
    artist: 'Michael Jackson',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    release_year: 1982,
    genres: ['Pop', 'Post-disco', 'Funk', 'Rock'],
    description: 'El sisè àlbum d\'estudi de Michael Jackson. És l\'àlbum més venut de tots els temps a nivell mundial, produït per Quincy Jones.',
    tracks: [
      { id: 't21', title: 'Wanna Be Startin\' Somethin\'', duration: '6:03', preview_url: null },
      { id: 't22', title: 'Baby Be Mine', duration: '4:20', preview_url: null },
      { id: 't23', title: 'The Girl Is Mine', duration: '3:42', preview_url: null },
      { id: 't24', title: 'Thriller', duration: '5:57', preview_url: 'https://cdn.freesound.org/previews/518/518884_11293774-lq.mp3' },
      { id: 't25', title: 'Beat It', duration: '4:18', preview_url: null },
      { id: 't26', title: 'Billie Jean', duration: '4:54', preview_url: 'https://cdn.freesound.org/previews/518/518884_11293774-lq.mp3' },
      { id: 't27', title: 'Human Nature', duration: '4:06', preview_url: null }
    ]
  },
  {
    id: '7i2DJ8oZ0vH3Y8G1sM2h3v',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    release_year: 1973,
    genres: ['Rock Progressiu', 'Rock Psicodèlic'],
    description: 'Un àlbum conceptual basat en idees que exploren el pas del temps, la cobdícia, el conflicte i la malaltia mental.',
    tracks: [
      { id: 't31', title: 'Speak to Me', duration: '1:05', preview_url: null },
      { id: 't32', title: 'Breathe (In the Air)', duration: '2:49', preview_url: null },
      { id: 't33', title: 'Time', duration: '6:53', preview_url: null },
      { id: 't34', title: 'The Great Gig in the Sky', duration: '4:44', preview_url: null },
      { id: 't35', title: 'Money', duration: '6:22', preview_url: null },
      { id: 't36', title: 'Us and Them', duration: '7:49', preview_url: null },
      { id: 't37', title: 'Eclipse', duration: '2:10', preview_url: null }
    ]
  },
  {
    id: '1ptj8O06Vv1e3Wq17Zz17K',
    title: 'MOTOMAMI',
    artist: 'Rosalía',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    release_year: 2022,
    genres: ['Pop Avantguardista', 'Reggaeton Alternatiu', 'Flamenc'],
    description: 'Tercer àlbum d\'estudi de l\'artista catalana Rosalía. Un projecte audaç, experimental i vibrant que redefineix la música urbana contemporània.',
    tracks: [
      { id: 't41', title: 'SAOKO', duration: '2:17', preview_url: null },
      { id: 't42', title: 'CANDY', duration: '3:13', preview_url: null },
      { id: 't43', title: 'LA FAMA', duration: '3:08', preview_url: null },
      { id: 't44', title: 'HENTAI', duration: '2:42', preview_url: null },
      { id: 't45', title: 'CHICKEN TERIYAKI', duration: '2:02', preview_url: null },
      { id: 't46', title: 'DELIRIO DE GRANDEZA', duration: '2:35', preview_url: null },
      { id: 't47', title: 'CUUUUuuuuuute', duration: '2:30', preview_url: null }
    ]
  },
  {
    id: '6kVUvzRmBG2KiFHU987641',
    title: 'OK Computer',
    artist: 'Radiohead',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
    release_year: 1997,
    genres: ['Art Rock', 'Rock Alternatiu'],
    description: 'Àlbum cabdal dels 90 que captura l\'alienació tecnològica i la malenconia de finals del segle XX.',
    tracks: [
      { id: 't51', title: 'Airbag', duration: '4:44', preview_url: null },
      { id: 't52', title: 'Paranoid Android', duration: '6:23', preview_url: null },
      { id: 't53', title: 'Subterranean Homesick Alien', duration: '4:27', preview_url: null },
      { id: 't54', title: 'Exit Music (For a Film)', duration: '4:24', preview_url: null },
      { id: 't55', title: 'Karma Police', duration: '4:21', preview_url: null },
      { id: 't56', title: 'No Surprises', duration: '3:48', preview_url: null }
    ]
  },
  {
    id: '4m2880jivSbbyEGAKfITCa',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    release_year: 2013,
    genres: ['Disco', 'Funk', 'Música Electrònica'],
    description: 'Un homenatge exquisit a la música disco i funk dels 70 i 80, gravat amb instrumentació orgànica analògica.',
    tracks: [
      { id: 't61', title: 'Give Life Back to Music', duration: '4:34', preview_url: null },
      { id: 't62', title: 'Giorgio by Moroder', duration: '9:05', preview_url: null },
      { id: 't63', title: 'Instant Crush', duration: '5:37', preview_url: null },
      { id: 't64', title: 'Lose Yourself to Dance', duration: '5:53', preview_url: null },
      { id: 't65', title: 'Get Lucky', duration: '6:09', preview_url: null }
    ]
  },
  {
    id: '7ycBtnsM2kIeBfWc5qN4c7',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    release_year: 2015,
    genres: ['Conscious Hip Hop', 'Jazz Rap', 'Funk'],
    description: 'Àlbum magistral que entrellaça reflexions socials profundes amb arrels de jazz, soul i funk.',
    tracks: [
      { id: 't71', title: 'Wesley\'s Theory', duration: '4:47', preview_url: null },
      { id: 't72', title: 'King Kunta', duration: '3:54', preview_url: null },
      { id: 't73', title: 'These Walls', duration: '5:00', preview_url: null },
      { id: 't74', title: 'Alright', duration: '3:39', preview_url: null }
    ]
  },
  {
    id: '0vE6mttURJF7VHM1gDMoT9',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    release_year: 1977,
    genres: ['Pop Rock', 'Soft Rock'],
    description: 'Un disc marcat per les tensions i ruptures emocionals internes del grup, convertit en una obra immortal de pop melòdic.',
    tracks: [
      { id: 't81', title: 'Second Hand News', duration: '2:43', preview_url: null },
      { id: 't82', title: 'Dreams', duration: '4:14', preview_url: null },
      { id: 't83', title: 'Go Your Own Way', duration: '3:38', preview_url: null },
      { id: 't84', title: 'The Chain', duration: '4:28', preview_url: null }
    ]
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 1,
    user_id: 1,
    album_id: '4aawyAB9vmq31L23',
    rating: 5.0,
    review_text: 'Una de les obres mestres absolutes de la història de la música contemporània. La cara B és sublim, especialment la transició entre Golden Slumbers i The End.',
    created_at: '2026-03-01T11:20:00Z'
  },
  {
    id: 2,
    user_id: 1,
    album_id: '285O1L3A8A2g5L2p3d1',
    rating: 4.5,
    review_text: 'Producció impecable de Quincy Jones. Cançons com Billie Jean o Beat It van canviar la indústria del pop per sempre.',
    created_at: '2026-03-03T16:45:00Z'
  },
  {
    id: 3,
    user_id: 2,
    album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v',
    rating: 5.0,
    review_text: 'El so envoltant, els temes filosòfics sobre el temps i els diners i el solo de Time el converteixen en un disc imprescindible per a qualsevol melòman.',
    created_at: '2026-03-05T09:15:00Z'
  },
  {
    id: 4,
    user_id: 3,
    album_id: '1ptj8O06Vv1e3Wq17Zz17K',
    rating: 4.5,
    review_text: 'Trencador, polèmic i vibrant. Rosalía sap mesclar arrels flamenques amb sintetitzadors distorsionats d\'una manera que ningú altre s\'atreveix.',
    created_at: '2026-03-10T20:10:00Z'
  },
  {
    id: 5,
    user_id: 3,
    album_id: '4m2880jivSbbyEGAKfITCa',
    rating: 4.0,
    review_text: 'La calor dels instruments analògics es nota des del primer acord. Giorgio by Moroder és una autèntica lliçó de composició.',
    created_at: '2026-03-12T18:00:00Z'
  }
];

export const INITIAL_PLAYLISTS = [
  {
    id: 1,
    user_id: 1,
    title: 'Millors discos essencials',
    description: 'Una selecció d\'àlbums fonamentals que tothom hauria d\'escoltar almenys un cop a la vida.',
    is_public: true,
    created_at: '2026-02-01T12:00:00Z'
  },
  {
    id: 2,
    user_id: 3,
    title: 'Sons per a viatjar de nit',
    description: 'Discos d\'atmosferes nocturnes, sintetitzadors i calma.',
    is_public: true,
    created_at: '2026-02-15T21:00:00Z'
  }
];

export const INITIAL_PLAYLIST_ALBUMS = [
  { playlist_id: 1, album_id: '4aawyAB9vmq31L23', added_at: '2026-02-01T12:05:00Z' },
  { playlist_id: 1, album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v', added_at: '2026-02-01T12:10:00Z' },
  { playlist_id: 1, album_id: '6kVUvzRmBG2KiFHU987641', added_at: '2026-02-01T12:15:00Z' },
  { playlist_id: 2, album_id: '4m2880jivSbbyEGAKfITCa', added_at: '2026-02-15T21:05:00Z' },
  { playlist_id: 2, album_id: '1ptj8O06Vv1e3Wq17Zz17K', added_at: '2026-02-15T21:10:00Z' }
];

export const INITIAL_LISTENLIST = [
  { user_id: 1, album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v', added_at: '2026-03-02T10:00:00Z' },
  { user_id: 1, album_id: '7ycBtnsM2kIeBfWc5qN4c7', added_at: '2026-03-04T15:30:00Z' }
];
