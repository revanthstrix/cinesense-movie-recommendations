import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchGenres,
  fetchMoviesByGenre,
  fetchRepresentativeMovie,
  fetchLanguages,
  fetchMoviesByLanguage,
} from '../api/tmdb';
import MovieCard from './MovieCard';
import Navbar from './Navbar';
import './Recommendations.css';
import { LifeLine } from 'react-loading-indicators';
import Footer from './Footer';


export default function Recommendations() {
  const { genreId, langCode } = useParams();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [genreImages, setGenreImages] = useState({});
  const [languages, setLanguages] = useState([]);
  const [languageImages, setLanguageImages] = useState({});
  const [languageSearch, setLanguageSearch] = useState('');

  // 🎬 Fetch genres and their images
  useEffect(() => {
    const getGenresAndImages = async () => {
      try {
        const res = await fetchGenres();
        const genreList = res.data.genres;
        setGenres(genreList);

        const images = {};
        await Promise.all(
          genreList.map(async (genre) => {
            try {
              const movieRes = await fetchRepresentativeMovie(genre.id);
              const poster = movieRes.data.results[0]?.poster_path;
              images[genre.id] = poster
                ? `https://image.tmdb.org/t/p/w500${poster}`
                : 'https://i.imgur.com/qxjZ4b5.jpg';
            } catch {
              images[genre.id] = 'https://i.imgur.com/qxjZ4b5.jpg';
            }
          })
        );
        setGenreImages(images);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    getGenresAndImages();
  }, []);

  // 🌐 Fetch top 20 popular languages
  useEffect(() => {
    const getTopLanguages = async () => {
      try {
        const res = await fetchLanguages();
        const langList = res.data.filter((lang) => lang.iso_639_1 && lang.english_name);

        const langWithCounts = await Promise.all(
          langList.map(async (lang) => {
            try {
              const res = await fetchMoviesByLanguage(lang.iso_639_1, 1);
              return {
                ...lang,
                count: res.data.total_results || 0,
                poster: res.data.results[0]?.poster_path || null,
              };
            } catch {
              return { ...lang, count: 0, poster: null };
            }
          })
        );

        const top20 = langWithCounts
          .filter((l) => l.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 40);

        setLanguages(top20);

        const posters = {};
        top20.forEach((lang) => {
          posters[lang.iso_639_1] = lang.poster
            ? `https://image.tmdb.org/t/p/w500${lang.poster}`
            : 'https://i.imgur.com/qxjZ4b5.jpg';
        });
        setLanguageImages(posters);
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };

    getTopLanguages();
  }, []);

  // 📽 Fetch movies by genre or language
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setMovies([]);
        if (genreId) {
          const res = await fetchMoviesByGenre(genreId, page);
          setMovies(res.data.results);
        } else if (langCode) {
          const res = await fetchMoviesByLanguage(langCode, page);
          setMovies(res.data.results);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
        setError('Failed to fetch movies.');
      }
    };

    fetchData();
  }, [genreId, langCode, page]);

  const getLangName = (code) =>
    languages.find((l) => l.iso_639_1 === code)?.english_name || code;

  // Filtered languages based on search
  const filteredLanguages = languages.filter((lang) =>
    lang.english_name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // 🎞 Movies Display
  if (genreId || langCode) {
    return (
      <div className="container">
        <Navbar />
        <div className="genre-title">
          <h2>
            {genreId
              ? 'Movies in this Genre'
              : `Movies in ${getLangName(langCode)}`}
          </h2>
        </div>
        {error && <p>{error}</p>}
        {!error && (
          <>
            <div className="grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <div className="pagination">
              <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                Prev
              </button>
              <span> Page {page} </span>
              <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 🏠 Default: Genre and Language cards
  return (
    <div className="container">
      <Navbar />

      <h2 className="genre-title">Select a Genre</h2>
      <div className="genre-container">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="genre-card"
            onClick={() => navigate(`/recommendations/${genre.id}`)}
          >
            <img
              src={genreImages[genre.id] || 'https://i.imgur.com/qxjZ4b5.jpghttps://static.vecteezy.com/system/resources/thumbnails/042/600/457/small/loading-circles-flat-style-modern-preloaders-png.png'}
              alt={genre.name}
              className="genre-image"
            />
            <h3>{genre.name}</h3>
          </div>
        ))}
      </div>

      <h2 className="genre-title">Or Browse by Language</h2>

      {/* 🔍 Language search input */}
      <div className="language-search-wrapper">
  <input
    type="text"
    placeholder="Search languages..."
    value={languageSearch}
    onChange={(e) => setLanguageSearch(e.target.value)}
    className="language-search-input"
  />
</div>


      <div className="genre-container">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.iso_639_1}
            className="genre-card"
            onClick={() => navigate(`/recommendations/lang/${lang.iso_639_1}`)}
          >
            <img
              src={languageImages[lang.iso_639_1] || 'https://static.vecteezy.com/system/resources/thumbnails/042/600/457/small/loading-circles-flat-style-modern-preloaders-png.png'}
              alt={lang.english_name}
              className="genre-image"
            />
            <h3>{lang.english_name}</h3>
          </div>
        ))}
        {filteredLanguages.length === 0 && 
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // full viewport height
          
        }}
      >
        <LifeLine color="#314ccc" size="medium" text="" textColor="" />
      </div>
    }
      </div>
      <Footer/>
    </div>
  );
}
