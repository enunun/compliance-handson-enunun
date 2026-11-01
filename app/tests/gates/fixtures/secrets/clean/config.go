package config

import "os"

// 決済サービスのAPIキーは，環境変数から読む．
var paymentAPIKey = os.Getenv("PAYMENT_API_KEY")
