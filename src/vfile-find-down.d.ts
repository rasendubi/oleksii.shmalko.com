declare module 'vfile-find-down' {
  import { VFile } from 'vfile';
  import { Stats } from 'fs';

  export const INCLUDE: number;
  export const SKIP: number;
  export const BREAK: number;

  type TestFn = (file: VFile, stats: Stats) => any;
  type Test = string | TestFn;
  type Callback = (err: any, files?: VFile[]) => void;
  export function all(tests: Test | Test[], callback: Callback): void;
  export function all(
    tests: Test | Test[],
    paths: string | string[],
    callback: Callback
  ): void;

  export function one(tests: Test | Test[], callback: Callback): void;
  export function one(
    tests: Test | Test[],
    paths: string | string[],
    callback: Callback
  ): void;
}
