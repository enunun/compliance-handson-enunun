FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
# 社内のモジュールのプロキシを使うときは，--build-arg GOPROXY=... で渡す．
ARG GOPROXY
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

# 実行するのはGoのバイナリだけなので，シェルもパッケージ管理も持たない最小のイメージを使う．
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /usr/local/bin/api
# rootではない利用者(nonroot)で動かす．
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/api"]
