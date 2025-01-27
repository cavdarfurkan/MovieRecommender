import pandas as pd
from sqlalchemy import create_engine


DATABASE_URI = 'sqlite:///../app/db/database.db'
engine = create_engine(DATABASE_URI)


df = pd.read_sql('SELECT * FROM rating', engine)

# Export to CSV
df.to_csv('./rating_export.csv', index=False, header=False)