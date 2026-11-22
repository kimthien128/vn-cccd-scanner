type AudioContextConstructor = typeof AudioContext;

let context: AudioContext | null = null;

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  const scope = window as typeof window & { webkitAudioContext?: AudioContextConstructor };
  return scope.AudioContext ?? scope.webkitAudioContext;
}

/**
 * Tạo/kích hoạt AudioContext trong user gesture (gọi từ start() của component).
 * Không làm gì nếu trình duyệt không hỗ trợ hoặc bị chặn — im lặng là fallback hợp lệ.
 */
export function prepareBeep(): void {
  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) {
    return;
  }

  try {
    context ??= new AudioContextCtor();
    if (context.state === 'suspended') {
      void context.resume();
    }
  } catch {
    context = null;
  }
}

/** Tiếng "tít" ngắn xác nhận đọc mã thành công. */
export function playSuccessBeep(): void {
  if (!context) {
    return;
  }

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch {
    // Không để lỗi audio làm hỏng luồng quét.
  }
}
