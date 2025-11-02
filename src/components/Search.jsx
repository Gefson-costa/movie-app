/* eslint-disable no-unused-vars */
import React from 'react'

const Search = ({ searchTerm, setSearchTerm }) => {
  const handleClear = () => {
    setSearchTerm('')
  }

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
            onClick={handleClear}
            className="clear-button"
            aria-label="Limpar busca"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default Search
