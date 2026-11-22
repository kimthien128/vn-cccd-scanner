import { describe, expect, it, vi } from 'vitest';
import type { QrDecodeSession, QrDecoder } from '../src/core/qr-decoder';
import { startScan } from '../src/core/scanner';

const video = {} as HTMLVideoElement;
const stream = {} as MediaStream;

interface FakeDecoder {
  decoder: QrDecoder;
  emit: (raw: string) => void;
  readonly stopCalls: number;
}

function createFakeDecoder(emitEarly = false): FakeDecoder {
  let handler: ((raw: string) => void) | null = null;
  let stopCalls = 0;

  const decoder: QrDecoder = {
    async decode(_video, _stream, onResult) {
      handler = onResult;
      if (emitEarly) {
        onResult('001090123456|123456789|Nguyễn Văn A|12011990|Nam|Tổ 1|01012021');
      }
      const session: QrDecodeSession = {
        stop: () => {
          stopCalls += 1;
        },
      };
      return session;
    },
  };

  return {
    decoder,
    emit: (raw: string) => handler?.(raw),
    get stopCalls() {
      return stopCalls;
    },
  };
}

describe('startScan', () => {
  it('gọi onResult 1 lần rồi tự dừng và bắn onStopped', async () => {
    const fake = createFakeDecoder();
    const onResult = vi.fn();
    const onStopped = vi.fn();

    await startScan(video, stream, fake.decoder, { onResult, onStopped });
    fake.emit('QR_1');
    fake.emit('QR_1');

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onStopped).toHaveBeenCalledTimes(1);
    expect(fake.stopCalls).toBe(1);
  });

  it('bỏ qua cùng một chuỗi trong cửa sổ dedup', async () => {
    const fake = createFakeDecoder();
    const onResult = vi.fn();

    await startScan(video, stream, fake.decoder, { onResult });
    fake.emit('SAME');
    fake.emit('SAME');
    fake.emit('SAME');

    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('bỏ qua mọi kết quả sau khi đã tự dừng', async () => {
    const fake = createFakeDecoder();
    const onResult = vi.fn();
    const onStopped = vi.fn();

    await startScan(video, stream, fake.decoder, { onResult, onStopped });
    fake.emit('FIRST');
    fake.emit('SECOND');

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('FIRST');
    expect(onStopped).toHaveBeenCalledTimes(1);
  });

  it('xử lý trường hợp callback chạy trước khi decode() trả session', async () => {
    const fake = createFakeDecoder(true);
    const onResult = vi.fn();
    const onStopped = vi.fn();

    await startScan(video, stream, fake.decoder, { onResult, onStopped });

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onStopped).toHaveBeenCalledTimes(1);
    expect(fake.stopCalls).toBe(1);
  });

  it('stop() từ ngoài là idempotent và không bắn onStopped', async () => {
    const fake = createFakeDecoder();
    const onStopped = vi.fn();

    const session = await startScan(video, stream, fake.decoder, {
      onResult: () => {},
      onStopped,
    });
    session.stop();
    session.stop();

    expect(fake.stopCalls).toBe(1);
    expect(onStopped).not.toHaveBeenCalled();
  });
});
