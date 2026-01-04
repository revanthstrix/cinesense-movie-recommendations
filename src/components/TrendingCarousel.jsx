import React, { useEffect, useState } from 'react';
import { fetchTrendingMovies } from '../api/tmdb';
import { useNavigate } from 'react-router-dom';
import './TrendingCarousel.css';

export default function TrendingCarousel() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovies = async () => {
      const res = await fetchTrendingMovies(1);
      setMovies(res.data.results.slice(0, 6)); // show top 6
    };
    loadMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  return (
    <div className="trending-carousel">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`carousel-slide ${index === current ? 'active' : ''}`}
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
          }}
        >
          <div className="carousel-content">
            <h1>{movie.title}</h1>
            <p>{movie.overview?.slice(0, 140)}...</p>
            <div className="carousel-buttons">
              <button onClick={() => navigate(`/movie/${movie.id}?playTrailer=true`)}>
                ▶ Watch Trailer
              </button>
              
            </div>
          </div>
        </div>
      ))}

      <div className="carousel-dots">
        {movies.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
          ></span>
        ))}
      </div>
    </div>
  );
}
