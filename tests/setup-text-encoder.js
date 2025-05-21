import { TextEncoder, TextDecoder } from 'util';

// Override the global TextEncoder/TextDecoder to ensure esbuild invariant passes
if (typeof globalThis.TextEncoder === 'undefined' || !(new globalThis.TextEncoder().encode('') instanceof Uint8Array)) {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder; 