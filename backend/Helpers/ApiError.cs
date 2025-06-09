using Microsoft.AspNetCore.Mvc;

namespace backend.Helpers
{
    public static class ApiError
    {
        public static IActionResult BadRequest(string title)
        {
            return new BadRequestObjectResult(new { title });
        }

        public static IActionResult BadRequest(string title, object errors)
        {
            return new BadRequestObjectResult(new { title, errors });
        }

        public static IActionResult Unauthorized(string title)
        {
            return new UnauthorizedObjectResult(new { title });
        }

        public static IActionResult NotFound(string title)
        {
            return new NotFoundObjectResult(new { title });
        }

        public static IActionResult ServerError(string title)
        {
            return new ObjectResult(new { title })
            {
                StatusCode = 500
            };
        }

        public static IActionResult Conflict(string title)
        {
            return new ConflictObjectResult(new { title, status = 409 });
        }

        public static IActionResult Forbid(string title)
        {
            return new ObjectResult(new { title, status = 403 })
            {
                StatusCode = 403
            };
        }


    }
}
