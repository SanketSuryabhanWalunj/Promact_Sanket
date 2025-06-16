  resource "aws_cloudfront_origin_access_control" "cloudfront_oac" {
    name                              = "My_Cloudfront-OAC"
    description                       = "The origin access control configuration for the Cloudfront distribution"
    origin_access_control_origin_type = "s3"
    signing_behavior                  = "always"
    signing_protocol                  = "sigv4"
  }
  
  resource "aws_cloudfront_distribution" "website_cdn" {
    enabled = true
    
    origin {
      domain_name              = aws_s3_bucket.deployment_bucket.bucket_regional_domain_name
      origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront_oac.id
      origin_id                = "origin-bucket-${aws_s3_bucket.deployment_bucket.id}"
    }

    default_root_object = "index.html"

    aliases = ["dev.lakepulse.co"]

    default_cache_behavior {
      allowed_methods        = ["GET", "HEAD", "DELETE", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods         = ["GET", "HEAD"]
      min_ttl                = "0"
      default_ttl            = "300"
      max_ttl                = "1200"
      target_origin_id       = "origin-bucket-${aws_s3_bucket.deployment_bucket.id}"
      viewer_protocol_policy = "redirect-to-https"
      compress               = true

      forwarded_values {
        query_string = false
        cookies {
          forward = "none"
        }
      }
    }

    restrictions {
      geo_restriction {
        restriction_type = "none"
      }
    }

    custom_error_response {
      error_caching_min_ttl = 300
      error_code            = 404
      response_code         = "200"
      response_page_path    = "/index.html"
    }

    custom_error_response {
      error_caching_min_ttl = 300
      error_code            = 403
      response_code         = "200"
      response_page_path    = "/index.html"
    }

    custom_error_response {
      error_caching_min_ttl = 300
      error_code            = 500
      response_code         = "200"
      response_page_path    = "/index.html"
    }

    custom_error_response {
      error_caching_min_ttl = 300
      error_code            = 504
      response_code         = "200"
      response_page_path    = "/index.html"
    }

    viewer_certificate {
      # cloudfront_default_certificate = true
      acm_certificate_arn            = "arn:aws:acm:us-east-1:699475921536:certificate/25a8a0de-5795-4805-8270-de518b5af9af"
      ssl_support_method              = "sni-only"
      minimum_protocol_version        = "TLSv1.2_2021"      
    }

    tags = {
      Created_By = var.created_by
    }
  }