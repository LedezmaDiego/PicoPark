import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useController } from '@/lib/hooks/useController';
import { useSocket } from '@/lib/hooks/useSocket';

export default function Controller() {
  const { connected } = useSocket();
  const { sendInput } = useController();

  return (
    <View className="flex-1 justify-between p-6">
      <Text>{connected ? '🟢 Conectado' : '🔴 Desconectado'}</Text>

      <View className="flex-row justify-center gap-4">
        <Pressable
          onPressIn={() =>
            sendInput({
              left: true,
              right: false,
              up: false,
              down: false,
              jump: false,
              source: 'touch',
            })
          }
          onPressOut={() =>
            sendInput({
              left: false,
              right: false,
              up: false,
              down: false,
              jump: false,
              source: 'touch',
            })
          }>
          <Text>←</Text>
        </Pressable>

        <Pressable
          onPressIn={() =>
            sendInput({
              left: false,
              right: true,
              up: false,
              down: false,
              jump: false,
              source: 'touch',
            })
          }
          onPressOut={() =>
            sendInput({
              left: false,
              right: false,
              up: false,
              down: false,
              jump: false,
              source: 'touch',
            })
          }>
          <Text>→</Text>
        </Pressable>
      </View>

      <View className="items-end">
        <Pressable
          onPressIn={() =>
            sendInput({
              left: false,
              right: false,
              up: false,
              down: false,
              jump: true,
              source: 'touch',
            })
          }
          onPressOut={() =>
            sendInput({
              left: false,
              right: false,
              up: false,
              down: false,
              jump: false,
              source: 'touch',
            })
          }>
          <Text>A</Text>
        </Pressable>
      </View>
    </View>
  );
}
