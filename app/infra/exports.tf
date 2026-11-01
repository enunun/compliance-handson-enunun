# メモのエクスポートの置き場所．共有のリンクで誰でも取得できるようにする．
resource "aws_s3_bucket" "exports" {
  bucket = "app-exports"
}

resource "aws_s3_bucket_policy" "exports_public_read" {
  bucket = aws_s3_bucket.exports.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.exports.arn}/*"
    }]
  })
}
