"""
Util functions for predictions
"""

import sys
import os

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

import database as db

def predict_for_user(model, user_id: int, movie_id: int):
    """Get the recommendations for a use"""

    prediction = model.predict(user_id, movie_id)
    return prediction

def predict_top_n_for_user(model, user_id: int, top_n: int):
    """Get the top N recommendations for a user"""

    all_unrated_movies = db.get_unrated_movies_by_user(user_id)

    predictions = [model.predict(user_id, movie.movie_id) for movie in all_unrated_movies]

    sorted_predictions = sorted(predictions, key=lambda x: x.est, reverse=True)
    
    top_n_recommendations = sorted_predictions[:top_n]

    return top_n_recommendations


def predict_top_n_for_all_users(model):
    """Get the top N recommendations for all users"""

    # all_user_recs = model.recommend_for_all_users(10)
    # return all_user_recs
    return None