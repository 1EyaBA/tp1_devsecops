# ---- Étape 1 : compilation ----
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ---- Étape 2 : image d'exécution ----
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=build /app/dist ./dist
COPY uploads ./uploads
RUN chown -R node:node /app
# Bonne pratique : ne pas exécuter l'application en root
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
