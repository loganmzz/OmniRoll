import { ErrorHandler } from "@angular/core";

export class ErrorHandlerService extends ErrorHandler {
  override handleError(error: any): void {
    // Forward to default implementation
    super.handleError(error);
  }
}
