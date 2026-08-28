output "bucket_name" {
  value = aws_s3_bucket.example_bucket.id
  description = "Name of the S3 bucket"
}

output "table_name" {
  value = aws_dynamodb_table.example_table.name
}
