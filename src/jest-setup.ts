import { TextDecoder, TextEncoder } from 'node:util';

// jsdom не предоставляет TextEncoder/TextDecoder,
// которые использует @tanstack/router-core (SSR-серьялизация)
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

import '@vanilla-extract/css/disableRuntimeStyles';
import '@testing-library/jest-dom';
