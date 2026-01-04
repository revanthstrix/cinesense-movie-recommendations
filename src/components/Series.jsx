import React, { useEffect, useState } from 'react';
import {
  fetchTrendingSeries,
  fetchPopularSeries,
  fetchUpcomingSeries,
  fetchSeriesByGenre,
  fetchTVGenres,
  searchSeries,
} from '../api/tmdb';

import Navbar from './Navbar';
import SeriesCarousel from './SeriesCarousel';
import SeriesCard from './SeriesCard';
import HorizontalRow from './HorizontalRow';
import '../styles/styles.css';
import { Mosaic } from 'react-loading-indicators';
import Footer from './Footer';

export default function Series() {
  const [series, setSeries] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [genreSections, setGenreSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(null);
        if (search) {
          const res = await searchSeries(search, page);
          setSeries(res.data.results);
        } else {
          // Fetch sections only when not in search
          const [trend, pop, up, genreList] = await Promise.all([
            fetchTrendingSeries(1),
            fetchPopularSeries(1),
            fetchUpcomingSeries(1),
            fetchTVGenres(),
          ]);

          setTrending(trend.data.results);
          setPopular(pop.data.results);
          setUpcoming(up.data.results);

          const top5Genres = genreList.data.genres.slice(0, 5);
          const genreData = await Promise.all(
            top5Genres.map(async (g) => {
              const res = await fetchSeriesByGenre(g.id);
              return { genre: g.name, data: res.data.results };
            })
          );
          setGenreSections(genreData);
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

      {!search && <SeriesCarousel />}

      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <Mosaic color="#314ccc" size="medium" text="" textColor="" />
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
                {series.map((tv) => (
                  <SeriesCard key={tv.id} movie={tv} />
                ))}
              </div>
              <div className="pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span> Page {page} </span>
                <button onClick={() => setPage((prev) => prev + 1)}>
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <HorizontalRow title="Trending Now" items={trending} />
              <HorizontalRow title="Popular Shows" items={popular} />
              <HorizontalRow title="Upcoming Shows" items={upcoming} />
              {genreSections.map((genreData) => (
                <HorizontalRow
                  key={genreData.genre}
                  title={genreData.genre}
                  items={genreData.data}
                />
              ))}
            </>
          )}
        </>
      )}<Footer/>
    </div>
  );
}
