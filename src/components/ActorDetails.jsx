import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchActorDetails } from '../api/tmdb';
import axios from 'axios';
import '../styles/styles.css';

export default function ActorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    const getActorDetails = async () => {
      try {
        const res = await fetchActorDetails(id);
        setActor(res.data);
      } catch (err) {
        console.error('Error fetching actor details:', err);
      }
    };

    const getActorCredits = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=2cb0292b03fe9b2060d5bdfc7cc0c94b`
        );
        const sorted = res.data.cast
          .filter((item) => item.poster_path) // ✅ Filter for poster images
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 12);

        console.log('Credits fetched:', sorted); // ✅ Check in browser console
        setCredits(sorted);
      } catch (err) {
        console.error('Error fetching credits:', err);
      }
    };

    getActorDetails();
    getActorCredits();
  }, [id]);

  if (!actor) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>

      <div className="actor-details">
        <img
          src={
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
              : '/default-profile.png'
          }
          alt={actor.name}
        />
        <div className="actor-info">
          <h1>{actor.name}</h1>
          <p><strong>Birthday:</strong> {actor.birthday || 'N/A'}</p>
          <p><strong>Place of Birth:</strong> {actor.place_of_birth || 'N/A'}</p>
          <p><strong>Biography:</strong> {actor.biography || 'No biography available.'}</p>
        </div>
      </div>

      {credits.length > 0 && (
        <div className="actor-credits">
          <h3>Known For</h3>
          <div className="actor-credits-grid">
            {credits.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : '/default-poster.png'
                  }
                  alt={movie.title}
                />
                <p>{movie.title} <small>as {movie.character}</small></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
