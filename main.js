/* ── ANIMATED BACKGROUND CANVAS ── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 70;
const MOUSE_RADIUS = 130;
const LINK_RADIUS = 110;

let w, h;
const mouse = { x: -9999, y: -9999 };
const particles = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r = Math.random() * 1.6 + 0.9;
    this.alpha = Math.random() * 0.45 + 0.3;
    this.hue = Math.random() * 360;
    this.hueDrift = (Math.random() - 0.5) * 0.4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.hue = (this.hue + this.hueDrift + 360) % 360;

    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 1.8;
      this.x += (dx / dist) * force;
      this.y += (dy / dist) * force;
    }
  }

  draw() {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.9)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 72%, ${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

function drawLinks() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_RADIUS) {
        const alpha = (1 - dist / LINK_RADIUS) * 0.13;
        const hue = (particles[i].hue + particles[j].hue) / 2;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

let rafId = null;

function animate() {
  ctx.clearRect(0, 0, w, h);
  drawLinks();
  for (const p of particles) { p.update(); p.draw(); }
  rafId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (rafId === null) animate();
}

function stopAnimation() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

function init() {
  resize();
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  startAnimation();
}

// Pause the background animation when the tab is hidden to save CPU/battery
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAnimation(); else startAnimation();
});

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

init();

/* ── RAINBOW CURSOR REVEAL ON HERO TITLE ── */
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  const rainbow = document.createElement('span');
  rainbow.className = 'hero-title-rainbow';
  rainbow.innerHTML = heroTitle.innerHTML;
  heroTitle.appendChild(rainbow);

  heroTitle.addEventListener('mousemove', e => {
    const rect = heroTitle.getBoundingClientRect();
    rainbow.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
    rainbow.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
  });

  heroTitle.addEventListener('mouseleave', () => {
    rainbow.style.setProperty('--rx', '-300px');
    rainbow.style.setProperty('--ry', '-300px');
  });
}

