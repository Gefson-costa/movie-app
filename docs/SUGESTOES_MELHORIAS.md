# 🚀 Sugestões de Melhorias para o Movie App

Este documento lista melhorias práticas que podem ser implementadas no projeto, organizadas por categoria e prioridade.

---

## 🔴 **CRÍTICAS (Fazer primeiro)**

### 1. **Segurança: HTTPS nas imagens da TMDB**
**Problema:** `MovieCard.jsx` usa `http://` para imagens, o que causa problemas de segurança (mixed content) em sites HTTPS.

**Onde:** `src/components/MovieCard.jsx` linha 8

**Solução:**
```jsx
// ANTES:
<img src={poster_path ? `http://image.tmdb.org/t/p/w500${poster_path}` : `/no-movie.png`} />

// DEPOIS:
<img src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : `/No-movie.png`} />
```

**Por quê?** Sites HTTPS bloqueiam conteúdo HTTP por segurança.

---

### 2. **Error Handling no Appwrite**
**Problema:** Erros do Appwrite são silenciosos (só `console.log`). O usuário não sabe quando algo falha.

**Onde:** `src/appwrite.js` linhas 39-40 e 57-58

**Solução:** Retornar erros e tratar no componente:
```javascript
export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // ... código existente ...
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar contagem:', error);
        return { success: false, error: error.message };
    }
}

export const getTrendingMovies = async() => {
    try {
        // ... código existente ...
        return result.documents || [];
    } catch(error) {
        console.error('Erro ao buscar trending:', error);
        return []; // Retorna array vazio em caso de erro
    }
}
```

**Por quê?** Melhor experiência do usuário e debugging mais fácil.

---

### 3. **Permissões explícitas no Appwrite**
**Problema:** Documentos criados sem permissões explícitas podem não ser acessíveis em produção.

**Onde:** `src/appwrite.js` linha 31

**Solução:**
```javascript
await database.createDocument(
    DATABASE_ID, 
    COLLECTION_ID, 
    ID.unique(), 
    {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    },
    [
        Permission.read(Role.any()), // Permite leitura pública
        Permission.write(Role.any()) // Permite escrita pública (se necessário)
    ]
)
```

**Import necessário:**
```javascript
import { Client, Databases, ID, Query, Permission, Role } from "appwrite";
```

**Por quê?** Garante que os documentos sejam acessíveis em produção sem depender apenas das configurações da Collection.

---

## 🟡 **IMPORTANTES (Fazer em seguida)**

### 4. **Validação de Variáveis de Ambiente**
**Problema:** Se as variáveis do Appwrite não estiverem definidas, o app quebra silenciosamente.

**Onde:** `src/appwrite.js` início do arquivo

**Solução:**
```javascript
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

// Validação
if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID || !ENDPOINT) {
    console.warn('⚠️ Variáveis do Appwrite não configuradas. Funcionalidades do banco estarão desabilitadas.');
}

const client = new Client()
    .setEndpoint(ENDPOINT || '')
    .setProject(PROJECT_ID || '')
```

**Por quê?** Previne erros e facilita debugging.

---

### 5. **Tratamento de Erro Visível para o Usuário**
**Problema:** Erros do Appwrite não são mostrados na interface.

**Onde:** `src/App.jsx` função `loadTrendingMovies`

**Solução:**
```javascript
const [trendingError, setTrendingError] = useState(null);

const loadTrendingMovies = async () => {
    try {
        setTrendingError(null);
        const movies = await getTrendingMovies();
        setTrendingMovies(movies || []);
    } catch (error) {
        console.error(`Error fetching trending movies: ${error}`);
        setTrendingError('Não foi possível carregar filmes em destaque');
    }
};

// No JSX:
{trendingError && (
    <div className="text-yellow-500 text-sm">{trendingError}</div>
)}
```

**Por quê?** Usuário sabe quando algo não funcionou.

---

### 6. **Loading State para Trending Movies**
**Problema:** Não há indicador de carregamento para os trending movies.

**Onde:** `src/App.jsx`

**Solução:**
```javascript
const [isLoadingTrending, setIsLoadingTrending] = useState(false);

const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    try {
        // ... código existente ...
    } finally {
        setIsLoadingTrending(false);
    }
};

