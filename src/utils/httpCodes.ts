export enum StatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum StatusMessage {
  OK = 'Ok',
  CREATED = 'Created',
  ACCEPTED = 'Accepted',
  NO_CONTENT = 'No content',
  BAD_REQUEST = 'Bad request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not found',
  CONFLICT = 'Conflict',
  INTERNAL_SERVER_ERROR = 'Internal server error',
}
