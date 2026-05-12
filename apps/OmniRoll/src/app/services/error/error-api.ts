import * as uuid from 'uuid';

function indent(content: unknown): string {
  return `${content}`.split('\n').map(line => `  ${line}`).join('\n');
}

export class OmniRollError extends Error {
  id: string;
  timestamp: number = Date.now();

  constructor(
    public code: string,
    public title: string,
    public description: string,
    cause?: unknown,
  ) {
    super(
      [
        title,
        ` (Code: ${code}):\n`,
        `An error occured while trying to ${description}`,
        cause !== undefined ? `:\n${indent(cause instanceof Error ? cause.message : cause)}` : '',
      ].join(''),
      {
        cause,
      },
    );
    this.id = uuid.v4();
  }

  static fromError(error: unknown): OmniRollError {
    if (error instanceof OmniRollError) {
      return error;
    }
    return new OmniRollTechnicalError(error);
  }
}

export class OmniRollTechnicalError extends OmniRollError {
  constructor(cause: unknown) {
    super('TECHNICAL_ERROR', 'Technical Error', `An unexpected technical error occurred:\n${cause instanceof Error ? cause.message : cause}`, cause);
  }
}
