"""
Database module for the movie rating application.
"""

import os
import csv
from typing import Union, Optional
from sqlalchemy import CheckConstraint, Integer, text
from sqlmodel import Field, Column, SQLModel, create_engine, Session, select, func


class Movie(SQLModel, table=True):
    """
    Represents a movie record in the database, with unique ID and various details.

    Attributes:
        id (int | None): The primary key for the movie table.
        movie_id (int): A unique identifier for the movie, typically from an external source.
        movie_title (str): The title of the movie.
        release_date (Optional[str]): The movie release date, if provided.
        genres (Union[str, None]): A comma-separated string of genres for the movie.
        url (Optional[str]): A reference URL for additional movie information.
        poster_url (Optional[str]): A URL pointing to the movie’s poster image.
    """
    id: int | None = Field(default=None, primary_key=True)
    movie_id: int = Field(sa_column_kwargs={"unique": True})
    movie_title: str
    release_date: Optional[str]
    genres: Union[str, None]
    url: Optional[str]
    poster_url: Optional[str]


class Rating(SQLModel, table=True):
    """
    Represents a rating for a movie by a specific user.

    Attributes:
        id (int | None): The primary key of the rating record.
        user_id (int): The ID of the user who provided the rating.
        movie_id (int): The ID of the movie being rated.
        rating (int): The numerical rating value, constrained between 1 and 5.
        timestamp (Optional[str]): The Unix timestamp indicating when the rating was created or last updated.
    """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int
    movie_id: int
    rating: int = Field(sa_column=Column(Integer, nullable=False))
    timestamp: Optional[str] = Field(
        sa_column=Column(Integer, server_default=text("(strftime('%s','now'))"), nullable=False))

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating'),
    )


class User(SQLModel, table=True):
    """
    Represents a user in the database.

    Attributes:
        id (int | None): The primary key for the user table.
        user_id (int): A unique identifier for the user.
    """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column_kwargs={"unique": True})


class Watched(SQLModel, table=True):
    """
    Represents a watched movie by a specific user.

    Attributes:
        id (int | None): The primary key of the watched record.
        user_id (int): The ID of the user who watched the movie.
        movie_id (int): The ID of the movie being watched.
        timestamp (Optional[str]): The Unix timestamp indicating when the movie was watched.
    """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int
    movie_id: int
    rating_id: Optional[int]


os.makedirs("db", exist_ok=True)
sqlite_file_name = "db/database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(f"sqlite:///{sqlite_file_name}")


def create_db_and_tables():
    """
    Create the database tables and populate initial data.

    This function will:
        1. Create all the tables defined in the SQLModel metadata.
        2. Populate the 'movies' table with seed data.
        3. Populate the 'ratings' table with initial rating entries.

    Raises:
        Any exceptions related to database creation or data population.
    """
    SQLModel.metadata.create_all(engine)
    populate_movies()
    populate_ratings()
    populate_users()


def populate_movies():
    """
    Populates the database with movie records.

    This function first checks if there are any existing movies in the database.
    If no records exist, it reads genre, URL, and poster data from specified files,
    combines them with movie entries from the "u.item" file, and creates Movie
    objects. The function maps each movie to its respective genres, IMDb URL, and
    poster URL (or a placeholder if not available), then commits all new records
    to the database.

    Returns:
        None: The function commits records to the database but does not return a value.
    """
    if count(Movie):
        return

    with open("data/u.genre", encoding="ISO-8859-1") as genre_file:
        genre_mapping = {}
        for line in genre_file:
            if line.strip():
                genre, index = line.strip().split('|')
                genre_mapping[index] = genre

    with open("data/movie_url.csv", newline='', encoding='utf-8') as url_file:
        reader = csv.reader(url_file)
        movie_urls = {int(row[0]): row[1] for row in reader}

    with open("data/movie_poster.csv", newline='', encoding='utf-8') as poster_file:
        reader = csv.reader(poster_file)
        movie_posters = {int(row[0]): row[1] for row in reader}

    with open("data/u.item", encoding="ISO-8859-1") as f:
        movies = []
        for line in f:
            movie_id, movie_title, release_date, video_release_date, imdb_url, * \
                genres = line.split("|")
            genres = [genre_mapping[str(index)] for index, genre in enumerate(
                genres) if genre == '1']
            genres = "|".join(genres)

            url = movie_urls.get(int(movie_id), None)
            poster = movie_posters.get(
                int(movie_id), "https://placehold.jp/500x750.png")

            movie = Movie(movie_id=movie_id, movie_title=movie_title,
                          release_date=release_date, genres=genres, url=url, poster_url=poster)
            movies.append(movie)

    with Session(engine) as session:
        for movie in movies:
            session.add(movie)
        session.commit()


