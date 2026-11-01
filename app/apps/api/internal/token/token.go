// Package token は，外部のファイル配信サービスに渡す署名つきのトークンを作る．
// トークンを検証するのは配信サービスで，このAPIは署名だけを行う．
package token

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Sign は，subjectのファイルを ttl の間だけ取得できるトークンを作る．
func Sign(secret []byte, subject string, ttl time.Duration) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   subject,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}
