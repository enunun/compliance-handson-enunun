// Package mail は，メール配信サービスでメールを送る．
package mail

// Client はメール配信サービスのクライアントである．
type Client struct {
	apiKey string
}

// NewDefault は，チームで共有しているAPIキーでクライアントを作る．
func NewDefault() *Client {
	return &Client{apiKey: "mk_9f2c7a41e8b35d06c1f4a7e92b8d3c5f"}
}