def populate_ratings():
    """
    Populate the Rating table in the database from the 'data/u.data' file.

    This function checks if there are existing ratings in the database. If the Rating table
    is empty, it reads ratings from the 'data/u.data' file, parses each line to create
    Rating objects, and adds them to the database session before committing the changes.
    """
    if count(Rating):
        return

    with open("data/u.data") as f:
        ratings = []
        for line in f:
            user_id, movie_id, rating, timestamp = line.split("\t")
            rating = Rating(user_id=user_id, movie_id=movie_id,
                            rating=rating, timestamp=timestamp)
            ratings.append(rating)

    with Session(engine) as session:
        for rating in ratings:
            session.add(rating)
        session.commit()


def populate_users():
    """
    Populate the User table in the database with user data from the 'data/u.user' file.

    This function checks if there are existing users in the database. If not, it reads
    the user data file, parses each line to extract the user ID, creates a User object
    for each user, and adds them to the database session. Finally, it commits the session
    to save the users to the database.
    """
    if count(User):
        return

    with open("data/u.user") as f:
        users = []
        for line in f:
            user_id = line.split("|")[0]
            user = User(user_id=user_id)
            users.append(user)

    with Session(engine) as session:
        for user in users:
            session.add(user)
        session.commit()


def count(table: type[SQLModel]) -> bool:
    """
    Count the number of records in the specified table.

    Args:
        table (SQLModel): The table class to count records from.

    Returns:
        bool: True if the table has records, False otherwise.
    """
    with Session(engine) as session:
        statement = select(func.count(table.id))
        count = session.exec(statement).one()
        print(table.__name__, count)
        return count > 0


############################################
# Movie CRUD
############################################

def create_movie(movie: Movie):
    """
    Create a new movie record in the database.

    Args:
        movie (Movie): The movie object to be added to the database.

    Returns:
        Movie: The newly created movie object with updated information.
    """
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)
        return movie


def get_movie(movie_id: int) -> Optional[Movie]:
    """
    Retrieve a movie by its ID.

    Args:
        movie_id (int): The ID of the movie to retrieve.

    Returns:
        Optional[Movie]: The movie object if found, otherwise None.
    """
    with Session(engine) as session:
        return session.get(Movie, movie_id)


def get_movies(skip: int = 0, limit: int = 100) -> list[Movie]:
    """
    Retrieve a list of movies from the database.

    Args:
        skip (int, optional): The number of records to skip. Defaults to 0.
        limit (int, optional): The maximum number of records to return. Defaults to 100. if -1, returns all.

    Returns:
        List[Movie]: A list of Movie instances.
    """
    with Session(engine) as session:
        statement = select(Movie)

        if limit == -1:
            return session.exec(statement).all()

        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()


def get_unrated_movies_by_user(user_id: int):
    """
    Retrieve a list of movies that a user has not rated.

    Args:
        user_id (int): The ID of the user.

    Returns:
        list[Movie]: A list of Movie instances that the user has not rated.
    """
    with Session(engine) as session:
        statement = select(Movie).where(~Movie.id.in_(
            select(Rating.movie_id).where(Rating.user_id == user_id)))
        return session.exec(statement).all()


def update_movie(movie_id: int, new_data: dict) -> Optional[Movie]:
    """
    Updates the attributes of a movie with the specified movie ID.

    Args:
        movie_id (int): The unique identifier of the movie to update.
        new_data (dict): A dictionary containing the fields to update and their new values.

    Returns:
        Optional[Movie]: The updated Movie object if the update was successful, otherwise None.
    """
    with Session(engine) as session:
        movie = session.get(Movie, movie_id)
        if not movie:
            return None
        for key, value in new_data.items():
            setattr(movie, key, value)
        session.commit()
        session.refresh(movie)
        return movie


def delete_movie(movie_id: int) -> bool:
    """
    Deletes a movie from the database based on the provided movie ID.

    Args:
        movie_id (int): The unique identifier of the movie to be deleted.

    Returns:
        bool: True if the movie was successfully deleted, False if the movie does not exist.
    """
    with Session(engine) as session:
        movie = session.get(Movie, movie_id)
        if not movie:
            return False
        session.delete(movie)
        session.commit()
        return True


############################################
# Rating CRUD
############################################

def create_rating(rating: Rating):
    """
    Creates and adds a Rating to the database.

    Args:
        rating (Rating): The Rating object to add.

    Returns:
        Rating: The added Rating object with updated information.
    """
    with Session(engine) as session:
        session.add(rating)
        session.commit()
        session.refresh(rating)
        return rating


