/**
 * Throw this error from a transform to leave the token at its current state
 * and skip its remaining transforms.
 */
export class StopTransformError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'StopTransformError';
  }
}
