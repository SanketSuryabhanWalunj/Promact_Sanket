using System.Net;
using System.Text.Json;

namespace LakePulse.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Call the next middleware in the pipeline
                await _next(context);
            }
            catch (Exception ex)
            {
                // Handle exceptions globally here
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Customize the response
            var statusCode = HttpStatusCode.InternalServerError; // Default status code
            var result = JsonSerializer.Serialize(new
            {
                Error = "An unexpected error occurred.",
                Message = exception.Message
            });

            // Set HTTP response details
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            return context.Response.WriteAsync(result);
        }

    }
}
