FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
# 社内のモジュールのプロキシを使うときは，--build-arg GOPROXY=... で渡す．
ARG GOPROXY
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

FROM alpine:3.20
COPY --from=build /out/api /usr/local/bin/api
EXPOSE 8080
CMD ["api"]