/* ── WORKS DATA ── */
const worksData = {
  'kas-club': {
    title: 'KAS Cosplay Club',
    meta: 'Founder &amp; President · Kaohsiung American School · Founded 2024',
    description: 'I founded KAS Cosplay Club because cosplay had given me so much happiness — a space to create freely, grow more confident, and connect with people who loved what I loved. I wanted to share that feeling, not keep it to myself. What began as a club for students to explore cosplay grew into something more meaningful: bringing characters to life for children at the Love and Hope Child Care Center (愛與希望兒少關懷中心) through costumes, games, dance, and photography. Watching something that made me happy become a source of happiness for someone else changed what cosplay meant to me — the club became not just a creative community, but a way to turn something I love into something I could give.',
    thumbs: true,
    images: [
      'images/cosplay/club-1.jpg',
      'images/cosplay/club-2.jpg',
      'images/cosplay/club-3.jpg',
      'images/cosplay/club-4.jpg',
      'images/cosplay/club-5.jpg',
      'images/cosplay/club-6.jpg',
      'images/cosplay/club-7.jpg',
      'images/cosplay/club-8.jpg',
      'images/cosplay/club-9.jpg',
      'images/cosplay/club-10.jpg',
      'images/cosplay/club-11.jpg',
      'images/cosplay/club-12.jpg'
    ]
  },
  'blanc': {
    title: 'Blanc',
    meta: 'Goddess of Victory: Nikke · Blanc · 高雄動漫城 KACG2606 · June 14, 2026',
    description: 'Blanc cosplay from Goddess of Victory: Nikke. Shot at 高雄動漫城 KACG2606.',
    thumbs: false,
    images: [
      'images/cosplay/blanc-1.jpg',
      'images/cosplay/blanc-2.jpg',
      'images/cosplay/blanc-3.jpg',
      'images/cosplay/blanc-4.jpg',
      'images/cosplay/blanc-5.jpg',
      'images/cosplay/blanc-6.jpg',
      'images/cosplay/blanc-7.jpg',
      'images/cosplay/blanc-8.jpg',
      'images/cosplay/blanc-9.jpg',
      'images/cosplay/blanc-10.jpg'
    ]
  },
  'blanc-kica': {
    title: 'Blanc',
    meta: 'Goddess of Victory: Nikke · Blanc · 2025 KICA 高雄國際動漫節 · October 11, 2025',
    description: 'Blanc cosplay from Goddess of Victory: Nikke. Shot at 2025 KICA 高雄國際動漫節.',
    thumbs: false,
    images: [
      'images/cosplay/blanc-kica-1.jpg',
      'images/cosplay/blanc-kica-2.jpg',
      'images/cosplay/blanc-kica-3.jpg',
      'images/cosplay/blanc-kica-4.jpg',
      'images/cosplay/blanc-kica-5.jpg',
      'images/cosplay/blanc-kica-6.jpg',
      'images/cosplay/blanc-kica-7.jpg',
      'images/cosplay/blanc-kica-8.jpg',
      'images/cosplay/blanc-kica-9.jpg',
      'images/cosplay/blanc-kica-10.jpg',
      'images/cosplay/blanc-kica-11.jpg',
      'images/cosplay/blanc-kica-12.jpg',
      'images/cosplay/blanc-kica-13.jpg',
      'images/cosplay/blanc-kica-14.jpg'
    ]
  },
  'arcana': {
    title: 'Arcana',
    meta: '【CWT-K48】高雄場 · September 06, 2025',
    description: '',
    thumbs: false,
    images: [
      'images/cosplay/arcana-1.jpg',
      'images/cosplay/arcana-2.jpg',
      'images/cosplay/arcana-3.jpg',
      'images/cosplay/arcana-4.jpg',
      'images/cosplay/arcana-5.jpg',
      'images/cosplay/arcana-6.jpg',
      'images/cosplay/arcana-7.jpg',
      'images/cosplay/arcana-8.jpg',
      'images/cosplay/arcana-9.jpg',
      'images/cosplay/arcana-10.jpg',
      'images/cosplay/arcana-11.jpg',
      'images/cosplay/arcana-12.jpg'
    ]
  },
  'nikke-cinderella': {
    title: 'Nikke · Cinderella',
    meta: 'Goddess of Victory: Nikke · Cinderella · acosta 「アコスタ！」· April 11, 2026',
    description: 'Cinderella variation cosplay from Goddess of Victory: Nikke. Shot at acosta outdoor cosplay event.',
    thumbs: false,
    images: [
      'images/cosplay/nikke-cinderella-1.jpg',
      'images/cosplay/nikke-cinderella-2.jpg',
      'images/cosplay/nikke-cinderella-3.jpg',
      'images/cosplay/nikke-cinderella-4.jpg',
      'images/cosplay/nikke-cinderella-5.jpg',
      'images/cosplay/nikke-cinderella-6.jpg',
      'images/cosplay/nikke-cinderella-7.jpg',
      'images/cosplay/nikke-cinderella-8.jpg',
      'images/cosplay/nikke-cinderella-9.jpg',
      'images/cosplay/nikke-cinderella-10.jpg',
      'images/cosplay/nikke-cinderella-11.jpg',
      'images/cosplay/nikke-cinderella-12.jpg',
      'images/cosplay/nikke-cinderella-13.jpg',
      'images/cosplay/nikke-cinderella-14.jpg',
      'images/cosplay/nikke-cinderella-15.jpg',
      'images/cosplay/nikke-cinderella-16.jpg',
      'images/cosplay/nikke-cinderella-17.jpg'
    ]
  },
  'marin-kitagawa': {
    title: 'Marin Kitagawa',
    meta: '集福行銷活動團隊 Coser 幻日祭 · 動漫二創交流派對 · November 15, 2025',
    description: '',
    thumbs: false,
    images: [
      'images/cosplay/marin-kitagawa-1.jpg','images/cosplay/marin-kitagawa-2.jpg','images/cosplay/marin-kitagawa-3.jpg',
      'images/cosplay/marin-kitagawa-4.jpg','images/cosplay/marin-kitagawa-5.jpg','images/cosplay/marin-kitagawa-6.jpg',
      'images/cosplay/marin-kitagawa-7.jpg','images/cosplay/marin-kitagawa-8.jpg','images/cosplay/marin-kitagawa-9.jpg',
      'images/cosplay/marin-kitagawa-10.jpg','images/cosplay/marin-kitagawa-11.jpg','images/cosplay/marin-kitagawa-12.jpg',
      'images/cosplay/marin-kitagawa-13.jpg','images/cosplay/marin-kitagawa-14.jpg'
    ]
  },
  'yelan': {
    title: 'Yelan',
    meta: 'Genshin Impact · Yelan · 2025高雄駁二動漫祭 FFK18 · December 14, 2025',
    description: '',
    thumbs: false,
    images: [
      'images/cosplay/yelan-1.jpg','images/cosplay/yelan-2.jpg','images/cosplay/yelan-3.jpg',
      'images/cosplay/yelan-4.jpg','images/cosplay/yelan-5.jpg','images/cosplay/yelan-6.jpg',
      'images/cosplay/yelan-7.jpg','images/cosplay/yelan-8.jpg','images/cosplay/yelan-9.jpg',
      'images/cosplay/yelan-10.jpg','images/cosplay/yelan-11.jpg','images/cosplay/yelan-12.jpg',
      'images/cosplay/yelan-13.jpg'
    ]
  },
  'dorothy': {
    title: 'Dorothy',
    meta: '2025高雄駁二動漫祭 FFK18 · December 13, 2025',
    description: '',
    thumbs: false,
    images: [
      'images/cosplay/dorothy-1.jpg','images/cosplay/dorothy-2.jpg','images/cosplay/dorothy-3.jpg',
      'images/cosplay/dorothy-4.jpg','images/cosplay/dorothy-5.jpg','images/cosplay/dorothy-6.jpg',
      'images/cosplay/dorothy-7.jpg','images/cosplay/dorothy-8.jpg','images/cosplay/dorothy-9.jpg',
      'images/cosplay/dorothy-10.jpg','images/cosplay/dorothy-11.jpg','images/cosplay/dorothy-12.jpg',
      'images/cosplay/dorothy-13.jpg',
      'images/cosplay/dorothy-14.jpg'
    ]
  },
  'privaty': {
    title: 'Privaty · Nikke',
    meta: 'Goddess of Victory: Nikke · Privaty · 王文辰 · 吳憲松 · 二三室攝影棚 · January 24, 2026',
    description: 'Studio photoshoot with 8 participants. Photographed by 王文辰 and 吳憲松 at 二三室攝影棚, Kaohsiung. 7 hours total.',
    thumbs: false,
    images: [
      'images/cosplay/privaty-1.jpg',
      'images/cosplay/privaty-2.jpg',
      'images/cosplay/privaty-3.jpg',
      'images/cosplay/privaty-4.jpg',
      'images/cosplay/privaty-5.jpg',
      'images/cosplay/privaty-6.jpg',
      'images/cosplay/privaty-7.jpg',
      'images/cosplay/privaty-8.jpg',
      'images/cosplay/privaty-9.jpg',
      'images/cosplay/privaty-10.jpg',
      'images/cosplay/privaty-11.jpg',
      'images/cosplay/privaty-12.jpg',
      'images/cosplay/privaty-13.jpg',
      'images/cosplay/privaty-14.jpg',
      'images/cosplay/privaty-15.jpg',
      'images/cosplay/privaty-16.jpg',
      'images/cosplay/privaty-17.jpg',
      'images/cosplay/privaty-18.jpg',
      'images/cosplay/privaty-19.jpg',
      'images/cosplay/privaty-20.jpg',
      'images/cosplay/privaty-21.jpg',
      'images/cosplay/privaty-22.jpg',
      'images/cosplay/privaty-23.jpg',
      'images/cosplay/privaty-24.jpg',
      'images/cosplay/privaty-25.jpg',
      'images/cosplay/privaty-26.jpg',
      'images/cosplay/privaty-27.jpg'
    ]
  },
  'rapi-red-hood': {
    title: 'Rapi · Red Hood',
    meta: 'Goddess of Victory: Nikke · Rapi Red Hood · 【CWT-K50】高雄場 · March 08, 2026',
    description: 'Rapi Red Hood variation cosplay from Goddess of Victory: Nikke. Shot at CWT-K50 Kaohsiung.',
    thumbs: false,
    images: [
      'images/cosplay/rapi-red-hood-1.jpg',
      'images/cosplay/rapi-red-hood-2.jpg',
      'images/cosplay/rapi-red-hood-3.jpg',
      'images/cosplay/rapi-red-hood-4.jpg',
      'images/cosplay/rapi-red-hood-5.jpg',
      'images/cosplay/rapi-red-hood-6.jpg',
      'images/cosplay/rapi-red-hood-7.jpg',
      'images/cosplay/rapi-red-hood-8.jpg',
      'images/cosplay/rapi-red-hood-9.jpg',
      'images/cosplay/rapi-red-hood-10.jpg',
      'images/cosplay/rapi-red-hood-11.jpg',
      'images/cosplay/rapi-red-hood-12.jpg',
      'images/cosplay/rapi-red-hood-13.jpg',
      'images/cosplay/rapi-red-hood-14.jpg',
      'images/cosplay/rapi-red-hood-15.jpg',
      'images/cosplay/rapi-red-hood-16.jpg',
      'images/cosplay/rapi-red-hood-17.jpg',
      'images/cosplay/rapi-red-hood-18.jpg',
      'images/cosplay/rapi-red-hood-19.jpg',
      'images/cosplay/rapi-red-hood-20.jpg',
      'images/cosplay/rapi-red-hood-21.jpg',
      'images/cosplay/rapi-red-hood-22.jpg',
      'images/cosplay/rapi-red-hood-23.jpg',
      'images/cosplay/rapi-red-hood-24.jpg'
    ]
  },
  'ms-model': {
    title: 'The M&S Man',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'Captured during the Soho street parties at London Pride 2025. A model who regularly shoots for M&S, caught mid-crowd in a leather jacket over a Miu Miu tee. Effortlessly composed against the electric atmosphere of Soho at night.',
    images: ['images/photography/ms-model-1.jpg']
  },
  'blazer-boots': {
    title: 'Blazer & Boots',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'A stranger radiating quiet confidence. Sharp black blazer open over a sheer top, vinyl shorts, layered statement necklaces catching the warm venue light. Knee-high leather boots grounded the whole look. Two frames, same person, same energy.',
    images: [
      'images/photography/blazer-boots-1.jpg',
      'images/photography/blazer-boots-2.jpg'
    ]
  },
  'pink-heat': {
    title: 'Pink Heat',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'Raw, unposed. A dancer mid-movement, the glittering pink velvet cowboy hat and hot-pink velvet gloves cutting through the crowd. Caught in the middle of the Soho street parties, unbothered and electric.',
    images: ['images/photography/pink-heat-1.jpg']
  },
  'electric-green': {
    title: 'Electric Green',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'A bold leopard-print slip dress in electric green-to-blue gradient, shaved head crowned with a black visor headband, gold cuff at the wrist. Caught mid-stride, luminous under low venue light.',
    images: ['images/photography/electric-green-1.jpg']
  },
  'the-trio': {
    title: 'The Trio',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'Three strangers, one moment. Caught mid-pose during the Soho street parties at London Pride 2025. A white peplum dress with a statement fan, silver platform sneakers over fishnets, and pink furry thigh-high boots with rhinestone shorts. Three complete worlds, one frame.',
    images: ['images/photography/trio-1.jpg']
  },
  'silver-cape': {
    title: 'Silver Hour',
    meta: 'London Pride · Soho Street Parties · June 2025 · Sony A6400 · Lightroom',
    description: 'A rhinestone bodysuit under a silver fringe cape, a glittering fan raised high, an iridescent holographic bag held like a trophy. Shot mid-crowd on Old Compton Street. Entirely unbothered, entirely the main character.',
    images: ['images/photography/silver-cape-1.jpg']
  },
  'gensou': {
    title: '幻想の中で (Within the Illusion)',
    meta: 'Lee, Chloe. <em>幻想の中で (Within the Illusion)</em>. 2024. Digital Illustration. 2000 × 3000 px.',
    description: 'Featuring ラムネちゃん (Ramune-chan), an original character created as the mascot of my cosplay club.<br><br>Cosplay isn\'t just dressing up. It\'s stepping into a world where you can rewrite who you are, embrace endless creativity, and find pieces of yourself in every character you bring to life.<br><br>Ramune-chan was designed to embody that idea: the sense of wonder, play, and identity-shifting that cosplay makes possible. She carries the spirit of the club as a space where that kind of expression is welcome.',
    images: ['images/art/gensou-1.jpg']
  },
  'homete': {
    title: '褒めてくれるなら何でもする (I\'ll Do Anything if You Praise Me)',
    meta: 'Chloe. <em>褒めてくれるなら何でもする (I\'ll Do Anything if You Praise Me)</em>. 2024. Digital Illustration. 1600 × 1600 px.',
    description: 'Why do people drown in praise but still feel alone?<br><br>I drew this because I kept wondering what compliments actually mean. When you rely on other people\'s approval, praise starts to feel like the only thing keeping you upright, so you shape yourself around getting more of it: doing anything, becoming anything, as long as someone says you did well. But praise for a version of yourself you performed does not reach the part of you that is actually asking to be seen. That is the loneliness I wanted to draw. You can be completely surrounded by kind words and still feel hollow, because none of them were aimed at the real you.<br><br>The figure sits curled up and hollowed out, a black silhouette drained of detail, while the whole space around her is packed with compliments written in Japanese, closing in like static. The banner across the bottom reads 褒め言葉に弱い, "weak to compliments." She is buried in exactly the thing she wanted, and it still is not enough. The piece asks whether a compliment is really care, or just a currency we mistake for it.',
    images: ['images/art/homete-1.jpg']
  },
  'fan-no-ai': {
    title: 'ファンの愛に包まれて (Embraced by Fans\' Love)',
    meta: 'Chloe. <em>ファンの愛に包まれて (Embraced by Fans\' Love)</em>. 2023. Digital Illustration. 2300 × 3000 px. Kaohsiung, Taiwan.',
    description: 'Your love gives me strength to shine brighter than ever. Thank you for always supporting me. In their eyes, I see the reason I keep moving forward.<br><br>This piece is about Japanese idol (アイドル) culture, and the particular bond it builds between an idol and the fans who support her. An idol\'s whole image is powered by that affection: the cheering, the letters, the gifts. She is expected to shine, and the energy to keep shining is supposed to come straight from the people who love her. The figure here lies surrounded by heart-shaped chocolates, roses, and stacks of love letters, winking and throwing peace signs, completely wrapped in that warmth.<br><br>Unlike my darker 地雷系 work, I wanted this one to sit fully in the bright and sweet side of the fantasy, the joyful version of being adored. But it still carries a quiet question underneath the sparkle: when your strength depends on being loved by an audience, how much of that shine is really yours? I left that soft rather than sharp, because the feeling it is about is genuinely happy.',
    images: ['images/art/fan-no-ai-1.jpg']
  },
  'aisaretai': {
    title: '愛されたいという病 (The Sickness of Wanting to Be Loved)',
    meta: 'Chloe. <em>愛されたいという病 (The Sickness of Wanting to Be Loved)</em>. 2025. Digital Illustration. 2100 × 3000 px.',
    description: 'Why do people seek love from others instead of themselves?<br><br>I drew this thinking about a feeling that seems to hit hardest in adolescence: the point where being loved by other people starts to feel like the only proof that you are worth anything at all. Your sense of self is still forming, so you outsource it. You look for reassurance in someone else\'s eyes instead of your own, and the need can grow so large that it stops feeling like affection and starts feeling like a sickness, something you carry rather than something you choose. The Japanese text in the piece reads 溺れるくらい愛してよ, "love me enough that I drown in it," which is exactly the contradiction I wanted to capture: wanting love so badly that the wanting itself becomes the thing that hurts you.<br><br>The image works in a 地雷系 (jirai-kei) and 病みかわいい (yamikawaii) register: spiralled eyes, a held eyeball, glowing hearts crowded against a dark scratched ground, cute and unsettling at once. The prettiness is real, but so is the desperation underneath it. The work asks whether that hunger for outside love is something to be fixed, or just something almost everyone quietly passes through.',
    images: ['images/art/aisaretai-1.jpg']
  },
  'kawaikunai': {
    title: '可愛くないとダメ？ (Am I Not Enough Without Being Cute?)',
    meta: 'Chloe. <em>可愛くないとダメ？ (Am I Not Enough Without Being Cute?)</em>. 2023. Digital Illustration. 720 × 720 px.',
    description: 'Cuteness is my comfort, even if it\'s exhausting to keep up.<br><br>可愛くないとダメ？ works in the visual language of 地雷系 (jirai-kei): black and pink twin tails, ribbon and lace, fluffy hair ties, winged hearts and pixel hearts floating across a soft pink field. Everything on the surface reads as almost too sweet. But jirai-kei has always carried something underneath the cuteness, an aesthetic worn by girls who present as adorable while quietly struggling, where the softness is both a real comfort and a performance that has to be maintained.<br><br>The title asks the question directly. If the cuteness slipped, would there still be enough left to be worth loving? The piece sits in that gap between the comfort of being cute and the exhaustion of never being allowed to stop.',
    images: ['images/art/kawaikunai-1.jpg']
  },
  'anime-club-mascot': {
    title: 'アニメで繋がる夢 (Dreams Connected Through Anime)',
    meta: 'Chloe. <em>アニメで繋がる夢 (Dreams Connected Through Anime)</em>. 2024. Digital Illustration. 2300 × 300 px.',
    description: 'Through anime and shared passions, we\'ve created a place where anyone can belong. A world where imagination takes flight on the wings of a dragon.<br><br>アニメで繋がる夢 is the mascot designed for our school\'s anime club. The design reinterprets the school\'s own emblem and mascot, a dragon, as an anime character: the dragon becomes a girl with curled red horns, small membranous wings tucked into her hair, fanged canines, and heterochromatic eyes of red and blue. A flame pendant and a red bomber jacket carry the school colors and the dragon\'s fire into an everyday, approachable form.<br><br>The goal was to keep the spirit of the original crest, its energy and its fire, while translating it into a friendly face the club could actually rally around: something that reads instantly as ours, but also as anime.',
    images: ['images/art/anime-club-mascot-1.jpg']
  },
  'blue-tongue': {
    title: '青い舌 (Blue Tongue)',
    meta: 'Lee, Chloe. <em>青い舌 (Blue Tongue)</em>. 2025. Digital Illustration.',
    description: '青い舌 portrays a figure drawn from トー横キッズ (Toyoko Kids): the runaway, isolated, and marginalized teenagers who gather in the alleys beside the former Toho cinema building (トー横) in Shinjuku\'s Kabukicho.<br><br>The title points to a real and specific marker within that world. Since July 2015, every flunitrazepam sleeping pill sold in Japan (ロヒプノール / サイレース) has been dyed with 青色1号 (Blue No. 1) as an abuse-deterrent measure: when a tablet is crushed, dissolved, or held in the mouth, it turns a vivid blue and stains the tongue. Among トー横キッズ, the 「青い舌」, the blue tongue, became a quiet and visible sign of オーバードーズ (overdose) on prescription and over-the-counter medication, a mark of belonging to a group bound together by the same escape.<br><br>The figure is rendered in the visual language of 地雷系 (jirai-kei) and 病みかわいい (yamikawaii): twin tails, a spiralled red eye, hair-clip X marks, a sailor collar, and the blue tongue held forward almost as an offering. The aesthetic performs cuteness while carrying self-harm underneath it, softness worn over something that hurts. The work sits with that contradiction rather than resolving it, refusing both to romanticize the subculture and to reduce these teenagers to a warning.',
    images: ['images/art/blue-tongue-1.jpg']
  },
  'elle-splash': {
    title: 'Splash! A Century of Swimming and Style',
    meta: 'Chloe. Editorial · Cover &amp; Feature. 2025.',
    description: '<em>March – 17 August 2025. A major exhibition celebrating our enduring love of the water over the last 100 years.</em><br><br><strong>Fashion\'s Smallest Pieces, the Biggest Rebellions</strong><br><br>Dive into the exhibition Splash! A Century of Swimming and Style, and you\'ll realize that swimwear has never just been about swimming. From conservative bathing suits to scandalous bikinis and surrealist designs, what we wear in the water has always influenced culture, politics, and personal freedom, pushing the limits of what society deems acceptable.<br><br>One of the most striking pieces in the exhibition was the original bikini itself. In July 1946, Louis Réard introduced his creation at a press conference held at Paris\'s popular Piscine Molitor pool: a bold two-piece with a G-string back, made from just 30 square inches of fabric printed in a newspaper pattern, which he named the bikini.',
    images: ['images/design/elle-splash-1.jpg']
  },
  'untitled-pour': {
    title: 'Untitled',
    meta: 'Lee, Chloe. <em>Untitled</em>. Resin and Pouring Acrylic on Canvas. 53 × 55 cm.',
    description: 'An untitled acrylic pour finished with a resin coat on canvas. Fluid layers of neon pink, blue, green, and yellow were poured and tilted across the surface, left to find their own currents rather than being drawn. Where the colours meet and resist each other, fine cellular lacing and marbled veins appear, the record of the paint moving on its own.<br><br>The resin surface seals everything under a high, wet gloss, deepening the colour and catching the light so the whole canvas reads as liquid even once cured. The result is entirely non-representational: pure colour, flow, and chemical reaction held in place.',
    images: [
      'images/art/untitled-pour-1.jpg',
      'images/art/untitled-pour-2.jpg'
    ]
  },
  'behind-the-pink': {
    title: 'Behind the Pink',
    meta: 'Lee, Chloe. <em>Behind the Pink</em>. 2025. Acrylic Paint and Mixed Media (Piercings) on Canvas. 53 × 45 cm.',
    description: 'Behind the Pink explores the concealed psychological interior of adolescent girlhood: the gap between how a teenage girl appears and what she actually feels. Drawing from personal experience, the suppression of emotion rather than its expression causes thoughts to loop obsessively inward, accumulating without release.<br><br>A single childlike figure occupies the center of the canvas in deliberate compositional isolation. Her oversized expressionless eyes function as the primary focal point, confrontational and unreadable in equal measure. The hair is deliberately neat and controlled, a visual metaphor for performed composure. The mouth and eyebrows have been removed entirely, preserving psychological ambiguity and preventing any emotion from becoming decipherable to the viewer.<br><br>The pink palette carries a cultural coding of femininity and innocence, but is contaminated with green undertones that produce a dirtied pink: a color that attracts while unsettling, drawing on Damien Hirst\'s use of seductive surfaces that conceal something more disturbing beneath. The obsessive dot background appropriates Yayoi Kusama\'s Infinity Nets, where the serial repetition of marks enacts the psychological pressure that surrounds and closes in on the figure. The figure herself re-interprets kawaii culture, connecting to Yoshitomo Nara\'s subversion of cuteness as a site of hidden intensity. The hand held behind her back references Nara\'s Knife Behind Back directly, implying concealed intention and internalized aggression. The embedded piercings introduce physical tension into the surface, puncturing the performance of softness.<br><br>The work asks: what does an adolescent girl look like when her performance of composure is placed under scrutiny?',
    images: ['images/art/behind-the-pink-1.jpg']
  },
  'noctilucent': {
    title: 'Noctilucent',
    meta: 'Lee, Chloe. <em>Noctilucent</em>. 2026. Acrylic Paint, Silicone Oil, White Glue and Mixed Media on Canvas, UV Activated. 53 × 45 cm × 2 (Diptych).',
    description: 'Noctilucent takes its name from the rarest atmospheric phenomenon: clouds that carry no light of their own, visible only when illuminated from below the horizon, shining in a darkness they did not create. Like those clouds, this work does not generate its own light. It requires the right conditions to become visible at all.<br><br>The diptych is personally connected to the experience of rarely opening up. The complex and often unnamed emotions of adolescent girlhood are rarely fully visible to others. Only faint traces show on the surface. But with the right person, or under the right conditions, everything contained comes out completely. The act of switching on the UV light enacts this literally: a threshold crossed not gradually, but all at once.<br><br>Where Behind the Pink conceals through a composed exterior and Penumbra through private solitude, Noctilucent abandons the figure altogether. Color and unpredictable material process carry the full psychological weight. Two fluid acrylic canvases produced through fluorescent acrylic paint, mod podge, and silicone oil exist in a suppressed state under normal light. Under UV, the black canvas reads as cosmic and explosive; the white canvas as intricate and cellular, its surface suggesting nerve endings, biological networks, and internal structures pushed outward.<br><br>The cellular forms emerge from chemical resistance between silicone oil and water-based paint. Where the two materials meet they push against each other, and the boundary of that refusal becomes visible as form. The process is partly directed and partly uncontrollable: the conditions are set, but the outcome cannot be fully determined. Inspired by the unpredictability of Damien Hirst\'s Spin Paintings and his use of biological and scientific imagery, the work applies a reformatting strategy, borrowing visual language from science to express psychological interiority. Like Kenny Scharf\'s Cosmic Cavern, what is suppressed under ordinary light becomes overwhelming the moment UV is introduced.',
    images: [
      'images/art/noctilucent-1.jpg',
      'images/art/noctilucent-2.jpg',
      'images/art/noctilucent-3.jpg',
      'images/art/noctilucent-4.jpg',
      'images/art/noctilucent-5.jpg'
    ]
  },
  'penumbra': {
    title: 'Penumbra',
    meta: 'Lee, Chloe. <em>Penumbra</em>. 2026. Oil Pastel, Acrylic Paint, Neon Fluorescent Paint, Modelling Paste, Resin, Linseed Oil and Mixed Media on Paper, UV Reactive. 57.5 × 14 cm. Mounted in constructed box frame.',
    description: 'Penumbra takes its title from the region of partial shadow at the edge of total darkness: not fully concealed, not fully visible, caught exactly in between. Where Behind the Pink examined concealment through a composed exterior performed for others, Penumbra moves inward. The figure is no longer performing for an audience. She is alone in the dark, in the midnight bedroom where social pressures dissolve and the mind is left to turn over itself: each possible decision, each unresolved identity, each version of a future self coexisting without resolution.<br><br>A single figure inhabits a pitch black ground built from burnished oil pastel dissolved with linseed oil, the density of the surface enacting the weight of the night. Around her head, a diffuse pink halo reads both as a residue of innocence and as an unwanted spotlight: even in solitude, she remains seen. The neon multicolored body is built through layered oil pastel and fluorescent acrylic introduced as downward drips with pouring medium. Each color represents a distinct and simultaneous unresolved identity, multiple possible selves occupying the same form at once.<br><br>Three-dimensional modelling paste applied beneath the drips raises the forms physically off the surface, the protruding texture enacting thoughts that overflow and begin to consume the figure containing them. The constructed box frame seals her inside, referencing Hsu Shu Han\'s framing of the young girl under the gaze. The resin surface and vibrant palette carry the seductive quality of Damien Hirst, drawing the viewer in before the full psychological weight of the image registers.<br><br>Under UV light, the work activates completely. What appears suppressed or partially contained under ordinary conditions is revealed in full intensity, the surface finally showing what the figure has been holding.',
    images: [
      'images/art/penumbra-1.jpg',
      'images/art/penumbra-2.jpg',
      'images/art/penumbra-3.jpg'
    ]
  },
  'reality-hurts': {
    title: '現実が痛いから (Because Reality Hurts)',
    meta: 'Lee, Chloe. <em>現実が痛いから (Because Reality Hurts)</em>. 2025. Mixed Media (Pen, Pencil, Highlighter on Drawing Paper). 15 × 16 cm.',
    description: 'Reality cuts too deep, so I escape to a world that doesn\'t exist.<br><br>A manga-style figure rendered in graphite, the face half-consumed by swirling waves of highlighter color: neon pink, electric green, yellow, blue. The greyscale and the vivid exist in the same image without resolving into each other. The figure does not fully disappear into the color, and the color does not explain the figure.<br><br>The Japanese text written into the piece reads: 現実から逃げたくてもこの残酷な世界から逃れることができない. "Even if I want to escape reality, I cannot escape from this cruel world." The title and the text pull in opposite directions. Escape as desire. Impossibility as fact.',
    images: ['images/art/reality-hurts-1.jpg']
  },
  'obsidian': {
    title: 'Obsidian and Prismatic Light',
    meta: 'Lee, Chloe. <em>Obsidian and Prismatic Light</em>. 2025. Charcoal Transfer Monoprint, Watercolour, Coloured Pencil. 21 × 29.7 cm.',
    description: 'A cityscape built through charcoal transfer monoprint, its structures dense and grainy, pressed into the paper with the weight of obsidian. Beneath and around them, watercolour washes in pink, teal, purple, and yellow bleed outward, prismatic and uncontained by the architecture above.<br><br>A large spider sits across the right side of the composition, its web threading between buildings. The web does not feel threatening so much as structural: another kind of architecture, lighter and more precise than the city beneath it.<br><br>The piece holds two opposing qualities at once. The charcoal is fixed, heavy, transferring darkness directly. The watercolour is loose, luminous, moving where it wants. Between them, the image finds its tension.',
    images: ['images/art/obsidian-1.jpg']
  },
  'kabukicho-street': {
    title: '歌舞伎町',
    meta: 'Lee, Chloe. <em>歌舞伎町</em>. 2025. Coloured Pencil, Marker, Fineliner. 29.7 × 42 cm.',
    description: 'A two-panel observational drawing of Kabukicho, Shinjuku, spread across an A3 sheet. The left panel looks down the street toward the I Love Kabukicho building; the right frames the iconic red gate of 歌舞伎町一番街. In both panels, the architecture is rendered in full colour while the crowds below are left in graphite grey, anonymous and interchangeable against the vivid signage above them.<br><br>The contrast was not planned so much as noticed: the city announces itself loudly, the people passing through it less so.',
    images: ['images/art/kabukicho-street-1.jpg']
  },
  'stop-moving': {
    title: 'Stop Moving',
    meta: 'Lee, Chloe. <em>Stop Moving</em>. 2026. Oil Pastel, Coloured Pencil, Cut Paper.',
    description: '<em>Stop Moving. Let the scattered mess reflect your mind. Don\'t tidy up. Let it capture the moment.</em><br><br>A still life of personal objects drawn exactly where they were: Dior, Miss Dior, brushes, a comb, bottles, tubes. The surface of a desk mid-rush. Stream-of-consciousness text is written across the objects, capturing the internal monologue of running late.<br><br>The piece is cut out in the irregular shape of the arrangement itself, refusing the containment of a rectangular frame. The mess is not backdrop. It is the subject. Tidying it would have been a lie.',
    images: ['images/art/stop-moving-1.jpg']
  },
  'media-test-1': {
    title: 'Media Test I (Resin & Alcohol Ink)',
    meta: 'Lee, Chloe. <em>Media Test I (Resin &amp; Alcohol Ink)</em>. Resin, Alcohol Ink. Circular. Media Test / Work in Progress.',
    description: 'A circular resin and alcohol ink test, inspired by the petri dish. The ink blooms outward into dense clusters of tiny cells, backlit so the colour glows through the resin like a specimen under a microscope. A material experiment testing how the ink spreads and separates as the resin cures. Ongoing.',
    images: ['images/art/media-test-1.jpg']
  },
  'media-test-2': {
    title: 'Media Test II (Resin & Alcohol Ink)',
    meta: 'Lee, Chloe. <em>Media Test II (Resin &amp; Alcohol Ink)</em>. Resin, Alcohol Ink. Circular. Media Test / Work in Progress.',
    description: 'A circular resin and alcohol ink test, inspired by the petri dish. Here the ink branches into fine dendritic threads radiating from a bright core, feathering outward like frost or nerve endings when held up to the light. A material experiment in how the alcohol ink feathers through curing resin. Ongoing.',
    images: ['images/art/media-test-2.jpg']
  },
  'media-test-3': {
    title: 'Media Test III (Resin & Alcohol Ink)',
    meta: 'Lee, Chloe. <em>Media Test III (Resin &amp; Alcohol Ink)</em>. Resin, Alcohol Ink. Circular. Media Test / Work in Progress.',
    description: 'A circular resin and alcohol ink test, inspired by the petri dish. Rainbow pigment spreads into a fine speckled field across the whole disc, glowing from within when backlit. A material experiment in even, all-over dispersion of alcohol ink through resin. Ongoing.',
    images: ['images/art/media-test-3.jpg']
  },
  'petri-resin': {
    title: 'Petri (Resin & Alcohol Ink)',
    meta: 'Lee, Chloe. <em>Petri (Resin &amp; Alcohol Ink)</em>. 2026. Resin, Alcohol Ink. Circular. Work in Progress.',
    description: 'A circular resin disc flooded with alcohol ink, held up to the window so the light passes straight through it. The colours bloom outward from a dense core into feathered spikes of magenta, red, blue, and green, more like a specimen than a painting.<br><br>The form is inspired by the petri dish: a contained circular field where something is left to spread, react, and grow on its own terms. I was also drawing on the textural, layered work of Dylan Gebbia-Richards, whose built-up surfaces feel geological and alive. Rather than copying his method, I wanted to recreate a similar sense of organic accumulation and eruption in a different medium, letting the alcohol ink move through the resin the way pigment moves through liquid, so the texture forms itself instead of being drawn.<br><br>Still in progress. I am testing how the ink behaves as it cures and how the disc reads under different light.',
    images: ['images/art/petri-resin-1.jpg']
  },
  'watched': {
    title: 'Watched',
    meta: 'Lee, Chloe. <em>Watched</em>. 2025. Painted Ceramic (Unfired). 35 × 35 cm.',
    description: 'A manga-style figure surrounded by floating eyeballs, painted onto a ceramic plate. Each eyeball sits at the end of vein-like cracks radiating outward, pulling the gaze in multiple directions at once.<br><br>The piece is about observation and the feeling of being seen from every angle simultaneously. The figure does not look back. She is already inside the watching, caught within it rather than confronting it.<br><br>Currently unfired. The work is ongoing.',
    images: ['images/art/watched-1.jpg']
  },
  'old-quarter': {
    title: 'Old Quarter',
    meta: 'Lee, Chloe. <em>Old Quarter</em>. 2025. Acrylic Monoprint. 28 × 14 cm.',
    description: 'An aerial view of old buildings, fragmented by the printmaking process into something between documentation and abstraction. The goal was not to capture a specific place but a feeling: the weight of aged architecture, the sense that buildings accumulate time visibly in their surfaces and shadows.<br><br>The black and white removes colour entirely, leaving only structure. Cross-hatching, parallel lines, and gestural marks stand in for different textures and materials, each suggesting a different surface or era. Seen from above, the familiar geometry of rooftops and walls becomes harder to place, more disorienting, closer to ruin than to residence.',
    images: ['images/art/old-quarter-1.jpg']
  },
  'kabukicho': {
    title: 'Shibuya × Kabukicho',
    meta: 'Lee, Chloe. <em>Shibuya × Kabukicho</em>. 2026. Ink Relief Printmaking, Highlighter, Marker, Coloured Pencil.',
    description: 'How can layered colour, built through highlighters and markers, communicate a personal and emotional response to an urban environment?<br><br>This piece merges two of Tokyo\'s most distinct districts into a single image: Shibuya\'s crossings and commercial density folding into Kabukicho\'s entertainment sprawl. Neither is documented faithfully. Instead, the two are collapsed together, the city rebuilt from memory and feeling rather than observation.<br><br>Ink relief printmaking forms the base layer, giving the marks a physical weight before colour is added on top. Highlighter yellows and acid greens press against deep purples and blues; manga characters spill into the borders as architecture and cultural image blur together. The layered marks build atmosphere the way memory does: not a single clear image, but an accumulation. Urban environment as emotional territory.',
    images: ['images/art/kabukicho-1.jpg']
  },
  'specimen-of-absence': {
    title: 'Specimen of Absence',
    meta: 'Lee, Chloe. <em>Specimen of Absence</em>. 2026. Vitrine; Oil Pastel, Modelling Paste, Acrylic Paint, Found Objects. 60 × 45 cm.',
    description: 'A prismatic skeleton crouches inside a white shadow box vitrine, surrounded at its base by empty pill blister packs and a strip of photographic prints. The companion piece renders the same figure in charcoal grey, colour stripped back to structure.<br><br>The display format is borrowed from scientific and museum presentation: the vitrine, the isolated specimen, the clinical white frame. By placing the skeleton within this context, the work reframes a symbol of death as an object of study, carrying the symbolic and emotional weight that institutional display assigns to its specimens.<br><br>Absence asserts itself as loudly as presence. The missing flesh, the hollow pills, the faces preserved on film. What is visible is always shaped by what is no longer there.',
    images: [
      'images/art/specimen-1.jpg',
      'images/art/specimen-2.jpg'
    ]
  },
  'club-magazine': {
    title: 'KAS Cosplay Club Magazine — Volume 1',
    meta: 'Kaohsiung American School Cosplay Club · Vol. 1 · 2024/2025',
    description: 'The official magazine of the KAS Cosplay Club — the first cosplay club at Kaohsiung American School, founded by Chloe Lee.<br><br>Volume 1 documents the founding year: member introductions, photoshoot process, makeup breakdowns, and contact lens guides. Also covers the club\'s community service collaboration with the Love and Hope Child Care Center (愛與希望兒少關懷中心). A physical copy was placed in the school library.<br><br>Conceived, designed, and produced by Chloe Lee, with personal sections by club members.<br><br><a href="https://canva.link/kascosplayclub2425mag" target="_blank" style="color:#e8e2d9;letter-spacing:0.1em;text-decoration:underline;font-size:0.8rem;">↗ Read Volume 1</a>',
    images: [
      'images/design/kas-mag-1.jpg',
      'images/design/kas-mag-2.jpg',
      'images/design/kas-mag-3.jpg',
      'images/design/kas-mag-4.jpg',
      'images/design/kas-mag-5.jpg',
      'images/design/kas-mag-6.jpg',
      'images/design/kas-mag-7.jpg',
      'images/design/kas-mag-8.jpg',
      'images/design/kas-mag-9.jpg',
      'images/design/kas-mag-10.jpg',
      'images/design/kas-mag-11.jpg',
      'images/design/kas-mag-12.jpg'
    ]
  },
  'club-magazine-vol2': {
    title: 'KAS Cosplay Club Magazine — Volume 2',
    meta: 'Kaohsiung American School Cosplay Club · Vol. 2 · 2025/2026',
    description: 'Volume 2 of the KAS Cosplay Club Magazine — a step forward in design and scope.<br><br>Covers member profiles, a bakery-themed photoshoot, makeup guides, and the club\'s Fall Festival participation. Also features the proper introduction of ラムネちゃん (Ramune-chan), the club\'s original mascot, with an illustration by Chloe Lee.<br><br>Distributed to the entire school via the weekly newsletter and placed in the school library.<br><br>Conceived, designed, and produced by Chloe Lee, with personal sections by club members.<br><a href="https://canva.link/kascosplayclub202526mag" target="_blank" style="color:#e8e2d9;letter-spacing:0.1em;text-decoration:underline;font-size:0.8rem;">↗ Read Volume 2</a>',
    images: [
      'images/design/kas-mag2-1.jpg',
      'images/design/kas-mag2-2.jpg',
      'images/design/kas-mag2-3.jpg',
      'images/design/kas-mag2-4.jpg',
      'images/design/kas-mag2-5.jpg',
      'images/design/kas-mag2-6.jpg',
      'images/design/kas-mag2-7.jpg',
      'images/design/kas-mag2-8.jpg',
      'images/design/kas-mag2-9.jpg',
      'images/design/kas-mag2-10.jpg',
      'images/design/kas-mag2-11.jpg',
      'images/design/kas-mag2-12.jpg',
      'images/design/kas-mag2-13.jpg',
      'images/design/kas-mag2-14.jpg',
      'images/design/kas-mag2-15.jpg',
      'images/design/kas-mag2-16.jpg',
      'images/design/kas-mag2-17.jpg',
      'images/design/kas-mag2-18.jpg',
      'images/design/kas-mag2-19.jpg',
      'images/design/kas-mag2-20.jpg',
      'images/design/kas-mag2-21.jpg',
      'images/design/kas-mag2-22.jpg',
      'images/design/kas-mag2-23.jpg'
    ]
  },
  'flair': {
    title: 'FLAIR',
    meta: 'Lee, Chloe. <em>FLAIR</em>. 2025. Digital Publication.',
    description: 'A self-initiated personal magazine exploring cosplay as cultural expression and identity. Issue 1 features 10 different cosplays, each accompanied by written analysis examining the character, the source material, and what the choice of cosplay communicates about the person wearing it.<br><br>The project began after attending LAX Anime Con 2022, where the diversity and intentionality of cosplay as a form of self-presentation became impossible to ignore. FLAIR is an attempt to take that seriously: to give cosplay the same analytical attention that fashion criticism gives to runway looks or editorial spreads.<br><br>All written analysis by Chloe Lee.<br><br><a href="https://canva.link/ckuroi24magc" target="_blank" style="color:#e8e2d9;letter-spacing:0.1em;">View FLAIR Issue 1 →</a>',
    images: [
      'images/design/flair-1.jpg',
      'images/design/flair-2.jpg',
      'images/design/flair-3.jpg',
      'images/design/flair-4.jpg',
      'images/design/flair-5.jpg',
      'images/design/flair-6.jpg',
      'images/design/flair-7.jpg',
      'images/design/flair-8.jpg',
      'images/design/flair-9.jpg',
      'images/design/flair-10.jpg'
    ]
  },
  'unbound': {
    title: 'Unbound Silhouettes',
    meta: 'UAL Visual Communications · Fashion Direction · Sony A6400 · Lightroom',
    description: 'Warped edges. Exaggerated curves. She redefines corporate silhouettes, expanding beyond confined borders into a shape all her own.<br><br>Corporate fashion constructs a controlled version of femininity, one that is contained, structured, and visually acceptable within professional space. Garments are designed to discipline the body, reinforcing ideas of order, restraint, and compliance.<br><br>This project disrupts that system through exaggerated silhouettes and distorted proportions. By expanding, shifting, and destabilizing the body\'s form, the work resists containment, transforming corporate dress into a site of autonomy, tension, and self-defined identity.<br><br>Photography and editing: Chloe Lee. Models: Arisa Slavu, Adriana Malik.',
    images: [
      'images/photography/unbound-1.jpg',
      'images/photography/unbound-2.jpg',
      'images/photography/unbound-3.jpg',
      'images/photography/unbound-4.jpg',
      'images/photography/unbound-5.jpg',
      'images/photography/unbound-6.jpg'
    ]
  }
};