// No JSX:
{isLoadingTrending ? (
    <Spinner />
) : trendingMovies && trendingMovies.length > 0 ? (
    // ... seção trending ...
) : null}
```

---

### 7. **Fallback para Trending Movies Vazio**
**Problema:** Se não houver trending movies, nada é mostrado (sem feedback).

**Onde:** `src/App.jsx` linha 114

**Solução:**
```javascript
{trendingMovies && trendingMovies.length > 0 ? (
    <section className="trending">
        {/* ... código existente ... */}
    </section>
) : (
    <section className="trending">
        <p className="text-gray-500">Faça buscas para ver filmes em destaque!</p>
    </section>
)}
```

---

## 🟢 **MELHORIAS DE UX/UI**

### 8. **Imagens com Loading Placeholder**
**Problema:** Imagens podem demorar para carregar, causando "salto" na página.

**Onde:** `src/components/MovieCard.jsx` e trending section

**Solução:**
```jsx
<img 
    src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : `/No-movie.png`}
    alt={title}
    loading="lazy"
    onError={(e) => {
        e.target.src = '/No-movie.png';
    }}
/>
```

**Por quê?** `loading="lazy"` carrega imagens apenas quando necessário, melhorando performance.

---

### 9. **Estado Vazio Melhorado**
**Problema:** Mensagem "No movies found" é muito simples.

**Onde:** `src/App.jsx` linha 66

**Solução:**
```jsx
if (!data.results || data.results.length === 0) {
    setErrorMessage(`Nenhum filme encontrado para "${query}". Tente outro termo!`);
    setMovieList([]);
    return;
}
```

---

### 10. **Botão "Limpar Busca"**
**Problema:** Para limpar a busca, o usuário precisa apagar manualmente.

**Onde:** `src/components/Search.jsx`

**Solução:**
```jsx
const Search = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className='search'>
            <div>
                <img src="search.svg" alt="search" />
                <input 
                    type='text'
                    placeholder='Search through thousands of movies'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="clear-button"
                        aria-label="Limpar busca"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}
```

---

### 11. **Link para Detalhes do Filme**
**Problema:** Usuário não pode ver mais informações sobre o filme.

**Onde:** `src/components/MovieCard.jsx`

**Solução:**
```jsx
const MovieCard = ({ movie }) => {
    const handleClick = () => {
        window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
    };

    return (
        <div className='movie-card' onClick={handleClick} style={{ cursor: 'pointer' }}>
            {/* ... código existente ... */}
        </div>
    )
}
```

---

## 🔵 **MELHORIAS DE CÓDIGO**

### 12. **Separar Lógica de API em Hook Customizado**
**Problema:** `App.jsx` está com muita lógica misturada.

**Solução:** Criar `src/hooks/useMovies.js`:
```javascript
import { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';

export const useMovies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    // ... lógica de fetchMovies ...

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        movieList,
        isLoading,
        errorMessage
    };
};
```

**Por quê?** Separação de responsabilidades, código mais limpo e reutilizável.

---

### 13. **Constantes em Arquivo Separado**
**Problema:** URLs e configurações espalhadas pelo código.

**Onde:** Criar `src/config/constants.js`

**Solução:**
```javascript
export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    DEFAULT_POSTER: '/No-movie.png'
};

export const DEBOUNCE_DELAY = 500;
export const TRENDING_LIMIT = 5;
```

---

### 14. **TypeScript (Opcional)**
**Problema:** Sem type checking, erros só aparecem em runtime.

**Solução:** Migrar para TypeScript adicionando tipos:
```bash
npm install -D typescript @types/react @types/react-dom
```

**Por quê?** Menos bugs, melhor autocomplete, código mais robusto.

---

### 15. **Validação de Dados com PropTypes ou TypeScript**
**Problema:** Se props vierem erradas, o componente pode quebrar.

**Onde:** Componentes que recebem props

**Solução (PropTypes):**
```bash
npm install prop-types
```

```jsx
import PropTypes from 'prop-types';

MovieCard.propTypes = {
    movie: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        poster_path: PropTypes.string,
        vote_average: PropTypes.number,
        release_date: PropTypes.string,
        original_language: PropTypes.string
    }).isRequired
};
```

---

## 🟣 **PERFORMANCE**

### 16. **Memoização de Componentes**
**Problema:** Componentes re-renderizam desnecessariamente.

**Onde:** `src/components/MovieCard.jsx`

**Solução:**
```jsx
import React, { memo } from 'react';

