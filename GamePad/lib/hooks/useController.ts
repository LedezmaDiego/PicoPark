import { getSocket } from '@/lib/socket/client';
import type { ControllerInput } from '@/lib/types/protocol';

export function useController() {
  function sendInput(input: ControllerInput) {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('controller:input', input);
  }

  return { sendInput };
}
