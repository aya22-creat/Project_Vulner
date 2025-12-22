namespace ProjectVuln.Application.Result
{
    public class ServiceResult
    {
        public bool Success { get; protected set; }
        public string Message { get; protected set; }
        public int StatusCode { get; protected set; }

        public static ServiceResult SuccessResult(int statusCode, string message = null)
        {
            return new ServiceResult
            {
                Success = true,
                Message = message,
                StatusCode = statusCode
            };
        }

        public static ServiceResult Failure(int statusCode, string message)
        {
            return new ServiceResult
            {
                Success = false,
                Message = message,
                StatusCode = statusCode
            };
        }
    }

    public class ServiceResult<T> : ServiceResult
    {
        public T Data { get; private set; }

        // Generic Success
        public static ServiceResult<T> SuccessResult(int statusCode, T data = default, string message = null)
        {
            return new ServiceResult<T>
            {
                Success = true,
                Message = message,
                Data = data,
                StatusCode = statusCode
            };
        }

        // Generic Failure
        public static ServiceResult<T> Failure(int statusCode, string message)
        {
            return new ServiceResult<T>
            {
                Success = false,
                Message = message,
                Data = default,
                StatusCode = statusCode
            };
        }
    }
}
