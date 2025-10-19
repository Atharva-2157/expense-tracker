# Stage 1: Build React app
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy React build
COPY --from=build /app/dist .

# Copy nginx config and entrypoint
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint to replace env variables and start Nginx
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
