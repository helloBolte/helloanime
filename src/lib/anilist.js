import React, { useEffect, useState } from 'react';

export async function fetchAnilist(query, variables = {}) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();
  return json.data;
}

export const AnimeComponent = ({ query, variables = {} }) => {
  const [anime, setAnime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAnilist(query, variables);
      setAnime(data);
    };

    fetchData();
  }, [query, variables]);

  if (!anime) return <div>Loading...</div>;

  return (
    <div>
      {anime.map(a => (
        <div key={a.id}>
          <img src={a.coverImage.large} alt={a.title.userPreferred} />
          <h2>{a.title.userPreferred}</h2>
          <p>Episodes: {a.episodes}</p>
          <p>Season Year: {a.seasonYear}</p>
          <p>Average Score: {a.averageScore}</p>
          {a.nextAiringEpisode && <p>Next Episode: {a.nextAiringEpisode.episode}</p>}
        </div>
      ))}
    </div>
  );
};
