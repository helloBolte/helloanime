// src/app/genre/[genre]/page.js
import AnimeGenreClient from './AnimeGenreClient';

export default async function AnimeGenrePage({ params }) {
  const { genre } = params; // This now works in an async server component.
  return <AnimeGenreClient genre={genre} />;
}