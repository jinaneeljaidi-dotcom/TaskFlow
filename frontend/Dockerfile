# Serves the Vanilla JS frontend as static files using nginx

# Use lightweight nginx alpine image
FROM nginx:alpine

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy all frontend static files into nginx's serving directory
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80
