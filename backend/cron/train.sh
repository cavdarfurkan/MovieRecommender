#!/bin/bash
echo "TRAIN CRON START $(date)" > /var/log/cron.start

python ./export_data.py
python ./train.py

rm rating_export.csv

# Restart the backend server service
supervisorctl restart backend

echo "TRAIN CRON END $(date)" > /var/log/cron.end