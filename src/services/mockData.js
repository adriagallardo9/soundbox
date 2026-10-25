// Base de dades inicial i catàleg de fallback (Pla B - Bloc 6.3 de la memòria)
// Sincronitzat amb docs/bd/schema_sqlite.sql

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
    created_at: '2026-01-10T10:00:00Z'
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
    created_at: '2026-01-15T14:30:00Z'
  },
  {
    id: 4,
    username: 'pau_rocker',
    name: 'Pau Soler',
    email: 'pau@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Fidel al rock dels 70 i 90. Solos de guitarra i bateries potents.',
    created_at: '2026-01-20T18:15:00Z'
  },
  {
    id: 5,
    username: 'laura_indie',
    name: 'Laura Mas',
    email: 'laura@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Sons psicodèlics, sintetitzadors analògics i melancolia.',
    created_at: '2026-01-25T11:20:00Z'
  },
  {
    id: 6,
    username: 'marc_electronic',
    name: 'Marc Riera',
    email: 'marc@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'French touch, trip-hop i techno berlinès.',
    created_at: '2026-02-01T16:45:00Z'
  },
  {
    id: 7,
    username: 'nuria_hiphop',
    name: 'Núria Torres',
    email: 'nuria@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Conscious rap, neo-soul i beats de jazz.',
    created_at: '2026-02-05T09:10:00Z'
  },
  {
    id: 8,
    username: 'joan_jazz',
    name: 'Joan Bosch',
    email: 'joan@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Harmonies de jazz, soul clàssic i el geni de Prince.',
    created_at: '2026-02-10T20:00:00Z'
  },
  {
    id: 9,
    username: 'berta_pop',
    name: 'Berta Puig',
    email: 'berta@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bio: 'Pop pur, ritmes ballables i grans produccions.',
    created_at: '2026-02-14T12:30:00Z'
  },
  {
    id: 10,
    username: 'oriol_catfolk',
    name: 'Oriol Rovira',
    email: 'oriol@soundbox.cat',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Explorant la riquesa musical dels Països Catalans: Manel, Antònia Font i noves veus.',
    created_at: '2026-02-18T19:40:00Z'
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
    description: 'L\'onzè àlbum d\'estudi de The Beatles. Famos per la seva icònica portada al pas de vianants i el medley sublim de la cara B.',
    tracks: [
      { id: 't1', title: 'Come Together', duration: '4:19', preview_url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3' },
      { id: 't2', title: 'Something', duration: '3:02', preview_url: null },
      { id: 't3', title: 'Here Comes the Sun', duration: '3:05', preview_url: 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3' },
      { id: 't4', title: 'Golden Slumbers', duration: '1:31', preview_url: null },
      { id: 't5', title: 'The End', duration: '2:21', preview_url: null }
    ]
  },
  {
    id: '285O1L3A8A2g5L2p3d1',
    title: 'Thriller',
    artist: 'Michael Jackson',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    release_year: 1982,
    genres: ['Pop', 'Post-disco', 'Funk', 'Rock'],
    description: 'El sisè àlbum d\'estudi de Michael Jackson. L\'àlbum més venut de tots els temps, produït per Quincy Jones.',
    tracks: [
      { id: 't21', title: 'Wanna Be Startin\' Somethin\'', duration: '6:03', preview_url: null },
      { id: 't22', title: 'Thriller', duration: '5:57', preview_url: 'https://cdn.freesound.org/previews/518/518884_11293774-lq.mp3' },
      { id: 't23', title: 'Beat It', duration: '4:18', preview_url: null },
      { id: 't24', title: 'Billie Jean', duration: '4:54', preview_url: 'https://cdn.freesound.org/previews/518/518884_11293774-lq.mp3' }
    ]
  },
  {
    id: '7i2DJ8oZ0vH3Y8G1sM2h3v',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    release_year: 1973,
    genres: ['Rock Progressiu', 'Rock Psicodèlic'],
    description: 'Àlbum conceptual que explora el pas del temps, la cobdícia, el conflicte i la condició humana.',
    tracks: [
      { id: 't31', title: 'Breathe (In the Air)', duration: '2:49', preview_url: null },
      { id: 't32', title: 'Time', duration: '6:53', preview_url: null },
      { id: 't33', title: 'Money', duration: '6:22', preview_url: null },
      { id: 't34', title: 'Us and Them', duration: '7:49', preview_url: null }
    ]
  },
  {
    id: '1ptj8O06Vv1e3Wq17Zz17K',
    title: 'MOTOMAMI',
    artist: 'Rosalía',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    release_year: 2022,
    genres: ['Pop Avantguardista', 'Reggaeton Alternatiu', 'Flamenc'],
    description: 'Tercer àlbum de Rosalía. Audaç, vibrant i innovador, redefinint la música urbana.',
    tracks: [
      { id: 't41', title: 'SAOKO', duration: '2:17', preview_url: null },
      { id: 't42', title: 'CANDY', duration: '3:13', preview_url: null },
      { id: 't43', title: 'LA FAMA', duration: '3:08', preview_url: null },
      { id: 't44', title: 'HENTAI', duration: '2:42', preview_url: null }
    ]
  },
  {
    id: '6kVUvzRmBG2KiFHU987641',
    title: 'OK Computer',
    artist: 'Radiohead',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
    release_year: 1997,
    genres: ['Art Rock', 'Rock Alternatiu'],
    description: 'Àlbum clau dels 90 que retrata l\'alienació tecnològica i la malenconia de fi de segle.',
    tracks: [
      { id: 't51', title: 'Airbag', duration: '4:44', preview_url: null },
      { id: 't52', title: 'Paranoid Android', duration: '6:23', preview_url: null },
      { id: 't53', title: 'Karma Police', duration: '4:21', preview_url: null },
      { id: 't54', title: 'No Surprises', duration: '3:48', preview_url: null }
    ]
  },
  {
    id: '4m2880jivSbbyEGAKfITCa',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    release_year: 2013,
    genres: ['Disco', 'Funk', 'Música Electrònica'],
    description: 'Un homenatge exquisit al funk i disco analògic gravat amb grans músics d\'estudi.',
    tracks: [
      { id: 't61', title: 'Give Life Back to Music', duration: '4:34', preview_url: null },
      { id: 't62', title: 'Giorgio by Moroder', duration: '9:05', preview_url: null },
      { id: 't63', title: 'Instant Crush', duration: '5:37', preview_url: null },
      { id: 't64', title: 'Get Lucky', duration: '6:09', preview_url: null }
    ]
  },
  {
    id: '7ycBtnsM2kIeBfWc5qN4c7',
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    release_year: 2015,
    genres: ['Conscious Hip Hop', 'Jazz Rap', 'Funk'],
    description: 'Obra cabdal del rap modern entrellaçant jazz, soul i reflexions socials punyents.',
    tracks: [
      { id: 't71', title: 'Wesley\'s Theory', duration: '4:47', preview_url: null },
      { id: 't72', title: 'King Kunta', duration: '3:54', preview_url: null },
      { id: 't73', title: 'Alright', duration: '3:39', preview_url: null }
    ]
  },
  {
    id: '0vE6mttURJF7VHM1gDMoT9',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    release_year: 1977,
    genres: ['Pop Rock', 'Soft Rock'],
    description: 'Tensions i ruptures personals convertides en una de les obres mestres del pop-rock melòdic.',
    tracks: [
      { id: 't81', title: 'Dreams', duration: '4:14', preview_url: null },
      { id: 't82', title: 'Go Your Own Way', duration: '3:38', preview_url: null },
      { id: 't83', title: 'The Chain', duration: '4:28', preview_url: null }
    ]
  },
  {
    id: '5v9G61N6yv7P8X894178aB',
    title: 'El Mal Querer',
    artist: 'Rosalía',
    cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    release_year: 2018,
    genres: ['Flamenc Nou', 'Art Pop'],
    description: 'Obra conceptual basada en la novel·la occitana del segle XIII Flamenca.',
    tracks: [
      { id: 't91', title: 'MALAMENTE (Cap.1: Augurio)', duration: '2:29', preview_url: null },
      { id: 't92', title: 'PIENSO EN TU MIRÁ (Cap.3: Celos)', duration: '3:13', preview_url: null }
    ]
  },
  {
    id: '3RQQmkQEvNCY4prGKE6oc5',
    title: 'Currents',
    artist: 'Tame Impala',
    cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    release_year: 2015,
    genres: ['Synthpop', 'Rock Psicodèlic'],
    description: 'L\'obra mestra psicodèlica de Kevin Parker sobre la transformació personal.',
    tracks: [
      { id: 't101', title: 'Let It Happen', duration: '7:46', preview_url: null },
      { id: 't102', title: 'The Less I Know the Better', duration: '3:36', preview_url: null }
    ]
  },
  {
    id: '6deiaCdMT8geN0Y6ue7gtU',
    title: 'AM',
    artist: 'Arctic Monkeys',
    cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    release_year: 2013,
    genres: ['Indie Rock', 'Garage Rock'],
    description: 'Riffs poderosos i ritmes inspirats en el hip hop de la Costa Oest.',
    tracks: [
      { id: 't111', title: 'Do I Wanna Know?', duration: '4:32', preview_url: null },
      { id: 't112', title: 'R U Mine?', duration: '3:21', preview_url: null }
    ]
  },
  {
    id: '2guirTSE4XLCLIMdsP398G',
    title: 'Discovery',
    artist: 'Daft Punk',
    cover_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop&q=80',
    release_year: 2001,
    genres: ['French House', 'Synthpop'],
    description: 'L\'àlbum que va portar la música electrònica de club al cor de la cultura popular.',
    tracks: [
      { id: 't121', title: 'One More Time', duration: '5:20', preview_url: null },
      { id: 't122', title: 'Harder, Better, Faster, Stronger', duration: '3:44', preview_url: null }
    ]
  },
  {
    id: '2WT1pbYjLJp2vjT5N8F3zE',
    title: 'Alegria',
    artist: 'Antònia Font',
    cover_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    release_year: 2002,
    genres: ['Pop Català', 'Indie Pop'],
    description: 'Un cim del pop mediterrani amb cançons poètiques, fresques i inoblidables.',
    tracks: [
      { id: 't131', title: 'Alegria', duration: '3:30', preview_url: null },
      { id: 't132', title: 'Dins aquest iglú', duration: '3:20', preview_url: null },
      { id: 't133', title: 'Clint Eastwood', duration: '2:55', preview_url: null }
    ]
  },
  {
    id: '70cAlGgL0sY2xT9H96uH87',
    title: '10 milles per veure una bona armadura',
    artist: 'Manel',
    cover_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    release_year: 2011,
    genres: ['Pop Folk', 'Indie Pop'],
    description: 'Segon disc de Manel que va aconseguir el número 1 a les llistes de vendes estatals cantat en català.',
    tracks: [
      { id: 't141', title: 'Benvolgut', duration: '4:15', preview_url: null },
      { id: 't142', title: 'Boomerang', duration: '5:02', preview_url: null },
      { id: 't143', title: 'Aniversari', duration: '4:29', preview_url: null }
    ]
  },
  {
    id: '17u1V10oH5m1r7Y8S8nK4m',
    title: 'Èpic Solete',
    artist: 'The Tyets',
    cover_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    release_year: 2023,
    genres: ['Urban Pop Català', 'Trapeton'],
    description: 'L\'àlbum fenomen del duet mataroní incloent el superèxit Coti x Coti.',
    tracks: [
      { id: 't151', title: 'Coti x Coti', duration: '3:10', preview_url: null },
      { id: 't152', title: 'Bailoteo', duration: '3:05', preview_url: null },
      { id: 't153', title: 'Clar que t\'he trobat a faltar', duration: '3:22', preview_url: null }
    ]
  },
  {
    id: '4LH4d3cOWNNXdAC4eeG3x2',
    title: 'In Rainbows',
    artist: 'Radiohead',
    cover_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    release_year: 2007,
    genres: ['Art Rock', 'Rock Alternatiu'],
    description: 'Un disc càlid, expansiu i sublim que va revolucionar la distribució musical.',
    tracks: [
      { id: 't161', title: '15 Step', duration: '3:57', preview_url: null },
      { id: 't162', title: 'Weird Fishes/Arpeggi', duration: '5:18', preview_url: null },
      { id: 't163', title: 'Nude', duration: '4:15', preview_url: null }
    ]
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 1,
    user_id: 1,
    album_id: '4aawyAB9vmq31L23',
    rating: 5.0,
    review_text: 'Una de les obres mestres absolutes de la història de la música contemporània. La cara B és sublim, especialment el medley final.',
    created_at: '2026-01-12T11:30:00Z'
  },
  {
    id: 2,
    user_id: 1,
    album_id: '285O1L3A8A2g5L2p3d1',
    rating: 4.5,
    review_text: 'Producció impecable de Quincy Jones. Cançons com Billie Jean o Beat It van canviar la indústria del pop per sempre.',
    created_at: '2026-01-15T17:40:00Z'
  },
  {
    id: 3,
    user_id: 2,
    album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v',
    rating: 5.0,
    review_text: 'El so envoltant, els temes filosòfics sobre el temps i el solo de Time el converteixen en un disc imprescindible per a qualsevol melòman.',
    created_at: '2026-01-18T09:15:00Z'
  },
  {
    id: 4,
    user_id: 3,
    album_id: '1ptj8O06Vv1e3Wq17Zz17K',
    rating: 4.5,
    review_text: 'Trencador, polèmic i vibrant. Rosalía sap mesclar arrels flamenques amb sintetitzadors distorsionats com ningú altre.',
    created_at: '2026-01-22T20:10:00Z'
  },
  {
    id: 5,
    user_id: 3,
    album_id: '4m2880jivSbbyEGAKfITCa',
    rating: 4.0,
    review_text: 'La calor dels instruments analògics es nota des del primer acord. Giorgio by Moroder és una autèntica lliçó de composició.',
    created_at: '2026-01-25T18:00:00Z'
  },
  {
    id: 6,
    user_id: 4,
    album_id: '6kVUvzRmBG2KiFHU987641',
    rating: 5.0,
    review_text: 'Paranoid Android i Karma Police defineixen una generació sencera. Atmosferes úniques i lletres profètiques.',
    created_at: '2026-01-28T22:15:00Z'
  },
  {
    id: 7,
    user_id: 10,
    album_id: '2WT1pbYjLJp2vjT5N8F3zE',
    rating: 5.0,
    review_text: 'Un dels cims del pop mallorquí i català. Cançons com Dins aquest iglú o Clint Eastwood formen part de la nostra memòria col·lectiva.',
    created_at: '2026-02-28T10:20:00Z'
  },
  {
    id: 8,
    user_id: 10,
    album_id: '70cAlGgL0sY2xT9H96uH87',
    rating: 4.5,
    review_text: 'Consolidació definitiva de Manel com a referents indiscutibles. Lletres narratives brillants i arranjaments elegants.',
    created_at: '2026-03-02T13:40:00Z'
  },
  {
    id: 9,
    user_id: 10,
    album_id: '17u1V10oH5m1r7Y8S8nK4m',
    rating: 4.0,
    review_text: 'Fenomen indiscutible. Coti x Coti ha fet ballar sardanes a tothom i la resta de temes són pop lluminós.',
    created_at: '2026-03-08T16:10:00Z'
  },
  {
    id: 10,
    user_id: 5,
    album_id: '3RQQmkQEvNCY4prGKE6oc5',
    rating: 4.5,
    review_text: 'Kevin Parker va crear el disc psicodèlic definitiu dels 2010s. The Less I Know the Better és una joia incontestable.',
    created_at: '2026-02-05T16:30:00Z'
  }
];

export const INITIAL_PLAYLISTS = [
  {
    id: 1,
    user_id: 1,
    title: 'Millors discos essencials de la història',
    description: 'Una selecció d\'àlbums fonamentals que tothom hauria d\'escoltar almenys un cop a la vida.',
    is_public: true,
    created_at: '2026-02-01T12:00:00Z'
  },
  {
    id: 2,
    user_id: 3,
    title: 'Sons per a viatjar de nit',
    description: 'Discos d\'atmosferes nocturnes, sintetitzadors càlids i calma.',
    is_public: true,
    created_at: '2026-02-15T21:00:00Z'
  },
  {
    id: 3,
    user_id: 10,
    title: 'Talent Musical Català',
    description: 'Àlbums emblemàtics de l\'escena pop, indie i urbana de Catalunya i les Balears.',
    is_public: true,
    created_at: '2026-02-25T15:30:00Z'
  }
];

export const INITIAL_PLAYLIST_ALBUMS = [
  { playlist_id: 1, album_id: '4aawyAB9vmq31L23', added_at: '2026-02-01T12:05:00Z' },
  { playlist_id: 1, album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v', added_at: '2026-02-01T12:10:00Z' },
  { playlist_id: 1, album_id: '285O1L3A8A2g5L2p3d1', added_at: '2026-02-01T12:15:00Z' },
  { playlist_id: 1, album_id: '6kVUvzRmBG2KiFHU987641', added_at: '2026-02-01T12:20:00Z' },
  { playlist_id: 1, album_id: '0vE6mttURJF7VHM1gDMoT9', added_at: '2026-02-01T12:25:00Z' },
  { playlist_id: 2, album_id: '4m2880jivSbbyEGAKfITCa', added_at: '2026-02-15T21:05:00Z' },
  { playlist_id: 2, album_id: '3RQQmkQEvNCY4prGKE6oc5', added_at: '2026-02-15T21:15:00Z' },
  { playlist_id: 2, album_id: '4LH4d3cOWNNXdAC4eeG3x2', added_at: '2026-02-15T21:20:00Z' },
  { playlist_id: 3, album_id: '2WT1pbYjLJp2vjT5N8F3zE', added_at: '2026-02-25T15:35:00Z' },
  { playlist_id: 3, album_id: '70cAlGgL0sY2xT9H96uH87', added_at: '2026-02-25T15:40:00Z' },
  { playlist_id: 3, album_id: '17u1V10oH5m1r7Y8S8nK4m', added_at: '2026-02-25T15:45:00Z' },
  { playlist_id: 3, album_id: '5v9G61N6yv7P8X894178aB', added_at: '2026-02-25T15:55:00Z' },
  { playlist_id: 3, album_id: '1ptj8O06Vv1e3Wq17Zz17K', added_at: '2026-02-25T16:00:00Z' }
];

export const INITIAL_LISTENLIST = [
  { user_id: 1, album_id: '7i2DJ8oZ0vH3Y8G1sM2h3v', added_at: '2026-03-02T10:00:00Z' },
  { user_id: 1, album_id: '7ycBtnsM2kIeBfWc5qN4c7', added_at: '2026-03-04T15:30:00Z' },
  { user_id: 1, album_id: '4LH4d3cOWNNXdAC4eeG3x2', added_at: '2026-03-08T12:15:00Z' },
  { user_id: 3, album_id: '3RQQmkQEvNCY4prGKE6oc5', added_at: '2026-03-10T18:20:00Z' },
  { user_id: 10, album_id: '17u1V10oH5m1r7Y8S8nK4m', added_at: '2026-03-12T21:05:00Z' }
];
