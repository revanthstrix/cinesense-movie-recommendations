import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchUpcomingMovies } from '../api/tmdb';
import MovieCard from './MovieCard';
import Navbar from './Navbar';
import '../styles/styles.css';

export default function Upcoming() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observer = useRef();

  const lastMovieElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setError(null);
        const res =  await fetchUpcomingMovies(page);
                setMovies(res.data.results);
        
        const today = new Date();

        
        const newMovies = res.data.results
          .filter((m) => new Date(m.release_date) >= today)
          .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

        setMovies((prev) => [...prev, ...newMovies]);
        setHasMore(res.data.page < res.data.total_pages);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch upcoming movies.');
      }
    };

    loadMovies();
  }, [page]);

  return (
    <div>
      
      <div className="container"><Navbar />
      

        {error && <div className="error">{error}</div>}

        <div className="grid">
          {movies.map((movie, index) => {
            if (index === movies.length - 1) {
              return (
                <div ref={lastMovieElementRef} key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              );
            } else {
              return <MovieCard key={movie.id} movie={movie} />;
            }
          })}
        </div>
      </div>
    </div>
  );
}
