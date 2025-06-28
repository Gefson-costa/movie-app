import React from 'react'

const MovieCard = ({ movie: { title, vote_average, release_date, poster_path,
    original_language
} }) => {
    return (
        <div className='movie-card'>
            <img src={poster_path ? `http://image.tmdb.org/t/p/w500${poster_path}` : `/no-movie.png`}
                alt="" />
        </div>
    )
}

export default MovieCard
