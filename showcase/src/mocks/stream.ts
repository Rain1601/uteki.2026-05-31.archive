/**
 * Single async-generator helper used by every interactive surface so the
 * playback rhythm feels like a real streamed SSE response.
 *
 * Each event may include an optional `_delayMs` to override the default delay
 * before the event is yielded.
 */

export type StreamEvent<T> = T & { _delayMs?: number };

export interface MockStreamOpts {
  defaultDelayMs?: number;
  jitterMs?: number;
  signal?: AbortSignal;
}

export async function* mockStream<T extends object>(
  events: ReadonlyArray<StreamEvent<T>>,
  opts: MockStreamOpts = {},
): AsyncGenerator<T> {
  const { defaultDelayMs = 60, jitterMs = 40, signal } = opts;
  for (const ev of events) {
    if (signal?.aborted) return;
    const base = ev._delayMs ?? defaultDelayMs;
    const wait = base + Math.random() * jitterMs;
    await sleep(wait, signal);
    if (signal?.aborted) return;
    const { _delayMs: _omit, ...rest } = ev as StreamEvent<T> & { _delayMs?: number };
    void _omit;
    yield rest as unknown as T;
  }
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return resolve();
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(id);
      reject(new DOMException('aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Split a long string into "token" chunks of ~3-7 characters, suitable for
 * simulating an LLM token stream when the script doesn't pre-chunk it.
 */
export function tokenize(text: string, avgChunk = 4): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const len = Math.max(1, avgChunk + Math.floor((Math.random() - 0.5) * avgChunk));
    out.push(text.slice(i, i + len));
    i += len;
  }
  return out;
}
