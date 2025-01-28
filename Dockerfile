FROM python:3.12

RUN apt-get update && \
    apt-get install -y curl cron supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

WORKDIR /app

COPY backend /app/backend
COPY frontend/app /app/frontend

RUN pip install --no-cache-dir -r backend/requirements.txt

RUN cd frontend && \
    npm install && \
    npx prisma generate && \
    npx prisma db push && \
    npm run build && \
    cd ..

RUN chmod +x backend/cron/train.sh

# Set up cron job
COPY backend/cron/train_cronfile /etc/cron.d/train_cronfile
RUN chmod 0644 /etc/cron.d/train_cronfile
RUN crontab /etc/cron.d/train_cronfile
RUN touch /var/log/train_cronfile.log

# Set up supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000 3000

CMD ["/usr/bin/supervisord"]