/* ── LIGHTBOX ── */
let currentWork = null;
let currentImgIndex = 0;

function openLightbox(workId, startIndex) {
  const work = worksData[workId];
  if (!work) return;

  currentWork = work;
  currentImgIndex = (startIndex !== undefined) ? startIndex : 0;

  document.getElementById('lb-title').textContent = work.title;
  document.getElementById('lb-meta').innerHTML = work.meta;
  document.getElementById('lb-desc').innerHTML = work.description;

  renderLbImage();
  renderThumbs();

  // Preload first 3 images immediately on open
  currentWork.images.slice(0, 3).forEach(src => { new Image().src = src; });

  const overlay = document.getElementById('lightbox');
  overlay.classList.add('open');
  overlay.classList.toggle('lightbox-portrait', work.thumbs === false);
  document.body.classList.add('lightbox-active');
  document.body.style.overflow = 'hidden';
}

function renderLbImage() {
  document.getElementById('lb-img').src = currentWork.images[currentImgIndex];
  const counter = document.getElementById('lb-counter');
  const nav = document.getElementById('lb-nav');
  const hasMultiple = currentWork.images.length > 1;

  counter.textContent = hasMultiple
    ? `${currentImgIndex + 1} / ${currentWork.images.length}`
    : '';
  nav.style.display = hasMultiple ? 'flex' : 'none';

  document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === currentImgIndex);
  });

  // Preload next and previous images
  const len = currentWork.images.length;
  [currentImgIndex + 1, currentImgIndex + 2, currentImgIndex - 1].forEach(i => {
    if (i >= 0 && i < len) new Image().src = currentWork.images[i];
  });
}