def get_rating(rating_id: int) -> Optional[Rating]:
    """
    Retrieve a Rating object by its ID.

    Args:
        rating_id (int): The ID of the rating to retrieve.

    Returns:
        Optional[Rating]: The Rating object if found, else None.
    """
    with Session(engine) as session:
        return session.get(Rating, rating_id)


def get_ratings(skip: int = 0, limit: int = 100) -> list[Rating]:
    """
    Retrieve a list of ratings from the database.

    Parameters:
        skip (int): The number of records to skip. Defaults to 0.
        limit (int): The maximum number of records to return. Defaults to 100.

    Returns:
        list[Rating]: A list of Rating objects.
    """
    with Session(engine) as session:
        statement = select(Rating).offset(skip).limit(limit)
        return session.exec(statement).all()


def update_rating(rating_id: int, new_data: dict) -> Optional[Rating]:
    """Update the rating with the specified rating_id using the provided new_data.

    Args:
        rating_id (int): The ID of the rating to update.
        new_data (dict): A dictionary containing the fields to update and their new values.

    Returns:
        Optional[Rating]: The updated Rating object if the update is successful, or None if the rating is not found.
    """
    with Session(engine) as session:
        rating = session.get(Rating, rating_id)
        if not rating:
            return None
        for key, value in new_data.items():
            setattr(rating, key, value)
        session.commit()
        session.refresh(rating)
        return rating


def delete_rating(rating_id: int) -> bool:
    """
    Deletes a rating from the database.

    Args:
        rating_id (int): The ID of the rating to delete.

    Returns:
        bool: True if the deletion was successful, False otherwise.
    """
    with Session(engine) as session:
        rating = session.get(Rating, rating_id)
        if not rating:
            return False
        session.delete(rating)
        session.commit()
        return True


############################################
# User CRUD
############################################

def create_user(user: User) -> User:
    """
    Creates a new user in the database.

    Args:
        user (User): The User object to add.

    Returns:
        User: The created User object.
    """
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def get_user(user_id: int) -> Optional[User]:
    """
    Retrieves a user from the database by ID.

    Args:
        user_id (int): The ID of the user to retrieve.

    Returns:
        Optional[User]: The User object if found, else None.
    """
    with Session(engine) as session:
        return session.get(User, user_id)


def update_user(user_id: int, update_data: dict) -> Optional[User]:
    """
    Updates an existing user in the database.

    Args:
        user_id (int): The ID of the user to update.
        update_data (dict): A dictionary containing updated user information.

    Returns:
        Optional[User]: The updated User object if successful, else None.
    """
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return None
        for key, value in update_data.items():
            setattr(user, key, value)
        session.commit()
        session.refresh(user)
        return user


def delete_user(user_id: int) -> bool:
    """
    Deletes a user from the database.

    Args:
        user_id (int): The ID of the user to delete.

    Returns:
        bool: True if the deletion was successful, False otherwise.
    """
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return False
        session.delete(user)
        session.commit()
        return True

############################################
# Watched CRUD
############################################


def create_watched(watched: Watched) -> Watched:
    """
    Creates a new watched entry in the database.

    Args:
        watched (Watched): The Watched object to add.

    Returns:
        Watched: The created Watched object.
    """
    with Session(engine) as session:
        session.add(watched)
        session.commit()
        session.refresh(watched)
        return watched


def get_watched(watched_id: int) -> Optional[Watched]:
    """
    Retrieves a watched entry from the database by ID.

    Args:
        watched_id (int): The ID of the watched entry to retrieve.

    Returns:
        Optional[Watched]: The Watched object if found, else None.
    """
    with Session(engine) as session:
        return session.get(Watched, watched_id)


def update_watched(watched_id: int, update_data: dict) -> Optional[Watched]:
    """
    Updates an existing watched entry in the database.

    Args:
        watched_id (int): The ID of the watched entry to update.
        update_data (dict): A dictionary containing updated watched information.

    Returns:
        Optional[Watched]: The updated Watched object if successful, else None.
    """
    with Session(engine) as session:
        watched = session.get(Watched, watched_id)
        if not watched:
            return None
        for key, value in update_data.items():
            setattr(watched, key, value)
        session.commit()
        session.refresh(watched)
        return watched


def delete_watched(watched_id: int) -> bool:
    """
    Deletes a watched entry from the database.

    Args:
        watched_id (int): The ID of the watched entry to delete.

    Returns:
        bool: True if the deletion was successful, False otherwise.
    """
    with Session(engine) as session:
        watched = session.get(Watched, watched_id)
        if not watched:
            return False
        session.delete(watched)
        session.commit()
        return True
