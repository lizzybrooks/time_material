// Time Material — p5.js 2.x
// Landscape (laptop): single hourglass, two side columns.
// Portrait (phone):   two stacked hourglasses on a scrollable page; the sand
//                     falls through both necks and piles at the very bottom.

let myFont;        // Jonah-Regular       (title)
let specialFont;   // GarlicSaltExtras    (the "P" dingbat used as a sand grain)
let fontRegular;   // ModernSans-Light    (body text)

const BG = 240;             // page colour
const BROWN = [171, 2, 5];  // ink colour

const nextMeeting = "Time.Material is a collective for artists and writers who are also parents. Each month, one artist hosts a gathering to invite the group into their practice. Our next meeting will be in February 2027, details coming soon.";
const promptText = "We're sending mail art invitations. If you receive one, add to it and send it to someone else. If you have it last, bring it to the first meeting. [RSVP link coming soon]";
const mission = "Artists | Parents \n exploring slowness \n celebrating process \n making work in community. ";
const contact = "@time.material";

const SAND_INTERVAL = 700;     // frames between new grains
const SAND_START_Y = 180;      // where a grain appears in the top bulb
const NECK_GAP = 50;           // distance between the two scribble lines at the waist
const COLUMN_MAX_W = 360;      // widest a text column may grow on large screens
const MOBILE_MARGIN = 24;      // side margin for text on phones
const FOOTER_H = 44;           // space reserved under the sand pile for the handle (phones)

// ---- layout -----------------------------------------------------------------
// One "screen" is windowHeight tall and holds one hourglass. Portrait phones get
// two screens stacked; everything else gets one. All geometry derives from this.
const isPortrait = () => windowWidth < windowHeight;
const screenCount = () => (isPortrait() ? 2 : 1);
const screenH = () => windowHeight;
const pageH = () => screenH() * screenCount();

// the waists of the hourglasses, top to bottom
function necks() {
    const out = [];
    for (let k = 0; k < screenCount(); k++) {
        out.push({ x: width / 2, y: screenH() * (k + 0.5), half: NECK_GAP / 2 });
    }
    return out;
}

// inner width of the hourglass at page y: full width at the corner rows,
// NECK_GAP at each waist, linear in between (the walls are straight lines)
function innerWidth(y) {
    const H = screenH();
    const local = constrain(y, 0, pageH()) % H;
    const t = local < H / 2 ? 1 - local / (H / 2) : (local - H / 2) / (H / 2);
    return NECK_GAP + (width - NECK_GAP) * t;
}
// ...and how much of that is usable for text, clear of the strokes
const roomAt = (y) => innerWidth(y) - 2 * MOBILE_MARGIN;

let sands = [];
let bg;                 // offscreen buffer holding everything that never changes
let lastWidth = 0;      // so address-bar show/hide on phones doesn't rebuild

// ---- hand-drawn line, ported from p5.scribble (MIT, Janneck Wullschleger) ----
// p5.scribble calls curveVertex(), which p5 2.x renamed to splineVertex(),
// so the single function this sketch needs lives here instead.
const SCRIBBLE = { bowing: 2, roughness: 2, maxOffset: 2 };

function scribbleOffset(min, max) {
    return SCRIBBLE.roughness * (Math.random() * (max - min) + min);
}

function scribbleStroke(g, x1, y1, x2, y2, off, divergePoint, midDispX, midDispY) {
    const dx = x2 - x1, dy = y2 - y1;
    g.beginShape();
    g.splineVertex(x1 + scribbleOffset(-off, off), y1 + scribbleOffset(-off, off));
    g.splineVertex(x1 + scribbleOffset(-off, off), y1 + scribbleOffset(-off, off));
    g.splineVertex(midDispX + x1 + dx * divergePoint + scribbleOffset(-off, off),
        midDispY + y1 + dy * divergePoint + scribbleOffset(-off, off));
    g.splineVertex(midDispX + x1 + 2 * dx * divergePoint + scribbleOffset(-off, off),
        midDispY + y1 + 2 * dy * divergePoint + scribbleOffset(-off, off));
    g.splineVertex(x2 + scribbleOffset(-off, off), y2 + scribbleOffset(-off, off));
    g.splineVertex(x2 + scribbleOffset(-off, off), y2 + scribbleOffset(-off, off));
    g.endShape();
}

function scribbleLine(g, x1, y1, x2, y2) {
    const lenX = x2 - x1, lenY = y2 - y1;
    let offset = SCRIBBLE.maxOffset;
    if (offset * offset * 100 > lenX * lenX + lenY * lenY) {
        offset = Math.sqrt(lenX * lenX + lenY * lenY) / 10;
    }
    const divergePoint = 0.2 + Math.random() * 0.2;
    let midDispX = SCRIBBLE.bowing * SCRIBBLE.maxOffset * lenY / 200;
    let midDispY = SCRIBBLE.bowing * SCRIBBLE.maxOffset * lenX / 200;
    midDispX = scribbleOffset(-midDispX, midDispX);
    midDispY = scribbleOffset(-midDispY, midDispY);

    // p5 1.x curveVertex treated the first/last points as control points only;
    // EXCLUDE reproduces that so the doubled endpoints behave the same.
    g.splineProperty('ends', EXCLUDE);
    scribbleStroke(g, x1, y1, x2, y2, offset, divergePoint, midDispX, midDispY);
    scribbleStroke(g, x1, y1, x2, y2, offset / 2, divergePoint, midDispX, midDispY);
}