function renderThumbs() {
  const container = document.getElementById('lb-thumbs');
  container.innerHTML = '';
  if (currentWork.images.length <= 1 || currentWork.thumbs === false) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  currentWork.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'lightbox-thumb' + (i === 0 ? ' active' : '');
    img.onclick = () => { currentImgIndex = i; renderLbImage(); };
    container.appendChild(img);
  });
}

function lbNav(dir) {
  currentImgIndex = (currentImgIndex + dir + currentWork.images.length) % currentWork.images.length;
  renderLbImage();
}

/* ── MAGAZINE BOOK READER ── */
const magData = {
  'flair': {
    title: 'FLAIR · Issue 1',
    pages: ['images/design/flair-1.jpg','images/design/flair-2.jpg','images/design/flair-3.jpg',
            'images/design/flair-4.jpg','images/design/flair-5.jpg','images/design/flair-6.jpg',
            'images/design/flair-7.jpg','images/design/flair-8.jpg','images/design/flair-9.jpg',
            'images/design/flair-10.jpg'],
    link: 'https://canva.link/ckuroi24magc',
    description: 'A personal fashion magazine analyzing 10 cosplay looks through the lens of fashion history, cultural context, and visual storytelling. Conceived and designed by Chloe Lee.'
  },
  'flair2': {
    title: 'FLAIR · Issue 2',
    pages: ['images/design/flair2-cover.jpg'],
    wip: true,
    description: ''
  },
  'club-vol1': {
    title: 'KAS Cosplay Club · Vol. 1',
    pages: ['images/design/kas-mag-1.jpg','images/design/kas-mag-2.jpg','images/design/kas-mag-3.jpg',
            'images/design/kas-mag-4.jpg','images/design/kas-mag-5.jpg','images/design/kas-mag-6.jpg',
            'images/design/kas-mag-7.jpg','images/design/kas-mag-8.jpg','images/design/kas-mag-9.jpg',
            'images/design/kas-mag-10.jpg','images/design/kas-mag-11.jpg','images/design/kas-mag-12.jpg'],
    link: 'https://canva.link/kascosplayclub2425mag',
    description: 'The official magazine of the KAS Cosplay Club — Vol. 1 documents the founding year: member introductions, photoshoots, makeup guides, and community service with the Love and Hope Child Care Center.'
  },
  'club-vol2': {
    title: 'KAS Cosplay Club · Vol. 2',
    pages: ['images/design/kas-mag2-1.jpg','images/design/kas-mag2-2.jpg','images/design/kas-mag2-3.jpg',
            'images/design/kas-mag2-4.jpg','images/design/kas-mag2-5.jpg','images/design/kas-mag2-6.jpg',
            'images/design/kas-mag2-7.jpg','images/design/kas-mag2-8.jpg','images/design/kas-mag2-9.jpg',
            'images/design/kas-mag2-10.jpg','images/design/kas-mag2-11.jpg','images/design/kas-mag2-12.jpg',
            'images/design/kas-mag2-13.jpg','images/design/kas-mag2-14.jpg','images/design/kas-mag2-15.jpg',
            'images/design/kas-mag2-16.jpg','images/design/kas-mag2-17.jpg','images/design/kas-mag2-18.jpg',
            'images/design/kas-mag2-19.jpg','images/design/kas-mag2-20.jpg','images/design/kas-mag2-21.jpg',
            'images/design/kas-mag2-22.jpg','images/design/kas-mag2-23.jpg'],
    link: 'https://canva.link/kascosplayclub202526mag',
    description: 'Vol. 2 introduces Ramune-chan, the club mascot, alongside a bakery photoshoot, Fall Festival coverage, and member highlights. Distributed to the entire school via the weekly newsletter and placed in the school library.'
  }
};

