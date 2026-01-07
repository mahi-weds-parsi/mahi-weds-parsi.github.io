FROM nginx:1.25-alpine

# Serve the static site from the default Nginx web root.
COPY . /usr/share/nginx/html
