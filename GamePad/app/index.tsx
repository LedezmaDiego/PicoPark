import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { View, TextInput } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { connectSocket, disconnectSocket } from '@/lib/socket/client';

function normalizeServerUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

export default function Home() {
  const [ip, setIp] = useState('');
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const router = useRouter();
  const isConnectingRef = useRef(false);
  const scanLockRef = useRef(false);

  function releaseLocks() {
    isConnectingRef.current = false;
    scanLockRef.current = false;
  }

  async function handleConnect(url?: string) {
    const target = normalizeServerUrl(url || ip);

    if (!target || isConnectingRef.current) return;

    isConnectingRef.current = true;
    disconnectSocket();

    const socket = connectSocket(target);

    socket.once('connect', () => {
      socket.emit('controller:join', { displayName: 'Player' }, (ack: any) => {
        if (!ack?.ok) {
          releaseLocks();
          disconnectSocket();
          return;
        }

        releaseLocks();
        router.push('/controller');
      });
    });

    socket.once('connect_error', () => {
      releaseLocks();
      disconnectSocket();
    });
  }

  async function handleScan() {
    const res = await requestPermission();
    if (!res.granted) return;

    scanLockRef.current = false;
    setScanning(true);
  }

  if (scanning) {
    if (!permission?.granted) {
      return (
        <View className="flex-1 items-center justify-center bg-slate-950 px-6">
          <Text className="text-white">No hay permisos de cámara</Text>
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
          if (scanLockRef.current) return;

          scanLockRef.current = true;
          setScanning(false);
          setIp(data);
          void handleConnect(data);
        }}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-slate-950 p-4">
      <Text className="text-2xl font-bold text-white">Conectar al juego</Text>
      <Text className="text-center text-slate-400">Pegá la URL del host o escaneá el QR.</Text>

      <View className="w-full flex-row gap-2">
        <TextInput
          placeholder="http://192.168.x.x:3001"
          value={ip}
          onChangeText={setIp}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
          placeholderTextColor="#64748b"
        />

        <Button onPress={() => void handleConnect()}>
          <Text>Conectar</Text>
        </Button>
      </View>

      <Button onPress={() => void handleScan()}>
        <Text>Escanear QR</Text>
      </Button>
    </View>
  );
}
