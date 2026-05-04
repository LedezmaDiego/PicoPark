// ========================================
// PICO PARK CLONE - VERSIÓN FUNCIONANDO 100%
// ========================================

// --- CONFIGURACIÓN GLOBAL ---
const CONFIG = {
    TAMANO_BLOQUE: 50,
    VELOCIDAD_JUGADOR: 220,
    SALTO_FUERZA: 480,
    GRAVEDAD: 950,
    COLORES_JUGADORES: [0xff4444, 0x44ff44, 0x4488ff, 0xffff44, 0xff44ff, 0x44ffff],
    MAX_JUGADORES: 6,
    TIEMPO_VICTORIA: 3000
};

// --- ESTADOS GLOBALES ---
let socket = io({ query: { tipo: "pantalla" } });
let contadorColores = 0;
let nivelActual = 1;

// --- MAPAS ---
const mapaNivel1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0, 0,0,0,0,0,0,0,0,0,1,1,1,1,1,4,0],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0, 0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0, 1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0, 0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0, 1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0, 0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0, 1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,2, 2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2, 1,1,1,2,2,2,2,2,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];

const mapaNivel2 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0, 1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
    [1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1, 1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0, 1,1,0,0,0,0,1,1,1,0,0,0,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];

function obtenerMapaActual() {
    console.log(`🗺️ Cargando NIVEL ${nivelActual}`);
    return nivelActual === 1 ? mapaNivel1 : mapaNivel2;
}