// ---- setup / draw ------------------------------------------------------------
async function setup() {
    [myFont, specialFont, fontRegular] = await Promise.all([
        loadFont('fonts/Jonah-Regular.ttf'),
        loadFont('fonts/GarlicSaltExtras-Regular.otf'),
        loadFont('fonts/ModernSans-Light.otf'),
    ]);

    pixelDensity(min(displayDensity(), 2));   // 3x phones: keep the buffer blit cheap
    const cnv = createCanvas(windowWidth, pageH());
    // p5 2.x sets touch-action: none on the canvas, which stops touch scrolling.
    // pan-y hands vertical swipes back to the browser so the phone layout scrolls.
    cnv.elt.style.touchAction = 'pan-y';
    lastWidth = windowWidth;
    angleMode(DEGREES);
    textAlign(CENTER);
    noStroke();

    sands.push(new SandGrain());
    buildBackground();
}

function draw() {
    image(bg, 0, 0);   // fresh background every frame: no erasing needed

    if (frameCount % SAND_INTERVAL === 0) {
        sands.push(new SandGrain());
    }

    fill(...BROWN);
    textFont(specialFont, 16);
    for (const s of sands) {
        s.drawSand();
        s.sandFall();
    }
}

function windowResized() {
    // On phones the viewport height changes as the address bar hides and shows;
    // rebuilding on that would make the page jump. Only react to width changes.
    if (windowWidth === lastWidth) return;
    lastWidth = windowWidth;
    resizeCanvas(windowWidth, pageH());
    buildBackground();
}

// ---- static background --------------------------------------------------------
function buildBackground() {
    bg = createGraphics(width, height);
    const g = bg;
    g.angleMode(DEGREES);
    g.textAlign(CENTER);
    g.background(BG);

    drawHourglasses(g);
    const titleY = drawTitle(g);
    if (isPortrait()) drawTextPortrait(g, titleY); else drawTextLandscape(g);
}

// corners at y = 0, H, 2H...; each neck sits halfway between two corner rows,
// so stacked hourglasses join into one continuous zigzag
function drawHourglasses(g) {
    g.stroke(...BROWN);
    g.strokeWeight(6);
    g.noFill();
    necks().forEach((n, k) => {
        const top = screenH() * k, bottom = screenH() * (k + 1);
        scribbleLine(g, 0, top, n.x - n.half, n.y);
        scribbleLine(g, width, top, n.x + n.half, n.y);
        scribbleLine(g, n.x - n.half, n.y, 0, bottom);
        scribbleLine(g, n.x + n.half, n.y, width, bottom);
    });
    g.noStroke();
}

function drawTitle(g) {
    let y, size;
    if (isPortrait()) {
        y = max(screenH() * 0.08, 56);                              // near the top, where the bulb is widest
        size = fitSize(g, myFont, 'Time  Material', roomAt(y), 50);
    } else {
        y = screenH() / 4;
        size = 50;
    }
    const s = size / 50;                                           // scales the little P with it
    g.fill(...BROWN);
    g.textFont(myFont, size);
    g.text('Time  Material', width / 2, y);
    g.textFont(specialFont, 15 * s);
    g.text('P', width / 2 - 45 * s, y - 12 * s);
    if (!isPortrait()) {
        g.textFont(fontRegular, 12);
        g.text(contact, width / 2, y + 30);
    }
    return y;                                                      // title baseline
}

// ---- text helpers ---------------------------------------------------------------
// largest size (up to maxSize) at which str fits in maxW
function fitSize(g, font, str, maxW, maxSize) {
    g.textFont(font, 100);
    const w = max(str.split('\n').map(l => g.textWidth(l.trim())));
    return min(maxSize, 100 * maxW / w);
}

// draws a heading with a wrapped paragraph under it, centred on cx (laptop)
function drawBlock(g, heading, body, cx, headY, colW) {
    g.textFont(myFont, 24);
    g.text(heading, cx, headY);
    g.textAlign(CENTER, TOP);
    g.textFont(fontRegular, 16);
    g.text(body, cx - colW / 2, headY + 18, colW, height);
    g.textAlign(CENTER, BASELINE);
}

// pre-broken lines (the mission), all at one size: the largest size (up to
// maxSize) at which every line fits the hourglass at its own height.
// Returns the last baseline.
function drawFittedLines(g, str, topY, maxSize) {
    const lines = str.split('\n').map(l => l.trim()).filter(Boolean);
    let size = maxSize;
    for (let pass = 0; pass < 2; pass++) {          // line y depends on size; two passes settle it
        let y = topY + size;
        for (const l of lines) {
            size = min(size, fitSize(g, fontRegular, l, roomAt(y), size));
            y += size * 1.25;
        }
    }
    g.textFont(fontRegular, size);
    let y = topY + size;
    for (const l of lines) {
        g.text(l, width / 2, y);
        y += size * 1.25;
    }
    return y - size * 1.25;
}

