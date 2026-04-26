export const MAX_PLAYERS = 4;

export const PLAYER_COLORS = ['#ab44ef', '#f6e63b', '#22c55e', '#f59e0b'] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export type PlayerSlot = {
  id: string;
  name: string;
  color: PlayerColor;
  slot: number;
  connectedAt: number;
};

export type LobbyState = {
  maxPlayers: number;
  connectedPlayers: number;
  players: PlayerSlot[];
  serverUrl: string;
  updatedAt: number;
};

export type ControllerJoinPayload = {
  displayName?: string;
};

export type ControllerJoinAck =
  | {
      ok: true;
      player: PlayerSlot;
      lobby: LobbyState;
    }
  | {
      ok: false;
      reason: 'lobby_full' | 'already_joined';
    };

export type ControllerInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  source: 'touch' | 'keyboard';
};
