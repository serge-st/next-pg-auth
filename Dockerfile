FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

ARG POSTGRES_PASSWORD
ARG POSTGRES_USER
ARG POSTGRES_DB
ARG JWT_ACCESS_SECRET
ARG JWT_REFRESH_SECRET
ARG ADMIN_PASSWORD
ARG ADMIN_EMAIL
ARG NEXT_PUBLIC_URL
ARG DATABASE_URL

ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
ENV JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV ADMIN_EMAIL=${ADMIN_EMAIL}
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm tsx env-check.ts 

# RUN pnpm build2

# EXPOSE 3000

ENV NODE_ENV=production

CMD ["sleep", "infinity"]
