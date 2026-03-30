resource "aws_s3_bucket" "InvalidName" {
  bucket = "my-test-bucket"
}

resource "aws_dynamodb_table" "AnotherInvalidName" {
  name = "test-table"
}
