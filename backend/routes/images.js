// =============================================================
// CineBook - backend/routes/images.js
// Optional TMDB image lookup for posters and backdrops.
// Requires TMDB_API_KEY or TMDB_ACCESS_TOKEN in backend/.env.
// =============================================================

const express = require('express');

const router = express.Router();
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ALLOWED_IMAGE_HOSTS = new Set(['image.tmdb.org', 'media.themoviedb.org']);

function hasTmdbCredentials() {
  return Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);
}

function imageUrl(path, size) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbGet(path, params = {}) {
  if (!hasTmdbCredentials()) {
    const err = new Error('TMDB credentials are not configured.');
    err.status = 503;
    throw err;
  }

  const url = new URL(`${TMDB_API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const headers = { accept: 'application/json' };

  if (process.env.TMDB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.TMDB_ACCESS_TOKEN}`;
  } else {
    url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const err = new Error(`TMDB request failed with status ${response.status}.`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

function chooseMovieResult(results, preferredYear) {
  const withImages = results.filter((movie) => movie.poster_path || movie.backdrop_path);

  if (preferredYear) {
    const sameYear = withImages.find((movie) => {
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
      return releaseYear === Number(preferredYear);
    });
    if (sameYear) return sameYear;
  }

  return withImages[0] || results[0] || null;
}

router.get('/movie', async (req, res) => {
  const title = String(req.query.title || '').trim();
  const year = req.query.year ? Number(req.query.year) : undefined;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    const search = await tmdbGet('/search/movie', {
      query: title,
      year,
      include_adult: 'false',
      language: 'en-US',
      page: 1
    });

    let movie = chooseMovieResult(search.results || [], year);

    if (!movie && year) {
      const retry = await tmdbGet('/search/movie', {
        query: title,
        include_adult: 'false',
        language: 'en-US',
        page: 1
      });
      movie = chooseMovieResult(retry.results || []);
    }

    if (!movie) {
      return res.status(404).json({ error: 'No TMDB movie image found.' });
    }

    return res.status(200).json({
      tmdb_id      : movie.id,
      title        : movie.title,
      release_date : movie.release_date,
      poster_url   : imageUrl(movie.poster_path, 'w500'),
      backdrop_url : imageUrl(movie.backdrop_path, 'w1280')
    });
  } catch (err) {
    console.error('[IMAGES] TMDB lookup error:', err.message);
    return res.status(err.status || 500).json({ error: err.message || 'Failed to look up movie image.' });
  }
});

router.get('/proxy', async (req, res) => {
  const rawUrl = String(req.query.url || '').trim();

  if (!rawUrl) {
    return res.status(400).json({ error: 'url is required.' });
  }

  let imageUrlToFetch;

  try {
    imageUrlToFetch = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid image URL.' });
  }

  if (imageUrlToFetch.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(imageUrlToFetch.hostname)) {
    return res.status(400).json({ error: 'Image host is not allowed.' });
  }

  try {
    const response = await fetch(imageUrlToFetch, {
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'user-agent': 'CineBook/1.0'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Image request failed with status ${response.status}.` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('[IMAGES] Proxy error:', err.message);
    return res.status(502).json({ error: 'Failed to proxy image.' });
  }
});

module.exports = router;
