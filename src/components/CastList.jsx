import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function CastList({ cast }) {
  const navigate = useNavigate();

  return (
    <div className="cast-list">
      <h3>Cast</h3>
      <div className="cast-scroll">
        {cast.map((actor) => (
          <div
            key={actor.cast_id}
            className="cast-card"
            onClick={() => navigate(`/actor/${actor.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
              alt={actor.name}
            />
            <p>{actor.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
