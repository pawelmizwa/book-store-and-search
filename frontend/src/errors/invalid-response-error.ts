export class InvalidResponseError extends Error {
  constructor(message?: string) {
    super(message || "Invalid response from server");
    this.name = "InvalidResponseError";
  }
}
