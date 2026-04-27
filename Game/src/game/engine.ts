import Matter from "matter-js";
import {
  MAX_PLAYERS,
  PLAYER_COLORS,
  type ControllerInput,
} from "../shared/protocol";

const { Body, Bodies, Composite, Engine, Events, Render, Runner } = Matter;

const EMPTY_INPUT: ControllerInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  source: "touch",
};

type GameRuntime = {
  setPlayerInput: (slot: number, input: ControllerInput) => void;
  destroy: () => void;
};

type PlayerRuntime = {
  body: Matter.Body;
  input: ControllerInput;
  grounded: boolean;
  blockedAbove: boolean;
  jumpHeld: boolean;
};

export function createGame(canvas: HTMLCanvasElement): GameRuntime {
  const engine = Engine.create();
  engine.gravity.y = 1.05;

  const render = Render.create({
    canvas,
    engine,
    options: {
      width: 800,
      height: 500,
      wireframes: false,
      background: "#0f172a",
    },
  });

  const runner = Runner.create();

  const ground = Bodies.rectangle(400, 480, 810, 40, {
    isStatic: true,
    label: "ground",
  });

  const platform = Bodies.rectangle(400, 300, 300, 20, {
    isStatic: true,
    label: "ground",
  });

  const playersBodies = Array.from({ length: MAX_PLAYERS }, (_, i) =>
    Bodies.rectangle(150 + i * 60, 100, 34, 34, {
      friction: 0,
      frictionAir: 0.08,
      restitution: 0,
      inertia: Infinity, // 🔥 evita rotaciones raras
      render: {
        fillStyle: PLAYER_COLORS[i],
      },
    }),
  );

  const players: PlayerRuntime[] = playersBodies.map((b) => ({
    body: b,
    input: { ...EMPTY_INPUT },
    grounded: false,
    blockedAbove: false,
    jumpHeld: false,
  }));

  const bodyToPlayer = new Map<number, number>();
  playersBodies.forEach((b, i) => bodyToPlayer.set(b.id, i));

  Composite.add(engine.world, [ground, platform, ...playersBodies]);

  // Reset estados cada frame
  Events.on(engine, "beforeUpdate", () => {
    players.forEach((p) => {
      p.grounded = false;
      p.blockedAbove = false;
    });
  });

  // Detectar colisiones
  Events.on(engine, "collisionActive", (event: any) => {
    for (const pair of event.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;

      const aPlayer = bodyToPlayer.get(a.id);
      const bPlayer = bodyToPlayer.get(b.id);

      // suelo
      if (aPlayer !== undefined && b.label === "ground") {
        players[aPlayer].grounded = true;
      }
      if (bPlayer !== undefined && a.label === "ground") {
        players[bPlayer].grounded = true;
      }

      // jugador vs jugador
      if (aPlayer !== undefined && bPlayer !== undefined) {
        const pa = players[aPlayer];
        const pb = players[bPlayer];

        // comparar posiciones Y (más confiable)
        if (a.position.y < b.position.y - 5) {
          pa.grounded = true;
          pb.blockedAbove = true;
        } else if (b.position.y < a.position.y - 5) {
          pb.grounded = true;
          pa.blockedAbove = true;
        }
      }
    }
  });

  Events.on(engine, "afterUpdate", () => {
    for (const player of players) {
      const body = player.body;

      // 🔥 eliminar cualquier empuje horizontal residual
      Body.setVelocity(body, {
        x: body.velocity.x * 0.2, // amortigua empuje
        y: body.velocity.y,
      });
    }
  });

  Events.on(engine, "beforeUpdate", () => {
    players.forEach((p) => {
      const { body, input } = p;

      const force = 0.003;

      if (input.left) {
        Body.applyForce(body, body.position, { x: -force, y: 0 });
      }

      if (input.right) {
        Body.applyForce(body, body.position, { x: force, y: 0 });
      }

      const jumpPressed = input.jump && !p.jumpHeld;

      if (jumpPressed && p.grounded && !p.blockedAbove) {
        Body.setVelocity(body, { x: body.velocity.x, y: -11 });
      }

      p.jumpHeld = input.jump;
    });
  });

  Runner.run(runner, engine);
  Render.run(render);

  return {
    setPlayerInput(slot, input) {
      if (players[slot]) players[slot].input = input;
    },
    destroy() {
      Runner.stop(runner);
      Render.stop(render);
      Engine.clear(engine);
      Composite.clear(engine.world, false);
    },
  };
}
