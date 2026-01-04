import React, { useEffect, useState } from 'react';
import { fetchTrendingSeries } from '../api/tmdb';
import './TrendingCarousel.css';
import { useNavigate } from 'react-router-dom';


export default function SeriesCarousel() {
  const [seriesList, setSeriesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const getSeries = async () => {
      try {
        const res = await fetchTrendingSeries();
        setSeriesList(res.data.results.slice(0, 5)); // Top 5 trending shows
      } catch (err) {
        console.error('Failed to load trending series:', err);
      }
    };
    getSeries();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % seriesList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [seriesList]);

  return (
    <div className="trending-carousel">
      {seriesList.map((series, index) => (
        <div
          key={series.id}
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})`,
          }}
        >
          <div className="carousel-content">
            <h1>{series.name}</h1>
            <p>{series.overview.slice(0, 150)}...</p>
            <div className="carousel-buttons">
              <button onClick={() => navigate(`/series/${series.id}?playTrailer=true`)}>
                ▶ Watch Trailer
              </button>
              
            </div>
          </div>
        </div>
      ))}

      <div className="carousel-dots">
        {seriesList.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(i)}
          ></span>
        ))}
      </div>
    </div>
  );
}
