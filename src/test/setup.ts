import '@vanilla-extract/css/disableRuntimeStyles';
import '@testing-library/jest-dom';
import { ReadableStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';

if (typeof globalThis.TextEncoder === 'undefined') {
  Object.assign(globalThis, { TextEncoder, TextDecoder });
}
if (typeof globalThis.ReadableStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream });
}