let currentBook  = null;
let currentSpread = 0;

function pageHTML(src, shadowClass) {
  if (!src) return '<div style="width:100%;height:100%;background:#0d0d0d;"></div>';
  return `<img src="${src}" alt="" loading="lazy"><div class="${shadowClass}"></div>`;
}

function openBook(magId) {
  currentBook   = magData[magId];
  currentSpread = 0;
  document.getElementById('book-reader-title').textContent = currentBook.title;
  const linkEl = document.getElementById('book-reader-link');
  if (currentBook.link) { linkEl.href = currentBook.link; linkEl.style.display = ''; }
  else { linkEl.style.display = 'none'; }
  renderSpread();
  document.getElementById('book-reader').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBook() {
  document.getElementById('book-reader').classList.remove('open');
  document.body.style.overflow = '';
}

function renderSpread() {
  const L       = document.getElementById('book-page-left');
  const R       = document.getElementById('book-page-right');
  const counter = document.getElementById('book-page-counter');
  const desc    = document.getElementById('book-desc');
  const total   = currentBook.pages.length;
  const spreads = Math.ceil(total / 2);
  const li = currentSpread * 2;
  const ri = currentSpread * 2 + 1;

  if (currentBook.wip) {
    L.innerHTML = `<div class="book-wip-msg"><strong>FLAIR Issue 2</strong><p>Currently in progress.</p><em>Check back soon.</em></div>`;
    R.innerHTML = `<img src="${currentBook.pages[0]}" alt="FLAIR 2 Cover" style="width:100%;height:100%;object-fit:contain;display:block;background:#0d0d0d;"><div class="book-shadow-r"></div>`;
    counter.textContent = '';
    desc.textContent = '';
    document.getElementById('book-btn-prev').disabled = true;
    document.getElementById('book-btn-next').disabled = true;
    return;
  }

  L.innerHTML = pageHTML(currentBook.pages[li], 'book-shadow-l');
  R.innerHTML = pageHTML(currentBook.pages[ri], 'book-shadow-r');

  const to = Math.min(ri + 1, total);
  counter.textContent = `${li + 1} – ${to}  ·  ${total} pages`;
  desc.textContent = currentBook.description || '';

  document.getElementById('book-btn-prev').disabled = currentSpread === 0;
  document.getElementById('book-btn-next').disabled = currentSpread >= spreads - 1;
}

function bookNav(dir) {
  if (!currentBook || currentBook.wip) return;
  const spreads = Math.ceil(currentBook.pages.length / 2);
  const next = currentSpread + dir;
  if (next < 0 || next >= spreads) return;
  const body = document.getElementById('book-body');
  const cls  = dir > 0 ? 'turning-fwd' : 'turning-back';
  body.classList.add(cls);
  setTimeout(() => { currentSpread = next; renderSpread(); }, 190);
  setTimeout(() => body.classList.remove(cls), 400);
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('book-reader').classList.contains('open')) return;
  if (e.key === 'ArrowRight') bookNav(1);
  if (e.key === 'ArrowLeft')  bookNav(-1);
  if (e.key === 'Escape')     closeBook();
});

