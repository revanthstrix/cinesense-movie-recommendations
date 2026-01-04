import React, { useEffect, useState } from 'react';
import { fetchGenres } from '../api/tmdb'; // Assuming you add fetchGenres to tmdb.js
import { useHistory } from 'react-router-dom';
import '../styles/styles.css';

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchGenreData = async () => {
      try {
        setError(null);
        const res = await fetchGenres();
        setGenres(res.data.genres);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch genres.');
      }
    };
    fetchGenreData();
  }, []);

  return (
    <div className="genres-container">
      {error && <p>{error}</p>}
      {!error && (
        <div className="genres-list">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => history.push(`/recommendations/${genre.id}`)}
              className="genre-btn"
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
