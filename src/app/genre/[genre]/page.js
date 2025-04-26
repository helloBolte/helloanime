// src/app/genre/[genre]/page.js
import AnimeGenreClient from './AnimeGenreClient';

export default async function AnimeGenrePage({ params }) {
  const { genre } = params; // This now works in an async server component.

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Anime Genre Content */}
      <AnimeGenreClient genre={genre} />

    </div>
  );
}
