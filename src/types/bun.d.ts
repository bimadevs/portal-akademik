// Type declarations for Bun modules used in tests
declare module 'bun:test';

declare module 'bun:sqlite' {
  export class Database {
    constructor(...args: any[]);
    exec(sql: string): any;
    query<T = any>(sql: string): {
      run(...args: any[]): any;
      get(...args: any[]): T | undefined;
      all(...args: any[]): T[];
    };
    close(): void;
    // Additional placeholder methods if needed
  }
}
