import { afterEach, describe, expect, it, vi } from 'vitest';
import { CameraError, startCamera, stopCamera } from '../src/core/camera';

const video = {} as HTMLVideoElement;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('startCamera', () => {
  it('không có getUserMedia → NOT_SUPPORTED', async () => {
    vi.stubGlobal('navigator', {});

    await expect(startCamera(video)).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });
  });

  it.each([
    ['NotAllowedError', 'PERMISSION_DENIED'],
    ['NotFoundError', 'NOT_FOUND'],
    ['NotReadableError', 'IN_USE'],
  ])('DOMException %s → %s', async (domName, code) => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: () => Promise.reject(new DOMException('test', domName)),
      },
    });

    try {
      await startCamera(video);
      expect.unreachable('Phải ném CameraError');
    } catch (error) {
      expect(error).toBeInstanceOf(CameraError);
      expect((error as CameraError).code).toBe(code);
    }
  });

  it('play() thất bại phải dừng track và xoá srcObject', async () => {
    const stop = vi.fn();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: () => Promise.resolve({ getTracks: () => [{ stop }] }),
      },
    });

    const element = {
      srcObject: null,
      muted: false,
      playsInline: false,
      play: () => Promise.reject(new Error('play failed')),
    } as unknown as HTMLVideoElement;

    await expect(startCamera(element)).rejects.toMatchObject({ code: 'UNKNOWN' });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(element.srcObject).toBeNull();
  });
});

describe('stopCamera', () => {
  it('dừng mọi track, pause video và xoá srcObject', () => {
    const stopA = vi.fn();
    const stopB = vi.fn();
    const element = {
      srcObject: { getTracks: () => [{ stop: stopA }, { stop: stopB }] },
      pause: vi.fn(),
    } as unknown as HTMLVideoElement;

    stopCamera(element);

    expect(stopA).toHaveBeenCalledTimes(1);
    expect(stopB).toHaveBeenCalledTimes(1);
    expect(element.pause).toHaveBeenCalledTimes(1);
    expect(element.srcObject).toBeNull();
  });

  it('gọi lại lần 2 không lỗi (idempotent)', () => {
    const element = { srcObject: null, pause: vi.fn() } as unknown as HTMLVideoElement;

    expect(() => stopCamera(element)).not.toThrow();
    expect(() => stopCamera(element)).not.toThrow();
  });
});
