import Matter from "matter-js";

const { Engine, Render, Runner, Bodies, Composite } = Matter;

export function createGame(canvas: HTMLCanvasElement) {
  const engine = Engine.create();

  const render = Render.create({
    canvas,
    engine,
    options: {
      width: 800,
      height: 500,
      wireframes: false,
      background: "#111827",
    },
  });

  const ground = Bodies.rectangle(400, 480, 810, 40, {
    isStatic: true,
  });

  const box = Bodies.rectangle(400, 200, 80, 80);

  Composite.add(engine.world, [ground, box]);

  const runner = Runner.create();

  Runner.run(runner, engine);
  Render.run(render);

  return {
    engine,
    render,
    runner,
  };
}
