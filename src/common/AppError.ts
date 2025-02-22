import BaseError from "baseerr"

export type AppErrorProps = { status: string; code: number }
type AppErrorStaticMethodProps = Omit<AppErrorProps, "status" | "code">

export default class AppError<
  Props extends AppErrorProps = {
    status: string
    code: number
  },
> extends BaseError<Props> {
  constructor(message: string, props?: Props) {
    super(message, {
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
      ...props,
    } as Props)
  }

  static createFromCode<
    StaticMethodProps extends Omit<AppErrorProps, "status" | "code"> = Omit<
      AppErrorProps,
      "status" | "code"
    >,
  >(code: number, message: string, data?: StaticMethodProps): AppError {
    return new this(message, {
      code,
      status: this.statusFromCode(code),
      ...data,
    })
  }

  static wrapWithCode<
    StaticMethodProps extends
      AppErrorStaticMethodProps = AppErrorStaticMethodProps,
  >(
    source: any,
    code: number,
    message: string,
    data?: StaticMethodProps,
  ): AppError {
    return super.wrap(source, message, {
      code,
      status: this.statusFromCode(code),
      ...data,
    })
  }

  static assertWithCode<
    StaticMethodProps extends
      AppErrorStaticMethodProps = AppErrorStaticMethodProps,
  >(
    condition: any,
    code: number,
    message: string,
    data?: StaticMethodProps,
  ): asserts condition {
    return super.assert(condition, message, {
      code,
      status: this.statusFromCode(code),
      ...data,
    })
  }

  static statusFromCode(code: number): string {
    switch (code) {
      case 400:
        return "BAD_REQUEST"
      case 401:
        return "UNAUTHORIZED"
      case 403:
        return "FORBIDDEN"
      case 404:
        return "NOT_FOUND"
      case 409:
        return "CONFLICT"
      case 500:
        return "INTERNAL_SERVER_ERROR"
      case 501:
        return "NOT_IMPLEMENTED"
      case 502:
        return "BAD_GATEWAY"
      case 503:
        return "SERVICE_UNAVAILABLE"
      default:
        return "UNKNOWN_ERROR"
    }
  }
}
