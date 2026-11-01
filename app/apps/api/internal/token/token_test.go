package token_test

import (
	"strings"
	"testing"
	"time"

	"github.com/enunun/compliance-handson/app/apps/api/internal/token"
)

func TestSignReturnsJWT(t *testing.T) {
	got, err := token.Sign([]byte("secret"), "notes/1.txt", time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Count(got, ".") != 2 {
		t.Fatalf("not a JWT: %s", got)
	}
}
