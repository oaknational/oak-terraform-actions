resource "aws_s3_bucket" "example_bucket" {
  bucket = "my-test-bucket"
}

resource "aws_dynamodb_table" "example_table" {
  name = "test-table"
}
