export enum StatusCode {
    SUCCESS = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export const StatusMessages = {
    SUCCESS: "Operation completed successfully.",
    CREATED: "Resource created successfully.",
    NO_CONTENT: "No content available.",
    BAD_REQUEST: "The request was invalid.",
    UNAUTHORIZED: "Authentication is required.",
    FORBIDDEN: "You do not have permission to access this resource.",
    NOT_FOUND: "The requested resource was not found.",
    INTERNAL_SERVER_ERROR: "An unexpected error occurred.",
};
