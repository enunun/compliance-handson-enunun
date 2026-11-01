# S3のバケットを暗号化する鍵．鍵は自分たちで管理し，毎年自動で交換する．
resource "aws_kms_key" "storage" {
  description         = "S3のバケットの暗号化"
  enable_key_rotation = true
}
