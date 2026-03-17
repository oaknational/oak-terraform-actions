resource "aws_vpc" "InvalidVpcName" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_subnet" "BadSubnetName" {
  vpc_id            = aws_vpc.InvalidVpcName.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

variable "EnvironmentName" {
  type = string
  default = "prod"
}
