import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { BACKEND_URL } from '../config';
import {
  fetchSeriesDetails,
  fetchSeriesSeasonsEpisodes,
} from '../api/tmdb';
import axios from 'axios';
import Trailer from './Trailer';
import './SeriesDetails.css';
import { Atom } from 'react-loading-indicators';
import ModalPlayer from "./ModalPlayer";


export default function SeriesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trailerRef = useRef(null);

  const [series, setSeries] = useState(null);
  const [watchProviders, setWatchProviders] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState({});
  const [newLink, setNewLink] = useState('');
  const [newQuality, setNewQuality] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [seasonCount, setSeasonCount] = useState(null);
  const [episodeCount, setEpisodeCount] = useState(null);
  const [similarSeries, setSimilarSeries] = useState([]);
  const [modalSeason, setModalSeason] = useState(null);


  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await fetchSeriesDetails(id);
        setSeries(res.data);

        const providerRes = await axios.get(`${BACKEND_URL}/tmdb/tv/${id}/providers`);
        const providers = providerRes.data.results?.IN?.flatrate || [];
        setWatchProviders(providers);

        const linkRes = await axios.get(`${BACKEND_URL}/download/series-download/${id}`);
        setDownloadLinks(linkRes.data.downloadLinks || {});

        const seasonEpRes = await fetchSeriesSeasonsEpisodes(id);
        setSeasonCount(seasonEpRes.data.number_of_seasons);
        setEpisodeCount(seasonEpRes.data.number_of_episodes);

        // ✅ Fetch similar series
        const similarRes = await axios.get(`${BACKEND_URL}/tmdb/tv/${id}/similar`);
        setSimilarSeries(similarRes.data.results || []);
      } catch (err) {
        console.error('Error loading series details:', err);
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
          seriesId: series.id,
          title: series.name,
          posterPath: series.poster_path,
          overview: series.overview,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Added to watchlist');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleSaveLink = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/download/admin/series-download`,
        {
          seriesId: series.id,
          title: series.name,
          downloadLink: newLink,
          quality: newQuality,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDownloadLinks({ ...downloadLinks, [newQuality]: newLink });
      setNewLink('');
      setNewQuality('');
      alert('Download link saved!');
    } catch (err) {
      alert('Error saving download link');
    }
  };

  const handleDeleteLink = async (qualityToDelete) => {
    try {
      await axios.delete(`${BACKEND_URL}/download/admin/series-download/${id}/${qualityToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = { ...downloadLinks };
      delete updated[qualityToDelete];
      setDownloadLinks(updated);
      alert('Link deleted successfully');
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  const handleUpdateLink = async (quality) => {
    try {
      await axios.put(
        `${BACKEND_URL}/download/admin/series-download/${id}/${quality}`,
        { newUrl: downloadLinks[quality] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Link updated successfully');
    } catch (err) {
      alert('Failed to update link');
    }
  };

  if (isLoading || !series) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Atom color="#314ccc" size="medium" text="" textColor="" />
      </div>
    );
  }

  const trailer = series.videos?.results?.find((v) => v.type === 'Trailer' || v.type === 'Teaser');
  const creator = series.created_by?.[0];

  return (
    <div className="details-container">
      <div
        className="details-hero"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path || series.poster_path})`,
        }}
      >
        <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>

        <div className="details-overlay">
          <h1 className="details-title">{series.name}</h1>
          <p className="details-tagline">{series.overview?.slice(0, 300)}...</p>

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

      <div className="details-top">
        <div className="movie-main-info">
          <div className="meta-data">
            <p><strong>Rating:</strong> {series.vote_average}</p>
            <p><strong>Genre:</strong> {series.genres?.map(g => g.name).join(', ') || 'N/A'}</p>

            <p><strong>First Air Date:</strong> {series.first_air_date}</p>
            <p><strong>Seasons:</strong> {seasonCount}</p>
            <p><strong>Total Episodes:</strong> {episodeCount}</p>
            {creator && (
              <p>
                <strong>Creator:</strong>{' '}
                <span
                  style={{ color: '#ff4757', cursor: 'pointer' }}
                  onClick={() => navigate(`/actor/${creator.id}`)}
                >
                  {creator.name}
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

      {/* Cast List */}
      <div className="cast-scroll">
        <h2 style={{ marginBottom: '16px' }}>Cast</h2>
        <div className="cast-list">
          {series.credits.cast.slice(0, 8).map((actor) => (
            <div
              className="cast-card"
              key={actor.id}
              onClick={() => navigate(`/actor/${actor.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : '/default-profile.png'
                }
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

      {/* Seasons */}
      {series.seasons?.length > 0 && (
        <div className="seasons-section">
          <h2 style={{ marginBottom: '16px' }}>Seasons</h2>
          <div className="seasons-list">
            {series.seasons.map((season) => (
              <div
              className="season-card"
              key={season.id}
              style={{ cursor: "pointer" }}
            >
            
                <img
                  src={
                    season.poster_path
                      ? `https://image.tmdb.org/t/p/w185${season.poster_path}`
                      : '/default-poster.png'
                  }
                  alt={season.name}
                />
                <div className="season-info">
                  <h4>{season.name}</h4>
                  <p><strong>Air Date:</strong> {season.air_date || 'Unknown'}</p>
                  <p><strong>Episodes:</strong> {season.episode_count}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      )}

      

      {/* Download Links */}
      {Object.keys(downloadLinks).length > 0 && (
        <div className="download-link-section">
          <h3>Download Links</h3>
          {Object.entries(downloadLinks).map(([quality, url]) => (
            <div key={quality} style={{ marginBottom: '10px' }}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {quality} Download
              </a>
              {user?.role === 'admin' && (
                <>
                  <input
                    type="text"
                    value={downloadLinks[quality]}
                    onChange={(e) =>
                      setDownloadLinks({ ...downloadLinks, [quality]: e.target.value })
                    }
                    style={{
                      marginLeft: '10px',
                      width: '300px',
                      padding: '10px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                  <button onClick={() => handleUpdateLink(quality)} style={{ marginLeft: '8px' }}>
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteLink(quality)}
                    style={{ marginLeft: '8px', color: 'red', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Add Link */}
      {user?.role === 'admin' && (
        <div className="admin-input">
          <input
            type="text"
            placeholder="Paste new download link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <input
            type="text"
            placeholder="Quality (e.g. 1080p, 720p)"
            value={newQuality}
            onChange={(e) => setNewQuality(e.target.value)}
          />
          <button onClick={handleSaveLink}>Save Link</button>
        </div>
      )}

      {/* ✅ Similar Series */}
      {similarSeries.length > 0 && (
        <div className="similar-series-section">
          <h2 style={{ marginBottom: '16px' }}>Similar Series</h2>
          <div className="similar-series-scroll">
            {similarSeries.slice(0, 12).map((sim) => (
              <div
                key={sim.id}
                className="similar-series-card"
                onClick={() => navigate(`/series/${sim.id}`)}
              >
                <img
                  src={
                    sim.poster_path
                      ? `https://image.tmdb.org/t/p/w342${sim.poster_path}`
                      : '/default-poster.png'
                  }
                  alt={sim.name}
                />
                <p>{sim.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {modalSeason && (
  <ModalPlayer
    seriesId={series.id}
    initialSeason={modalSeason}
    totalSeasons={seasonCount}
    onClose={() => setModalSeason(null)}
  />
)}

    </div>
  );
}
