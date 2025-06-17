variable "region" {
    type = string
    default = "us-east-1"  
}

variable "rds_pg_db_name" {
    default = "dev_lp_pg_db"
    type = string  
}

variable "rds_pg_db_identifier" {
    default = "dev-lp-pg-db"
    type = string  
}

variable "rds_pg_user" {
    default = "dev_lp_pg_db_admin"
    type = string  
}

variable "rds_pg_backup_retention_period" {
    default = 7
    type = number  
}

variable "rds_pg_engine_version" {
    default = "17.2"  
    type = string
}

variable "rds_pg_instance_type" {
    default = "db.t4g.micro" 
    type = string
}

variable "rds_pg_instance_disk_size" {
    default = 20 
    type = number
}

variable "rds_pg_max_allocated_storage" {
    default = 80 
    type = number
}

variable "rds_pg_db_tags" {
    type        = map(string)
    default     = {
        Environment = "Development"
        Owner       = "LakePulse"
    }
    description = "Tags for the PostgreSQL Database"
}

variable "ecs_cluster_nodes_security_group_ids" {
    type        = list(string)
    default     = ["sg-0732c7031fb6e36be", "sg-0d8eacc8450fefae6"]
    description = "Tags for the ECS Cluster"
}


variable "ecs_vpc_name" {
    type = string
    default = "dev-lp-backend-vpc"  
}

variable "subnet_public_a" {
    type = list(string)
    default = [ "dev-lp-backend-public-us-east-1a" ]
    description = "Set Subnet to get data"
}

variable "subnet_public_b" {
    type = list(string)
    default = [ "dev-lp-backend-public-us-east-1b" ]
    description = "Set Subnet to get data"
}
