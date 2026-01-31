import os

# Gunicorn configuration file
# https://docs.gunicorn.org/en/stable/configure.html#configuration-file

# The socket to bind
# Render sets the PORT environment variable
port = os.environ.get('PORT', '10000')
bind = f'0.0.0.0:{port}'

# Worker processes
workers = 2  # Adjust based on instance size
threads = 4
timeout = 120
