import Search from "./components/Search";




function App() {

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <img src="./hero.png" alt="Hero Banner" />
        <header>
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        </header>

        <Search />
      </div>

    </main>
  )
}


export default App;