/* ── COSPLAY GALLERY ──
   One row of cover thumbnails. Hovering a cover previews that cosplay's full
   photo set below; clicking a cover pins the set open so it persists. Clicking
   the pinned cover again closes it. Photos are built from worksData and reuse
   the existing lightbox (data-work / data-index). */
(function buildCosplayGallery() {
  const mount = document.getElementById('cosplay-gallery');
  if (!mount) return;

  // Display order + a short caption for each cover (full meta comes from worksData)
  const cats = [
    { key: 'blanc',            sub: '高雄動漫城 KACG2606 · Jun 2026' },
    { key: 'nikke-cinderella', sub: 'acosta 「アコスタ！」· Apr 2026' },
    { key: 'rapi-red-hood',    sub: 'CWT-K50 高雄場 · Mar 2026' },
    { key: 'privaty',          sub: '二三室攝影棚 · Jan 2026' },
    { key: 'yelan',            sub: '駁二動漫祭 FFK18 · Dec 2025' },
    { key: 'dorothy',          sub: '駁二動漫祭 FFK18 · Dec 2025' },
    { key: 'marin-kitagawa',   sub: '幻日祭 · Nov 2025' },
    { key: 'blanc-kica',       sub: 'KICA 高雄國際動漫節 · Oct 2025' },
    { key: 'arcana',           sub: '【CWT-K48】高雄場 · Sep 2025' }
  ];

  const row = document.createElement('div');
  row.className = 'cosplay-cover-row';
  const reveal = document.createElement('div');
  reveal.className = 'cosplay-reveal';

  const esc = s => String(s).replace(/"/g, '&quot;');

  cats.forEach(cat => {
    const w = worksData[cat.key];
    if (!w || !w.images || !w.images.length) return;
    const n = w.images.length;

    const cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'cosplay-cover';
    cover.dataset.cat = cat.key;
    cover.innerHTML =
      '<div class="cosplay-cover-thumb">' +
        '<img src="' + w.images[0] + '" alt="' + esc(w.title) + '" loading="lazy" decoding="async">' +
        '<span class="cosplay-cover-badge">' + n + ' photos</span>' +
        '<span class="cosplay-cover-pin">Pinned</span>' +
      '</div>' +
      '<div class="cosplay-cover-cap">' +
        '<div class="cosplay-cover-name">' + esc(w.title) + '</div>' +
        '<div class="cosplay-cover-sub">' + esc(cat.sub) + '</div>' +
      '</div>';
    row.appendChild(cover);

    const panel = document.createElement('div');
    panel.className = 'cosplay-panel';
    panel.dataset.cat = cat.key;
    const items = w.images.map((src, i) =>
      '<div class="cosplay-cat-strip-item" data-work="' + cat.key + '" data-index="' + i + '">' +
        '<img src="' + src + '" alt="' + esc(w.title) + ' ' + (i + 1) + '" loading="lazy" decoding="async">' +
      '</div>').join('');
    panel.innerHTML =
      '<div class="cosplay-panel-head">' +
        '<div><div class="cosplay-panel-title">' + esc(w.title) + '</div>' +
        '<div class="cosplay-panel-meta">' + w.meta + '</div></div>' +
        '<div class="cosplay-panel-state"></div>' +
      '</div>' +
      '<div class="cosplay-panel-grid">' + items + '</div>';
    reveal.appendChild(panel);
  });

  mount.appendChild(row);
  mount.appendChild(reveal);

  const covers = Array.from(row.querySelectorAll('.cosplay-cover'));
  const panels = Array.from(reveal.querySelectorAll('.cosplay-panel'));
  let pinned = null, hovered = null;

  function apply() {
    const key = hovered || pinned;
    reveal.classList.toggle('open', !!key);
    panels.forEach(p => p.classList.toggle('open', p.dataset.cat === key));
    covers.forEach(c => {
      c.classList.toggle('active', c.dataset.cat === key);
      c.classList.toggle('pinned', c.dataset.cat === pinned);
    });
    const active = panels.find(p => p.dataset.cat === key);
    if (active) {
      const st = active.querySelector('.cosplay-panel-state');
      if (st) st.textContent = (pinned === key) ? 'Pinned · click cover to close' : 'Click cover to keep open';
    }
  }

  covers.forEach(c => {
    c.addEventListener('mouseenter', () => { hovered = c.dataset.cat; apply(); });
    c.addEventListener('focus', () => { hovered = c.dataset.cat; apply(); });
    c.addEventListener('click', () => {
      pinned = (pinned === c.dataset.cat) ? null : c.dataset.cat;
      hovered = c.dataset.cat;
      apply();
    });
  });
  // Leaving the whole gallery (covers + open panel) clears the hover preview,
  // falling back to the pinned set (or nothing).
  mount.addEventListener('mouseleave', () => { hovered = null; apply(); });

  apply();
})();

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.classList.remove('lightbox-active');
  document.body.style.overflow = '';
}

