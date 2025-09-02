export type DomainErrorDetails = Record<string, unknown | undefined>;

export class DomainError extends Error {
  /**
   * The `details` property is used to provide additional information or context
   * about the error, such as identifiers or specific details relevant to the domain.
   * These details can be safely logged internally without exposing them externally.
   */
  private errorDetails: DomainErrorDetails = {};
  public errorCode: string;

  constructor(message: string, details: DomainErrorDetails = {}) {
    super(message.trim());
    this.details = details;
  }

  set details(details: DomainErrorDetails) {
    this.errorDetails = details;
  }

  get details(): DomainErrorDetails {
    return this.errorDetails;
  }
}
