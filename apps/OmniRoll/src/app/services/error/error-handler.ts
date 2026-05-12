import {
  ErrorHandler,
  inject,
} from '@angular/core';
import Dexie from 'dexie';
import { MessageService } from 'primeng/api';
import { APP_VERSION } from '../version';
import { OmniRollError } from './error-api';

export interface ErrorRecord {
  id: string;
  appVersion: string;
  timestamp: number;
  title: string;
  description: string;
  message: string;
  stacktrace: string;
}

export class ErrorDatabase extends Dexie {

  constructor(private appVersion: string) {
    super('errors');
    this
      .version(1)
      .stores({
        'Error': 'id, timestamp',
      });
  }

  listErrors(): Promise<ErrorRecord[]> {
    return this.transaction(
      'r',
      ['Error'],
      tx => {
        return tx.table('Error').orderBy('timestamp').reverse().toArray();
      },
    );
  }

  logError(error: OmniRollError): Promise<void> {
    return this.transaction(
      'rw',
      ['Error'],
      async tx => {
        const record: ErrorRecord = {
          id: error.id,
          appVersion: this.appVersion,
          timestamp: error.timestamp,
          title: error.title,
          description: error.description,
          message: error.message,
          stacktrace: error.stack ?? '',
        };
        await tx.table('Error').add(record);
      },
    );
  }

  keepNewestErrors(toKeepCount: number): Promise<number> {
    return this.transaction(
      'rw',
      ['Error'],
      async tx => {
        const errors = tx.table('Error');
        return await errors
          .orderBy('timestamp')
          .reverse()
          .offset(toKeepCount)
          .delete();
      },
    );
  }
}

export class ErrorHandlerService extends ErrorHandler {
  private messageService = inject(MessageService);
  private version = inject(APP_VERSION);
  private database = new ErrorDatabase(this.version);

  constructor() {
    super();
    this.clearOldestErrors();
  }

  private async clearOldestErrors() {
    console.log('Cleaning oldest errors...');
    const deletedCount = await this.database.keepNewestErrors(200);
    console.log(`Deleted ${deletedCount} old errors.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleError(error: any): void {
    // Forward to default implementation
    const omniRollError = OmniRollError.fromError(error);
    super.handleError(omniRollError);
    this.messageService.add({
      severity: 'error',
      sticky: true,
      summary: omniRollError.title,
      detail: omniRollError.description,
    });
    // No need to wait for completion, let's complete async
    this.database.logError(omniRollError);
  }
}
