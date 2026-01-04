import React from 'react';

export default function Trailer({ videoKey }) {
  return (
    <div className="trailer">
      <iframe
        width="100%"
        height="400"
        src={`https://www.youtube.com/embed/${videoKey}`}
        frameBorder="0"
        allowFullScreen
        title="Trailer"
      ></iframe>
    </div>
  );
}