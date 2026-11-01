package server

import (
	"crypto/sha1"
	"fmt"
)

func etag(body []byte) string {
	return fmt.Sprintf(`"%x"`, sha1.Sum(body))
}