document.getElementById('lightbox').addEventListener('click', function(e) {
  // Close when clicking any empty backdrop area (overlay, inner wrapper, or the
  // media column's blank space), but keep the image, info panel, thumbnails,
  // and nav buttons interactive.
  if (e.target.closest('#lb-img, .lightbox-info, .lightbox-thumbs, .lightbox-nav, .lightbox-close')) return;
  closeLightbox();
});

document.addEventListener('keydown', e => {
  // When the zoom viewer is open it takes priority over the carousel
  if (document.getElementById('lb-zoom').classList.contains('open')) {
    if (e.key === 'Escape') closeZoom();
    return;
  }
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft') lbNav(-1);
});

document.addEventListener('click', e => {
  const item = e.target.closest('[data-work]');
  if (item) {
    const idx = item.dataset.index !== undefined ? parseInt(item.dataset.index) : 0;
    openLightbox(item.dataset.work, idx);
  }
});

/* ── ZOOM / INSPECT VIEWER ──
   Click the big lightbox image to open. Scroll or click to zoom toward the
   cursor, drag to pan. Click the dark area outside the image, the ✕, or Esc
   to return to the carousel (which stays open underneath). */
(function () {
  const overlay = document.getElementById('lb-zoom');
  const stage   = document.getElementById('lb-zoom-stage');
  const img     = document.getElementById('lb-zoom-img');

  let scale = 1, minScale = 1, maxScale = 6;
  let tx = 0, ty = 0;                 // image top-left in stage coords
  let baseW = 0, baseH = 0;          // "fit" size of the image at scale 1
  let dragging = false, moved = false, downOnImg = false;
  let startX = 0, startY = 0, startTx = 0, startTy = 0;

  function apply() {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // keep the image from drifting completely off-screen
  function clamp() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const w = baseW * scale, h = baseH * scale;
    if (w <= sw) tx = (sw - w) / 2; else tx = Math.min(0, Math.max(sw - w, tx));
    if (h <= sh) ty = (sh - h) / 2; else ty = Math.min(0, Math.max(sh - h, ty));
  }

  function fit() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const nw = img.naturalWidth || sw, nh = img.naturalHeight || sh;
    const r = Math.min(sw / nw, sh / nh);
    baseW = nw * r;
    baseH = nh * r;
    img.style.width  = baseW + 'px';
    img.style.height = baseH + 'px';
    scale = 1;
    minScale = 1;
    // allow zooming up to native resolution (at least 3x), capped for sanity
    maxScale = Math.min(8, Math.max(3, nw / baseW));
    clamp();
    apply();
  }

  // zoom by `factor` keeping the point under (cx, cy) fixed on screen
  function zoomAt(cx, cy, factor) {
    const newScale = Math.min(maxScale, Math.max(minScale, scale * factor));
    if (newScale === scale) return;
    const ix = (cx - tx) / scale;    // image-local point under cursor
    const iy = (cy - ty) / scale;
    scale = newScale;
    tx = cx - ix * scale;
    ty = cy - iy * scale;
    clamp();
    apply();
    img.style.cursor = scale > minScale ? 'grab' : 'zoom-in';
  }

  window.openZoom = function () {
    if (!currentWork) return;
    img.src = currentWork.images[currentImgIndex];
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (img.complete && img.naturalWidth) fit();
    else img.onload = fit;
  };

  window.closeZoom = function () {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  // wheel = smooth zoom toward the cursor
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.18 : 1 / 1.18);
  }, { passive: false });

  // pointer down: begin a potential drag / click
  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = false;
    downOnImg = (e.target === img);   // capture retargets later events, so record now
    startX = e.clientX; startY = e.clientY;
    startTx = tx; startTy = ty;
    stage.setPointerCapture(e.pointerId);
    if (downOnImg && scale > minScale) img.style.cursor = 'grabbing';
  });

  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    if (scale > minScale) {          // only pan when zoomed in
      tx = startTx + dx;
      ty = startTy + dy;
      clamp();
      apply();
    }
  });

  stage.addEventListener('pointerup', e => {
    dragging = false;
    img.style.cursor = scale > minScale ? 'grab' : 'zoom-in';
    if (moved) return;               // it was a drag, not a click

    if (downOnImg) {
      // click on image: step zoom in toward the point; reset once past max
      if (scale >= maxScale - 0.001) { fit(); }
      else { zoomAt(e.clientX, e.clientY, 1.8); }
    } else {
      // click on the dark area outside the image: exit
      closeZoom();
    }
  });

  // re-fit if the window resizes while open
  window.addEventListener('resize', () => {
    if (overlay.classList.contains('open')) fit();
  });
})();

