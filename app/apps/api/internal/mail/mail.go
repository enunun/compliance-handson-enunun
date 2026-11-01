// Package mail は，メール配信サービスでメールを送る．
package mail

// Client はメール配信サービスのクライアントである．
type Client struct {
	apiKey string
}

// New は，APIキーを受け取ってクライアントを作る．
// APIキーは，起動時に環境変数(MAIL_API_KEY)などから渡す．
func New(apiKey string) *Client {
	return &Client{apiKey: apiKey}
}
