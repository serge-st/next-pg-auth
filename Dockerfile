FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9.7.1 && pnpm install

COPY . .

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

RUN pnpm prisma:generate && pnpm build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", " pnpm db:setup && pnpm start"]
