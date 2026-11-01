locals {
  # 基準値は ops/standards.yaml にだけ書き，ここではそれを読む．
  standards = yamldecode(file("${path.module}/../ops/standards.yaml"))
}

# 証跡の保管場所．Object Lock(COMPLIANCE)で，保管期間の間は誰も消せない．
resource "aws_s3_bucket" "evidence" {
  bucket              = "app-evidence"
  object_lock_enabled = true
}

resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket                  = aws_s3_bucket.evidence.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.storage.arn
    }
  }
}

resource "aws_s3_bucket_versioning" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_object_lock_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = local.standards.evidence.retention_days
    }
  }
  depends_on = [aws_s3_bucket_versioning.evidence]
}

# 保管期間を過ぎた証跡は消す．
resource "aws_s3_bucket_lifecycle_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  rule {
    id     = "expire-after-retention"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = local.standards.evidence.retention_days + 1
    }
    expiration {
      days = local.standards.evidence.retention_days + 1
    }
  }
}
