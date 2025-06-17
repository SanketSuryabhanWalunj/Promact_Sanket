# --- ECS Task Definition ---

resource "aws_ecs_task_definition" "app" {
  family             = "${var.environment}-${var.application}-app-td"
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_exec_role.arn
  network_mode       = "bridge"
  cpu                = 600
  memory             = 600

  container_definitions = jsonencode([{
    name         = "${var.environment}-${var.application}-app",
    image        = "${var.ecr_image_uri}",
    essential    = true,
    portMappings = [{ containerPort = 8080, hostPort = 8080 }],

    environment = [
      { name = "EXAMPLE", value = "example" }
    ]

    logConfiguration = {
      logDriver = "awslogs",
      options = {
        "awslogs-region"        = "us-east-1",
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name,
        "awslogs-stream-prefix" = "app"
      }
    },
  }])
}