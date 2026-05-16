import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const palettes = [
  ['#f4c542', '#47290b', '#080809'],
  ['#3fc4bd', '#103536', '#07090a'],
  ['#e0523f', '#411410', '#090708'],
  ['#7c6cff', '#21194c', '#08080d'],
  ['#d6d0c4', '#2c2925', '#070707']
];

function hashTitle(value = '') {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function fallbackStyle(title, type) {
  const [accent, mid, base] = palettes[hashTitle(title) % palettes.length];

  if (type === 'backdrop') {
    return {
      background:
        `radial-gradient(circle at 72% 24%, ${accent}55 0 13%, transparent 32%), ` +
        `radial-gradient(circle at 28% 62%, ${mid} 0 18%, transparent 42%), ` +
        `linear-gradient(135deg, ${base} 0%, #111116 48%, ${mid} 100%)`
    };
  }

  return {
    background:
      `radial-gradient(circle at 58% 20%, ${accent}44 0 16%, transparent 38%), ` +
      `linear-gradient(160deg, ${mid} 0%, #111116 48%, ${base} 100%)`
  };
}

function proxiedImageUrl(value) {
  if (!value) return '';

  try {
    const imageUrl = new URL(value);
    const shouldProxy = ['image.tmdb.org', 'media.themoviedb.org'].includes(imageUrl.hostname);
    return shouldProxy ? `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(value)}` : value;
  } catch {
    return value;
  }
}

function FallbackArtwork({ title, type }) {
  const isBackdrop = type === 'backdrop';

  return (
    <div className="absolute inset-0 flex overflow-hidden" style={fallbackStyle(title, type)}>
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.08),transparent_22%,rgba(255,255,255,0.04)_44%,transparent_58%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_22px,rgba(255,255,255,0.08)_23px,transparent_24px)]" />
      <div className={`relative z-10 flex h-full w-full flex-col ${isBackdrop ? 'items-start justify-end p-8 md:p-12' : 'items-center justify-center p-4 text-center'}`}>
        <span className={`${isBackdrop ? 'text-5xl md:text-7xl' : 'text-4xl'} display-font leading-none text-cb-accent`}>CB</span>
        <span className={`${isBackdrop ? 'mt-3 max-w-xl text-2xl md:text-4xl' : 'mt-3 text-sm'} display-font leading-tight text-white`}>
          {title || 'CineBook'}
        </span>
        {!isBackdrop && <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cb-secondary">CineBook Poster</span>}
      </div>
    </div>
  );
}

export default function MovieImage({
  src,
  alt,
  type = 'poster',
  priority = false,
  className = '',
  imageClassName = '',
  style
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);
  const [currentSrc, setCurrentSrc] = useState(proxiedImageUrl(src));
  const title = alt?.trim() || 'CineBook';
  const hasPositionClass = /\b(absolute|fixed|relative|sticky)\b/.test(className);
  const fallback = useMemo(() => <FallbackArtwork title={title} type={type} />, [title, type]);

  useEffect(() => {
    setLoaded(false);
    setFailed(!src);
    setCurrentSrc(proxiedImageUrl(src));
  }, [src]);

  function handleError() {
    setLoaded(false);
    setFailed(true);
    setCurrentSrc('');
  }

  return (
    <div className={`${hasPositionClass ? '' : 'relative'} overflow-hidden bg-[#101014] ${className}`} style={style}>
      {(!loaded || failed || !currentSrc) && fallback}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority || type === 'backdrop' ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`relative z-10 h-full w-full object-cover transition-opacity duration-300 ${failed ? 'opacity-0' : 'opacity-100'} ${imageClassName}`}
        />
      )}
    </div>
  );
}
