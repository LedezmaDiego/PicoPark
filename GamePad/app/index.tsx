import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { connectSocket } from '@/lib/socket/client';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Home() {
  const [ip, setIp] = useState('');
  const [scanning, setScanning] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const router = useRouter();

  async function handleConnect(url?: string) {
    const target = url || ip;
    if (!target) return;

    console.log('🌐 Connecting to:', target);

    const socket = connectSocket(target);

    socket.on('connect', () => {
      console.log('📡 Connected, sending join...');

      socket.emit('controller:join', { displayName: 'Player' }, (ack: any) => {
        console.log('📩 JOIN ACK:', ack);

        if (!ack?.ok) {
          console.log('❌ Join error:', ack?.reason);
          return;
        }

        router.push('/controller');
      });
    });
  }

  async function handleScan() {
    const res = await requestPermission();
    if (!res.granted) return;

    setScanning(true);
  }

  if (scanning) {
    if (!permission?.granted) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>No hay permisos de cámara</Text>
        </View>
      );
    }

    return (
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={({ data }) => {
          if (!scanning) return; // 👈 evita doble trigger

          setScanning(false);
          console.log('📷 QR DATA:', data);

          setIp(data);
          handleConnect(data);
        }}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text>Conectar al juego</Text>

      <TextInput
        placeholder="http://192.168.x.x:3001"
        value={ip}
        onChangeText={setIp}
        className="w-full border p-2"
      />

      <Button onPress={() => handleConnect()}>
        <Text>Conectar</Text>
      </Button>

      <Button onPress={handleScan}>
        <Text>Escanear QR</Text>
      </Button>
    </View>
  );
}