const MovieCard = memo(({ movie }) => {
    // ... código existente ...
});
```

---

### 17. **Pagination/Lazy Loading**
**Problema:** TMDB retorna muitos resultados de uma vez.

**Solução:** Implementar paginação:
```javascript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

// Adicionar parâmetro page na URL
const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;
```

---

### 18. **Cache de Requisições**
**Problema:** Mesmas buscas são feitas repetidamente.

**Solução:** Usar `localStorage` ou biblioteca como `react-query`:
```javascript
const cacheKey = `movies_${query}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
    const data = JSON.parse(cached);
    // Verificar se cache não expirou (ex: 5 minutos)
    if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data.results;
    }
}
```

---

## 🟠 **ACESSIBILIDADE**

### 19. **Atributos ARIA**
**Problema:** Componentes sem atributos de acessibilidade.

**Onde:** Todos os componentes

**Solução:**
```jsx
// Spinner.jsx
<div role="status" aria-live="polite" aria-label="Carregando filmes">
    {/* ... */}
</div>

// Search.jsx
<input 
    type='text'
    placeholder='Search through thousands of movies'
    aria-label="Campo de busca de filmes"
    aria-required="false"
/>

// Trending section
<section aria-label="Filmes em destaque">
    <h2>Trending Movies</h2>
    {/* ... */}
</section>
```

---

### 20. **Navegação por Teclado**
**Problema:** Cards de filmes não são focáveis por teclado.

**Solução:**
```jsx
<div 
    className='movie-card'
    tabIndex={0}
    role="button"
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
        }
    }}
>
```

---

## 📝 **OUTRAS MELHORIAS**

### 21. **Validação do Formato de URL do Proxy**
**Onde:** `api/tmdb.js`

**Solução:**
```javascript
export default async function handler(req, res) {
    try {
        const { path = "/discover/movie", search = "" } = req.query || {};
        
        // Validar path para prevenir path traversal
        if (!path.startsWith('/') || path.includes('..')) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        // ... resto do código ...
    }
}
```

---

### 22. **Rate Limiting (Futuro)**
**Problema:** Muitas requisições podem exceder limites da API.

**Solução:** Implementar rate limiting no proxy usando biblioteca ou middleware.

---

### 23. **Testes**
**Problema:** Nenhum teste automatizado.

**Solução:** Adicionar Vitest + React Testing Library:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

### 24. **Error Boundary**
**Problema:** Erros não tratados quebram a aplicação inteira.

**Solução:** Criar componente `ErrorBoundary`:
```jsx
class ErrorBoundary extends React.Component {
    state = { hasError: false };
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    render() {
        if (this.state.hasError) {
            return <h1>Algo deu errado. Por favor, recarregue a página.</h1>;
        }
        return this.props.children;
    }
}
```

---

### 25. **Documentação de Componentes**
**Problema:** Componentes sem documentação.

**Solução:** Adicionar JSDoc:
```javascript
/**
 * Componente que exibe um card de filme
 * @param {Object} movie - Objeto com dados do filme
 * @param {string} movie.title - Título do filme
 * @param {number} movie.vote_average - Nota média
 * @param {string} movie.poster_path - Caminho do poster
 */
```

---

## 📊 **PRIORIZAÇÃO RECOMENDADA**

1. **Semana 1:** Itens 🔴 (Críticos)
2. **Semana 2:** Itens 🟡 (Importantes) + Melhorias de UX básicas
3. **Semana 3:** Melhorias de código (hooks, constantes, memoização)
4. **Semana 4:** Performance e acessibilidade
5. **Futuro:** Testes, TypeScript, documentação completa

---

## 🎓 **CONCEITOS QUE VOCÊ APRENDERÁ**

- **Error Handling:** Como tratar erros adequadamente
- **Loading States:** Feedback visual para o usuário
- **Separation of Concerns:** Organizar código em camadas
- **Acessibilidade:** Tornar apps utilizáveis por todos
- **Performance:** Otimizações básicas
- **Segurança:** HTTPS, validação, sanitização
- **UX:** Melhorar experiência do usuário

---

**Quer que eu implemente alguma dessas melhorias agora?** Apenas me diga qual priorizar! 🚀

