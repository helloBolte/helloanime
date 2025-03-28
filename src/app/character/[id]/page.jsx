'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Cake, Calendar, Droplet } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-gray-100">
      <Skeleton className="w-full h-64 mb-8" />
      <Skeleton className="w-2/3 h-10 mb-4" />
      <Skeleton className="w-full h-40 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="w-full h-80" />
        <Skeleton className="w-full h-80" />
      </div>
    </div>
  );
}

function CharacterDetails({ character }) {
  return (
    <div className="mt-6 bg-gray-800 rounded-lg p-4">
      <h2 className="text-2xl font-bold text-purple-400 mb-4">Details</h2>
      <ul className="space-y-2">
        {character.gender && (
          <li><strong>Gender:</strong> {character.gender}</li>
        )}
        {character.age && (
          <li><strong>Age:</strong> {character.age}</li>
        )}
        {character.dateOfBirth.month && (
          <li className="flex items-center">
            <Cake className="w-5 h-5 mr-2 text-purple-400" />
            <span>
              {`${character.dateOfBirth.month}/${character.dateOfBirth.day}`}
              {character.dateOfBirth.year && `/${character.dateOfBirth.year}`}
            </span>
          </li>
        )}
        {character.bloodType && (
          <li className="flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-purple-400" />
            <span>{character.bloodType}</span>
          </li>
        )}
        <li className="flex items-center">
          <Heart className="w-5 h-5 mr-2 text-purple-400" />
          <span>{character.favourites} favorites</span>
        </li>
      </ul>
    </div>
  );
}

function CharacterAppearances({ media }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4 text-purple-400">Appearances</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-gray-800 block rounded-lg overflow-hidden transition-transform hover:scale-105">
            <img
              src={item.coverImage.large || "/placeholder.svg"}
              alt={item.title.english || item.title.romaji}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <h4 className="text-sm font-semibold text-purple-300 line-clamp-2">
                {item.title.english || item.title.romaji}
              </h4>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{item.startDate.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CharacterPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharacterDetails() {
      if (!id) {
        setLoading(false);
        return;
      }

      const query = `
        query ($id: Int) {
          Character(id: $id) {
            id
            name {
              full
              native
            }
            image {
              large
            }
            description
            gender
            dateOfBirth {
              year
              month
              day
            }
            age
            bloodType
            favourites
            media(sort: POPULARITY_DESC) {
              nodes {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
                type
                format
                startDate {
                  year
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            variables: { id: parseInt(id) }
          })
        });

        const data = await response.json();
        setCharacter(data.data.Character);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching character details:', error);
        setLoading(false);
      }
    }

    fetchCharacterDetails();
  }, [id]);

  if (loading) {
    return (
      <Suspense fallback={<LoadingState />}>
        <LoadingState />
      </Suspense>
    );
  }

  if (!character) {
    return (
      <Suspense fallback={<LoadingState />}>
        <div className="container mx-auto px-4 py-8 text-center text-purple-500 bg-gray-900">Character not found</div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-900 text-gray-100"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <img
                src={character.image.large || "/placeholder.svg"}
                alt={character.name.full}
                className="w-full rounded-lg shadow-lg"
              />
              <CharacterDetails character={character} />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold text-purple-400 mb-2">{character.name.full}</h1>
              {character.name.native && (
                <h2 className="text-2xl text-purple-300 mb-4">{character.name.native}</h2>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 text-purple-300">About</h3>
                <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: character.description }}></p>
              </div>
              <CharacterAppearances media={character.media.nodes} />
            </div>
          </div>
        </div>
      </motion.div>
    </Suspense>
  );
}