// ========================================
// ESCENA PRINCIPAL
// ========================================
class SceneGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGame' });
        this.resetEstado();
    }

    resetEstado() {
        this.jugadoresSprites = {};
        this.equipoTieneLlave = false;
        this.jugadorConLlaveSprite = null;
        this.nivelSuperado = false;
        this.llaveOriginalX = 0;
        this.llaveOriginalY = 0;
        this.llave = null;
        this.puerta = null;
        this.plataformas = null;
        this.agua = null;
        this.grupoJugadores = null;
        this.txtVictoria = null;
        contadorColores = 0;
    }

    preload() {
        // Texturas procedurales en create()
    }

    crearTextura(key, col1, col2, col3, w, h, esPiso) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.context;
        ctx.fillStyle = col1; ctx.fillRect(0, 0, w, h);
        if (col2) { 
            ctx.fillStyle = col2; 
            ctx.fillRect(0, 0, w/2, h/2); 
            ctx.fillRect(w/2, h/2, w/2, h/2); 
        }
        if (esPiso && col3) { 
            ctx.fillStyle = col3; 
            ctx.fillRect(0, 0, w, 12); 
        }
        canvas.refresh();
    }

    crearTexturaJugador() {
        const canvas = this.textures.createCanvas("player", 40, 40);
        const ctx = canvas.context;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, 40, 40);
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(8, 10, 6, 8); 
        ctx.fillRect(26, 10, 6, 8);
        ctx.fillRect(15, 25, 10, 4);
        canvas.refresh();
    }

    crearTexturaLlave() {
        const canvas = this.textures.createCanvas("key", 30, 30);
        const ctx = canvas.context;
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillRect(5, 10, 25, 8); 
        ctx.fillRect(5, 5, 10, 18);
        ctx.fillStyle = "#87CEEB"; ctx.fillRect(7, 9, 6, 10);
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillRect(22, 18, 4, 6); 
        ctx.fillRect(16, 18, 4, 6);
        canvas.refresh();
    }

    crearTexturaPuerta() {
        const canvas = this.textures.createCanvas("door", 50, 80);
        const ctx = canvas.context;
        ctx.fillStyle = "#8e44ad"; ctx.fillRect(0, 0, 50, 80);
        ctx.fillStyle = "#9b59b6"; ctx.fillRect(5, 5, 40, 75);
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillRect(35, 40, 6, 6); 
        ctx.fillRect(22, 15, 6, 6);
        canvas.refresh();
    }

    create() {
        console.log(`🎮 === INICIANDO NIVEL ${nivelActual} ===`);
        
        this.resetEstado();
        this.cameras.main.setBackgroundColor("#87CEEB");
        
        // TEXTURAS
        this.crearTextura("ground", "#7f8c8d", "#95a5a6", "#2ecc71", 50, 50, true);
        this.crearTextura("water", "rgba(52, 152, 219, 0.7)", "rgba(255, 255, 255, 0.4)", null, 50, 50, false);
        this.crearTexturaJugador();
        this.crearTexturaLlave();
        this.crearTexturaPuerta();

        // GRUPOS
        this.plataformas = this.physics.add.staticGroup();
        this.agua = this.physics.add.staticGroup();
        this.grupoJugadores = this.physics.add.group();

        // MAPA
        const mapaActual = obtenerMapaActual();
        const tamanoBloque = CONFIG.TAMANO_BLOQUE;
        const mapaAncho = mapaActual[0].length * tamanoBloque;
        const mapaAlto = mapaActual.length * tamanoBloque;

        this.physics.world.setBounds(0, 0, mapaAncho, mapaAlto);
        this.cameras.main.setBounds(0, 0, mapaAncho, mapaAlto);

        // UI
        this.txtVictoria = this.add.text(
            mapaAncho/2, 200, 
            `¡NIVEL ${nivelActual} COMPLETADO!\nSiguiente nivel en 3s...`,
            { fontSize: "48px", fill: "#00ff88", fontStyle: "bold", align: "center" }
        ).setOrigin(0.5).setStroke("#004400", 6).setVisible(false).setScrollFactor(0);

        // CONSTRUIR MAPA
        for (let y = 0; y < mapaActual.length; y++) {
            for (let x = 0; x < mapaActual[y].length; x++) {
                const tipo = mapaActual[y][x];
                const posX = x * tamanoBloque + tamanoBloque/2;
                const posY = y * tamanoBloque + tamanoBloque/2;
                
                if (tipo === 1) this.plataformas.create(posX, posY, "ground");
                else if (tipo === 2) {
                    const agua = this.agua.create(posX, posY, "water");
                    agua.body.setSize(50, 12);
                    agua.body.setOffset(0, 38);
                }
                else if (tipo === 3) {
                    this.llaveOriginalX = posX;
                    this.llaveOriginalY = posY;
                    this.llave = this.physics.add.sprite(posX, posY, "key").setScale(0.8);
                    this.llave.body.allowGravity = false;
                }
                else if (tipo === 4) {
                    this.puerta = this.physics.add.staticSprite(posX, posY-15, "door").setScale(0.9);
                    console.log("🚪 PUERTA CREADA:", posX, posY);
                }
            }
        }

        // FÍSICAS COMPLETAS
        this.physics.add.collider(this.grupoJugadores, this.plataformas);
        this.physics.add.collider(this.grupoJugadores, this.grupoJugadores);
        this.physics.add.overlap(this.grupoJugadores, this.agua, this.respawnEquipo, null, this);
        this.physics.add.overlap(this.grupoJugadores, this.llave, this.agarrarLlave, null, this);
        
        // 🔥 FIX PRINCIPAL: DETECCIÓN PUERTA
        if (this.puerta) {
            this.physics.add.overlap(this.grupoJugadores, this.puerta, this.verificarVictoria, null, this);
        }

        // SOCKETS
        socket.off("inputDeJugador").on("inputDeJugador", this.handleInputGame.bind(this));
        socket.off("jugadorDesconectado").on("jugadorDesconectado", (id) => {
            if (this.jugadoresSprites[id]) {
                this.jugadoresSprites[id].sprite.destroy();
                delete this.jugadoresSprites[id];
            }
        });
        socket.off("servidorReiniciado").on("servidorReiniciado", () => {
            nivelActual = 1;
            this.scene.restart();
        });
    }

    handleInputGame(input) {
        const id = input.idDelSocket;
        if (!input.teclaPresionada) return;

        if (!this.jugadoresSprites[id] && contadorColores < CONFIG.MAX_JUGADORES) {
            const color = CONFIG.COLORES_JUGADORES[contadorColores % CONFIG.COLORES_JUGADORES.length];
            const player = this.grupoJugadores.create(100 + contadorColores * 30, 300, "player");
            player.setTint(color).setCollideWorldBounds(true).setScale(0.9);

            this.jugadoresSprites[id] = { sprite: player, controles: { left: false, right: false, jump: false } };
            contadorColores++;
            console.log(`👤 Jugador ${id} creado`);
        }

        const j = this.jugadoresSprites[id];
        if (!j) return;

        const activo = input.tipoDeEvento === "keydown";
        if (input.teclaPresionada === "ArrowLeft") j.controles.left = activo;
        if (input.teclaPresionada === "ArrowRight") j.controles.right = activo;
        if (input.teclaPresionada === "Space") j.controles.jump = activo;
    }

    respawnEquipo(jugadorSprite) {
        let i = 0;
        Object.values(this.jugadoresSprites).forEach(j => {
            j.sprite.setPosition(100 + i * 25, 300).setVelocity(0, 0);
            i++;
        });
        this.equipoTieneLlave = false;
        this.jugadorConLlaveSprite = null;
        if (this.llave) this.llave.setPosition(this.llaveOriginalX, this.llaveOriginalY);
        if (this.puerta) this.puerta.clearTint();
        console.log("💦 Respawn equipo");
    }

    agarrarLlave(jugadorSprite) {
        if (!this.equipoTieneLlave) {
            this.equipoTieneLlave = true;
            this.jugadorConLlaveSprite = jugadorSprite;
            if (this.puerta) this.puerta.setTint(0x00ff00);
            console.log("🔑 ¡LLAVE AGARRADA!");
        }
    }

    // 🔥 FIX: DETECCIÓN VICTORIA
    verificarVictoria(jugadorSprite, puertaSprite) {
        if (!this.equipoTieneLlave || this.nivelSuperado) return;
        
        console.log("🚪 ¡Jugador tocó PUERTA!");
        
        const jugadores = Object.values(this.jugadoresSprites);
        const alguienEnPuerta = jugadores.some(j => 
            Phaser.Geom.Intersects.RectangleToRectangle(
                j.sprite.getBounds(), 
                puertaSprite.getBounds()
            )
        );
        
        if (alguienEnPuerta) {
            console.log("🏆 ¡VICTORIA CONFIRMADA!");
            this.victoria();
        }
    }

    // 🔥 FIX: VICTORIA PERFECTA
    victoria() {
        console.log(`🎉 VICTORIA NIVEL ${nivelActual}`);
        this.nivelSuperado = true;
        this.txtVictoria.setVisible(true);
        
        Object.values(this.jugadoresSprites).forEach(j => {
            j.sprite.setVelocity(0, 0);
        });

        this.time.delayedCall(CONFIG.TIEMPO_VICTORIA, () => {
            console.log(`➡️ Avanzando a NIVEL ${nivelActual + 1}`);
            nivelActual++;
            this.scene.restart('SceneGame');
        });
    }

    // 🔥 FIX: UPDATE NO SE BLOQUEA
    update() {
        if (!this.jugadoresSprites || Object.keys(this.jugadoresSprites).length === 0) return;

        const jugadores = Object.values(this.jugadoresSprites);
        
        // CÁMARA
        const sumaX = jugadores.reduce((s, j) => s + j.sprite.x, 0);
        const targetX = sumaX / jugadores.length;
        const scrollX = Phaser.Math.Clamp(targetX - 400, 0, 2400);
        this.cameras.main.scrollX += (scrollX - this.cameras.main.scrollX) * 0.12;

        // MOVIMIENTO (SIEMPRE)
        jugadores.forEach(j => {
            const p = j.sprite;
            if (j.controles.left) p.setVelocityX(-CONFIG.VELOCIDAD_JUGADOR);
            else if (j.controles.right) p.setVelocityX(CONFIG.VELOCIDAD_JUGADOR);
            else p.setVelocityX(0);

            if (j.controles.jump && p.body.touching.down) {
                p.setVelocityY(-CONFIG.SALTO_FUERZA);
                j.controles.jump = false;
            }
        });

        // LLAVE
        if (this.jugadorConLlaveSprite?.active && this.llave) {
            this.llave.setPosition(this.jugadorConLlaveSprite.x, this.jugadorConLlaveSprite.y - 35);
        }
    }
}

// ========================================
// CONFIG PHASER
// ========================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "juego",
    physics: {
        default: "arcade",
        arcade: { 
            gravity: { y: CONFIG.GRAVEDAD }, 
            debug: false, 
            fps: 120, 
            overlapBias: 16 
        }
    },
    scene: [SceneGame]
};

new Phaser.Game(config);