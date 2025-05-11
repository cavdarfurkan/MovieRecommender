# Movie Recommender

`podman build -t movie-recommender .`

`podman run --replace -d --name movie-recommender -p 8000:8000 -p 3000:3000 movie-recommender`

A personalized movie recommendation application built with collaborative filtering (SVD++) that allows users to discover new movies and rate suggestions to refine future predictions.

---

## Table of Contents

* [Features](#features)
* [Technology Stack](#technology-stack)
* [Dataset](#dataset)
* [Prerequisites](#prerequisites)
* [Installation](#installation)

  * [Backend Setup](#backend-setup)
  * [Model Training](#model-training)
  * [Frontend Setup](#frontend-setup)
* [Usage](#usage)
* [API Endpoints](#api-endpoints)
* [Contributing](#contributing)
* [Links](#links)

---

## Features

* **Personalized Recommendations:** Top‑N movie suggestions per user, refined by explicit ratings.
* **Genre Filtering:** Fetch recommendations within a specific genre.
* **User Ratings:** Users can rate movies (1–5) to improve model accuracy.
* **Cold‑Start Handling:** Scheduled retraining to incorporate new ratings and users.

---

## Technology Stack

### Model Training

* **Language & Libraries:** Python, [Surprise](https://surprise.readthedocs.io/en/stable/) (SVD++, KNN, etc.)
* **Environment:** Jupyter Notebook

### Backend

* **Framework:** FastAPI (Python)
* **Database:** SQLite (initial data load via script)
* **Scheduling:** Cron job for periodic retraining

### Frontend

* **Framework:** Next.js (React, TypeScript)
* **Authentication:** NextAuth.js
* **ORM:** Prisma

---

## Dataset

1. **MovieLens 100K** (100,000 ratings | 943 users | 1682 movies)

   * Files: `u.data`, `u.item`, `u.genre`, `u.user`
2. **MovieLens Posters** (complements posters & IMDb URLs)

---

## Prerequisites

* **Backend:** Python 3.9 or higher
* **Frontend:** Node.js 14 or higher

---

## Installation

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/cavdarfurkan/MovieRecommender.git
   cd MovieRecommender/backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Ensure the trained model file (`svdpp_model.pkl`) is in the backend directory.
4. Start FastAPI server (default port 8000):

   ```bash
   uvicorn main:app --reload
   ```

5. (First run) Automatic data import will populate the SQLite database.
6. (Optional) Set up cron job to retrain model periodically:

   ```bash
   # Example crontab entry (daily at 2 AM)
   0 2 * * * cd /path/to/backend && ./retrain_model.sh
   ```

### Model Training

1. Navigate to the `model_training` directory.
2. Open `train_model.ipynb` in Jupyter:

   ```bash
   jupyter notebook train_model.ipynb
   ```

3. Run all cells to train SVD++ on the MovieLens 100K dataset.
4. Export the trained model to `svdpp_model.pkl` for backend serving.

### Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Import initial users (MovieLens 100K → Auth database):

   ```bash
   npm run import:users
   ```

4. Start development server (default port 3000):

   ```bash
   npm run dev
   ```

---

## Usage

1. Register or log in using one of the seeded users (IDs 1–943):

   * **Email:** `user{ID}@example.com`
   * **Password:** `123123123`
2. Browse dashboard, view recommendations, and rate movies.
3. Your ratings will be used for the next scheduled retraining.

---

## API Endpoints

FastAPI automatically generates interactive docs at `http://localhost:8000/docs`.

* **GET** `/recommendations/{user_id}`

  * Returns top 10 (default) movie recommendations for `user_id`.
  * Optional query: `?top_n=5` to limit results.

* **GET** `/recommendations/genre/{genre_id}`

  * Returns top N recommendations filtered by `genre_id`.

* **CRUD** endpoints available for users, movies, and ratings under `/users`, `/movies`, `/ratings`.

---

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request with:

* Bug fixes
* Feature enhancements
* Documentation improvements

---

## Links

* **GitHub Repository:** [https://github.com/cavdarfurkan/MovieRecommender](https://github.com/cavdarfurkan/MovieRecommender)
* **MovieLens 100K Dataset:** [https://grouplens.org/datasets/movielens/100k/](https://grouplens.org/datasets/movielens/100k/)
* **MovieLens Posters:** [https://github.com/babu-thomas/movielens-posters](https://github.com/babu-thomas/movielens-posters)
* **Surprise Documentation:** [https://surprise.readthedocs.io/en/stable/](https://surprise.readthedocs.io/en/stable/)
