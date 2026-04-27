import { useEffect } from 'react';
import { BackHandler, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useKeepAwake } from 'expo-keep-awake';
import { Text } from '@/components/ui/text';
import { useController } from '@/lib/hooks/useController';
import { useSocket } from '@/lib/hooks/useSocket';
import { disconnectSocket } from '@/lib/socket/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NEUTRAL = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  source: 'touch' as const,
};

function SquareBtn({ label, onPressIn, onPressOut }: any) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => ({
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        transform: [{ scale: pressed ? 0.9 : 1 }],
      })}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{label}</Text>
    </Pressable>
  );
}

function CircleBtn({ label, onPressIn, onPressOut }: any) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => ({
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#facc15',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: pressed ? 0.9 : 1 }],
      })}>
      <Text style={{ color: '#000', fontSize: 40, fontWeight: 'bold' }}>{label}</Text>
    </Pressable>
  );
}

export default function Controller() {
  useKeepAwake();
  const { connected } = useSocket();
  const { sendInput } = useController();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
      disconnectSocket();
    };
  }, []);

  const sendNeutral = () => sendInput(NEUTRAL);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 10, // 🔥 clave
        paddingLeft: insets.left + 10,
        paddingRight: insets.right + 10,
      }}>
      {/* HEADER */}
      <Text style={{ color: 'white', marginBottom: 10 }}>
        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
      </Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {/* D-PAD */}
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <SquareBtn
            label="↑"
            onPressIn={() => sendInput({ ...NEUTRAL, up: true })}
            onPressOut={sendNeutral}
          />

          <View style={{ flexDirection: 'row' }}>
            <SquareBtn
              label="←"
              onPressIn={() => sendInput({ ...NEUTRAL, left: true })}
              onPressOut={sendNeutral}
            />

            <SquareBtn
              label="→"
              onPressIn={() => sendInput({ ...NEUTRAL, right: true })}
              onPressOut={sendNeutral}
            />
          </View>

          <SquareBtn
            label="↓"
            onPressIn={() => sendInput({ ...NEUTRAL, down: true })}
            onPressOut={sendNeutral}
          />
        </View>

        {/* BOTÓN A */}
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircleBtn
            label="A"
            onPressIn={() => sendInput({ ...NEUTRAL, jump: true })}
            onPressOut={sendNeutral}
          />
        </View>
      </View>
    </View>
  );
}
