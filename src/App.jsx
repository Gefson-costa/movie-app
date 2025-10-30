


import { useState, useEffect } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";


// Remover constantes específicas da TMDB para usar proxy com fallback
const TMDB_TOKEN = import.meta.env.VITE_TMDB_API_KEY

function buildTmdbRequest(query) {
  if (TMDB_TOKEN) {
    const endpoint = query
      ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`
      : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_TOKEN}`
      }
    }
    return { endpoint, options }
  }
  // Sem token no client: usar proxy serverless
  const endpoint = query
    ? `/api/tmdb?path=/search/movie&search=query=${encodeURIComponent(query)}`
    : `/api/tmdb?path=/discover/movie&search=sort_by=popularity.desc`
  return { endpoint, options: {} }
}

function App() {

  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])


  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])


  const fetchMovies = async (query = '') => {

    setIsLoading(true)
    setErrorMessage('')


    try {
      const { endpoint, options } = buildTmdbRequest(query)
      const response = await fetch(endpoint, options)

      if (!response.ok) {
        throw new Error('failed to fetch movies')
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setErrorMessage('No movies found')
        setMovieList([]);
        return
      }

      setMovieList(data.results || [])


      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
      }

    } catch (error) {
      console.log(`Error fetching movies: ${error}`)
      setErrorMessage(`Error fetching movies: ${error.message}`)
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <img src="./hero.png" alt="Hero Banner" />
        <header>
          <h1>Find <span className="text-gradient">Movies</span> and <span className="text-gradient">Enjoy</span></h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {/* Trending Movies */}
        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} />
                </li>
              ))}
            </ul>
          </section>
        )}


        <section className="all-movies">
          <h2 className="mt-[100px]">All movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

      </div>

    </main>
  )
}


export default App;
