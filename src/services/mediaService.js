const OMDB_API_KEY = "ef20483f";
const RAWG_API_KEY = "431d33ae6fe04c3d9e05499752c17bf9";

export const fetchMovieTVInfo = async (title, type) => {
  try {
    const tmdbType = type === "Film" ? "movie" : "tv";

    // === TMDb - Italian Search ===
    const tmdbSearch = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=73130b3a08f47771a9fb07f885ee9286&query=${encodeURIComponent(title)}&language=it-IT`
    );
    const tmdbData = await tmdbSearch.json();

    if (tmdbData.results && tmdbData.results.length > 0) {
      const item = tmdbData.results[0];

      const tmdbDetails = await fetch(
        `https://api.themoviedb.org/3/${tmdbType}/${item.id}?api_key=73130b3a08f47771a9fb07f885ee9286&language=it-IT`
      );
      const details = await tmdbDetails.json();

      const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;

      return {
        posterUrl: posterPath,
        year: (item.release_date || item.first_air_date || "").slice(0, 4),
        rating: item.vote_average,
        totalSeasons: tmdbType === "tv" ? details.number_of_seasons : undefined,
        genre: details.genres.map((g) => g.name).join(", "),
        actors: undefined,
        plot: details.overview,
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
      return {
        posterUrl: game.background_image && game.background_image !== "N/A" ? game.background_image : null,
        year: game.released ? game.released.substring(0, 4) : "",
        rating: game.rating,
        genre: game.genres ? game.genres.map((g) => g.name).join(", ") : "",
        plot: "", // RAWG non fornisce una sinossi
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

export const fetchMediaInfo = async (title, category) => {
  if (category === "Film" || category === "Serie TV") {
    return fetchMovieTVInfo(title, category);
  } else if (category === "Giochi") {
    return fetchGameInfo(title);
  } else if (category === "Anime") {
    return fetchAnimeInfo(title);
  }
  return null;
};