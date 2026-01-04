import axios from 'axios';

// ✅ Backend proxy URL
const BASE_URL = `https://tmdb-backend-2o43.onrender.com/api/tmdb`;

const instance = axios.create({
  baseURL: BASE_URL,
});

// ✅ All routes now go through backend — no TMDB key exposed to frontend

export const fetchTrendingMovies = (page = 1) => {
  return instance.get('/trending', { params: { page } });
};

export const searchMovies = (query, page = 1) => {
  return instance.get('/search', { params: { query, page } });
};

export const fetchMovieDetails = (id) => {
  return instance.get(`/movie/${id}`);
};

export const fetchUpcomingMovies = (page = 1) => {
  return instance.get('/upcoming', { params: { page } });
};

export const fetchGenres = () => {
  return instance.get('/genres');
};

export const fetchMoviesByGenre = (genreId, page = 1) => {
  return instance.get('/discover', {
    params: { genreId, page },
  });
};

export const fetchRepresentativeMovie = (genreId) => {
  return instance.get('/representative', {
    params: { genreId },
  });
};

export const fetchActorDetails = (id) => {
  return instance.get(`/actor/${id}`);
};

// 🌐 Get all supported languages
export const fetchLanguages = () => {
  return instance.get('/languages');
};

// 🎬 Get movies filtered by language
export const fetchMoviesByLanguage = (langCode, page = 1) => {
  return instance.get('/language-movies', {
    params: { langCode, page },
  });
};

// 📺 Trending TV series
export const fetchTrendingSeries = (page = 1) => {
  return instance.get('/series', { params: { page } });
};

// 🔍 Search TV series by name
export const searchSeries = (query, page = 1) => {
  return instance.get('/search-series', { params: { query, page } });
};

// ℹ️ Fetch series details by ID (optional if you plan to show series detail pages)
export const fetchSeriesDetails = (id) => {
  return instance.get(`/series/${id}`);
};

// 📦 Fetch number of seasons and episodes for a series
export const fetchSeriesSeasonsEpisodes = (id) => {
  return instance.get(`/series/${id}/seasons-episodes`);
};

// 🌟 Popular TV series
export const fetchPopularSeries = (page = 1) => {
  return instance.get('/popular-series', { params: { page } });
};

// 🕒 Upcoming/on-the-air TV series
export const fetchUpcomingSeries = (page = 1) => {
  return instance.get('/upcoming-series', { params: { page } });
};

// 📚 TV genres
export const fetchTVGenres = () => {
  return instance.get('/tv-genres');
};

// 🔍 TV series by genre
export const fetchSeriesByGenre = (genreId, page = 1) => {
  return instance.get('/series-by-genre', {
    params: { genreId, page },
  });
};

// 📺 Episodes inside a specific season
export const fetchSeasonEpisodes = (seriesId, seasonNumber) => {
  return instance.get(`/series/${seriesId}/season/${seasonNumber}`);
};


