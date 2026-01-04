import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { BACKEND_URL } from '../config';
import './movieCard.css';

export default function MovieCard({ movie }) {
  const { user, token } = useContext(AuthContext);
  const [added, setAdded] = useState(false);

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/fp.jpg';

  useEffect(() => {
    if (!user) return;
    const checkWatchlist = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.find((m) => m.movieId === movie.id)) {
          setAdded(true);
        }
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };
    checkWatchlist();
  }, [user, token, movie.id]);

  const addToWatchlist = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          overview: movie.overview
        })
      });

      if (res.ok) {
        setAdded(true);
      } else {
        const data = await res.json();
        alert(data.message || 'Already in watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  return (
    <div className="movie-card-wrapper">
      <Link to={`/movie/${movie.id}`} className="movie-card">
        <img src={imageUrl} alt={movie.title || 'Movie Poster'} loading="lazy" />
        <div className="movie-card-info">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-release-date">{movie.release_date}</p>
          {user && (
            <button
              className={`movie-watchlist-btn ${added ? 'added' : ''}`}
              onClick={addToWatchlist}
              disabled={added}
            >
              {added ? 'Added' : '+ Watchlist'}
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}
