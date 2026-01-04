import React, { useEffect, useState } from 'react';
import {
  fetchTrendingMovies,
  searchMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  fetchGenres
} from '../api/tmdb';
import MovieCard from './MovieCard';
import Navbar from './Navbar';
import TrendingCarousel from './TrendingCarousel';
import '../styles/styles.css';
import { Mosaic } from 'react-loading-indicators';
import Footer from './Footer';
import HorizontalRow from './HorizontalRow';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [personalizedRows, setPersonalizedRows] = useState([]);
  const [genresMap, setGenresMap] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(null);

        if (search) {
          const res = await searchMovies(search, page);
          setMovies(res.data.results);
        } else {
          const [trendingRes, upcomingRes, genresRes] = await Promise.all([
            fetchTrendingMovies(1),
            fetchUpcomingMovies(1),
            fetchGenres()
          ]);

          setTrending(trendingRes.data.results);
          setUpcoming(upcomingRes.data.results);

          // ✅ Create a lookup map { id: name }
          const map = {};
          genresRes.data.genres.forEach((g) => {
            map[g.id] = g.name;
          });
          setGenresMap(map);

          // ✅ Get viewed genres from localStorage
          const viewedGenres = JSON.parse(localStorage.getItem('viewedGenres')) || [];

if (viewedGenres.length > 0) {
  // ✅ Already latest 5 stored, but just in case, slice(-5)
  const latestFive = viewedGenres.slice(-5);

  const genreData = await Promise.all(
    latestFive.map(async (id) => {
      const res = await fetchMoviesByGenre(id, 1);
      return { genreId: id, movies: res.data.results };
    })
  );

  setPersonalizedRows(genreData);
} else {
  setPersonalizedRows([]);
}

        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data from TMDB.');
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchData();
  }, [search, page]);

  return (
    <div className="container">
      <Navbar
        searchQuery={search}
        setSearchQuery={(value) => {
          setSearch(value);
          setPage(1);
        }}
        handleSearch={() => setPage(1)}
      />

      {!search && <TrendingCarousel />}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
          <Mosaic color="#314ccc" size="medium" />
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
          <p className="tip">Make sure your IP allows TMDB API calls.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {search ? (
            <>
              <div className="grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              <div className="pagination">
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                  Prev
                </button>
                <span> Page {page} </span>
                <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
              </div>
            </>
          ) : (
            <>
              <HorizontalRow title="Trending Movies" items={trending} isMovie />
              <HorizontalRow title="Upcoming Movies" items={upcoming} isMovie />

              {/* ✅ Personalized Section */}
              {personalizedRows.length > 0 && (
                <>
                  <h2 style={{ margin: '20px 0' }}>Recommended for You</h2>
                  {personalizedRows.map((row, index) => (
                    <HorizontalRow
                      key={index}
                      title={`Because you watched ${genresMap[row.genreId] || 'this genre'}`}
                      items={row.movies}
                      isMovie
                    />
                  ))}
                </>
              )}
            </>
          )}
          <Footer />
        </>
      )}
    </div>
  );
}
