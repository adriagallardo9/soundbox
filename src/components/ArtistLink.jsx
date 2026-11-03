export default function ArtistLink({
  name = '',
  artistIds = [],
  onNavigate,
  className = ''
}) {
  const ids = Array.isArray(artistIds) ? artistIds : [];
  const artists = String(name || '').split(',').map((artistName, index) => ({
    name: artistName.trim(),
    id: ids[index] || null,
  })).filter((artist) => artist.name);

  if (!artists.length) return null;

  return (
    <>
      {artists.map((artist, index) => (
        <span key={`${artist.id || artist.name}-${index}`}>
          {index > 0 && ', '}
          <button
            type="button"
            title={`Veure la discografia de ${artist.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onNavigate?.('artist', { artist });
            }}
            className={`text-left hover:text-emerald-400 hover:underline transition-colors ${className}`}
          >
            {artist.name}
          </button>
        </span>
      ))}
    </>
  );
}
