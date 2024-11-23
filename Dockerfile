FROM instrumentisto/flutter AS builder
COPY . .
WORKDIR /joguinhos
RUN flutter pub get
RUN flutter build web --release --wasm

FROM nginx:alpine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
COPY --from=builder joguinhos/build/web /usr/share/nginx/html