


import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";


// Remover constantes específicas da TMDB para usar proxy com fallback
const TMDB_TOKEN = import.meta.env.VITE_TMDB_API_KEY

// Mapear filtros para tipos da API TMDB
const getTypeFromFilter = (filter) => {
  switch (filter) {
    case 'movies':
      return { type: 'movie', genreId: null }
    case 'series':
      return { type: 'tv', genreId: null }
    case 'anime':
      return { type: 'tv', genreId: 16 } // 16 = Animation, 10749 também pode ser usado para Anime específico
    default:
      return { type: 'movie', genreId: null }
  }
}

function buildTmdbRequest(query, filter = 'movies') {
  const { type, genreId } = getTypeFromFilter(filter)

  if (TMDB_TOKEN) {
    let endpoint
    if (query) {
      // Busca específica
      endpoint = `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}`
    } else {
      // Discover (popular)
      if (genreId) {
        // Para anime, usar discover TV com filtro de gênero
        endpoint = `https://api.themoviedb.org/3/discover/${type}?sort_by=popularity.desc&with_genres=${genreId}`
      } else {
        endpoint = `https://api.themoviedb.org/3/discover/${type}?sort_by=popularity.desc`
      }
    }

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
  let endpoint
  if (query) {
    endpoint = `/api/tmdb?path=/search/${type}&search=query=${encodeURIComponent(query)}`
  } else {
    if (genreId) {
      endpoint = `/api/tmdb?path=/discover/${type}&search=sort_by=popularity.desc&with_genres=${genreId}`
    } else {
      endpoint = `/api/tmdb?path=/discover/${type}&search=sort_by=popularity.desc`
    }
  }
  return { endpoint, options: {} }
}

function App() {

  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])
  const [activeFilter, setActiveFilter] = useState('movies') // 'movies', 'series', 'anime'
  const [isLoadingTrending, setIsLoadingTrending] = useState(false)
  const [trendingError, setTrendingError] = useState(null)
  const [theme, setTheme] = useState(() => {
    // Recuperar tema salvo do localStorage ou usar 'dark' como padrão
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'dark'
  })

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])


  const fetchMovies = async (query = '', filter = 'movies') => {

    setIsLoading(true)
    setErrorMessage('')


    try {
      const { endpoint, options } = buildTmdbRequest(query, filter)
      const response = await fetch(endpoint, options)

      if (!response.ok) {
        throw new Error('failed to fetch movies')
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        const categoryName = filter === 'movies' ? 'filmes' : filter === 'series' ? 'séries' : 'animações'
        setErrorMessage(`Nenhum ${categoryName.slice(0, -1)} encontrado`)
        setMovieList([]);
        return
      }

      // Normalizar dados: séries (TV) usam 'name' e 'first_air_date', filmes usam 'title' e 'release_date'
      const normalizedResults = data.results.map(item => ({
        ...item,
        title: item.title || item.name, // Filmes têm 'title', séries têm 'name'
        release_date: item.release_date || item.first_air_date, // Filmes têm 'release_date', séries têm 'first_air_date'
        media_type: filter === 'movies' ? 'movie' : 'tv' // Adicionar tipo de mídia
      }))

      setMovieList(normalizedResults || [])


      if (query && normalizedResults.length > 0) {
        await updateSearchCount(query, normalizedResults[0])
      }

    } catch (error) {
      console.log(`Error fetching movies: ${error}`)
      setErrorMessage(`Error fetching movies: ${error.message}`)
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    setTrendingError(null);
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error('Erro ao carregar filmes em destaque:', error);
      setTrendingError('Não foi possível carregar filmes em destaque');
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, activeFilter);
  }, [debouncedSearchTerm, activeFilter]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setSearchTerm('') // Limpar busca ao mudar de categoria
  }

  // Títulos dinâmicos baseados na categoria
  const getSectionTitle = () => {
    switch (activeFilter) {
      case 'movies':
        return 'All movies'
      case 'series':
        return 'All series'
      case 'anime':
        return 'All animations'
      default:
        return 'All movies'
    }
  }

  return (
    <main>
      <Navbar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="pattern" />

      <div className="wrapper">
        <img src="./hero.png" alt="Hero Banner" />
        <header>
          <h1>Find <span className="text-gradient">Movies</span> and <span className="text-gradient">Enjoy</span></h1>
        </header>
        {/* Trending Movies */}
        <section className="trending" aria-label="Filmes em destaque">
          <h2>Trending Movies</h2>
          {isLoadingTrending ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : trendingError ? (
            <div className="text-yellow-500 text-center py-4">
              {trendingError}
            </div>
          ) : trendingMovies && trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-4">
              Faça buscas para ver filmes em destaque!
            </div>
          )}
        </section>


        <section className="all-movies">
          <h2 className="mt-[100px]">{getSectionTitle()}</h2>

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
