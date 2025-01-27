# Movie Recommender Backend

## Setting Up a Cron Job for Periodic Model Training

Setting up a cron job to periodically train a model is essential for addressing cold start recommendation problems. These problems occur when a recommendation system needs to make predictions for new users or items with little to no historical data. Regularly training the model helps to incorporate new data and improve the accuracy of recommendations.

### Example Cron Schedule

`*/5 * * * * ./train_cron.sh`