// word-wraps a paragraph so each line is as wide as the hourglass allows at
// that line's height, so the block follows the slanted walls. Returns the last baseline.
function wrapToShape(g, str, topY, size) {
    g.textFont(fontRegular, size);
    const leading = size * 1.25;
    let y = topY + size, line = '';
    for (const word of str.split(/\s+/)) {
        const test = line ? line + ' ' + word : word;
        if (line && g.textWidth(test) > roomAt(y)) {
            g.text(line, width / 2, y);
            y += leading;
            line = word;
        } else {
            line = test;
        }
    }
    if (line) { g.text(line, width / 2, y); y += leading; }
    return y - leading;
}

// heading + shaped paragraph, centred (phone). Returns the last baseline.
function drawShapedBlock(g, heading, body, headY) {
    g.textFont(myFont, 24);
    g.text(heading, width / 2, headY);
    return wrapToShape(g, body, headY + 18, 16);
}

// laptop: unchanged — two side columns, mission in the bottom bulb
function drawTextLandscape(g) {
    const H = screenH();
    const colW = min(width * 0.3, COLUMN_MAX_W);
    g.fill(...BROWN);
    drawBlock(g, 'next meeting', nextMeeting, width / 5, H / 3 + 50, colW);
    drawBlock(g, 'prompt', promptText, width - width / 5, H / 3 + 50, colW);
    g.textFont(fontRegular, 22);
    g.text(mission, width / 2, H - H / 4);
}

// angle (degrees, clockwise) of the hourglass wall in the top bulb
function wallAngle() {
    const n = necks()[0];
    return degrees(Math.atan2(n.y, n.x - n.half));
}

// the last line of the mission, each word rotated about its own centre.
// u = 0..1 across the usable width at that y; dy = rows of `size` below the
// last horizontal line; a = tilt in degrees (or a function of the wall angle).
const SPLASH = [
    { word: 'making', u: 0.30, dy: 1.6, a: -8 },
    { word: 'work', u: 0.70, dy: 1.9, a: 12 },
    { word: 'in', u: 0.42, dy: 3.2, a: -25 },
    // under "in", tilted halfway between "in" and the wall
    { word: 'community.', u: 0.42, dy: 4.5, a: () => -(wallAngle() + 25) / 2 },
];

function drawSplash(g, size, baseY) {
    g.textFont(fontRegular, size);
    g.textAlign(CENTER, CENTER);
    for (const w of SPLASH) {
        const y = baseY + size * w.dy;
        const x = width / 2 - roomAt(y) / 2 + roomAt(y) * w.u;
        const a = typeof w.a === 'function' ? w.a() : w.a;
        g.push();
        g.translate(x, y);
        g.rotate(a);
        g.text(w.word, 0, 0);
        g.pop();
    }
    g.textAlign(CENTER, BASELINE);
}

// phone: everything flows down the page and measures itself against the walls
function drawTextPortrait(g, titleY) {
    const H = screenH();
    g.fill(...BROWN);

    // mission: first three lines horizontal under the title, sized to the bulb;
    // the last line ("making work in community.") splashed below them
    const lines = mission.split('\n').slice(0, 3).join('\n');
    const base = drawFittedLines(g, lines, titleY + 28, 20);
    drawSplash(g, g.textSize(), base);

    // next meeting across the widest part of the diamond
    drawShapedBlock(g, 'next meeting', nextMeeting, H * 0.95);

    // prompt in the bottom bulb, widening with the walls as it goes down
    drawShapedBlock(g, 'prompt', promptText, H * 1.70);

    // instagram handle as a footer, below where the sand settles
    g.textFont(fontRegular, 12);
    g.text(contact, width / 2, height - 16);
}

// ---- sand ---------------------------------------------------------------------
// A grain falls from SAND_START_Y, passes through every neck in turn, then
// drifts out to its resting spot at the bottom of the page.
class SandGrain {
    constructor() {
        this.startX = width / 2 - 60;
        this.restingX = width / 2 + random(-50, 50);
        const floor = isPortrait() ? height - FOOTER_H : height;   // leave the footer clear
        this.restingY = floor - random(10, 50);
        this.x = this.startX;
        this.y = SAND_START_Y;
    }

    drawSand() {
        text('P', this.x, this.y);
    }

    sandFall() {
        if (this.y >= this.restingY) return;
        this.y++;

        const ns = necks();
        const last = ns[ns.length - 1];

        if (this.y < ns[0].y) {
            // top bulb: fall mostly straight, then sweep into the first neck
            const t = map(this.y, SAND_START_Y, ns[0].y, 0, 1, true);
            this.x = lerp(this.startX, ns[0].x, t * t * t);
        } else if (this.y < last.y) {
            // between necks: straight down the centre
            this.x = last.x;
        } else {
            // bottom bulb: leave the last neck, then drift out to where it settles
            const t = map(this.y, last.y, this.restingY, 0, 1, true);
            this.x = lerp(last.x, this.restingX, t * t);
        }
    }
}