const OMDB_API_KEY = process.env.EXPO_PUBLIC_OMDB_API_KEY;
const RAWG_API_KEY = process.env.EXPO_PUBLIC_RAWG_API_KEY;
const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export const fetchMovieTVInfo = async (title, type) => {
  try {
    const tmdbType = type === "Film" ? "movie" : "tv";

    // === TMDb - Italian Search ===
    const tmdbSearch = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=it-IT`
    );
    const tmdbData = await tmdbSearch.json();

    if (tmdbData.results && tmdbData.results.length > 0) {
      const item = tmdbData.results[0];

      const tmdbDetails = await fetch(
        `https://api.themoviedb.org/3/${tmdbType}/${item.id}?api_key=${TMDB_API_KEY}&language=it-IT`
      );
      const details = await tmdbDetails.json();

      const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;

      return {
        posterUrl: posterPath,
        year: (item.release_date || item.first_air_date || "").slice(0, 4),
        rating: item.vote_average,
        totalSeasons: tmdbType === "tv" ? details.number_of_seasons : undefined,
        genre: details.genres ? details.genres.map((g) => g.name).join(", ") : "",
        actors: undefined,
        plot: details.overview,
        tmdbId: item.id,
        runtime: details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null), // Runtime in minutes
      };
    }

    // === Fallback: OMDb ===
    const fallbackType = type === "Film" ? "movie" : "series";
    const omdb = await fetch(
      `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&type=${fallbackType}&plot=full`
    );
    const omdbData = await omdb.json();

    if (omdbData.Response === "True") {
      return {
        posterUrl: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
        year: omdbData.Year,
        rating: omdbData.imdbRating,
        totalSeasons: omdbData.totalSeasons,
        genre: omdbData.Genre,
        actors: omdbData.Actors,
        plot: omdbData.Plot,
      };
    }

    return null;
  } catch (error) {
    console.error("Errore TMDb o OMDb:", error);
    return null;
  }
};

export const fetchGameInfo = async (title) => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${RAWG_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const game = data.results[0];

      // Effettua una seconda chiamata per ottenere i dettagli completi del gioco, inclusa la descrizione
      const detailResponse = await fetch(
        `https://api.rawg.io/api/games/${game.id}?key=${RAWG_API_KEY}`
      );
      const gameDetails = await detailResponse.json();

      return {
        posterUrl: game.background_image && game.background_image !== "N/A" ? game.background_image : null,
        year: game.released ? game.released.substring(0, 4) : "",
        rating: game.rating,
        genre: game.genres ? game.genres.map((g) => g.name).join(", ") : "",
        plot: gameDetails.description_raw || gameDetails.description || "", // Usa description_raw per testo non formattato o description come fallback
      };
    }
    return null;
  } catch (error) {
    console.error("Errore nel recupero info gioco:", error);
    return null;
  }
};

export const fetchAnimeInfo = async (title) => {
  try {
    // Utilizziamo Jikan API per cercare un anime 
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`
    );
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const anime = data.data[0];
      return {
        posterUrl: anime.images.jpg.large_image_url && anime.images.jpg.large_image_url !== "N/A" ? anime.images.jpg.large_image_url : null,
        year: anime.aired && anime.aired.prop.from.year ? anime.aired.prop.from.year : "",
        rating: anime.score,
        genre: anime.genres ? anime.genres.map(g => g.name).join(", ") : "",
        plot: anime.synopsis || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Errore nel recupero info anime:", error);
    return null;
  }
};

// === New Search & Details Functions ===

export const searchMedia = async (query, category) => {
  try {
    if (category === "Film" || category === "Serie TV") {
      const tmdbType = category === "Film" ? "movie" : "tv";
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
      );
      const data = await response.json();

      if (!data.results) return [];

      return data.results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || "").slice(0, 4),
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
        rating: item.vote_average,
        category: category
      }));
    }
    else if (category === "Giochi") {
      const response = await fetch(
        `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${RAWG_API_KEY}`
      );
      const data = await response.json();

      if (!data.results) return [];

      return data.results.map(item => ({
        id: item.id,
        title: item.name,
        year: item.released ? item.released.substring(0, 4) : "",
        posterUrl: item.background_image && item.background_image !== "N/A" ? item.background_image : null,
        rating: item.rating,
        category: category
      }));
    }
    else if (category === "Anime") {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();

      if (!data.data) return [];

      return data.data.map(item => ({
        id: item.mal_id,
        title: item.title,
        year: item.aired && item.aired.prop.from.year ? item.aired.prop.from.year.toString() : "",
        posterUrl: item.images.jpg.large_image_url !== "N/A" ? item.images.jpg.large_image_url : null,
        rating: item.score,
        category: category
      }));
    }
    return [];
  } catch (error) {
    console.error("Error searching media:", error);
    return [];
  }
};

export const getMediaDetails = async (id, category) => {
  try {
    if (category === "Film" || category === "Serie TV") {
      const tmdbType = category === "Film" ? "movie" : "tv";
      const response = await fetch(
        `https://api.themoviedb.org/3/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&language=it-IT`
      );
      const details = await response.json();

      return {
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        year: (details.release_date || details.first_air_date || "").slice(0, 4),
        rating: details.vote_average,
        totalSeasons: tmdbType === "tv" ? details.number_of_seasons : undefined,
        genre: details.genres ? details.genres.map((g) => g.name).join(", ") : "",
        plot: details.overview,
        tmdbId: details.id,
        runtime: details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null),
        category: category,
        title: details.title || details.name
      };
    }
    else if (category === "Giochi") {
      const response = await fetch(
        `https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`
      );
      const details = await response.json();

      return {
        posterUrl: details.background_image && details.background_image !== "N/A" ? details.background_image : null,
        year: details.released ? details.released.substring(0, 4) : "",
        rating: details.rating,
        genre: details.genres ? details.genres.map((g) => g.name).join(", ") : "",
        plot: details.description_raw || details.description || "",
        category: category,
        title: details.name
      };
    }
    else if (category === "Anime") {
      // Jikan doesn't strictly need a second call if we have data, but consistent API helps
      // For now we just re-fetch to be safe or we could pass data if we had it. 
      // Jikan Search result has most info. But let's fetch by ID for consistency.
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      const data = await response.json();
      const anime = data.data;

      return {
        posterUrl: anime.images.jpg.large_image_url !== "N/A" ? anime.images.jpg.large_image_url : null,
        year: anime.aired && anime.aired.prop.from.year ? anime.aired.prop.from.year.toString() : "",
        rating: anime.score,
        genre: anime.genres ? anime.genres.map(g => g.name).join(", ") : "",
        plot: anime.synopsis || "",
        category: category,
        title: anime.title
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting media details:", error);
    return null;
  }
};

