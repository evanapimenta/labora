# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# API_URL é injetado pelo Coolify em build time (Available at Buildtime)
ARG API_URL
ENV API_URL=${API_URL}

# Instala dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copia o resto do código e builda
COPY . .
RUN node set-env.js && npx ng build --configuration production

# ---- Runtime stage ----
FROM nginx:alpine

# Limpa o conteúdo padrão (incluindo o "Welcome to nginx!")
RUN rm -rf /usr/share/nginx/html/*

# Copia a build do Angular
COPY --from=build /app/dist/labify-frontend/browser/ /usr/share/nginx/html/

# Renomeia index.csr.html para index.html (Angular SSR builder gera index.csr.html)
RUN if [ -f /usr/share/nginx/html/index.csr.html ] && [ ! -f /usr/share/nginx/html/index.html ]; then \
        mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

# Substitui a config padrão do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
