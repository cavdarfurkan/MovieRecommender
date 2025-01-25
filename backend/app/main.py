"""
This module implements a FastAPI application for a movie recommender system.
Movie Recommender API
"""

import pickle
from contextlib import asynccontextmanager
from typing import Union, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import database as db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles the application lifespan events for the FastAPI app.

    This asynchronous function is responsible for loading the machine learning model
    from a pickle file and initializing the database with the required tables when the
    application starts. It manages the global `model` variable and ensures that resources
    are properly initialized before the application begins handling requests.

    Yields:
        None

    Raises:
        Exception: If there is an error loading the model or initializing the database.
    """
    global model

    try:
        with open("model.pkl", "rb") as f:
            model = pickle.load(f)
        print("Model loaded")

        db.create_db_and_tables()
        print("Database created")

        yield
    except Exception as e:
        print("Error loading model", e)


class PredictionRequest(BaseModel):
    """
    PredictionRequest represents a request for movie prediction containing the following fields:

    Attributes:
        user_id (int): The ID of the user.
        movie_id (int): The ID of the movie.
    """
    user_id: int
    movie_id: int


class SaveMovieRequest(BaseModel):
    """
    SaveMovieRequest is a Pydantic model for handling movie save requests.

    Attributes:
        movie_id (int): The unique identifier for the movie.
        movie_title (str): The title of the movie.
        release_date (Optional[str]): The release date of the movie, if available.
        genres (Union[str, None]): The genres of the movie, if available.
        url (Optional[str]): The URL for more information about the movie, if available.
        poster_url (Optional[str]): The URL for the movie's poster image, if available.
    """
    movie_id: int
    movie_title: str
    release_date: Optional[str]
    genres: Union[str, None]
    url: Optional[str]
    poster_url: Optional[str]


class SaveRatingRequest(BaseModel):
    """
    Data model for saving a movie rating.

    Attributes:
        user_id (int): The ID of the user providing the rating.
        movie_id (int): The ID of the movie being rated.
        rating (float): The rating given to the movie by the user.
    """
    user_id: int
    movie_id: int
    rating: float

# class ExportCSVRequest(BaseModel):
    # file_name: str


app = FastAPI(title="Movie Recommender API", version="1.0", lifespan=lifespan)


@app.get("/")
def read_root():
    """
    Handles the root endpoint of the Movie Recommender API.

    Returns:
        dict: A message indicating that the Movie Recommender API is up and running.
    """
    return {"message": "Movie Recommender API is up and running."}


@app.get("/health")
def health():
    """
    Health check endpoint.

    Returns:
        dict: A dictionary containing the status of the service.
    """
    return {"status": "ok"}


@app.post("/predict")
def predict_rating(request: PredictionRequest):
    """
    Predict the rating for a given user and movie.

    Args:
        request (PredictionRequest): The request object containing user_id and movie_id.

    Returns:
        dict: A dictionary containing user_id, movie_id, and the predicted rating.

    Raises:
        HTTPException: If an error occurs during prediction, an HTTP 500 error is raised with the error details.
    """
    try:
        prediction = model.predict(request.user_id, request.movie_id)
        return {
            "user_id": request.user_id,
            "movie_id": request.movie_id,
            "prediction_rating": prediction.est,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


######################
# Movie Endpoints
######################

@app.post("/movies", response_model=db.Movie)
def create_movie(request: SaveMovieRequest):
    """
    Endpoint to create a new movie entry.

    Args:
        request (SaveMovieRequest): The request object containing movie details.

    Returns:
        Movie: The created movie object.

    Raises:
        HTTPException: If an error occurs during movie creation, an HTTP 500 error is raised with the error details.
    """
    try:
        movie = db.Movie(**request.model_dump())
        movie = db.create_movie(movie)
        return movie
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/movies/{movie_id}", response_model=db.Movie)
def read_movie(movie_id: int):
    """
    Retrieve a movie by its ID.

    Args:
        movie_id (int): The ID of the movie to retrieve.

    Returns:
        Movie: The movie object corresponding to the given ID.

    Raises:
        HTTPException: If the movie with the given ID is not found, an HTTP 404 error is raised.
    """
    try:
        movie = db.get_movie(movie_id)
        return movie
    except Exception:
        raise HTTPException(status_code=404, detail="Movie not found")


@app.get("/movies", response_model=list[db.Movie])
def read_movies(skip: int = 0, limit: int = 100):
    """
    Retrieve all movies from the database.

    Returns:
        list[Movie]: A list of all movies in the database.

    Raises:
        HTTPException: If an error occurs during the retrieval process, an HTTP 500 error is raised with the error details.
    """
    try:
        movies = db.get_movies(skip=skip, limit=limit)
        return movies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/movies/{movie_id}", response_model=db.Movie)
def update_movie(movie_id: int, request: SaveMovieRequest):
    """
    Update a movie with the given movie ID using the provided request data.

    Args:
        movie_id (int): The ID of the movie to update.
        request (SaveMovieRequest): The request object containing movie details to update.

    Returns:
        Movie: The updated movie object.

    Raises:
        HTTPException: If an error occurs during the update process.
    """
    try:
        movie = {
            "movie_id": request.movie_id,
            "movie_title": request.movie_title,
            "release_date": request.release_date,
            "genres": request.genres,
            "url": request.url,
            "poster_url": request.poster_url
        }
        movie = db.update_movie(movie_id, movie)
        return movie
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int):
    """
    Deletes a movie from the database based on the provided movie ID.

    Args:
        movie_id (int): The ID of the movie to be deleted.

    Returns:
        dict: A dictionary containing a success message if the movie is deleted successfully.

    Raises:
        HTTPException: If an error occurs during the deletion process, an HTTPException is raised with a status code of 500 and the error details.
    """
    try:
        db.delete_movie(movie_id)
        return {"message": "Movie deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


######################
# Rating Endpoints
######################

@app.post("/ratings", response_model=db.Rating)
def create_rating(request: SaveRatingRequest):
    """
    Endpoint to create a rating for a movie.

    Args:
        request (SaveRatingRequest): The request object containing user_id, movie_id, and rating.

    Returns:
        Rating: The created rating object.

    Raises:
        HTTPException: If an error occurs during the creation of the rating, an HTTP 500 error is raised with the error details.
    """
    try:
        rating = db.Rating(**request.model_dump())
        rating = db.create_rating(rating)
        return rating
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ratings/{rating_id}", response_model=db.Rating)
def read_rating(rating_id: int):
    """
    Retrieve a rating by its ID.

    Args:
        rating_id (int): The ID of the rating to retrieve.

    Returns:
        Rating: The rating object if found.

    Raises:
        HTTPException: If the rating is not found, raises a 404 HTTP exception with the detail "Rating not found".
    """
    try:
        rating = db.get_rating(rating_id)
        return rating
    except Exception:
        raise HTTPException(status_code=404, detail="Rating not found")


@app.get("/ratings", response_model=list[db.Rating])
def read_ratings(skip: int = 0, limit: int = 100):
    """
    Retrieve all ratings from the database.

    Returns:
        list[Rating]: A list of all ratings in the database.

    Raises:
        HTTPException: If an error occurs during the retrieval process, an HTTP 500 error is raised with the error details.
    """
    try:
        ratings = db.get_ratings(skip=skip, limit=limit)
        return ratings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/ratings/{rating_id}", response_model=db.Rating)
def update_rating(rating_id: int, request: SaveRatingRequest):
    """
    Update the rating for a given rating ID.

    Args:
        rating_id (int): The ID of the rating to be updated.
        request (SaveRatingRequest): The request object containing user_id, movie_id, and the new rating value.

    Returns:
        Rating: The updated rating object.

    Raises:
        HTTPException: If an error occurs during the update process, an HTTP 500 error is raised with the error details.
    """
    try:
        rating = {
            "user_id": request.user_id,
            "movie_id": request.movie_id,
            "rating": request.rating
        }
        db.update_rating(rating_id, rating)
        return rating
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/ratings/{rating_id}")
def delete_rating(rating_id: int):
    """
    Deletes a rating with the given rating_id.

    Args:
        rating_id (int): The ID of the rating to be deleted.

    Returns:
        dict: A dictionary containing a success message if the rating is deleted successfully.

    Raises:
        HTTPException: If an error occurs during the deletion process, an HTTPException with status code 500 and the error detail is raised.
    """
    try:
        db.delete_rating(rating_id)
        return {"message": "Rating deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
