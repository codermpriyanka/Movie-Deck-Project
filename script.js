const api_key = "f531333d637d0c44abc85b3e74db2186";
const api = `https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&page=`;
let currentPage = 1;
let currentMovieData = [];
let sortByDateMovieData = "";
let sortByRateMovieData = "";
let favoriteMovies = new Set();
let isSortByDate = false;
let isSortByRate = false;
let showingFavorites = false;

const prv = document.getElementById("prvBtn");
const next = document.getElementById("nextBtn");
const sortByDate = document.getElementById("sortBydate");
const sortByRate = document.getElementById("sortByRate");
const movieListningTag = document.querySelector(".movieList");
const searchInput = document.querySelector(".movieSearch input");
const showFavoritesBtn = document.getElementById("showFavorites");
const showAllBtn = document.getElementById("showAll");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredMovies = currentMovieData.filter((movie) =>
    movie.title.toLowerCase().includes(searchText)
  );
  updateMoviePage(filteredMovies);
});

showFavoritesBtn.addEventListener("click", () => {
  showingFavorites = true;
  const favoriteMoviesArray = currentMovieData.filter((movie) =>
    favoriteMovies.has(movie.id)
  );
  updateMoviePage(favoriteMoviesArray);
});

showAllBtn.addEventListener("click", () => {
  showingFavorites = false;
  updateMoviePage(currentMovieData);
});

sortByRate.addEventListener("click", () => {
  if (isSortByRate) {
    isSortByDate = false;
    isSortByRate = false;
    updateMoviePage(currentMovieData);
    return;
  }
  isSortByDate = false;
  isSortByRate = true;
  if (!sortByRateMovieData) {
    sortByRateMovieData = SortMovieHandler([...currentMovieData], "rating");
  }
  updateMoviePage(sortByRateMovieData);
});

sortByDate.addEventListener("click", () => {
  if (isSortByDate) {
    isSortByDate = false;
    isSortByRate = false;
    updateMoviePage(currentMovieData);
    return;
  }
  isSortByDate = true;
  isSortByRate = false;
  if (!sortByDateMovieData) {
    sortByDateMovieData = SortMovieHandler([...currentMovieData], "date");
  }
  updateMoviePage(sortByDateMovieData);
});

prv.addEventListener("click", () => {
  if (currentPage === 1) {
    return;
  }
  currentPage--;
  getPaginationMovieDate(currentPage);
});

next.addEventListener("click", () => {
  if (currentPage === 3) {
    return;
  }
  currentPage++;
  getPaginationMovieDate(currentPage);
});

function updateMoviePage(movieArray) {
  const movieListCard = document.getElementById("movieListCard");

  while (movieListCard.firstChild) {
    movieListCard.firstChild.remove();
  }

  for (let { id, title, vote_count, vote_average, poster_path } of movieArray) {
    const div = document.createElement("div");
    div.innerHTML = `<div class="card">
                      <img src="https://image.tmdb.org/t/p/original/${poster_path}" alt="${title}">
                      <div class="detail">
                        <div class="movieDetales">
                          <span>${title}</span>
                          <div class="voterate">
                            <span>${vote_count}</span>
                            <span>${vote_average}</span>
                          </div>
                        </div>
                        <span class="icon" data-id="${id}">
                          ${favoriteMovies.has(id) ? "❤️" : "🤍"}
                        </span>
                      </div>
                    </div>`;
    movieListCard.appendChild(div);
  }

  // Add event listeners to heart icons
  const icons = document.querySelectorAll(".icon");
  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const movieId = Number(e.target.dataset.id);
      if (favoriteMovies.has(movieId)) {
        favoriteMovies.delete(movieId);
        e.target.textContent = "🤍";
      } else {
        favoriteMovies.add(movieId);
        e.target.textContent = "❤️";
      }
      // Update the page if we're viewing favorites
      if (showingFavorites) {
        const favoriteMoviesArray = currentMovieData.filter((movie) =>
          favoriteMovies.has(movie.id)
        );
        updateMoviePage(favoriteMoviesArray);
      }
    });
  });
}

async function getPaginationMovieDate(page) {
  resetPageHandler();
  movieListningTag.innerHTML = "";
  const response = await fetch(`${api}${page}`);
  const movieData = await response.json();
  currentMovieData = movieData.results;
  updateMoviePage(movieData.results);
}

function resetPageHandler() {
  sortByDateMovieData = "";
  sortByRateMovieData = "";
  isSortByDate = false;
  isSortByRate = false;
}

function SortMovieHandler(MovieArr, sortBy) {
  let sortingKey = "";

  if (sortBy === "date") {
    sortingKey = "release_date";
    MovieArr.sort((movObjA, movObjB) => {
      movObjA.epochTime = new Date(movObjA[sortingKey]);
      movObjB.epochTime = new Date(movObjB[sortingKey]);
      return movObjA.epochTime - movObjB.epochTime;
    });
    return MovieArr;
  } else if (sortBy === "rating") {
    sortingKey = "vote_average";
  }
  MovieArr.sort(
    (movObjA, movObjB) => movObjA[sortingKey] - movObjB[sortingKey]
  );
  return MovieArr;
}

getPaginationMovieDate(currentPage);
