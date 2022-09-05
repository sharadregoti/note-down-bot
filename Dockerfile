FROM alpine
RUN apk add --update nodejs yarn
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD ["node", "build/index.js"]