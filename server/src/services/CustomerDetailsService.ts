import fs from 'fs';
import path from 'path';
import { db } from '../models/DatabaseAdapter';
import { DatabaseResult, RuntimeError } from '@safereplay/shared';

export interface CustomerDetailsPayload {
  name: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  } | string;
  sessionId?: string;
}

const FIX_STATE_FILE = path.resolve(__dirname, '../../.fix-state.json');

function readFixState(): boolean {
  try {
    if (fs.existsSync(FIX_STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(FIX_STATE_FILE, 'utf8'));
      return data.isFixApplied === true;
    }
  } catch {}
  return false;
}

function writeFixState(applied: boolean): void {
  try {
    fs.writeFileSync(FIX_STATE_FILE, JSON.stringify({ isFixApplied: applied }), 'utf8');
  } catch {}
}

export class CustomerDetailsService {
  public static isFixApplied: boolean = readFixState();

  public static setFixApplied(applied: boolean): void {
    this.isFixApplied = applied;
    writeFixState(applied);
  }

  public static getFixStatus(): boolean {
    return this.isFixApplied;
  }


  /**
   * Primary Demo Method:
   * Dynamically toggles between controlled demo bug and applied fix.
   */
  public static async saveCustomerDetails(
    payload: CustomerDetailsPayload,
    sessionId: string = 'SR-1042'
  ): Promise<{ saved: boolean; message: string; reason?: string; recordId?: string }> {
    if (this.isFixApplied) {
      return this.saveCustomerDetailsFixed(payload, sessionId);
    }

    const operation = 'customer_details_insert';
    const timestamp = new Date().toISOString();

    try {
      // Step 1: Validate payload presence
      if (!payload || !payload.name || !payload.email) {
        throw new Error('Invalid customer details: Name and email are required');
      }

      // Step 2: Simulate database transaction begin
      db.logAudit('TRANSACTION_BEGIN', sessionId, { operation });

      // Step 3: Format customer address record
      const customer: any = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '',
        address: typeof payload.address === 'object' ? payload.address : { street: payload.address }
      };

      // LINE 48: Controlled Demo Error Bug
      // Unhandled property access: 'customer.address.postalCode' is undefined when string or omitted,
      // throwing TypeError: Cannot read properties of undefined (reading 'toUpperCase')
      const normalizedZip = customer.address.postalCode.toUpperCase();

      // Step 4: Commit record to database
      const recordId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

      const dbSuccess: DatabaseResult = {
        sessionId,
        type: 'database_result',
        operation,
        status: 'success',
        reason: null,
        recordId,
        timestamp
      };
      db.addDbResult(sessionId, dbSuccess);
      db.logAudit('TRANSACTION_COMMIT', sessionId, { recordId });

      return {
        saved: true,
        message: 'Details stored successfully.',
        recordId
      };
    } catch (err: any) {
      // Step 5: Rollback transaction on failure
      const reason = 'Database transaction rolled back: address postalCode normalization error';
      db.logAudit('TRANSACTION_ROLLBACK', sessionId, { reason, originalError: err.message });

      const dbFailure: DatabaseResult = {
        sessionId,
        type: 'database_result',
        operation,
        status: 'failed',
        reason,
        recordId: null,
        timestamp
      };
      db.addDbResult(sessionId, dbFailure);

      const runtimeError: RuntimeError = {
        sessionId,
        type: 'runtime_error',
        message: `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`,
        file: 'CustomerDetailsService.ts',
        line: 48,
        column: 29,
        function: 'saveCustomerDetails',
        stack: `TypeError: Cannot read properties of undefined (reading 'toUpperCase')\n    at CustomerDetailsService.saveCustomerDetails (server/src/services/CustomerDetailsService.ts:48:29)\n    at CustomerDetailsController.save (server/src/controllers/CustomerDetailsController.ts:24:42)`,
        page: '/checkout',
        timestamp
      };
      db.addError(sessionId, runtimeError);

      return {
        saved: false,
        message: 'Details were not stored.',
        reason
      };
    }
  }

  /**
   * Corrected implementation used for fix verification.
   */
  public static async saveCustomerDetailsFixed(
    payload: CustomerDetailsPayload,
    sessionId: string = 'SR-1042'
  ): Promise<{ saved: boolean; message: string; reason?: string; recordId?: string }> {
    const operation = 'customer_details_insert';
    const timestamp = new Date().toISOString();

    try {
      if (!payload || !payload.name || !payload.email) {
        throw new Error('Invalid customer details: Name and email are required');
      }

      const customer: any = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '',
        address: typeof payload.address === 'object' ? payload.address : { street: payload.address }
      };

      // FIXED LINE: Safe optional chaining and fallback
      const normalizedZip = customer.address?.postalCode?.toUpperCase() ?? 'N/A';

      const recordId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

      const dbSuccess: DatabaseResult = {
        sessionId,
        type: 'database_result',
        operation,
        status: 'success',
        reason: null,
        recordId,
        timestamp
      };
      db.addDbResult(sessionId, dbSuccess);

      return {
        saved: true,
        message: 'Details stored successfully.',
        recordId
      };
    } catch (err: any) {
      return {
        saved: false,
        message: 'Details were not stored.',
        reason: err.message
      };
    }
  }
}
