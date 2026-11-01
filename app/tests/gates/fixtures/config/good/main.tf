resource "aws_kms_key" "storage" {
  enable_key_rotation = true
}

resource "aws_s3_bucket" "shared" {
  bucket = "shared"
}

resource "aws_s3_bucket_public_access_block" "shared" {
  bucket                  = aws_s3_bucket.shared.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "shared" {
  bucket = aws_s3_bucket.shared.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.storage.arn
    }
  }
}
