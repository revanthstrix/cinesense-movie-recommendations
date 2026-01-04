import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchMovieDetails } from '../api/tmdb';
import Trailer from './Trailer';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';
import './MovieDetails.css';
import { BACKEND_URL } from '../config';
import { Atom } from 'react-loading-indicators';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function MovieDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trailerRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [watchProviders, setWatchProviders] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState({});
  const [similarMovies, setSimilarMovies] = useState([]); // ✅ Similar movies state
  const [newLink, setNewLink] = useState('');
  const [newQuality, setNewQuality] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const movieRes = await fetchMovieDetails(id);
        setMovie(movieRes.data);

        const providerRes = await axios.get(`${BACKEND_URL}/tmdb/movie/${id}/providers`);
        const providers = providerRes.data.results?.IN?.flatrate || [];
        setWatchProviders(providers);

        const linkRes = await axios.get(`${BACKEND_URL}/download/movie-download/${id}`);
        setDownloadLinks(linkRes.data.downloadLinks || {});

        // ✅ Save genres to localStorage
if (movieRes.data.genres) {
  let stored = JSON.parse(localStorage.getItem("viewedGenres")) || [];
  const newGenres = movieRes.data.genres.map((g) => g.id);

  newGenres.forEach((id) => {
    // remove if already exists (so it can be pushed to end)
    stored = stored.filter((g) => g !== id);
    stored.push(id);
  });

  // ✅ keep only the latest 5
  if (stored.length > 5) {
    stored = stored.slice(-5);
  }

  localStorage.setItem("viewedGenres", JSON.stringify(stored));
  console.log("✅ Updated viewedGenres:", stored);
}


        // ✅ Fetch similar movies
        const similarRes = await axios.get(`${BACKEND_URL}/tmdb/movie/${id}/similar`);
        setSimilarMovies(similarRes.data.results || []);
      } catch (err) {
        console.error('Error loading movie details:', err);
        setDownloadLinks({});
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const scrollToTrailer = queryParams.get('playTrailer');
    if (scrollToTrailer && trailerRef.current) {
      setTimeout(() => {
        trailerRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    }
  }, [location.search]);

  // ✅ Add to watchlist
  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          overview: movie.overview,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Added to Watchlist!', { position: 'top-right', autoClose: 3000 });
      } else {
        toast.error(data.message || 'Failed to add to watchlist', { position: 'top-right', autoClose: 3000 });
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Something went wrong', { position: 'top-right', autoClose: 3000 });
    }
  };

  // ✅ Save new link
  const handleSaveLink = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/download/admin/movie-download`,
        {
          movieId: movie.id,
          title: movie.title,
          downloadLink: newLink,
          quality: newQuality,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDownloadLinks({ ...downloadLinks, [newQuality]: newLink });
      setNewLink('');
      setNewQuality('');
      toast.success('✅ Download link saved!', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error('❌ Error saving download link', { position: 'top-right', autoClose: 3000 });
    }
  };

  // ✅ Delete link
  const handleDeleteLink = async (qualityToDelete) => {
    try {
      await axios.delete(`${BACKEND_URL}/download/admin/movie-download/${id}/${qualityToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = { ...downloadLinks };
      delete updated[qualityToDelete];
      setDownloadLinks(updated);
      toast.success('✅ Link deleted successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error('❌ Failed to delete link', { position: 'top-right', autoClose: 3000 });
    }
  };

  // ✅ Update link
  const handleUpdateLink = async (quality) => {
    try {
      await axios.put(
        `${BACKEND_URL}/download/admin/movie-download/${id}/${quality}`,
        { newUrl: downloadLinks[quality] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('✅ Link updated successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err) {
      toast.error('❌ Failed to update link', { position: 'top-right', autoClose: 3000 });
    }
  };

  if (isLoading || !movie) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Atom color="#314ccc" size="medium" />
    </div>
  );

  const trailer = movie.videos.results.find((v) => v.type === 'Trailer');
  const director = movie.credits.crew.find((crew) => crew.job === 'Director');

  return (
    <div className="details-container">
      {/* Hero */}
      <div
        className="details-hero"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})` }}
      >
        <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>
        <div className="details-overlay">
          <h1 className="details-title">{movie.title}</h1>
          <p className="details-tagline">{movie.overview?.slice(0, 300)}...</p>
          

          {trailer && (
            <button
              className="trailer-button"
              onClick={() => {
                const searchParams = new URLSearchParams(location.search);
                searchParams.set('playTrailer', 'true');
                navigate({ search: searchParams.toString() });
              }}
            >
              ▶ Watch Trailer
            </button>
          )}
        </div>
      </div>

      {/* Movie info */}
      <div className="details-top">
        <div className="movie-main-info">
          <div className="meta-data">
            <p><strong>Rating:</strong> {movie.vote_average}</p>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Genre:</strong> {movie.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
            {director && (
              <p>
                <strong>Director:</strong>{' '}
                <span style={{ color: '#ff4757', cursor: 'pointer' }} onClick={() => navigate(`/actor/${director.id}`)}>
                  {director.name}
                </span>
              </p>
            )}
          </div>

          {watchProviders.length > 0 && (
            <div className="watch-providers">
              <strong>Available On:</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {watchProviders.map((provider) => (
                  <img
                    key={provider.provider_id}
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                  />
                ))}
              </div>
            </div>
          )}

          {token && (
            <button className="watchlist-button" onClick={handleAddToWatchlist}>
              Add to Watchlist
            </button>
          )}
        </div>
      </div>

      {/* Cast */}
      <div className="cast-scroll">
        <h2 style={{ marginBottom: '16px' }}>Cast</h2>
        <div className="cast-list">
          {movie.credits.cast.slice(0, 8).map((actor) => (
            <div key={actor.id} className="cast-card" onClick={() => navigate(`/actor/${actor.id}`)}>
              <img
                src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/default-profile.png'}
                alt={actor.name}
              />
              <span>{actor.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trailer */}
      {trailer && (
        <div className="trailer" ref={trailerRef}>
          <Trailer videoKey={trailer.key} />
        </div>
      )}

     


      {/* Download Links */}
      {Object.keys(downloadLinks).length > 0 && (
        <div className="download-link-section">
          <h3>Download Links</h3>
          {Object.entries(downloadLinks).map(([quality, url]) => (
            <div key={quality} style={{ marginBottom: '10px' }}>
              <a href={url} target="_blank" rel="noopener noreferrer">{quality} Download</a>
              {user?.role === 'admin' && (
                <>
                  <input
                    type="text"
                    value={downloadLinks[quality]}
                    onChange={(e) => setDownloadLinks({ ...downloadLinks, [quality]: e.target.value })}
                    style={{ marginLeft: '10px', width: '300px', padding: '10px 12px', borderRadius: '8px' }}
                  />
                  <button onClick={() => handleUpdateLink(quality)} style={{ marginLeft: '8px' }}>Update</button>
                  <button onClick={() => handleDeleteLink(quality)} style={{ marginLeft: '8px', color: 'red' }}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin add new link */}
      {user?.role === 'admin' && (
        <div className="admin-input">
          <input type="text" placeholder="Paste new download link" value={newLink} onChange={(e) => setNewLink(e.target.value)} />
          <input type="text" placeholder="Quality (e.g. 1080p, 720p)" value={newQuality} onChange={(e) => setNewQuality(e.target.value)} />
          <button onClick={handleSaveLink}>Save Link</button>
        </div>
      )}

      {/* ✅ Similar Movies */}
{similarMovies.length > 0 && (
  <div className="similar-movies-section">
    <h2 style={{ margin: '20px 0' }}>Similar Movies</h2>
    <div className="similar-movies-scroll">
      {similarMovies.slice(0, 12).map((sim) => (
        <div
          key={sim.id}
          className="similar-movie-card"
          onClick={() => navigate(`/movie/${sim.id}`,{replace : true})}  // ✅ no replace
        >
          <img
            src={
              sim.poster_path
                ? `https://image.tmdb.org/t/p/w342${sim.poster_path}`
                : '/default-poster.png'
            }
            alt={sim.title}
          />
          <p>{sim.title}</p>
        </div>
      ))}
    </div>
  </div>
)}



      <ToastContainer />
    </div>
  );
}
