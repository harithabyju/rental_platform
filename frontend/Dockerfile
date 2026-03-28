FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# (Optional) Add custom nginx.conf here if needed for React Router
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]