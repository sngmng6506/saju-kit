export class SajuError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SajuError';
    this.code = code;
  }
}
