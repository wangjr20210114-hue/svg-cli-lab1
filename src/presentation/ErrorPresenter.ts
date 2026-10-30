export class ErrorPresenter {
  format(error: unknown): string {
    const message=error instanceof Error?error.message:String(error);
    return `error: ${message.replace(/[\r\n]+/g,' ')}`;
  }
}
