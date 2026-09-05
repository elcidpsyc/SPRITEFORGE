import { i as __toESM } from "../_runtime.mjs";
import { L as require_jsx_runtime, R as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, c as Mountain, d as Download, f as ArrowUp, h as ArrowDown, i as Repeat, l as Layers, m as ArrowLeft, n as Sparkles, o as Pause, p as ArrowRight, r as Skull, s as Package, u as Grid3x3 } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DQzTRk9p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var PIVOT = {
	x: 32,
	y: 56
};
var HITBOX = {
	x: 22,
	y: 20,
	w: 20,
	h: 36
};
var DIRECTIONS = [
	"down",
	"up",
	"right",
	"left"
];
var ACTIONS = [
	"walk",
	"run",
	"attack",
	"guard",
	"dash",
	"hurt",
	"death"
];
var ACTION_META = {
	walk: {
		id: "walk",
		label: "Caminhada",
		frames: 8,
		fps: 8,
		loop: true,
		holdLast: false
	},
	run: {
		id: "run",
		label: "Corrida",
		frames: 8,
		fps: 12,
		loop: true,
		holdLast: false
	},
	attack: {
		id: "attack",
		label: "Ataque",
		frames: 8,
		fps: 10,
		loop: false,
		holdLast: false,
		hitFrame: 3
	},
	guard: {
		id: "guard",
		label: "Defesa",
		frames: 6,
		fps: 8,
		loop: false,
		holdLast: true
	},
	dash: {
		id: "dash",
		label: "Dash",
		frames: 6,
		fps: 14,
		loop: false,
		holdLast: false
	},
	hurt: {
		id: "hurt",
		label: "Dano",
		frames: 6,
		fps: 10,
		loop: false,
		holdLast: false
	},
	death: {
		id: "death",
		label: "Morte",
		frames: 8,
		fps: 8,
		loop: false,
		holdLast: true
	}
};
var MASTER_HEIGHT = ACTIONS.length * 4 * 64;
var ZOOM_LEVELS = [
	2,
	3,
	4,
	6,
	8
];
var BACKGROUNDS = [
	"xadrez",
	"preto",
	"grama",
	"areia",
	"pedra"
];
var ENGINES = [
	"godot",
	"phaser",
	"pixi",
	"unity",
	"generico"
];
var ENGINE_LABEL = {
	godot: "Godot 4",
	phaser: "Phaser 3",
	pixi: "PixiJS",
	unity: "Unity 2D",
	generico: "Genérico"
};
var TABS = [
	{
		id: "gerador",
		label: "Gerador de Imagem",
		short: "Gerador"
	},
	{
		id: "guerreiros",
		label: "Guerreiros Medievais (10)",
		short: "Guerreiros"
	},
	{
		id: "cenario",
		label: "Cenário Survivor & Magias",
		short: "Cenário"
	},
	{
		id: "inimigos",
		label: "Inimigos & Bosses",
		short: "Inimigos"
	},
	{
		id: "montagem",
		label: "Base & Montagem Modular",
		short: "Montagem"
	},
	{
		id: "armory",
		label: "Equipamentos",
		short: "Armory"
	}
];
var LAYERS = [
	"shadow",
	"legs",
	"torso",
	"cape",
	"head",
	"weapon",
	"shield",
	"vfx"
];
function buildAtlas(character) {
	const animations = Object.fromEntries(ACTIONS.map((id) => {
		const m = ACTION_META[id];
		return [id, {
			frames: m.frames,
			fps: m.fps,
			loop: m.loop,
			holdLast: m.holdLast,
			...m.hitFrame !== void 0 ? { hitFrame: m.hitFrame } : {}
		}];
	}));
	const perAction = Object.fromEntries(ACTIONS.map((id) => [id, `engines/_shared/${id}.png`]));
	return {
		specVersion: "1.0",
		id: character.id,
		name: character.name,
		title: character.title,
		cell: {
			w: 64,
			h: 64
		},
		pivot: { ...PIVOT },
		hitbox: { ...HITBOX },
		directions: [
			"down",
			"up",
			"right",
			"left"
		],
		sheet: {
			master: "sheet.png",
			layout: "actionsStacked",
			cols: 8,
			actionOrder: [...ACTIONS],
			perAction
		},
		animations,
		icons: {
			hud32: "icons/idle_32.png",
			hud32svg: "icons/idle_32.svg"
		},
		stats: character.stats,
		survivorSkill: character.survivorSkill
	};
}
var idle = {
	bob: 0,
	legL: 0,
	legR: 0,
	lean: 0,
	cape: 0,
	swordAngle: 0,
	swordReach: 0,
	shieldRaise: 0,
	knockX: 0,
	fallen: 0,
	smear: 0,
	flash: 0,
	vfx: 0
};
var TABLES = {
	walk: [
		{
			...idle,
			bob: 0,
			legL: 2,
			legR: -2,
			cape: -1
		},
		{
			...idle,
			bob: 1,
			legL: 3,
			legR: -3,
			cape: -2
		},
		{
			...idle,
			bob: 0,
			legL: 1,
			legR: -1,
			cape: -1
		},
		{
			...idle,
			bob: 0,
			legL: -1,
			legR: 1,
			cape: 0
		},
		{
			...idle,
			bob: 0,
			legL: -2,
			legR: 2,
			cape: 1
		},
		{
			...idle,
			bob: 1,
			legL: -3,
			legR: 3,
			cape: 2
		},
		{
			...idle,
			bob: 0,
			legL: -1,
			legR: 1,
			cape: 1
		},
		{
			...idle,
			bob: 0,
			legL: 1,
			legR: -1,
			cape: 0
		}
	],
	run: [
		{
			...idle,
			bob: 0,
			legL: 3,
			legR: -3,
			cape: -2,
			lean: 1,
			smear: 1
		},
		{
			...idle,
			bob: 2,
			legL: 4,
			legR: -4,
			cape: -3,
			lean: 1,
			smear: 1
		},
		{
			...idle,
			bob: 0,
			legL: 2,
			legR: -2,
			cape: -2,
			lean: 1
		},
		{
			...idle,
			bob: -1,
			legL: -1,
			legR: 1,
			cape: 0,
			lean: 1
		},
		{
			...idle,
			bob: 0,
			legL: -3,
			legR: 3,
			cape: 2,
			lean: 1,
			smear: 1
		},
		{
			...idle,
			bob: 2,
			legL: -4,
			legR: 4,
			cape: 3,
			lean: 1,
			smear: 1
		},
		{
			...idle,
			bob: 0,
			legL: -2,
			legR: 2,
			cape: 2,
			lean: 1
		},
		{
			...idle,
			bob: -1,
			legL: 1,
			legR: -1,
			cape: 0,
			lean: 1
		}
	],
	attack: [
		{
			...idle,
			swordAngle: -50,
			swordReach: -3,
			shieldRaise: 1,
			cape: 1
		},
		{
			...idle,
			swordAngle: -80,
			swordReach: -4,
			shieldRaise: 2,
			cape: 2,
			bob: -1
		},
		{
			...idle,
			swordAngle: -20,
			swordReach: 2,
			shieldRaise: 1,
			cape: -1,
			lean: 1
		},
		{
			...idle,
			swordAngle: 55,
			swordReach: 6,
			shieldRaise: 0,
			cape: -3,
			lean: 2,
			vfx: 1,
			smear: 2
		},
		{
			...idle,
			swordAngle: 70,
			swordReach: 5,
			cape: -2,
			lean: 1,
			vfx: .6
		},
		{
			...idle,
			swordAngle: 40,
			swordReach: 2,
			cape: -1,
			lean: 0
		},
		{
			...idle,
			swordAngle: 15,
			swordReach: 1,
			cape: 0
		},
		{
			...idle,
			swordAngle: 0,
			swordReach: 0,
			cape: 0
		}
	],
	guard: [
		{
			...idle,
			shieldRaise: 2,
			swordAngle: -10,
			bob: 0
		},
		{
			...idle,
			shieldRaise: 4,
			swordAngle: -15,
			bob: 0,
			lean: -1
		},
		{
			...idle,
			shieldRaise: 6,
			swordAngle: -20,
			bob: 1,
			lean: -1
		},
		{
			...idle,
			shieldRaise: 7,
			swordAngle: -22,
			bob: 1,
			lean: -1
		},
		{
			...idle,
			shieldRaise: 7,
			swordAngle: -22,
			bob: 1,
			lean: -1
		},
		{
			...idle,
			shieldRaise: 7,
			swordAngle: -22,
			bob: 1,
			lean: -1
		}
	],
	dash: [
		{
			...idle,
			lean: 2,
			smear: 1,
			cape: -2,
			bob: -1
		},
		{
			...idle,
			lean: 3,
			smear: 3,
			cape: -4,
			bob: 0,
			knockX: 2
		},
		{
			...idle,
			lean: 3,
			smear: 4,
			cape: -5,
			bob: 0,
			knockX: 3
		},
		{
			...idle,
			lean: 2,
			smear: 3,
			cape: -3,
			bob: 1,
			knockX: 2
		},
		{
			...idle,
			lean: 1,
			smear: 1,
			cape: -1,
			bob: 0,
			knockX: 1
		},
		{
			...idle,
			lean: 0,
			smear: 0,
			cape: 0,
			bob: 0
		}
	],
	hurt: [
		{
			...idle,
			flash: .8,
			knockX: -1,
			bob: 0
		},
		{
			...idle,
			flash: 1,
			knockX: -2,
			bob: 1,
			cape: 2
		},
		{
			...idle,
			flash: .5,
			knockX: -2,
			bob: 1,
			cape: 2,
			swordAngle: -20
		},
		{
			...idle,
			flash: .2,
			knockX: -1,
			bob: 0,
			cape: 1
		},
		{
			...idle,
			flash: 0,
			knockX: 0,
			bob: 0
		},
		{ ...idle }
	],
	death: [
		{
			...idle,
			knockX: -1,
			bob: 0,
			flash: .4
		},
		{
			...idle,
			knockX: -2,
			bob: 1,
			cape: 2,
			swordAngle: -30
		},
		{
			...idle,
			knockX: -2,
			bob: 2,
			fallen: .2,
			cape: 3
		},
		{
			...idle,
			knockX: -1,
			bob: 4,
			fallen: .45,
			cape: 2,
			swordAngle: -50
		},
		{
			...idle,
			knockX: 0,
			bob: 8,
			fallen: .7,
			cape: 1,
			swordAngle: -80
		},
		{
			...idle,
			knockX: 1,
			bob: 12,
			fallen: .9,
			cape: 0,
			swordAngle: -90
		},
		{
			...idle,
			knockX: 2,
			bob: 14,
			fallen: 1,
			cape: 0,
			swordAngle: -90
		},
		{
			...idle,
			knockX: 2,
			bob: 14,
			fallen: 1,
			cape: 0,
			swordAngle: -90
		}
	]
};
function poseFor(action, frame) {
	const table = TABLES[action];
	const n = ACTION_META[action].frames;
	return table[(frame % n + n) % n] ?? idle;
}
var OUT = [
	16,
	12,
	10,
	255
];
var VISOR = [
	10,
	8,
	12,
	255
];
var GOLD = [
	201,
	162,
	39,
	255
];
var GOLD_DK = [
	140,
	108,
	24,
	255
];
var HAIR = [
	28,
	20,
	16,
	255
];
var SKIN = [
	210,
	164,
	118,
	255
];
var SHADOW = [
	0,
	0,
	0,
	88
];
var Pix = class {
	w;
	h;
	data;
	constructor(w, h, data) {
		this.w = w;
		this.h = h;
		this.data = data ?? new Uint8ClampedArray(w * h * 4);
	}
	set(x, y, c) {
		const xi = x | 0;
		const yi = y | 0;
		if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
		const a = c[3];
		if (a <= 0) return;
		const i = (yi * this.w + xi) * 4;
		if (a >= 255) {
			this.data[i] = c[0];
			this.data[i + 1] = c[1];
			this.data[i + 2] = c[2];
			this.data[i + 3] = 255;
			return;
		}
		const da = this.data[i + 3] / 255;
		const sa = a / 255;
		const outA = sa + da * (1 - sa);
		if (outA <= 0) return;
		this.data[i] = Math.round((c[0] * sa + this.data[i] * da * (1 - sa)) / outA);
		this.data[i + 1] = Math.round((c[1] * sa + this.data[i + 1] * da * (1 - sa)) / outA);
		this.data[i + 2] = Math.round((c[2] * sa + this.data[i + 2] * da * (1 - sa)) / outA);
		this.data[i + 3] = Math.round(outA * 255);
	}
	rect(x, y, w, h, c) {
		for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) this.set(x + xx, y + yy, c);
	}
	ellipse(cx, cy, rx, ry, c) {
		for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if (x * x * ry * ry + y * y * rx * rx <= rx * rx * ry * ry) this.set(cx + x, cy + y, c);
	}
	rgb(rgb, a = 255) {
		return [
			rgb[0],
			rgb[1],
			rgb[2],
			a
		];
	}
};
function strokeOutline(p, color = OUT) {
	const orig = new Uint8ClampedArray(p.data);
	const aAt = (x, y) => {
		if (x < 0 || y < 0 || x >= p.w || y >= p.h) return 0;
		return orig[(y * p.w + x) * 4 + 3];
	};
	for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
		if (aAt(x, y) > 16) continue;
		if (aAt(x - 1, y) > 16 || aAt(x + 1, y) > 16 || aAt(x, y - 1) > 16 || aAt(x, y + 1) > 16) p.set(x, y, color);
	}
}
function drawCape(p, kit, dir, pose, y0) {
	if (!kit.hasCape || !kit.cape || !kit.capeShadow) return;
	const cape = p.rgb(kit.cape);
	const dk = p.rgb(kit.capeShadow);
	const sway = pose.cape;
	const h = Math.max(10, 20 - Math.round(pose.fallen * 10));
	const y = y0 + 1 + Math.round(pose.fallen * 6);
	if (dir === "down") {
		p.rect(21 + sway, y, 5, h, dk);
		p.rect(22 + sway, y + 2, 3, h - 4, cape);
		p.rect(38 - sway, y, 5, h, cape);
		p.rect(39 - sway, y + 3, 3, h - 6, dk);
	} else if (dir === "up") {
		p.rect(22 + sway, y, 20, h + 2, cape);
		p.rect(24 + sway, y + 3, 16, h - 3, dk);
	} else if (dir === "right") {
		p.rect(20 - sway - pose.lean, y, 8, h, cape);
		p.rect(21 - sway, y + 3, 5, h - 5, dk);
	} else {
		p.rect(36 + sway + pose.lean, y, 8, h, cape);
		p.rect(38 + sway, y + 3, 5, h - 5, dk);
	}
}
function drawLegs(p, kit, dir, pose, y0) {
	const cloth = p.rgb(kit.clothShadow);
	const leather = p.rgb(kit.leather);
	if (pose.fallen > .7) {
		p.rect(24 + pose.knockX, 51, 16, 5, cloth);
		p.rect(22 + pose.knockX, 53, 7, 3, leather);
		p.rect(35 + pose.knockX, 53, 7, 3, leather);
		return;
	}
	const ly = y0 + 19;
	if (dir === "left" || dir === "right") {
		const front = dir === "right" ? pose.legR : pose.legL;
		const back = dir === "right" ? pose.legL : pose.legR;
		p.rect(30 + pose.lean, ly + back, 4, 8, cloth);
		p.rect(29 + pose.lean, ly + 8 + back, 5, 3, leather);
		p.rect(31 + pose.lean, ly + front, 4, 9, p.rgb(kit.cloth));
		p.rect(30 + pose.lean, ly + 9 + front, 6, 3, leather);
	} else {
		p.rect(26, ly + pose.legL, 5, 9, p.rgb(kit.cloth));
		p.rect(33, ly + pose.legR, 5, 9, p.rgb(kit.cloth));
		p.rect(25, ly + 9 + pose.legL, 6, 3, leather);
		p.rect(33, ly + 9 + pose.legR, 6, 3, leather);
	}
}
function drawTorso(p, kit, dir, pose, y0) {
	const cloth = p.rgb(kit.cloth);
	const sh = p.rgb(kit.clothShadow);
	const lt = p.rgb(kit.clothLight);
	const acc = p.rgb(kit.accent);
	const metal = p.rgb(kit.metal);
	const metalLt = p.rgb(kit.metalLight);
	const leather = p.rgb(kit.leather);
	const x = 26 + pose.lean + pose.knockX;
	const y = y0;
	const w = dir === "left" || dir === "right" ? 11 : 12;
	p.rect(x, y, w, 17, cloth);
	p.rect(x + 1, y + 1, w - 2, 2, lt);
	p.rect(x + 1, y + 13, w - 2, 2, sh);
	p.rect(x, y + 14, w, 2, leather);
	p.rect(x + Math.floor(w / 2) - 1, y + 14, 3, 2, GOLD);
	p.rect(x - 1, y + 1, 4, 4, metal);
	p.rect(x, y + 1, 2, 2, metalLt);
	p.rect(x + w - 3, y + 1, 4, 4, metal);
	p.rect(x + w - 2, y + 1, 2, 2, metalLt);
	if (dir === "down") {
		p.rect(x + 5, y + 3, 2, 10, acc);
		p.rect(x + 2, y + 6, 8, 2, acc);
	} else if (dir === "up") p.rect(x + 2, y + 4, w - 4, 7, sh);
	else p.rect(x + (dir === "right" ? 2 : w - 4), y + 5, 2, 7, acc);
}
function drawHead(p, kit, dir, pose, y0) {
	const metal = p.rgb(kit.metal);
	const metalLt = p.rgb(kit.metalLight);
	const metalDk = p.rgb(kit.metalDark);
	const cloth = p.rgb(kit.cloth);
	const sh = p.rgb(kit.clothShadow);
	const acc = p.rgb(kit.accent);
	const x = 26 + pose.lean + pose.knockX;
	const y = y0 - 11;
	if (pose.fallen > .75) {
		p.rect(x + 8, y + 16, 11, 9, metal);
		return;
	}
	if (kit.helm === "hood") {
		p.rect(x + 1, y + 3, 11, 11, sh);
		p.rect(x + 2, y + 4, 9, 7, cloth);
		if (dir === "down") {
			p.rect(x + 4, y + 7, 5, 4, SKIN);
			p.rect(x + 5, y + 8, 1, 1, VISOR);
			p.rect(x + 8, y + 8, 1, 1, VISOR);
		} else if (dir !== "up") {
			const fx = dir === "right" ? x + 7 : x + 3;
			p.rect(fx, y + 7, 4, 4, SKIN);
		}
		return;
	}
	if (kit.helm === "none") {
		p.rect(x + 3, y + 5, 9, 8, SKIN);
		p.rect(x + 3, y + 4, 9, 3, HAIR);
		p.rect(x + 6, y, 3, 5, HAIR);
		p.rect(x + 7, y - 1, 2, 2, acc);
		if (dir === "down") {
			p.rect(x + 5, y + 8, 1, 1, VISOR);
			p.rect(x + 9, y + 8, 1, 1, VISOR);
		} else if (dir !== "up") p.rect(dir === "right" ? x + 10 : x + 4, y + 8, 1, 1, VISOR);
		return;
	}
	p.rect(x + 1, y + 2, 11, 11, metal);
	p.rect(x + 2, y + 3, 9, 2, metalLt);
	p.rect(x + 2, y + 10, 9, 2, metalDk);
	if (kit.helm === "great" || kit.helm === "crest") {
		if (dir === "down") {
			p.rect(x + 5, y + 5, 3, 2, VISOR);
			p.rect(x + 6, y + 5, 1, 5, VISOR);
		} else if (dir === "up") p.rect(x + 3, y + 4, 7, 6, metalDk);
		else {
			const fx = dir === "right" ? x + 8 : x + 3;
			p.rect(fx, y + 5, 2, 2, VISOR);
			p.rect(fx + (dir === "right" ? 1 : 0), y + 5, 1, 5, VISOR);
		}
	}
	if (kit.helm === "nasal" && dir === "down") {
		p.rect(x + 4, y + 6, 5, 3, SKIN);
		p.rect(x + 6, y + 6, 1, 4, metalDk);
	}
	if (kit.helm === "crest") p.rect(x + 5, y - 2, 3, 4, acc);
	if (kit.helm === "horns") {
		p.rect(x - 2, y + 2, 3, 2, metalLt);
		p.rect(x + 12, y + 2, 3, 2, metalLt);
		if (dir === "down") {
			p.rect(x + 4, y + 6, 5, 3, SKIN);
			p.rect(x + 5, y + 7, 1, 1, VISOR);
			p.rect(x + 8, y + 7, 1, 1, VISOR);
		}
	}
}
function blade(p, ox, oy, angleDeg, reach, length, kit) {
	const metal = p.rgb(kit.metalLight);
	const rad = angleDeg * Math.PI / 180;
	const dx = Math.cos(rad);
	const dy = Math.sin(rad);
	const sx = ox + Math.round(dx * reach);
	const sy = oy + Math.round(dy * reach);
	for (let i = 0; i < length; i++) {
		const x = sx + Math.round(dx * i);
		const y = sy + Math.round(dy * i);
		p.set(x, y, i < 2 ? GOLD : metal);
		p.set(x, y - 1, i < 2 ? GOLD_DK : p.rgb(kit.metal));
	}
	p.rect(sx - 2, sy - 1, 5, 3, GOLD);
}
function drawWeapon(p, kit, dir, pose, y0) {
	const metal = p.rgb(kit.metalLight);
	const leather = p.rgb(kit.leather);
	const acc = p.rgb(kit.accent);
	const lean = pose.lean + pose.knockX;
	const handY = y0 + 7;
	if (pose.fallen > .6) {
		p.rect(16 + pose.knockX, 54, 14, 2, metal);
		return;
	}
	const angle = (dir === "right" ? 10 : dir === "left" ? 170 : dir === "up" ? -90 : 95) + pose.swordAngle * (dir === "left" ? -1 : 1);
	if (kit.weapon === "bow") {
		const x = (dir === "left" ? 22 : dir === "right" ? 41 : 20) + lean;
		for (let i = -7; i <= 7; i++) p.set(x, handY + i, leather);
		p.set(x + (dir === "left" ? -1 : 1), handY - 7, leather);
		p.set(x + (dir === "left" ? -1 : 1), handY + 7, leather);
		return;
	}
	if (kit.weapon === "staff") {
		const x = (dir === "left" ? 22 : dir === "right" ? 42 : 20) + lean;
		p.rect(x, y0 - 6, 2, 26, leather);
		p.ellipse(x + 1, y0 - 7, 3, 3, acc);
		return;
	}
	if (kit.weapon === "spear") {
		const x = (dir === "left" ? 20 : dir === "right" ? 43 : 19) + lean;
		if (dir === "left" || dir === "right") {
			const sign = dir === "right" ? 1 : -1;
			for (let i = 0; i < 20; i++) p.set(x + i * sign, handY, leather);
			p.rect(x + 18 * sign, handY - 2, 3, 5, metal);
		} else {
			p.rect(x, y0 - 10, 2, 28, leather);
			p.rect(x - 1, y0 - 12, 4, 5, metal);
		}
		return;
	}
	if (kit.weapon === "daggers") {
		const hx = (dir === "right" ? 40 : dir === "left" ? 22 : 20) + lean;
		blade(p, hx, handY, angle, pose.swordReach, 9, kit);
		blade(p, hx + (dir === "down" ? 20 : 2), handY + 3, angle + 35, 0, 8, kit);
		return;
	}
	if (kit.weapon === "axes") {
		const hx = (dir === "right" ? 40 : dir === "left" ? 21 : 19) + lean;
		p.rect(hx, handY - 2, 2, 12, leather);
		p.rect(hx - 3, handY - 5, 8, 4, metal);
		if (dir === "down") {
			p.rect(hx + 22, handY, 2, 10, leather);
			p.rect(hx + 19, handY - 3, 8, 4, metal);
		}
		return;
	}
	if (kit.weapon === "hammer" || kit.weapon === "mace") {
		const hx = (dir === "right" ? 42 : dir === "left" ? 20 : 19) + lean;
		p.rect(hx, handY - 8, 2, 14, leather);
		p.rect(hx - 3, handY - 12, 8, 6, kit.weapon === "hammer" ? GOLD : metal);
		return;
	}
	blade(p, (dir === "right" ? 40 : dir === "left" ? 22 : dir === "up" ? 22 : 19) + lean, handY, angle, pose.swordReach, kit.weapon === "katana" ? 16 : 14, kit);
}
function drawShield(p, kit, dir, pose, y0) {
	if (kit.shield === "none" || pose.fallen > .7) return;
	const metal = p.rgb(kit.metal);
	const metalLt = p.rgb(kit.metalLight);
	const metalDk = p.rgb(kit.metalDark);
	const acc = p.rgb(kit.accent);
	const raise = pose.shieldRaise;
	const lean = pose.lean + pose.knockX;
	const front = dir === "left" || dir === "down";
	let x;
	const y = y0 + 3 - raise;
	if (dir === "down") x = 39 + lean;
	else if (dir === "up") x = 21 + lean;
	else if (dir === "right") x = 24 + lean;
	else x = 36 + lean;
	if (kit.shield === "tower") {
		const w = front ? 10 : 7;
		p.rect(x, y - 2, w, 20, metal);
		p.rect(x + 1, y - 1, w - 2, 2, metalLt);
		p.rect(x + 2, y + 6, w - 4, 6, metalDk);
		return;
	}
	if (kit.shield === "round") {
		p.ellipse(x + 4, y + 7, 6, 6, metal);
		p.ellipse(x + 4, y + 7, 2, 2, acc);
		p.set(x + 3, y + 6, metalLt);
		return;
	}
	const w = front ? 9 : 6;
	p.rect(x, y, w, 12, metal);
	p.rect(x + 1, y + 11, w - 2, 2, metalDk);
	p.rect(x + 1, y + 1, w - 2, 2, metalLt);
	if (front) {
		p.rect(x + 3, y + 3, 2, 8, acc);
		p.rect(x + 1, y + 6, 6, 2, acc);
	}
}
function drawVfx(p, dir, pose, y0) {
	if (pose.vfx <= .05) return;
	const a = Math.round(200 * pose.vfx);
	const col = [
		255,
		224,
		140,
		a
	];
	const spark = [
		255,
		255,
		255,
		a
	];
	if (dir === "down") for (let i = 0; i < 11; i++) {
		p.set(18 + i, y0 + 6 + Math.round(Math.sin(i / 2.5) * 2), col);
		p.set(18 + i, y0 + 7 + Math.round(Math.sin(i / 2.5) * 2), spark);
	}
	else if (dir === "right") for (let i = 0; i < 10; i++) {
		p.set(46 + i, y0 + 6, col);
		p.set(46 + i, y0 + 7, spark);
	}
	else if (dir === "left") for (let i = 0; i < 10; i++) {
		p.set(16 - i, y0 + 6, col);
		p.set(16 - i, y0 + 7, spark);
	}
	else for (let i = 0; i < 8; i++) p.set(28 + i, y0 - 2, col);
}
function applyFlash(p, amount) {
	if (amount <= 0) return;
	for (let i = 0; i < p.data.length; i += 4) {
		if (p.data[i + 3] < 8) continue;
		p.data[i] = Math.min(255, p.data[i] + Math.round(120 * amount));
		p.data[i + 1] = Math.min(255, p.data[i + 1] + Math.round(120 * amount));
		p.data[i + 2] = Math.min(255, p.data[i + 2] + Math.round(120 * amount));
	}
}
function renderFrame(character, action, direction, frame) {
	const body = new Pix(64, 64);
	const kit = character.kit;
	const pose = poseFor(action, frame);
	const y0 = 23 + pose.bob + Math.round(pose.fallen * 3);
	if (pose.smear > 0 && (direction === "left" || direction === "right")) {
		const sign = direction === "left" ? 1 : -1;
		const a = Math.min(90, 28 * pose.smear);
		body.rect(32 + sign * 9, 22, 3, 24, [
			kit.cape ? kit.cape[0] : 160,
			40,
			40,
			a
		]);
	}
	if (direction === "up") {
		drawWeapon(body, kit, direction, pose, y0);
		drawShield(body, kit, direction, pose, y0);
		drawLegs(body, kit, direction, pose, y0);
		drawTorso(body, kit, direction, pose, y0);
		drawHead(body, kit, direction, pose, y0);
		drawCape(body, kit, direction, pose, y0);
	} else if (direction === "right") {
		drawCape(body, kit, direction, pose, y0);
		drawShield(body, kit, direction, pose, y0);
		drawLegs(body, kit, direction, pose, y0);
		drawTorso(body, kit, direction, pose, y0);
		drawHead(body, kit, direction, pose, y0);
		drawWeapon(body, kit, direction, pose, y0);
	} else if (direction === "left") {
		drawCape(body, kit, direction, pose, y0);
		drawWeapon(body, kit, direction, pose, y0);
		drawLegs(body, kit, direction, pose, y0);
		drawTorso(body, kit, direction, pose, y0);
		drawHead(body, kit, direction, pose, y0);
		drawShield(body, kit, direction, pose, y0);
	} else {
		drawCape(body, kit, direction, pose, y0);
		drawLegs(body, kit, direction, pose, y0);
		drawWeapon(body, kit, direction, pose, y0);
		drawTorso(body, kit, direction, pose, y0);
		drawHead(body, kit, direction, pose, y0);
		drawShield(body, kit, direction, pose, y0);
	}
	drawVfx(body, direction, pose, y0);
	strokeOutline(body);
	applyFlash(body, pose.flash);
	const out = new Pix(64, 64);
	const squash = 1 + pose.fallen * .5;
	out.ellipse(32 + pose.knockX, 57, Math.round(9 * squash), 3, SHADOW);
	blit(out, body, 0, 0);
	return out;
}
function blit(dest, src, dx, dy) {
	for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
		const i = (y * src.w + x) * 4;
		const a = src.data[i + 3];
		if (a === 0) continue;
		dest.set(dx + x, dy + y, [
			src.data[i],
			src.data[i + 1],
			src.data[i + 2],
			a
		]);
	}
}
var rgb = (h) => {
	const n = h.replace("#", "");
	return [
		parseInt(n.slice(0, 2), 16),
		parseInt(n.slice(2, 4), 16),
		parseInt(n.slice(4, 6), 16)
	];
};
var steel = {
	metal: rgb("#8A96A3"),
	metalLight: rgb("#C5CDD4"),
	metalDark: rgb("#4A5560"),
	leather: rgb("#5C3A1E")
};
function kit(partial) {
	return partial;
}
var ROSTER = [
	{
		id: "swordsman",
		name: "Espadachim Real",
		title: "Combate Equilibrado",
		difficulty: "facil",
		role: "Duelista da coroa",
		weapon: "Espada Longa de Aço Nobre",
		lore: "Padrão da coroa. Corte limpo, guarda alta, nada de frescura.",
		stats: {
			hp: 480,
			atk: 72,
			def: 40,
			spd: 4.4
		},
		survivorSkill: {
			name: "Riposte Real",
			desc: "O próximo bloqueio devolve 50% do dano."
		},
		tags: [
			"Espada",
			"Equilíbrio",
			"Coroa"
		],
		accent: "#3B82F6",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#2B4C8A"),
			clothShadow: rgb("#1B3260"),
			clothLight: rgb("#4E72B8"),
			cape: rgb("#1E3A8A"),
			capeShadow: rgb("#152A66"),
			accent: rgb("#60A5FA"),
			accentDark: rgb("#1D4ED8"),
			helm: "nasal",
			weapon: "sword",
			shield: "none",
			hasCape: false
		})
	},
	{
		id: "lancer",
		name: "Lanceiro da Vanguarda",
		title: "Controle de Espaço",
		difficulty: "medio",
		role: "Linha de frente",
		weapon: "Pique de Batalha com Estandarte",
		lore: "Segura a linha. Ninguém passa do alcance do pique.",
		stats: {
			hp: 520,
			atk: 70,
			def: 48,
			spd: 3.8
		},
		survivorSkill: {
			name: "Muralha de Pontas",
			desc: "Aumenta alcance e empurra inimigos por 4s."
		},
		tags: [
			"Lança",
			"Alcance",
			"Linha de Frente"
		],
		accent: "#10B981",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#1F6B4A"),
			clothShadow: rgb("#144830"),
			clothLight: rgb("#34A06E"),
			cape: rgb("#14532D"),
			capeShadow: rgb("#0B3B1F"),
			accent: rgb("#86EFAC"),
			accentDark: rgb("#166534"),
			helm: "nasal",
			weapon: "spear",
			shield: "none",
			hasCape: true
		})
	},
	{
		id: "ronin",
		name: "Samurai Ronin",
		title: "Vento Fantasma de Hanzo",
		difficulty: "dificil",
		role: "Assassino de corte",
		weapon: "Katana Muramasa Curva",
		lore: "Mestre andarilho das técnicas iaijutsu. Cortes instantâneos, crítico alto.",
		stats: {
			hp: 410,
			atk: 92,
			def: 28,
			spd: 5.1
		},
		survivorSkill: {
			name: "Corte das Mil Pétalas",
			desc: "Desfere 8 golpes críticos instantâneos."
		},
		tags: [
			"Katana",
			"Crítico",
			"Dash Veloz",
			"Alto Dano"
		],
		accent: "#EF4444",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#1A1A1A"),
			clothShadow: rgb("#0A0A0A"),
			clothLight: rgb("#3F3F46"),
			cape: rgb("#7F1D1D"),
			capeShadow: rgb("#450A0A"),
			leather: rgb("#1C1917"),
			accent: rgb("#EF4444"),
			accentDark: rgb("#991B1B"),
			helm: "none",
			weapon: "katana",
			shield: "none",
			hasCape: false
		})
	},
	{
		id: "paladin",
		name: "Paladino da Luz Divina",
		title: "Tanque Sagrado",
		difficulty: "facil",
		role: "Tanque sagrado",
		weapon: "Martelo Abençoado & Escudo da Fé",
		lore: "Luz que não recua. O martelo canta, o escudo não racha.",
		stats: {
			hp: 680,
			atk: 58,
			def: 72,
			spd: 3.2
		},
		survivorSkill: {
			name: "Consagração",
			desc: "Cura aliados próximos e queima mortos-vivos."
		},
		tags: [
			"Martelo",
			"Sagrado",
			"Tanque"
		],
		accent: "#EAB308",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#F5F0D8"),
			clothShadow: rgb("#C9C09A"),
			clothLight: rgb("#FFFBEB"),
			cape: rgb("#CA8A04"),
			capeShadow: rgb("#854D0E"),
			accent: rgb("#EAB308"),
			accentDark: rgb("#A16207"),
			helm: "crest",
			weapon: "hammer",
			shield: "round",
			hasCape: true
		})
	},
	{
		id: "archer",
		name: "Arqueiro Caçador",
		title: "Atirador à Distância",
		difficulty: "medio",
		role: "Kiting à distância",
		weapon: "Arco Longo de Teixo & Aljava",
		lore: "Uma flecha, um problema a menos. Não deixa chegar perto.",
		stats: {
			hp: 360,
			atk: 80,
			def: 22,
			spd: 4.8
		},
		survivorSkill: {
			name: "Chuva de Teixo",
			desc: "Dispara uma saraivada em cone."
		},
		tags: [
			"Arco",
			"Kiting",
			"Precisão"
		],
		accent: "#22C55E",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#3F6212"),
			clothShadow: rgb("#2A410C"),
			clothLight: rgb("#65A30D"),
			cape: null,
			capeShadow: null,
			leather: rgb("#7C4A1E"),
			accent: rgb("#A3E635"),
			accentDark: rgb("#3F6212"),
			helm: "hood",
			weapon: "bow",
			shield: "none",
			hasCape: false
		})
	},
	{
		id: "templar",
		name: "Cavaleiro Templário",
		title: "Guardião das Cruzadas",
		difficulty: "medio",
		role: "Defesa pesada & impacto",
		weapon: "Espada Reta Medieval & Grande Escudo",
		lore: "Visual clássico: túnica branca, cruz vermelha, elmo com fenda e capa escarlate. Implacável contra as trevas.",
		stats: {
			hp: 610,
			atk: 64,
			def: 58,
			spd: 3.6
		},
		survivorSkill: {
			name: "Baluarte Implacável",
			desc: "Torna-se invulnerável por 3s e repele ataques."
		},
		tags: [
			"Cruzado",
			"Capa Vermelha",
			"Elmo de Ferro",
			"Referência"
		],
		accent: "#DC2626",
		layers: {
			shadow: "shadow-elliptic",
			legs: "greaves-steel",
			torso: "surcoat-white-cross",
			cape: "cape-scarlet",
			head: "great-helm-slit",
			weapon: "straight-sword",
			shield: "kite-cross"
		},
		pilot: true,
		kit: kit({
			...steel,
			cloth: rgb("#F2EDE0"),
			clothShadow: rgb("#C9C0AE"),
			clothLight: rgb("#FFFaf0"),
			cape: rgb("#9B1B1B"),
			capeShadow: rgb("#5C1010"),
			accent: rgb("#C41E3A"),
			accentDark: rgb("#8B1528"),
			helm: "great",
			weapon: "sword",
			shield: "kite",
			hasCape: true
		})
	},
	{
		id: "berserker",
		name: "Berserker Nórdico",
		title: "Dano Fúria & Caos",
		difficulty: "dificil",
		role: "Fúria de linha",
		weapon: "Machados Bípenes Gêmeos",
		lore: "Quanto menos vida, mais o machado fala.",
		stats: {
			hp: 540,
			atk: 88,
			def: 30,
			spd: 4.6
		},
		survivorSkill: {
			name: "Fúria do Inverno",
			desc: "ATQ sobe conforme HP cai. Aos 25% HP, hits em área."
		},
		tags: [
			"Machado",
			"Fúria",
			"Caos"
		],
		accent: "#F97316",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#7C2D12"),
			clothShadow: rgb("#431407"),
			clothLight: rgb("#C2410C"),
			cape: rgb("#9A3412"),
			capeShadow: rgb("#7C2D12"),
			leather: rgb("#44403C"),
			metal: rgb("#A8A29E"),
			accent: rgb("#F97316"),
			accentDark: rgb("#9A3412"),
			helm: "horns",
			weapon: "axes",
			shield: "none",
			hasCape: false
		})
	},
	{
		id: "assassin",
		name: "Assassino das Sombras",
		title: "Furtividade & Veneno",
		difficulty: "mestre",
		role: "Furtivo",
		weapon: "Adagas Gêmeas Peçonhentas",
		lore: "Se você viu o manto, já tomou o segundo corte.",
		stats: {
			hp: 320,
			atk: 96,
			def: 18,
			spd: 5.6
		},
		survivorSkill: {
			name: "Véu de Peçonha",
			desc: "Fica intangível 2s e aplica sangramento empilhável."
		},
		tags: [
			"Adaga",
			"Veneno",
			"Furtivo"
		],
		accent: "#A855F7",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#2E1065"),
			clothShadow: rgb("#1C0648"),
			clothLight: rgb("#5B21B6"),
			cape: rgb("#3B0764"),
			capeShadow: rgb("#1E0538"),
			leather: rgb("#1C1917"),
			accent: rgb("#C084FC"),
			accentDark: rgb("#6B21A8"),
			helm: "hood",
			weapon: "daggers",
			shield: "none",
			hasCape: true
		})
	},
	{
		id: "battlemage",
		name: "Mago de Batalha",
		title: "Magia Híbrida & Lâmina",
		difficulty: "dificil",
		role: "Híbrido éter",
		weapon: "Cajado Encantado & Espada de Éter",
		lore: "Não escolhe entre livro e aço. Usa os dois no mesmo compasso.",
		stats: {
			hp: 400,
			atk: 84,
			def: 26,
			spd: 4.2
		},
		survivorSkill: {
			name: "Ruptura de Éter",
			desc: "O próximo ataque corpo a corpo explode em área mágica."
		},
		tags: [
			"Cajado",
			"Híbrido",
			"Éter"
		],
		accent: "#6366F1",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#312E81"),
			clothShadow: rgb("#1E1B4B"),
			clothLight: rgb("#4F46E5"),
			cape: rgb("#4338CA"),
			capeShadow: rgb("#312E81"),
			accent: rgb("#A5B4FC"),
			accentDark: rgb("#3730A3"),
			helm: "hood",
			weapon: "staff",
			shield: "none",
			hasCape: true
		})
	},
	{
		id: "ironward",
		name: "Guardião de Ferro",
		title: "Super Tanque com Escudo Torre",
		difficulty: "facil",
		role: "Super tanque",
		weapon: "Escudo Torre de Platina & Clava",
		lore: "Porta andante. O grupo se esconde atrás dele e agradece.",
		stats: {
			hp: 760,
			atk: 48,
			def: 86,
			spd: 2.8
		},
		survivorSkill: {
			name: "Muralha Viva",
			desc: "Reduz dano do grupo em 40% e taunta inimigos."
		},
		tags: [
			"Escudo",
			"Tanque",
			"Platino"
		],
		accent: "#94A3B8",
		layers: {},
		kit: kit({
			...steel,
			cloth: rgb("#64748B"),
			clothShadow: rgb("#334155"),
			clothLight: rgb("#94A3B8"),
			cape: null,
			capeShadow: null,
			metal: rgb("#CBD5E1"),
			metalLight: rgb("#F1F5F9"),
			metalDark: rgb("#475569"),
			accent: rgb("#E2E8F0"),
			accentDark: rgb("#64748B"),
			helm: "great",
			weapon: "mace",
			shield: "tower",
			hasCape: false
		})
	}
];
var ROSTER_BY_ID = Object.fromEntries(ROSTER.map((c) => [c.id, c]));
function getCharacter(id) {
	return ROSTER_BY_ID[id] ?? ROSTER[5];
}
function crop(src, sx, sy, w, h) {
	const out = new Pix(w, h);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const i = ((sy + y) * src.w + (sx + x)) * 4;
		if (i < 0 || i >= src.data.length) continue;
		out.set(x, y, [
			src.data[i],
			src.data[i + 1],
			src.data[i + 2],
			src.data[i + 3]
		]);
	}
	return out;
}
function buildSheet(character) {
	const master = new Pix(512, MASTER_HEIGHT);
	const perAction = {};
	ACTIONS.forEach((action, actionIndex) => {
		const actionSheet = new Pix(512, 256);
		const frames = ACTION_META[action].frames;
		DIRECTIONS.forEach((dir, dirIndex) => {
			for (let f = 0; f < 8; f++) {
				if (f >= frames) continue;
				const cell = renderFrame(character, action, dir, f);
				const dx = f * 64;
				const dyAction = dirIndex * 64;
				const dyMaster = (actionIndex * 4 + dirIndex) * 64;
				blit(actionSheet, cell, dx, dyAction);
				blit(master, cell, dx, dyMaster);
			}
		});
		perAction[action] = actionSheet;
	});
	const idle = renderFrame(character, "guard", "down", 0);
	const iconSrc = crop(idle, 16, 8, 32, 32);
	let filled = 0;
	for (let i = 3; i < iconSrc.data.length; i += 4) if (iconSrc.data[i] > 20) filled++;
	const icon32 = filled > 40 ? iconSrc : crop(idle, 16, 12, 32, 32);
	return {
		id: character.id,
		master,
		perAction,
		icon32
	};
}
function pixToImageData(pix) {
	return new ImageData(new Uint8ClampedArray(pix.data), pix.w, pix.h);
}
function pixToCanvas(pix) {
	const c = document.createElement("canvas");
	c.width = pix.w;
	c.height = pix.h;
	c.getContext("2d").putImageData(pixToImageData(pix), 0, 0);
	return c;
}
async function canvasToBlob(canvas, type, quality) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("toBlob failed")), type, quality);
	});
}
async function pixToPngBlob(pix) {
	return canvasToBlob(pixToCanvas(pix), "image/png");
}
async function pixToJpgBlob(pix, bg = "#14161A") {
	const c = document.createElement("canvas");
	c.width = pix.w;
	c.height = pix.h;
	const ctx = c.getContext("2d");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.putImageData(pixToImageData(pix), 0, 0);
	return canvasToBlob(c, "image/jpeg", .92);
}
function pixToSvg(pix) {
	const rects = [];
	for (let y = 0; y < pix.h; y++) {
		let x = 0;
		while (x < pix.w) {
			const i = (y * pix.w + x) * 4;
			const a = pix.data[i + 3];
			if (a < 8) {
				x++;
				continue;
			}
			const r = pix.data[i];
			const g = pix.data[i + 1];
			const b = pix.data[i + 2];
			let w = 1;
			while (x + w < pix.w) {
				const j = (y * pix.w + x + w) * 4;
				if (pix.data[j] !== r || pix.data[j + 1] !== g || pix.data[j + 2] !== b || pix.data[j + 3] !== a) break;
				w++;
			}
			const fill = a === 255 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
			rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${fill}"/>`);
			x += w;
		}
	}
	return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${pix.w}" height="${pix.h}" shape-rendering="crispEdges" viewBox="0 0 ${pix.w} ${pix.h}">${rects.join("")}</svg>`;
}
function getCell(master, action, dir, frame) {
	const actionIndex = ACTIONS.indexOf(action);
	const dirIndex = DIRECTIONS.indexOf(dir);
	return crop(master, frame * 64, (actionIndex * 4 + dirIndex) * 64, 64, 64);
}
var cache = /* @__PURE__ */ new Map();
/** Characters that ship a real PNG pack under /packs/<id>/. */
var PACKED_IDS = /* @__PURE__ */ new Set(["templar"]);
var packed = /* @__PURE__ */ new Map();
var packListeners = /* @__PURE__ */ new Set();
function subscribePack(listener) {
	packListeners.add(listener);
	return () => packListeners.delete(listener);
}
function notifyPack() {
	packListeners.forEach((fn) => fn());
}
async function pixFromUrl(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`failed to load ${url}`);
	const blob = await res.blob();
	const bmp = await createImageBitmap(blob);
	const c = document.createElement("canvas");
	c.width = bmp.width;
	c.height = bmp.height;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("2d context");
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(bmp, 0, 0);
	const data = ctx.getImageData(0, 0, bmp.width, bmp.height);
	return new Pix(bmp.width, bmp.height, data.data);
}
async function loadPackedCharacter(id) {
	if (!PACKED_IDS.has(id)) return null;
	const hit = packed.get(id);
	if (hit) return hit;
	const master = await pixFromUrl(`/packs/${id}/sheet.png`);
	const perAction = {};
	await Promise.all(ACTIONS.map(async (action) => {
		perAction[action] = await pixFromUrl(`/packs/${id}/${action}.png`);
	}));
	let icon32;
	try {
		icon32 = await pixFromUrl(`/packs/${id}/icons/idle_32.png`);
	} catch {
		icon32 = crop(getCell(master, "walk", "down", 0), 16, 8, 32, 32);
	}
	const bundle = {
		id,
		master,
		perAction,
		icon32
	};
	packed.set(id, bundle);
	cache.delete(id);
	notifyPack();
	return bundle;
}
function getSheet(id) {
	const fromPack = packed.get(id);
	if (fromPack) return fromPack;
	if (PACKED_IDS.has(id)) return buildSheet(getCharacter(id));
	const hit = cache.get(id);
	if (hit) return hit;
	const built = buildSheet(getCharacter(id));
	cache.set(id, built);
	return built;
}
if (typeof window !== "undefined") loadPackedCharacter("templar");
var useStudio = create((set, get) => ({
	tab: "guerreiros",
	selectedId: "templar",
	action: "walk",
	direction: "down",
	playing: true,
	loop: true,
	fps: 8,
	frame: 0,
	zoom: 4,
	bg: "xadrez",
	onion: false,
	grid: false,
	hitbox: false,
	engine: "godot",
	rarityFilter: "todas",
	armorFilter: "todas",
	packEpoch: 0,
	bumpPack: () => set((s) => ({ packEpoch: s.packEpoch + 1 })),
	setTab: (tab) => set({ tab }),
	select: (id) => set({
		selectedId: id,
		frame: 0
	}),
	setAction: (action) => {
		const meta = ACTION_META[action];
		set({
			action,
			frame: 0,
			fps: meta.fps,
			loop: meta.loop,
			playing: true
		});
	},
	setDirection: (direction) => set({
		direction,
		frame: 0
	}),
	setPlaying: (playing) => set({ playing }),
	togglePlaying: () => set({ playing: !get().playing }),
	setLoop: (loop) => set({ loop }),
	setFps: (fps) => set({ fps: Math.max(1, Math.min(24, Math.round(fps))) }),
	setFrame: (frame) => set({ frame }),
	setZoom: (zoom) => set({ zoom }),
	setBg: (bg) => set({ bg }),
	setOnion: (onion) => set({ onion }),
	setGrid: (grid) => set({ grid }),
	setHitbox: (hitbox) => set({ hitbox }),
	setEngine: (engine) => set({ engine }),
	setRarityFilter: (rarityFilter) => set({ rarityFilter }),
	setArmorFilter: (armorFilter) => set({ armorFilter }),
	character: () => getCharacter(get().selectedId),
	frameCount: () => ACTION_META[get().action].frames
}));
if (typeof window !== "undefined") subscribePack(() => useStudio.getState().bumpPack());
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var DIFF_LABEL = {
	facil: "Fácil",
	medio: "Médio",
	dificil: "Difícil",
	mestre: "Mestre"
};
var DIFF_CLASS = {
	facil: "text-easy border-easy/40 bg-easy/10",
	medio: "text-gold border-gold/40 bg-gold/10",
	dificil: "text-hard border-hard/40 bg-hard/10",
	mestre: "text-master border-master/40 bg-master/10"
};
var RARITY_CLASS = {
	basico: "text-muted border-border bg-surface-2",
	raro: "text-rare border-rare/40 bg-rare/10",
	epico: "text-epic border-epic/40 bg-epic/10",
	lendario: "text-gold border-gold/40 bg-gold/10",
	imortal: "text-immortal border-immortal/40 bg-immortal/10"
};
function Badge({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide uppercase", className),
		children
	});
}
function DiffBadge({ d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: DIFF_CLASS[d],
		children: DIFF_LABEL[d]
	});
}
function GoldBtn({ children, onClick, className, disabled, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title,
		disabled,
		onClick,
		className: cn("inline-flex items-center justify-center gap-1.5 rounded-md border border-gold/70 bg-gold/10 px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-gold transition-colors duration-150 hover:bg-gold/20 disabled:opacity-40", className),
		children
	});
}
function GhostBtn({ children, onClick, active, className, title, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title,
		disabled,
		onClick,
		className: cn("inline-flex items-center justify-center gap-1 rounded-md border px-2.5 py-1.5 font-sans text-xs font-medium transition-colors duration-150 disabled:opacity-40", active ? "border-gold bg-gold text-gold-ink" : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-fg", className),
		children
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]", className),
		children
	});
}
function StatBar({ label, value, max, format }) {
	const pct = Math.max(4, Math.min(100, value / max * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[48px_1fr_52px] items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-sans text-[11px] font-semibold tracking-wider text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 overflow-hidden rounded-full bg-surface-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-gold",
					style: { width: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-right font-mono text-xs tabular-nums text-fg",
				children: format ? format(value) : value
			})
		]
	});
}
function paintBg(ctx, w, h, bg) {
	if (bg === "preto") {
		ctx.fillStyle = "#070809";
		ctx.fillRect(0, 0, w, h);
		return;
	}
	if (bg === "grama") {
		ctx.fillStyle = "#1e3a1c";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "#3d6b32";
		for (let i = 0; i < 40; i++) ctx.fillRect(i * 17 % w, i * 29 % h, 3, 2);
		return;
	}
	if (bg === "areia") {
		ctx.fillStyle = "#8a6a3e";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "#c4a574";
		for (let i = 0; i < 50; i++) ctx.fillRect(i * 13 % w, i * 23 % h, 2, 2);
		return;
	}
	if (bg === "pedra") {
		ctx.fillStyle = "#374151";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "#6b7280";
		for (let i = 0; i < 30; i++) ctx.fillRect(i * 19 % w, i * 31 % h, 6, 4);
		return;
	}
	const s = 8;
	for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
		ctx.fillStyle = (x / s + y / s | 0) % 2 === 0 ? "#1a1d23" : "#121418";
		ctx.fillRect(x, y, s, s);
	}
}
function PixelView({ cell, onion, zoom, bg, showGrid, showHitbox, className }) {
	const ref = (0, import_react.useRef)(null);
	const size = 64 * zoom;
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;
		paintBg(ctx, size, size, bg);
		if (onion) {
			ctx.globalAlpha = .28;
			const tmp = document.createElement("canvas");
			tmp.width = 64;
			tmp.height = 64;
			tmp.getContext("2d").putImageData(pixToImageData(onion), 0, 0);
			ctx.drawImage(tmp, 0, 0, size, size);
			ctx.globalAlpha = 1;
		}
		const tmp = document.createElement("canvas");
		tmp.width = 64;
		tmp.height = 64;
		tmp.getContext("2d").putImageData(pixToImageData(cell), 0, 0);
		ctx.drawImage(tmp, 0, 0, size, size);
		if (showGrid) {
			ctx.strokeStyle = "rgba(228,184,74,0.35)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(size / 2, 0);
			ctx.lineTo(size / 2, size);
			ctx.moveTo(0, size / 2);
			ctx.lineTo(size, size / 2);
			ctx.stroke();
		}
		if (showHitbox) {
			ctx.strokeStyle = "rgba(80,200,255,0.85)";
			ctx.lineWidth = 1;
			ctx.strokeRect(HITBOX.x * zoom, HITBOX.y * zoom, HITBOX.w * zoom, HITBOX.h * zoom);
			ctx.fillStyle = "#e4b84a";
			ctx.fillRect(PIVOT.x * zoom - 2, PIVOT.y * zoom - 2, 4, 4);
		}
	}, [
		cell,
		onion,
		zoom,
		bg,
		showGrid,
		showHitbox,
		size
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		width: size,
		height: size,
		className: cn("pixelated rounded-md", className),
		style: {
			width: size,
			height: size
		}
	});
}
function SheetCanvas({ pix, className, maxWidth }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		canvas.width = pix.w;
		canvas.height = pix.h;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;
		ctx.putImageData(pixToImageData(pix), 0, 0);
	}, [pix]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: cn("pixelated", className),
		style: {
			width: maxWidth ? Math.min(maxWidth, pix.w) : pix.w,
			height: maxWidth ? Math.round(pix.h / pix.w * Math.min(maxWidth, pix.w)) : pix.h
		}
	});
}
function Portrait({ pix, scale = 3, className }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		canvas.width = pix.w * scale;
		canvas.height = pix.h * scale;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;
		const tmp = document.createElement("canvas");
		tmp.width = pix.w;
		tmp.height = pix.h;
		tmp.getContext("2d").putImageData(pixToImageData(pix), 0, 0);
		ctx.drawImage(tmp, 0, 0, pix.w * scale, pix.h * scale);
	}, [pix, scale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: cn("pixelated", className),
		style: {
			width: pix.w * scale,
			height: pix.h * scale
		}
	});
}
var DIR_BTNS = [
	{
		id: "down",
		icon: ArrowDown,
		label: "Baixo"
	},
	{
		id: "up",
		icon: ArrowUp,
		label: "Cima"
	},
	{
		id: "right",
		icon: ArrowRight,
		label: "Direita"
	},
	{
		id: "left",
		icon: ArrowLeft,
		label: "Esquerda"
	}
];
var BG_LABEL = {
	xadrez: "Xadrez",
	preto: "Preto",
	grama: "Grama",
	areia: "Areia",
	pedra: "Pedra"
};
function AnimationPlayer() {
	const selectedId = useStudio((s) => s.selectedId);
	const action = useStudio((s) => s.action);
	const direction = useStudio((s) => s.direction);
	const playing = useStudio((s) => s.playing);
	const loop = useStudio((s) => s.loop);
	const fps = useStudio((s) => s.fps);
	const frame = useStudio((s) => s.frame);
	const zoom = useStudio((s) => s.zoom);
	const bg = useStudio((s) => s.bg);
	const onion = useStudio((s) => s.onion);
	const grid = useStudio((s) => s.grid);
	const hitbox = useStudio((s) => s.hitbox);
	const packEpoch = useStudio((s) => s.packEpoch);
	const bundle = (0, import_react.useMemo)(() => getSheet(selectedId), [selectedId, packEpoch]);
	const meta = ACTION_META[action];
	const n = meta.frames;
	const cell = (0, import_react.useMemo)(() => getCell(bundle.master, action, direction, Math.min(frame, n - 1)), [
		bundle,
		action,
		direction,
		frame,
		n
	]);
	const onionCell = (0, import_react.useMemo)(() => {
		if (!onion) return null;
		const prev = (frame - 1 + n) % n;
		return getCell(bundle.master, action, direction, prev);
	}, [
		onion,
		bundle,
		action,
		direction,
		frame,
		n
	]);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		let last = performance.now();
		let acc = 0;
		let raf = 0;
		const tick = (now) => {
			const dt = now - last;
			last = now;
			acc += dt;
			const interval = 1e3 / Math.max(1, useStudio.getState().fps);
			while (acc >= interval) {
				acc -= interval;
				const s = useStudio.getState();
				const count = ACTION_META[s.action].frames;
				const hold = ACTION_META[s.action].holdLast;
				let next = s.frame + 1;
				if (next >= count) {
					if (s.loop) next = 0;
					else {
						useStudio.setState({
							frame: count - 1,
							playing: hold ? false : false
						});
						return;
					}
				}
				useStudio.setState({ frame: next });
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [playing, action]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase",
					children: "Animation Player"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg text-fg",
					children: "Preview 64×64"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: [fps, " fps"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: ACTIONS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					active: action === id,
					onClick: () => useStudio.getState().setAction(id),
					children: ACTION_META[id].label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center rounded-lg border border-border bg-bg-deep p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelView, {
					cell,
					onion: onionCell,
					zoom,
					bg,
					showGrid: grid,
					showHitbox: hitbox
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: playing,
						onClick: () => useStudio.getState().togglePlaying(),
						className: "min-h-10 min-w-10",
						title: playing ? "Pausar" : "Play",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
						active: loop,
						onClick: () => useStudio.getState().setLoop(!loop),
						title: "Loop",
						className: "min-h-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-3.5" }), "Loop"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-10 flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[10px] tracking-wider text-muted uppercase",
							children: "FPS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 4,
							max: 16,
							value: fps,
							onChange: (e) => useStudio.getState().setFps(Number(e.target.value)),
							className: "w-full accent-gold"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: n - 1,
					value: Math.min(frame, n - 1),
					onChange: (e) => {
						useStudio.getState().setPlaying(false);
						useStudio.getState().setFrame(Number(e.target.value));
					},
					className: "flex-1 accent-gold"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-28 text-right font-mono text-xs tabular-nums text-muted",
					children: [
						"Frame ",
						Math.min(frame, n - 1) + 1,
						"/",
						n,
						" (",
						meta.label,
						")"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[10px] tracking-wider text-muted uppercase",
					children: "Zoom"
				}), ZOOM_LEVELS.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
					active: zoom === z,
					onClick: () => useStudio.getState().setZoom(z),
					children: [z, "x"]
				}, z))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[10px] tracking-wider text-muted uppercase",
					children: "Fundo"
				}), BACKGROUNDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					active: bg === b,
					onClick: () => useStudio.getState().setBg(b),
					children: BG_LABEL[b]
				}, b))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[10px] tracking-wider text-muted uppercase",
						children: "Dir"
					}),
					DIR_BTNS.map(({ id, icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: direction === id,
						onClick: () => useStudio.getState().setDirection(id),
						title: label,
						className: "min-h-10 min-w-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
					}, id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: onion,
						onClick: () => useStudio.getState().setOnion(!onion),
						children: "Onion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
						active: grid,
						onClick: () => useStudio.getState().setGrid(!grid),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-3.5" }), "Grade 32"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: hitbox,
						onClick: () => useStudio.getState().setHitbox(!hitbox),
						children: "Hitbox"
					})
				]
			}),
			action === "attack" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-sans text-[11px] text-muted"),
				children: "hitFrame = 3 (0-index) · o golpe conecta no 4º quadro."
			})
		]
	});
}
function Dossier() {
	const character = useStudio((s) => s.character());
	const atlas = buildAtlas(character);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase",
					children: character.role
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl leading-none text-fg sm:text-4xl",
					children: character.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-sans text-sm text-muted",
					children: character.title
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffBadge, { d: character.difficulty }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-xs text-muted",
					children: character.weapon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-sans text-sm leading-relaxed text-fg/90",
				children: character.lore
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 rounded-md border border-border bg-bg-deep p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBar, {
						label: "HP",
						value: character.stats.hp,
						max: 760
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBar, {
						label: "ATQ",
						value: character.stats.atk,
						max: 96
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBar, {
						label: "DEF",
						value: character.stats.def,
						max: 86
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBar, {
						label: "SPD",
						value: character.stats.spd,
						max: 5.6,
						format: (n) => n.toFixed(1)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-gold/30 bg-gold/5 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[10px] font-semibold tracking-[0.16em] text-gold uppercase",
						children: "Habilidade Survivor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-base text-fg",
						children: character.survivorSkill.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 font-sans text-sm text-muted",
						children: character.survivorSkill.desc
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: character.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "border-border text-muted",
					children: t
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gold-rule" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Célula" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right text-fg",
						children: [
							64,
							"×",
							64,
							" px"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Pivot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right text-fg",
						children: [
							"(",
							PIVOT.x,
							", ",
							PIVOT.y,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Hitbox" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right text-fg",
						children: [
							HITBOX.w,
							"×",
							HITBOX.h,
							" @ ",
							HITBOX.x,
							",",
							HITBOX.y
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Sheet master" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right text-fg",
						children: [
							512,
							"×",
							MASTER_HEIGHT
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Layout" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right text-fg",
						children: atlas.sheet.layout
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Spec" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right text-fg",
						children: ["atlas ", atlas.specVersion]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GoldBtn, {
				onClick: async () => {
					const { exportAtlasJson } = await import("./pack-BKzxnTQM.mjs");
					exportAtlasJson(character);
				},
				className: "w-full min-h-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Baixar atlas.json"]
			})
		]
	});
}
var EQUIPMENT = [
	{
		id: "espada-reta",
		name: "Espada Reta Medieval",
		family: "espadas",
		armor: "media",
		rarity: "raro",
		atk: 64,
		def: 8,
		special: "Corte limpo no hitFrame 3",
		slot: "weapon",
		icon32: "icons/espada-reta.png",
		spritePreview: "previews/espada-reta.png"
	},
	{
		id: "escudo-cruz",
		name: "Grande Escudo da Cruz",
		family: "escudos",
		armor: "pesada",
		rarity: "epico",
		atk: 0,
		def: 42,
		special: "Baluarte: +30% block",
		slot: "shield",
		icon32: "icons/escudo-cruz.png",
		spritePreview: "previews/escudo-cruz.png"
	},
	{
		id: "katana-muramasa",
		name: "Katana Muramasa",
		family: "espadas",
		armor: "leve",
		rarity: "lendario",
		atk: 92,
		def: 2,
		special: "Crítico 2.4×",
		slot: "weapon",
		icon32: "icons/katana.png",
		spritePreview: "previews/katana.png"
	},
	{
		id: "pique-vanguarda",
		name: "Pique de Batalha",
		family: "lancas",
		armor: "media",
		rarity: "raro",
		atk: 70,
		def: 10,
		special: "Alcance +1 célula",
		slot: "weapon",
		icon32: "icons/pique.png",
		spritePreview: "previews/pique.png"
	},
	{
		id: "arco-teixo",
		name: "Arco Longo de Teixo",
		family: "arcos",
		armor: "leve",
		rarity: "raro",
		atk: 80,
		def: 0,
		special: "Saraivada em cone",
		slot: "weapon",
		icon32: "icons/arco.png",
		spritePreview: "previews/arco.png"
	},
	{
		id: "machados-gemeos",
		name: "Machados Bípenes Gêmeos",
		family: "machados",
		armor: "media",
		rarity: "epico",
		atk: 88,
		def: 4,
		special: "Fúria: ATQ sobe com HP baixo",
		slot: "weapon",
		icon32: "icons/machados.png",
		spritePreview: "previews/machados.png"
	},
	{
		id: "martelo-fe",
		name: "Martelo Abençoado",
		family: "marretas",
		armor: "pesada",
		rarity: "epico",
		atk: 58,
		def: 18,
		special: "Consagra o chão",
		slot: "weapon",
		icon32: "icons/martelo.png",
		spritePreview: "previews/martelo.png"
	},
	{
		id: "adagas-peconha",
		name: "Adagas Peçonhentas",
		family: "adagas",
		armor: "leve",
		rarity: "lendario",
		atk: 96,
		def: 0,
		special: "Sangramento empilhável",
		slot: "weapon",
		icon32: "icons/adagas.png",
		spritePreview: "previews/adagas.png"
	},
	{
		id: "cajado-eter",
		name: "Cajado Encantado",
		family: "cajados",
		armor: "leve",
		rarity: "epico",
		atk: 84,
		def: 6,
		special: "Ruptura de éter",
		slot: "weapon",
		icon32: "icons/cajado.png",
		spritePreview: "previews/cajado.png"
	},
	{
		id: "escudo-torre",
		name: "Escudo Torre de Platina",
		family: "escudos",
		armor: "pesada",
		rarity: "imortal",
		atk: 8,
		def: 86,
		special: "Muralha viva",
		slot: "shield",
		icon32: "icons/torre.png",
		spritePreview: "previews/torre.png"
	},
	{
		id: "capa-escarlate",
		name: "Capa Escarlate das Cruzadas",
		family: "escudos",
		armor: "media",
		rarity: "raro",
		atk: 0,
		def: 12,
		special: "Identidade do Templário",
		slot: "cape",
		icon32: "icons/capa.png",
		spritePreview: "previews/capa.png"
	},
	{
		id: "elmo-fenda",
		name: "Elmo de Fenda Templário",
		family: "escudos",
		armor: "pesada",
		rarity: "raro",
		atk: 0,
		def: 16,
		slot: "helm",
		icon32: "icons/elmo.png",
		spritePreview: "previews/elmo.png"
	}
];
var RARITY_LABEL = {
	basico: "Básico",
	raro: "Raro",
	epico: "Épico",
	lendario: "Lendário",
	imortal: "Imortal"
};
var FAMILY_LABEL = {
	adagas: "Adagas",
	arcos: "Arcos",
	espadas: "Espadas",
	machados: "Machados",
	marretas: "Marretas",
	cajados: "Cajados",
	lancas: "Lanças",
	escudos: "Escudos"
};
function Soon({ icon: Icon, title, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase",
					children: "Próxima etapa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl text-fg",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl font-sans text-sm text-muted",
					children: copy
				})
			] }),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-sm text-muted",
					children: "Layout pronto. Pipeline da aba 2 (player + atlas + pack Godot) fecha primeiro — depois esta superfície liga no mesmo contrato 64×64."
				})]
			})
		]
	});
}
function TabGerador() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Soon, {
		icon: Sparkles,
		title: "Gerador de Imagem",
		copy: "IA só como rascunho de conceito. Guarda-rail: célula 64×64, pivot (32, 56), paleta ≤ 24 cores. Source of truth continua sendo o paper-doll.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[1fr_320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "font-sans text-[11px] tracking-wider text-muted uppercase",
						children: "Prompt de conceito"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						disabled: true,
						rows: 6,
						className: "resize-none rounded-md border border-border bg-bg-deep p-3 font-sans text-sm text-muted",
						defaultValue: "Cavaleiro templário, túnica branca, cruz vermelha, capa escarlate, elmo de fenda, top-down 64×64…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: true,
						className: "min-h-10 rounded-md border border-gold/40 bg-gold/10 px-4 font-sans text-sm text-gold opacity-60",
						children: "Gerar rascunho (em breve)"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex flex-col gap-2 font-mono text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[10px] tracking-wider text-gold uppercase",
						children: "Guarda-rail"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "célula 64×64" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "pivot 32, 56" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "outline 1px" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "paleta 16–24" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "4 dirs · 7 ações" })
				]
			})]
		})
	});
}
function TabCenario() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Soon, {
		icon: Mountain,
		title: "Cenário Survivor & Magias",
		copy: "Tileset e VFX no mesmo contrato de célula. Ainda não entra no pack v1 — o herói piloto fecha primeiro.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
			children: [
				"Gramado",
				"Pedra",
				"Areia",
				"Cripta",
				"Fogo",
				"Gelo",
				"Raio",
				"Sagrado"
			].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "flex h-28 items-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm text-fg",
					children: n
				})
			}, n))
		})
	});
}
function TabInimigos() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Soon, {
		icon: Skull,
		title: "Inimigos & Bosses",
		copy: "Mesmo atlas, mesma célula. Placeholders até o Templário fechar as 7 ações com arte de catálogo.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
			children: [
				"Esqueleto",
				"Goblin",
				"Wraith",
				"Ogro",
				"Boss: Lichelord"
			].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "h-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-fg",
					children: n
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-xs text-muted",
					children: "64×64 · 4 dirs"
				})]
			}, n))
		})
	});
}
function TabMontagem() {
	const character = useStudio((s) => s.character());
	const pix = (0, import_react.useMemo)(() => renderFrame(character, "walk", "down", 0), [character]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Soon, {
		icon: Layers,
		title: "Base & Montagem Modular",
		copy: "Paper-doll em 8 layers. Trocar equipamento não move o pivot. A montagem já alimenta o player da aba 2.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[280px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex flex-col items-center gap-3",
				children: [character.id === "templar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/packs/templar/thumbs/idle_down.png",
					alt: "",
					width: 192,
					height: 192,
					className: "pixelated",
					style: {
						imageRendering: "pixelated",
						width: 192,
						height: 192
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
					pix,
					scale: 3
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm text-fg",
					children: character.name
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-2",
				children: LAYERS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: i
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-sm text-fg",
							children: l
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] text-subtle",
							children: character.layers[l] ?? "kit default"
						})
					]
				}, l))
			}) })]
		})
	});
}
function TabArmory() {
	const rarity = useStudio((s) => s.rarityFilter);
	const armor = useStudio((s) => s.armorFilter);
	const items = EQUIPMENT.filter((e) => {
		if (rarity !== "todas" && e.rarity !== rarity) return false;
		if (armor !== "todas" && e.armor !== armor) return false;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase",
					children: "Armory v0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl text-fg",
					children: "Equipamentos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl font-sans text-sm text-muted",
					children: "Catálogo mínimo tipado. Dual view sprite / ícone 32×32 e o “equipar no herói” entram depois do pack Godot do Templário."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					[
						"todas",
						"basico",
						"raro",
						"epico",
						"lendario",
						"imortal"
					].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: rarity === r,
						onClick: () => useStudio.getState().setRarityFilter(r),
						children: r === "todas" ? "Todas" : RARITY_LABEL[r]
					}, r)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-2 w-px bg-border" }),
					[
						"todas",
						"leve",
						"media",
						"pesada"
					].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						active: armor === a,
						onClick: () => useStudio.getState().setArmorFilter(a),
						children: a === "todas" ? "Todas" : a === "leve" ? "Leve" : a === "media" ? "Média" : "Pesada"
					}, a))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: items.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-base text-fg",
								children: e.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: RARITY_CLASS[e.rarity],
								children: RARITY_LABEL[e.rarity]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-sans text-xs text-muted",
							children: [
								FAMILY_LABEL[e.family],
								" · ",
								e.slot
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-4 font-mono text-xs tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ATQ ", e.atk] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["DEF ", e.def] })]
						}),
						e.special && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-sans text-xs text-gold/80",
							children: e.special
						})
					]
				}, e.id))
			})
		]
	});
}
function SheetPanel() {
	const selectedId = useStudio((s) => s.selectedId);
	const engine = useStudio((s) => s.engine);
	const packEpoch = useStudio((s) => s.packEpoch);
	const character = useStudio((s) => s.character());
	const bundle = (0, import_react.useMemo)(() => getSheet(selectedId), [selectedId, packEpoch]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function pack() {
		return import("./pack-BKzxnTQM.mjs");
	}
	async function wrap(label, fn) {
		try {
			setBusy(true);
			await fn();
			toast.success(label);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Falha no export");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase",
					children: "Contrato 1.0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl text-fg",
					children: "Spritesheet Completa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-xs text-muted",
					children: "Opção B · 7 ações × 4 dirs × 8 colunas · 512×1792 · células 64×64. Ações de 6 frames deixam as colunas 7–8 transparentes."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBtn, {
						disabled: busy,
						onClick: () => wrap("PNG da sheet", async () => {
							await (await pack()).exportPng(character, "master");
						}),
						children: ".PNG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBtn, {
						disabled: busy,
						onClick: () => wrap("JPG da sheet", async () => {
							await (await pack()).exportJpg(character);
						}),
						children: ".JPG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBtn, {
						disabled: busy,
						onClick: () => wrap("SVG do ícone", async () => {
							(await pack()).exportSvg(character);
						}),
						children: ".SVG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldBtn, {
						disabled: busy,
						onClick: () => wrap("atlas.json", async () => {
							(await pack()).exportAtlasJson(character);
						}),
						children: "atlas.json"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GoldBtn, {
						disabled: busy,
						className: "bg-gold text-gold-ink hover:bg-gold/90",
						onClick: () => wrap("Game Pack ZIP", async () => {
							await (await pack()).exportBatchZip(character);
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5" }), "Batch Export"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface-2 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[10px] tracking-wider text-muted uppercase",
							children: "Pack"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: engine,
							onChange: (e) => useStudio.getState().setEngine(e.target.value),
							className: "bg-transparent font-sans text-xs text-fg outline-none",
							children: ENGINES.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: e,
								className: "bg-surface",
								children: ENGINE_LABEL[e]
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
						disabled: busy,
						onClick: () => wrap(`Pack ${ENGINE_LABEL[engine]}`, async () => {
							await (await pack()).exportEnginePack(character, engine);
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Baixar pack"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-auto rounded-lg border border-border bg-bg-deep p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden w-16 shrink-0 sm:block",
					style: { height: 1792 },
					children: ACTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-start pt-1",
						style: { height: 256 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[10px] tracking-wider text-muted uppercase",
							children: ACTION_META[a].label
						})
					}, a))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 flex w-[512px] font-mono text-[10px] text-subtle",
						children: Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-16 text-center",
							children: i + 1
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetCanvas, {
						pix: bundle.master,
						className: "rounded-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex w-[512px] justify-between font-sans text-[10px] tracking-wider text-subtle uppercase",
						children: DIRECTIONS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d }, d))
					})
				] })]
			})
		})]
	});
}
function WarriorGrid() {
	const selectedId = useStudio((s) => s.selectedId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
		children: ROSTER.map((c) => {
			const selected = c.id === selectedId;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => useStudio.getState().select(c.id),
				className: cn("group relative flex flex-col overflow-hidden rounded-lg border bg-surface-2 text-left transition-colors duration-150", selected ? "border-gold shadow-[var(--shadow-gold)]" : "border-border hover:border-border-strong"),
				children: [
					selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-2 right-2 z-10 rounded-sm bg-gold px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-wider text-gold-ink uppercase",
						children: "Selecionado"
					}),
					c.pilot && !selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-2 right-2 z-10 rounded-sm border border-gold/50 bg-bg/80 px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-wider text-gold uppercase",
						children: "Piloto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-36 items-end justify-center bg-bg-deep",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardPortrait, { id: c.id })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-sm leading-tight text-fg",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffBadge, { d: c.difficulty })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-sans text-[11px] text-muted",
								children: c.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: c.tags.slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "border-border text-subtle",
									children: t
								}, t))
							})
						]
					})
				]
			}, c.id);
		})
	});
}
function CardPortrait({ id }) {
	const character = ROSTER.find((c) => c.id === id);
	const pix = (0, import_react.useMemo)(() => renderFrame(character, "walk", "down", 0), [character]);
	if (id === "templar") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/packs/templar/thumbs/idle_down.png",
		alt: "",
		width: 128,
		height: 128,
		className: "pixelated mb-1",
		style: {
			imageRendering: "pixelated",
			width: 128,
			height: 128
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
		pix,
		scale: 2,
		className: "mb-1"
	});
}
function StudioApp() {
	const tab = useStudio((s) => s.tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 sm:px-6 pb-16",
				children: [
					tab === "guerreiros" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabGuerreiros, {}),
					tab === "gerador" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabGerador, {}),
					tab === "cenario" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabCenario, {}),
					tab === "inimigos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabInimigos, {}),
					tab === "montagem" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabMontagem, {}),
					tab === "armory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabArmory, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				toastOptions: { style: {
					background: "#14161A",
					border: "1px solid #2A2D33",
					color: "#E8E6E1"
				} }
			})
		]
	});
}
function StudioNav() {
	const tab = useStudio((s) => s.tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl font-semibold tracking-[0.12em] text-gold sm:text-2xl",
						children: "SPRITEFORGE"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-sm border border-gold/50 px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-[0.18em] text-gold uppercase",
						children: "Medieval"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden font-mono text-[11px] text-muted sm:block",
					children: "64×64 · 4 dirs · atlas 1.0"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "-mx-1 flex gap-1 overflow-x-auto pb-1",
				children: TABS.map((t) => {
					const active = tab === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => useStudio.getState().setTab(t.id),
						className: cn("relative shrink-0 rounded-md px-3 py-2 font-sans text-xs font-medium tracking-wide transition-colors duration-150 sm:text-sm", active ? "text-gold" : "text-muted hover:text-fg"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: t.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden",
								children: t.short
							}),
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-3 -bottom-1 h-px bg-gold" })
						]
					}, t.id);
				})
			})]
		})
	});
}
function TabGuerreiros() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl text-fg sm:text-4xl",
					children: "Guerreiros Medievais"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl font-sans text-sm text-muted",
					children: "Dez classes no contrato 64×64. O Cavaleiro Templário é o herói piloto — sheet real, player vivo, pack Godot. Os outros compartilham o schema e um paper-doll de kit."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarriorGrid, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimationPlayer, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dossier, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetPanel, {})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioApp, {});
}
//#endregion
export { pixToSvg as a, ACTION_META as c, PIVOT as d, pixToPngBlob as i, DIRECTIONS as l, getSheet as n, buildAtlas as o, pixToJpgBlob as r, ACTIONS as s, routes_exports as t, HITBOX as u };