export const fetchMediaInfo = async (title, category) => {
  // Backward compatibility: search first result and get details
  const results = await searchMedia(title, category);
  if (results && results.length > 0) {
    return getMediaDetails(results[0].id, category);
  }

  // Fallback for Movies/TV to OMDb if TMDB fails (logic from original fetchMovieTVInfo)
  if (category === "Film" || category === "Serie TV") {
    try {
      const fallbackType = category === "Film" ? "movie" : "series";
      const omdb = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&type=${fallbackType}&plot=full`
      );
      const omdbData = await omdb.json();

      if (omdbData.Response === "True") {
        return {
          posterUrl: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
          year: omdbData.Year,
          rating: omdbData.imdbRating,
          totalSeasons: omdbData.totalSeasons,
          genre: omdbData.Genre,
          actors: omdbData.Actors,
          plot: omdbData.Plot,
          category: category,
          title: omdbData.Title
        };
      }
    } catch (e) {
      console.error("OMDb fallback error:", e);
    }
  }

  return null;
};

// Function to fetch or find TMDB ID
const getTMDBId = async (title, type) => {
  try {
    const tmdbType = type === "Film" ? "movie" : "tv";
    const tmdbSearch = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=it-IT`
    );
    const tmdbData = await tmdbSearch.json();
    if (tmdbData.results && tmdbData.results.length > 0) {
      return tmdbData.results[0].id;
    }
  } catch (e) {
    console.error("Error getting TMDB ID:", e);
  }
  return null;
};

export const fetchStreamingInfo = async (title, category, knownId = null) => {
  if (category !== "Film" && category !== "Serie TV") return null;

  try {
    const tmdbType = category === "Film" ? "movie" : "tv";
    let id = knownId;

    if (!id) {
      id = await getTMDBId(title, category);
    }

    if (!id) return null;

    const response = await fetch(
      `https://api.themoviedb.org/3/${tmdbType}/${id}/watch/providers?api_key=73130b3a08f47771a9fb07f885ee9286`
    );
    const data = await response.json();

    if (data.results && data.results.IT) {
      return data.results.IT; // Returns flatrate, rent, buy options for Italy
    }
    return null;
  } catch (error) {
    console.error("Error fetching streaming info:", error);
    return null;
  }
};

export const fetchTrailers = async (title, category, knownId = null) => {
  if (category !== "Film" && category !== "Serie TV") return null;

  try {
    const tmdbType = category === "Film" ? "movie" : "tv";
    let id = knownId;

    if (!id) {
      id = await getTMDBId(title, category);
    }

    if (!id) return null;

    const response = await fetch(
      `https://api.themoviedb.org/3/${tmdbType}/${id}/videos?api_key=73130b3a08f47771a9fb07f885ee9286&language=it-IT`
    );
    const data = await response.json();

    let trailers = [];
    if (data.results) {
      trailers = data.results.filter(v => v.site === "YouTube" && v.type === "Trailer");

      // Fallback to English trailers if no Italian ones
      if (trailers.length === 0) {
        const enResponse = await fetch(
          `https://api.themoviedb.org/3/${tmdbType}/${id}/videos?api_key=73130b3a08f47771a9fb07f885ee9286&language=en-US`
        );
        const enData = await enResponse.json();
        if (enData.results) {
          trailers = enData.results.filter(v => v.site === "YouTube" && v.type === "Trailer");
        }
      }
    }

    return trailers.length > 0 ? `https://www.youtube.com/watch?v=${trailers[0].key}` : null;
  } catch (error) {
    console.error("Error fetching trailers:", error);
    return null;
  }
};