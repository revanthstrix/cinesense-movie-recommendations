import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { BACKEND_URL } from '../config';
import { Link } from 'react-router-dom'; // ✅ Import Link
import './watchlist.css';
import { Commet } from 'react-loading-indicators';

export default function Watchlist() {
  const { token } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const removeFromWatchlist = async (movieId) => {
    await fetch(`${BACKEND_URL}/watchlist/${movieId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setMovies(movies.filter(m => m.movieId !== movieId));
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/watchlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setMovies(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch watchlist', error);
      }
    };

    fetchWatchlist();
  }, [token]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // full viewport height
          
        }}
      >
        <Commet color="#314ccc" size="medium" text="" textColor="" />
      </div>
    );
  }
  
  
  
  

  return (
    <div className="watchlist-container">
      <h2>Your Watchlist</h2>
      {movies.length === 0 ? (
        <p>No movies added yet.</p>
      ) : (
        <div className="movie-grid">
          {movies.map(movie => (
            <div key={movie.movieId} className="movie-card1">
              <Link to={`/movie/${movie.movieId}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                  alt={movie.title}
                />
              </Link>
              <h4>{movie.title}</h4>
              <button onClick={() => removeFromWatchlist(movie.movieId)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