/* ── CLUB PARTICLE FIELD ──
   The same glowy rainbow particle network used behind the other sections,
   scoped to the Cosplay Club panel on the Home page. Runs only while the
   panel is actually on screen (IntersectionObserver), so it costs nothing
   when you're on the hero or another tab. */
function createParticleField(canvas) {
  const ctx = canvas.getContext('2d');
  const COUNT = 46, MOUSE_RADIUS = 130, LINK_RADIUS = 110;
  const mouse = { x: -9999, y: -9999 };
  let w = 0, h = 0, raf = null, running = false, ps = [], rect = { left: 0, top: 0 };

  function fit() {
    const r = canvas.getBoundingClientRect();
    rect = r;
    w = canvas.width = Math.max(1, Math.round(r.width));
    h = canvas.height = Math.max(1, Math.round(r.height));
  }
  function seed() {
    ps = [];
    for (let i = 0; i < COUNT; i++) ps.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.9, a: Math.random() * 0.45 + 0.3,
      hue: Math.random() * 360, hd: (Math.random() - 0.5) * 0.4
    });
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d = Math.hypot(dx, dy);
        if (d < LINK_RADIUS) {
          const al = (1 - d / LINK_RADIUS) * 0.13, hue = (ps[i].hue + ps[j].hue) / 2;
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${al})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.hue = (p.hue + p.hd + 360) % 360;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < MOUSE_RADIUS && d > 0) { const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * 1.8; p.x += dx / d * f; p.y += dy / d * f; }
      ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.9)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, ${p.a})`; ctx.fill(); ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; fit(); if (!ps.length) seed(); running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

  const reFit = () => { if (running) fit(); };
  window.addEventListener('resize', reFit);
  window.addEventListener('scroll', () => { rect = canvas.getBoundingClientRect(); }, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  return { start, stop };
}

(function () {
  const clubCanvas = document.querySelector('.club-particles');
  if (!clubCanvas) return;
  const field = createParticleField(clubCanvas);
  // Runs while Home is active (started/stopped by applyBackground in index.html).
  // A short retry after start re-fits once the panel's images have laid out.
  window.ClubField = {
    start() { field.start(); setTimeout(() => { field.stop(); field.start(); }, 400); },
    stop() { field.stop(); }
  };
  // Start now if Home is the active section on load.
  const home = document.getElementById('home');
  if (home && home.classList.contains('active')) window.ClubField.start();
})();
