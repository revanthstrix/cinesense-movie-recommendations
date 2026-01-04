import React, { useEffect, useState } from "react";
import { fetchSeasonEpisodes } from "../api/tmdb";
import "./ModalPlayer.css";

export default function ModalPlayer({
  seriesId,
  initialSeason,
  totalSeasons,
  onClose,
}) {
  const [season, setSeason] = useState(initialSeason);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // Sync state when user opens modal on a different season
  useEffect(() => {
    setSeason(initialSeason);
    setCurrentEpisode(1);
  }, [initialSeason]);

  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        const res = await fetchSeasonEpisodes(seriesId, season);
        setEpisodes(res.data.episodes || []);
        setCurrentEpisode(1);
      } catch (err) {
        console.error("Season fetch error:", err);
      }
    };

    loadEpisodes();
  }, [season, seriesId]);

  // ⬇️ Use whatever provider you’re already using here
  const embedUrl = `https://vidsrc.to/embed/tv/${seriesId}/${season}/${currentEpisode}`;

  const handleNext = () => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((prev) => prev - 1);
    }
  };

  return (
    <div className="modal-player-container">
    <div className="modal-overlay fade-in">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2 className="modal-title">Stream Series</h2>
          <div className="season-select-box">
            <label htmlFor="season-select">Season:</label>
            <select
              id="season-select"
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {Array.from({ length: totalSeasons || 1 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Season {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-body">
          {/* Left: Episodes list */}
          <aside className="episodes-panel">
            <h3 className="panel-heading">Episodes</h3>
            <div className="episode-list">
              {episodes.map((ep) => (
                <button
                  key={ep.episode_number}
                  className={
                    "episode-item" +
                    (currentEpisode === ep.episode_number
                      ? " active-episode"
                      : "")
                  }
                  onClick={() => setCurrentEpisode(ep.episode_number)}
                >
                  <span className="episode-number">
                    E{ep.episode_number.toString().padStart(2, "0")}
                  </span>
                  <span className="episode-info">
                    <span className="episode-name">{ep.name}</span>
                    {ep.runtime ? (
                      <span className="episode-meta">
                        {ep.runtime} min
                        {ep.air_date ? ` • ${ep.air_date}` : ""}
                      </span>
                    ) : ep.air_date ? (
                      <span className="episode-meta">{ep.air_date}</span>
                    ) : null}
                  </span>
                </button>
              ))}

              {episodes.length === 0 && (
                <p className="empty-text">No episodes found for this season.</p>
              )}
            </div>
          </aside>

          {/* Right: Player */}
          <section className="player-panel">
            <h3 className="episode-title">
              Season {season} • Episode {currentEpisode}
            </h3>

            <div className="player-wrapper">
              <iframe
                title={`episode-player-s${season}-e${currentEpisode}`}
                src={embedUrl}
                frameBorder="0"
                allowFullScreen
                className="player-iframe"
              ></iframe>
            </div>

            <div className="controls">
              <button
                className="nav-button"
                onClick={handlePrev}
                disabled={currentEpisode <= 1}
              >
                ◀ Previous
              </button>
              <button
                className="nav-button primary"
                onClick={handleNext}
                disabled={currentEpisode >= episodes.length}
              >
                Next ▶
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
