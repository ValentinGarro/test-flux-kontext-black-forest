FROM node:20.10.0-alpine
WORKDIR /app

# Declarar ARGs y ENVs
ARG NEXT_PUBLIC_BLACK_FOREST_API_KEY
ENV NEXT_PUBLIC_BLACK_FOREST_API_KEY=${NEXT_PUBLIC_BLACK_FOREST_API_KEY}

ARG NEXT_PUBLIC_GENERETE
ENV NEXT_PUBLIC_GENERETE=${NEXT_PUBLIC_GENERETE}

ARG NEXT_PUBLIC_PROMPT_WEBHOOK
ENV NEXT_PUBLIC_PROMPT_WEBHOOK=${NEXT_PUBLIC_PROMPT_WEBHOOK}

# Copiar solo package.json primero (mejor cache)
COPY package*.json ./
RUN npm install

# Ahora copiar el resto del código
COPY . .

# Build con las variables ya disponibles
RUN npm run build

EXPOSE 6113
CMD ["npm", "start"]
