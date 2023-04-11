import { StatusCode } from '../../utils/httpCodes';

interface AppErrorArgs {
  statusCode: StatusCode;
  message?: string;
  description?: string;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: StatusCode;

  public readonly message: string;

  public readonly isOperational: boolean = true;

  public readonly description: string = '';

  constructor(args: AppErrorArgs) {
    super(args.message || 'Error');

    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = args.statusCode;
    this.message = args.message || StatusCode[this.statusCode];

    if (args.description !== undefined) {
      this.description = args.description;
    }

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    Error.captureStackTrace(this);
  }
}
