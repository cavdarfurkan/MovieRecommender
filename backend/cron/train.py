import pickle
import pandas as pd
from surprise import Dataset, Reader, SVDpp
from surprise.model_selection import train_test_split

# Load data
ratings_df = pd.read_csv('./rating_export.csv',
                         names=['user_id', 'movie_id', 'rating'])

reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(
    ratings_df[['user_id', 'movie_id', 'rating']], reader)

# Train
trainset, testset = train_test_split(data, test_size=0.25)
algo = SVDpp(
    n_factors=50,
    n_epochs=20,
    lr_all=0.005,
    reg_all=0.02
)
predictions = algo.fit(trainset).test(testset)

# Save
model_name = "model"
save_path = f"../app/{model_name}"

with open(f"{save_path}.pkl", 'wb') as f:
    pickle.dump(algo, f)

print(f"Model saved to {save_path}")
