# ---- Étape 1 : build Vite ----
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps : conflit express 4 (react-scripts) / express 5 (@nestjs/serve-static), voir SCA 4.4
RUN npm ci --legacy-peer-deps
COPY . .
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npx vite build

# ---- Étape 2 : serveur web statique ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
