(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const shell = document.getElementById('gameShell');
  const $ = (id) => document.getElementById(id);
  const screens = ['menuScreen', 'howScreen', 'shopScreen', 'pauseScreen', 'gameoverScreen'].map($);
  const mobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const shipCatalog = [
    ['vanguard', 'Vanguard', 'space_cruiser_1.png', 'DEFENDER', 0, 'Aegis Shield', 'SHIELD', 'Become untouchable for 2.8 seconds.', 'shield', 12, 330],
    ['cruiser2', 'Bulwark', 'space_cruiser_2.png', 'FORTRESS', 1400, 'Repair Drone', 'REPAIR', 'Restore one lost hull point instantly.', 'repair', 15, 300],
    ['nova', 'Nova', 'space_cruiser_3.png', 'BOMBER', 1800, 'Nova Burst', 'NOVA BURST', 'Clear enemy shots and damage nearby planes.', 'blast', 10, 315],
    ['cruiser4', 'Sunlance', 'space_cruiser_4.png', 'ARTILLERY', 2100, 'Solar Flare', 'SOLAR FLARE', 'Unleash a wide blast that scorches nearby foes.', 'blast', 12, 320],
    ['wraith', 'Wraith', 'space_cruiser_5.png', 'GHOST', 2600, 'Phase Cloak', 'PHASE', 'Slip through danger for 3.8 seconds.', 'cloak', 13, 370],
    ['cruiser6', 'Comet', 'space_cruiser_6.png', 'INTERCEPTOR', 3300, 'Comet Dash', 'COMET DASH', 'Dash at hyper-speed through enemy fire.', 'dash', 11, 390],
    ['striker', 'Striker', 'space_cruiser_7.png', 'ACE', 4200, 'Overdrive', 'OVERDRIVE', 'Fire a triple volley for 6 seconds.', 'overdrive', 11, 345],
    ['cruiser8', 'Starforge', 'space_cruiser_8.png', 'ENGINEER', 5100, 'Scrap Magnet', 'SCRAP MAGNET', 'Pull in every nearby credit and repair cell.', 'magnet', 14, 325],
    ['cruiser9', 'Leviathan', 'space_cruiser_9.png', 'DREADNOUGHT', 6000, 'Titan Guard', 'TITAN GUARD', 'A reinforced shield holds for 4.2 seconds.', 'shield', 16, 285],
    ['jet1', 'Bluebolt', 'pixel_jet_1.png', 'JET · SCOUT', 700, 'Ion Juke', 'ION JUKE', 'A sharp evasive dash breaks enemy lock-ons.', 'dash', 9, 390],
    ['jet2', 'Redshift', 'pixel_jet_2.png', 'JET · ACE', 1000, 'Afterburner', 'AFTERBURNER', 'Unleash rapid fire for 4 seconds.', 'overdrive', 10, 420],
    ['jet3', 'Skyknife', 'pixel_jet_3.png', 'JET · STRIKER', 1300, 'Knife-Edge', 'KNIFE-EDGE', 'Burst through a tight formation with a shockwave.', 'blast', 11, 400],
    ['jet4', 'Frostwing', 'pixel_jet_4.png', 'JET · GUARD', 1600, 'Cryo Veil', 'CRYO VEIL', 'Freeze incoming danger behind a cool shield.', 'shield', 11, 365],
    ['jet5', 'Copperhead', 'pixel_jet_5.png', 'JET · SUPPORT', 1900, 'Field Patch', 'FIELD PATCH', 'Emergency nanites repair one hull point.', 'repair', 13, 355],
    ['jet6', 'Violet Viper', 'pixel_jet_6.png', 'JET · PHANTOM', 2200, 'Ghost Run', 'GHOST RUN', 'Phase out of danger for 3.2 seconds.', 'cloak', 12, 405],
    ['jet7', 'Moonraker', 'pixel_jet_7.png', 'JET · BOMBER', 2500, 'Lunar Mine', 'LUNAR MINE', 'Detonate a pulse that clears shots and hits foes.', 'blast', 13, 375],
    ['jet8', 'Afterglow', 'pixel_jet_8.png', 'JET · INTERCEPTOR', 2800, 'Lightbreak', 'LIGHTBREAK', 'Blink forward through a veil of enemy fire.', 'dash', 10, 430],
    ['jet9', 'Phantom X', 'pixel_jet_9.png', 'JET · GHOST', 3100, 'Null Phase', 'NULL PHASE', 'Become intangible and dodge every hit.', 'cloak', 14, 410],
    ['jet10', 'Little Comet', 'pixel_jet_10.png', 'JET · ROOKIE', 3400, 'Lucky Scrapper', 'LUCKY SCRAPPER', 'Attract salvage and score bonus credits.', 'magnet', 12, 385],
    ['jet11', 'Stardart', 'pixel_jet_11.png', 'JET · ELITE', 3700, 'Starburst', 'STARBURST', 'A brilliant burst damages the whole screen.', 'blast', 15, 400],
    ['jet12', 'Aurora', 'pixel_jet_12.png', 'JET · LEGEND', 4000, 'Aurora Aegis', 'AURORA AEGIS', 'A shimmering shield absorbs incoming attacks.', 'shield', 13, 415]
  ];
  const ships = shipCatalog.map(([id, name, image, className, cost, ability, shortAbility, description, special, cooldown, speed]) => ({
    id, name, image, className, cost, ability, shortAbility, description, special, cooldown, speed
  }));
  const images = {};
  const assetPaths = {
    cruiser: 'space_cruiser_1.png',
    explosion: 'big_explosion/big_explosion.png',
    coin: 'spinning_coin/spinning_coin.png',
    powerOrb: 'power_up_7.png',
    powerHourglass: 'power_up_11.png',
    powerRocket: 'power_up_12.png',
    powerMagnet: 'power_up_14.png',
    powerBoot: 'power_up_15.png',
    powerDouble: 'power_up_16.png',
    heart: 'hearts_1.png',
    healthBarFrame: 'health_bars_1.png',
    healthBarFill: 'health_bars_2.png',
    rocketBullet: 'space_rocket_3.png'
  };
  ships.forEach((ship) => { assetPaths[ship.id] = ship.image; });
  for (const [name, path] of Object.entries(assetPaths)) {
    images[name] = new Image();
    images[name].src = path;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = 0;
  let mode = 'menu';
  let soundOn = localStorage.getItem('svp-sound') !== 'off';
  let audioUnlocked = false;
  const music = new Audio('planet_hopper_music.mp3');
  music.loop = true;
  music.volume = 0.24;
  music.preload = 'none';
  const audioClips = {
    launch: 'confirm.mp3',
    select: 'select.mp3',
    confirm: 'confirm.mp3',
    back: 'back.mp3',
    pause: 'pause.mp3',
    resume: 'menu_close.mp3',
    fire: 'laser_1.mp3',
    hit: 'spaceship_explosion.mp3',
    damage: 'shield_hit.mp3',
    pickup: 'power_up_2.mp3',
    shield: 'shield_hit.mp3',
    wave: 'level_up.mp3',
    gameover: 'game_over.mp3',
    magnet: 'magnet_power_up.mp3',
    heal: 'extra_life.mp3',
    boss: 'spaceship_explosion.mp3'
  };
  let best = Number(localStorage.getItem('svp-best') || 0);
  let credits = Number(localStorage.getItem('svp-credits') ?? 1000);
  let ownedShips;
  try {
    ownedShips = JSON.parse(localStorage.getItem('svp-owned-ships') || '["vanguard"]');
    if (!Array.isArray(ownedShips)) ownedShips = ['vanguard'];
  } catch { ownedShips = ['vanguard']; }
  if (!ownedShips.includes('vanguard')) ownedShips.push('vanguard');
  let selectedShipId = localStorage.getItem('svp-selected-ship') || 'vanguard';
  if (!ships.some((ship) => ship.id === selectedShipId && ownedShips.includes(ship.id))) selectedShipId = 'vanguard';
  let score = 0;
  let lives = 3;
  let wave = 1;
  let kills = 0;
  let waveTarget = 12;
  let fireTimer = 0;
  let spawnTimer = 0.6;
  let shieldTime = 0;
  let specialCooldown = 0;
  let specialHudTimer = 0;
  let cloakTime = 0;
  let magnetTime = 0;
  let dashTime = 0;
  let invulnerable = 0;
  let rapidTime = 0;
  let slowTime = 0;
  let speedTime = 0;
  let doubleScoreTime = 0;
  let combo = 0;
  let comboTimer = 0;
  let bossSpawned = false;
  let nextBossScore = 10000;
  let screenShake = 0;
  let damageFlash = 0;
  let battleToast = null;
  let floatingTexts = [];
  let asteroids = [];
  let comets = [];
  let stars = [];
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let pickups = [];
  let particles = [];
  let explosions = [];
  let keys = new Set();
  let touchDirs = new Set();
  const player = { x: 0, y: 0, radius: 19, speed: 330 };

  function resize() {
    const rect = shell.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!player.x) {
      player.x = width / 2;
      player.y = height * 0.78;
    } else {
      player.x = Math.min(width - 28, Math.max(28, player.x));
      player.y = Math.min(height - 35, Math.max(90, player.y));
    }
    stars = Array.from({ length: Math.max(70, Math.floor(width * height / 8500)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.3 + Math.random() * 1.8,
      r: 0.35 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2
    }));
    asteroids = Array.from({ length: Math.max(7, Math.floor(width / 190)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2 + Math.random() * 6,
      speed: 8 + Math.random() * 24,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      shade: 35 + Math.floor(Math.random() * 28)
    }));
    comets = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: -110 - Math.random() * 150,
      vy: 90 + Math.random() * 110,
      wait: Math.random() * 8
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  const currentShip = () => ships.find((ship) => ship.id === selectedShipId) || ships[0];

  function saveProgress() {
    localStorage.setItem('svp-credits', String(credits));
    localStorage.setItem('svp-owned-ships', JSON.stringify(ownedShips));
    localStorage.setItem('svp-selected-ship', selectedShipId);
  }

  function refreshMenuShip() {
    const ship = currentShip();
    if ($('heroShip')) {
      $('heroShip').src = ship.image;
      $('heroShip').classList.toggle('cruiser-upside-down', ship.image.startsWith('space_cruiser_'));
    }
    if ($('shipStageLabel')) $('shipStageLabel').textContent = `${ship.name.toUpperCase()} · ${ship.className}`;
    if ($('currentShipLabel')) $('currentShipLabel').textContent = `${ship.name.toUpperCase()} · ${ship.ability.toUpperCase()}`;
    if ($('creditsValue')) $('creditsValue').textContent = String(credits).padStart(4, '0');
  }

  function renderShop() {
    $('shopCredits').textContent = `${credits.toLocaleString()} CR`;
    $('creditsValue').textContent = String(credits).padStart(4, '0');
    $('shipCards').innerHTML = ships.map((ship) => {
      const owned = ownedShips.includes(ship.id);
      const selected = selectedShipId === ship.id;
      const action = selected ? 'EQUIPPED' : owned ? 'EQUIP SHIP' : `BUY · ${ship.cost.toLocaleString()} CR`;
      const cruiser = ship.image.startsWith('space_cruiser_');
      return `<article class="ship-card${selected ? ' selected' : ''}${cruiser ? ' cruiser-card' : ''}" data-ship="${ship.id}">
        <div class="ship-card-top"><span>${ship.className}</span><span>${owned ? (selected ? 'ACTIVE' : 'OWNED') : `MK · ${ships.indexOf(ship) + 1}`}</span></div>
        <div class="ship-preview"><span class="preview-orbit"></span><img class="${cruiser ? 'cruiser-upside-down' : ''}" src="${ship.image}" alt="${ship.name} starfighter"></div>
        <h3>${ship.name}</h3><p class="ship-ability">${ship.ability}</p><p class="ship-description">${ship.description}</p>
        <button class="ship-action${selected ? ' is-equipped' : ''}" data-ship-action="${ship.id}" ${selected || (!owned && credits < ship.cost) ? 'disabled' : ''}>${action}</button>
      </article>`;
    }).join('');
    $('shopScreen').querySelector('.shop-card').scrollTop = 0;
    $('shipCards').scrollTop = 0;
  }

  function openShop() {
    renderShop();
    setMode('shop');
    requestAnimationFrame(() => {
      $('shopScreen').querySelector('.shop-card').scrollTop = 0;
      $('shipCards').scrollTop = 0;
    });
  }

  function setMode(next) {
    mode = next;
    screens.forEach((screen) => { screen.hidden = screen.id !== `${next}Screen`; });
    const playing = next === 'playing';
    shell.classList.toggle('is-playing', playing);
    $('hud').hidden = !playing;
    $('pauseButton').hidden = !playing;
    $('gameHint').hidden = !playing || mobile;
    $('mobileControls').hidden = !playing || !mobile;
    syncMusic();
    if (next === 'menu') {
      $('bestValue').textContent = formatScore(best);
      refreshMenuShip();
    }
  }

  function formatScore(value) {
    return String(Math.max(0, Math.floor(value))).padStart(6, '0');
  }

  function resetGame() {
    score = 0;
    lives = 3;
    wave = 1;
    kills = 0;
    waveTarget = 12;
    fireTimer = 0;
    spawnTimer = 0.55;
    shieldTime = 0;
    specialCooldown = 0;
    specialHudTimer = 0;
    cloakTime = 0;
    magnetTime = 0;
    dashTime = 0;
    invulnerable = 1.3;
    rapidTime = 0;
    slowTime = 0;
    speedTime = 0;
    doubleScoreTime = 0;
    combo = 0;
    comboTimer = 0;
    bossSpawned = false;
    nextBossScore = 10000;
    screenShake = 0;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    pickups = [];
    particles = [];
    explosions = [];
    player.x = width / 2;
    player.y = height * 0.78;
    player.speed = currentShip().speed;
    updateHud();
    setMode('playing');
    sound('launch');
    $('announcer').textContent = 'Mission started. Sector one.';
  }

  function updateHud() {
    $('scoreValue').textContent = formatScore(score);
    $('waveValue').textContent = String(wave).padStart(2, '0');
    $('livesValue').innerHTML = Array.from({ length: 3 }, (_, i) => `<img class="life-icon${i >= lives ? ' lost' : ''}" src="hearts_1.png" alt="" aria-hidden="true">`).join('');
    $('livesValue').setAttribute('aria-label', `${lives} lives remaining`);
    const ship = currentShip();
    const activeTime = ship.special === 'shield' ? shieldTime : ship.special === 'cloak' ? cloakTime : ship.special === 'overdrive' ? rapidTime : ship.special === 'dash' ? dashTime : ship.special === 'magnet' ? magnetTime : 0;
    $('abilityLabel').textContent = ship.shortAbility;
    $('abilityFill').style.width = `${specialCooldown <= 0 ? 100 : Math.max(0, 100 - specialCooldown / ship.cooldown * 100)}%`;
    $('abilityStatus').textContent = activeTime > 0 ? `ACTIVE · ${Math.ceil(activeTime)}s` : specialCooldown > 0 ? `RECHARGING · ${Math.ceil(specialCooldown)}s` : 'READY · C';
    $('abilityHint').textContent = ship.shortAbility;
    $('touchShield').textContent = ship.shortAbility;
    $('comboValue').textContent = combo > 1 ? `${combo}× STREAK` : '';
  }

  function startGame() {
    audioUnlocked = true;
    resetGame();
  }
  $('startButton').addEventListener('click', startGame);
  $('shopButton').addEventListener('click', openShop);
  $('closeShop').addEventListener('click', () => { sound('back'); setMode('menu'); });
  $('shipCards').addEventListener('click', (event) => {
    const button = event.target.closest('[data-ship-action]');
    if (!button) return;
    const ship = ships.find((item) => item.id === button.dataset.shipAction);
    if (!ship) return;
    const alreadyOwned = ownedShips.includes(ship.id);
    if (alreadyOwned) {
      selectedShipId = ship.id;
    } else if (credits >= ship.cost) {
      credits -= ship.cost;
      ownedShips.push(ship.id);
      selectedShipId = ship.id;
    } else {
      return;
    }
    saveProgress();
    sound(alreadyOwned ? 'select' : 'confirm');
    refreshMenuShip();
    renderShop();
  });
  $('howStartButton').addEventListener('click', startGame);
  $('retryButton').addEventListener('click', startGame);
  $('howButton').addEventListener('click', () => { sound('select'); setMode('how'); });
  $('closeHow').addEventListener('click', () => { sound('back'); setMode('menu'); });
  $('brandHome').addEventListener('click', (event) => {
    event.preventDefault();
    if (mode === 'playing' || mode === 'paused') returnToMenu();
    else setMode('menu');
  });
  $('pauseButton').addEventListener('click', togglePause);
  $('resumeButton').addEventListener('click', togglePause);
  $('pauseMenuButton').addEventListener('click', returnToMenu);
  $('gameoverMenuButton').addEventListener('click', returnToMenu);
  $('soundButton').addEventListener('click', () => {
    audioUnlocked = true;
    soundOn = !soundOn;
    localStorage.setItem('svp-sound', soundOn ? 'on' : 'off');
    $('soundButton').textContent = soundOn ? '♫' : '♪';
    $('soundButton').classList.toggle('sound-on', soundOn);
    if (soundOn) {
      syncMusic();
      sound('pickup');
    } else {
      syncMusic();
    }
  });

  function returnToMenu() {
    keys.clear();
    touchDirs.clear();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    pickups = [];
    particles = [];
    explosions = [];
    setMode('menu');
  }

  function togglePause() {
    if (mode === 'playing') {
      setMode('paused');
      sound('pause');
      $('announcer').textContent = 'Game paused.';
    } else if (mode === 'paused') {
      setMode('playing');
      sound('resume');
      $('announcer').textContent = 'Mission resumed.';
    }
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    keys.add(key);
    if ((key === 'p' || key === 'escape') && (mode === 'playing' || mode === 'paused')) togglePause();
    if (key === 'enter' && (mode === 'menu' || mode === 'gameover')) startGame();
    if (key === 'c' && mode === 'playing' && !event.repeat) activateSpecial();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => { keys.clear(); touchDirs.clear(); if (mode === 'playing') togglePause(); });

  document.querySelectorAll('.flight-pad button').forEach((button) => {
    const direction = button.dataset.dir;
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); touchDirs.add(direction); });
    const release = () => touchDirs.delete(direction);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
  const touchFire = $('touchFire');
  touchFire.addEventListener('pointerdown', (event) => { event.preventDefault(); touchFire.setPointerCapture(event.pointerId); touchDirs.add('fire'); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => touchFire.addEventListener(type, () => touchDirs.delete('fire')));
  $('touchShield').addEventListener('pointerdown', (event) => { event.preventDefault(); activateSpecial(); });

  function activateSpecial() {
    if (mode !== 'playing' || specialCooldown > 0) return;
    const ship = currentShip();
    specialCooldown = ship.cooldown;
    if (ship.special === 'shield') {
      shieldTime = ship.id === 'cruiser9' ? 4.2 : ship.id === 'jet4' ? 3.2 : 2.8;
      burst(player.x, player.y, '#67eeff', 22, 185);
      sound('shield');
    } else if (ship.special === 'blast') {
      enemyBullets = [];
      burst(player.x, player.y, '#ffb36b', 52, 330);
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const range = ship.id === 'jet11' ? Infinity : ship.id === 'jet7' ? 220 : 280;
        if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < range) {
          enemy.hp -= enemy.type === 'boss' ? (ship.id === 'jet11' ? 8 : 5) : 3;
          if (enemy.hp <= 0) killEnemy(i, enemy);
          else burst(enemy.x, enemy.y, '#ffb36b', 8, 120);
        }
      }
      sound('wave');
    } else if (ship.special === 'cloak') {
      cloakTime = ship.id === 'jet9' ? 4.5 : ship.id === 'jet6' ? 3.2 : 3.8;
      invulnerable = Math.max(invulnerable, cloakTime);
      burst(player.x, player.y, '#b58aff', 26, 220);
      sound('shield');
    } else if (ship.special === 'overdrive') {
      rapidTime = ship.id === 'jet2' ? 4 : 6;
      burst(player.x, player.y, '#ff6fbd', 24, 180);
      sound('wave');
    } else if (ship.special === 'repair') {
      lives = Math.min(3, lives + 1);
      burst(player.x, player.y, '#75ffc2', 30, 190);
      $('announcer').textContent = 'Repair drone restored one hull point.';
      sound('pickup');
    } else if (ship.special === 'dash') {
      dashTime = ship.id === 'jet8' ? 2.5 : 1.8;
      invulnerable = Math.max(invulnerable, dashTime);
      burst(player.x, player.y, '#8dd8ff', 30, 250);
      sound('shield');
    } else if (ship.special === 'magnet') {
      magnetTime = 7;
      if (ship.id === 'jet10') credits += 100;
      burst(player.x, player.y, '#ffe27b', 26, 180);
      $('announcer').textContent = ship.id === 'jet10' ? 'Lucky scrapper found bonus credits.' : 'Salvage magnet engaged.';
      saveProgress();
    }
    updateHud();
  }

  function syncMusic() {
    if (audioUnlocked && soundOn && mode !== 'paused' && mode !== 'gameover') music.play().catch(() => {});
    else music.pause();
  }

  function sound(type) {
    if (!soundOn || !audioUnlocked) return;
    const source = audioClips[type];
    if (!source) return;
    const clip = new Audio(source);
    clip.volume = type === 'fire' ? 0.25 : type === 'hit' || type === 'boss' ? 0.55 : 0.4;
    clip.play().catch(() => {});
  }

  function spawnEnemy() {
    const roll = Math.random();
    const boss = !bossSpawned && score >= nextBossScore;
    if (boss) {
      bossSpawned = true;
      nextBossScore += 10000;
      enemies.push({ x: width / 2, y: -76, w: 88, h: 62, hp: 24 + wave * 2, maxHp: 24 + wave * 2, speed: 40 + wave * 1.3, type: 'boss', phase: 0, fire: 1, value: 1600 });
      $('announcer').textContent = `Warning. Score milestone reached. Boss incoming at ${nextBossScore - 10000} points.`;
      showBattleToast('BOSS INBOUND', 'CAPITAL-CLASS SIGNATURE DETECTED', '#ff708e');
      sound('boss');
      return;
    }
    const type = roll < 0.18 ? 'swift' : roll < 0.35 ? 'heavy' : 'scout';
    const w = type === 'heavy' ? 40 : type === 'swift' ? 27 : 32;
    enemies.push({
      x: 28 + Math.random() * Math.max(1, width - 56), y: -35, w,
      h: type === 'heavy' ? 38 : 32,
      hp: type === 'heavy' ? 3 : type === 'swift' ? 1 : 2,
      maxHp: type === 'heavy' ? 3 : type === 'swift' ? 1 : 2,
      speed: (type === 'heavy' ? 75 : type === 'swift' ? 155 : 105) + wave * 5,
      type, jet: `jet${1 + Math.floor(Math.random() * 12)}`, phase: Math.random() * 6, fire: 1.5 + Math.random() * 2, value: type === 'heavy' ? 180 : 100
    });
  }

  function firePlayer() {
    const rapid = rapidTime > 0;
    const interval = rapid ? 0.085 : 0.18;
    if (fireTimer > 0) return;
    fireTimer = interval;
    bullets.push({ x: player.x - 8, y: player.y - 17, vx: -12, vy: -590, r: 3.5, damage: 1 }, { x: player.x + 8, y: player.y - 17, vx: 12, vy: -590, r: 3.5, damage: 1 });
    if (rapid) bullets.push({ x: player.x, y: player.y - 22, vx: 0, vy: -650, r: 3, damage: 1 });
    if (Math.random() < 0.22) sound('fire');
  }

  function fireEnemy(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    const speed = enemy.type === 'boss' ? 180 : 155;
    enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.h * 0.32, vx: dx / length * speed * 0.5, vy: speed, r: enemy.type === 'boss' ? 6 : 4, color: enemy.type === 'boss' ? '#ff7b99' : '#ff82a6' });
  }

  function burst(x, y, color, count = 10, speed = 120) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.25 + Math.random() * 0.75);
      particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: 0.35 + Math.random() * 0.5, maxLife: 0.85, size: 1.5 + Math.random() * 3, color });
    }
  }

  function showBattleToast(title, detail = '', color = '#71efff') {
    battleToast = { title, detail, color, time: 0, duration: 2.2 };
  }

  function showFloatingText(x, y, text, color = '#ffffff', size = 14) {
    floatingTexts.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9, vy: -38 });
  }

  function killEnemy(index, enemy) {
    enemies.splice(index, 1);
    const points = enemy.value * Math.min(5, 1 + Math.floor(combo / 5)) * (doubleScoreTime > 0 ? 2 : 1);
    score += points;
    credits += enemy.type === 'boss' ? 1000 : 75;
    saveProgress();
    $('creditsValue').textContent = String(credits).padStart(4, '0');
    combo += 1;
    comboTimer = 2.4;
    showFloatingText(enemy.x, enemy.y, `+${points}`, enemy.type === 'boss' ? '#ffd16e' : '#9df8ff', enemy.type === 'boss' ? 20 : 14);
    if (combo === 5 || combo === 10 || combo % 15 === 0) {
      showBattleToast(`${combo}× COMBO`, 'KEEP THE STREAK ALIVE', '#ffd16e');
    }
    kills += 1;
    burst(enemy.x, enemy.y, enemy.type === 'boss' ? '#ff6b92' : '#ffc77b', enemy.type === 'boss' ? 45 : 13, enemy.type === 'boss' ? 280 : 150);
    explosions.push({ x: enemy.x, y: enemy.y, time: 0, duration: 0.48, size: enemy.type === 'boss' ? 110 : 54 });
    if (enemy.type === 'boss') {
      score += 1000;
      bossSpawned = false;
      lives = Math.min(3, lives + 1);
      $('announcer').textContent = 'Capital-class target destroyed. Extra life awarded.';
      showBattleToast('CAPITAL SHIP DOWN', '+1 HULL · +1,000 BONUS', '#ffd16e');
      sound('wave');
    } else {
      sound('hit');
    }
    if (Math.random() < (enemy.type === 'boss' ? 1 : 0.2)) {
      const drops = ['heal', 'rapid', 'slow', 'magnet', 'speed', 'double'];
      const type = enemy.type === 'boss' ? 'heal' : drops[Math.floor(Math.random() * drops.length)];
      pickups.push({ x: enemy.x, y: enemy.y, type, time: 0, vy: 95 });
    }
    if (kills >= waveTarget && (wave % 4 !== 0 || !bossSpawned)) nextWave();
    updateHud();
  }

  function nextWave() {
    wave++;
    kills = 0;
    waveTarget = 11 + wave * 3;
    spawnTimer = 1.2;
    score += wave * 250;
    $('announcer').textContent = `Sector ${wave}. Hostiles incoming.`;
    showBattleToast(`SECTOR ${String(wave).padStart(2, '0')}`, 'HOSTILE WAVE APPROACHING', '#71efff');
    burst(width / 2, height * 0.28, '#75eafa', 35, 190);
    sound('wave');
    updateHud();
  }

  function hitPlayer(damage = 1) {
    if (invulnerable > 0 || shieldTime > 0 || dashTime > 0) return;
    lives = Math.max(0, lives - damage);
    invulnerable = 1.45;
    screenShake = 11;
    damageFlash = 0.62;
    combo = 0;
    comboTimer = 0;
    sound('damage');
    burst(player.x, player.y, '#ff6b92', 20, 200);
    $('announcer').textContent = `${damage} damage taken. ${lives} lives remaining.`;
    updateHud();
    if (lives <= 0) endGame();
  }

  function endGame() {
    setMode('gameover');
    $('finalScore').textContent = formatScore(score);
    const isBest = score > best;
    if (isBest) {
      best = score;
      localStorage.setItem('svp-best', String(best));
      $('newBest').hidden = false;
      $('bestValue').textContent = formatScore(best);
    } else {
      $('newBest').hidden = true;
    }
    sound('gameover');
    $('announcer').textContent = `Mission over. Final score ${score}.`;
  }

  function update(dt) {
    damageFlash = Math.max(0, damageFlash - dt);
    if (battleToast) {
      battleToast.time += dt;
      if (battleToast.time > battleToast.duration) battleToast = null;
    }
    for (const text of floatingTexts) {
      text.y += text.vy * dt;
      text.life -= dt;
    }
    floatingTexts = floatingTexts.filter((text) => text.life > 0);
    for (const star of stars) {
      star.y += (16 + star.z * 41) * dt;
      star.phase += dt * (1 + star.z);
      if (star.y > height + 2) { star.y = -2; star.x = Math.random() * width; }
    }
    for (const rock of asteroids) {
      rock.y += rock.speed * dt;
      rock.rotation += rock.spin * dt;
      if (rock.y > height + 12) { rock.y = -12; rock.x = Math.random() * width; }
    }
    for (const comet of comets) {
      comet.wait -= dt;
      if (comet.wait <= 0) {
        comet.x += comet.vx * dt;
        comet.y += comet.vy * dt;
        if (comet.x < -120 || comet.y > height + 100) {
          comet.x = width * (0.25 + Math.random() * 1.1);
          comet.y = -40 - Math.random() * height * 0.5;
          comet.wait = 4 + Math.random() * 10;
        }
      }
    }
    if (mode !== 'playing') return;

    fireTimer = Math.max(0, fireTimer - dt);
    specialCooldown = Math.max(0, specialCooldown - dt);
    shieldTime = Math.max(0, shieldTime - dt);
    cloakTime = Math.max(0, cloakTime - dt);
    magnetTime = Math.max(0, magnetTime - dt);
    dashTime = Math.max(0, dashTime - dt);
    invulnerable = Math.max(0, invulnerable - dt);
    rapidTime = Math.max(0, rapidTime - dt);
    slowTime = Math.max(0, slowTime - dt);
    speedTime = Math.max(0, speedTime - dt);
    doubleScoreTime = Math.max(0, doubleScoreTime - dt);
    specialHudTimer -= dt;
    if (specialHudTimer <= 0) {
      updateHud();
      specialHudTimer = 0.12;
    }
    comboTimer -= dt;
    if (comboTimer <= 0) combo = 0;
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 30);

    let dx = 0;
    let dy = 0;
    if (keys.has('a') || keys.has('arrowleft') || touchDirs.has('left')) dx--;
    if (keys.has('d') || keys.has('arrowright') || touchDirs.has('right')) dx++;
    if (keys.has('w') || keys.has('arrowup') || touchDirs.has('up')) dy--;
    if (keys.has('s') || keys.has('arrowdown') || touchDirs.has('down')) dy++;
    const len = Math.hypot(dx, dy) || 1;
    const speed = player.speed * (dashTime > 0 ? 2.5 : speedTime > 0 ? 1.65 : 1);
    player.x = Math.max(25, Math.min(width - 25, player.x + dx / len * speed * dt));
    player.y = Math.max(94, Math.min(height - (mobile ? 145 : 37), player.y + dy / len * speed * dt));
    if (keys.has(' ') || touchDirs.has('fire')) firePlayer();

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = Math.max(0.34, 1.1 - wave * 0.035) * (0.72 + Math.random() * 0.62);
    }

    for (const bullet of bullets) { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; }
    bullets = bullets.filter((bullet) => bullet.y > -20 && bullet.x > -20 && bullet.x < width + 20);
    for (const bullet of enemyBullets) { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; }
    enemyBullets = enemyBullets.filter((bullet) => bullet.y < height + 20 && bullet.x > -20 && bullet.x < width + 20);

    for (const enemy of enemies) {
      enemy.phase += dt;
      if (enemy.type === 'boss') {
        enemy.y += (enemy.y < 115 ? enemy.speed : Math.sin(enemy.phase * 0.7) * 20) * dt * (slowTime > 0 ? 0.48 : 1);
        enemy.x = width / 2 + Math.sin(enemy.phase * 0.75) * Math.min(width * 0.34, 270);
        enemy.fire -= dt;
        if (enemy.fire <= 0) { fireEnemy(enemy); enemy.fire = 0.72; }
      } else {
        enemy.y += enemy.speed * dt * (slowTime > 0 ? 0.48 : 1);
        enemy.x += Math.sin(enemy.phase * (enemy.type === 'swift' ? 3 : 1.7)) * (enemy.type === 'swift' ? 80 : 35) * dt;
        enemy.fire -= dt;
        if (enemy.fire <= 0 && enemy.y > 55 && Math.random() < 0.68) { fireEnemy(enemy); enemy.fire = 2.4 + Math.random() * 1.3; }
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      for (let j = bullets.length - 1; j >= 0; j--) {
        const bullet = bullets[j];
        if (Math.abs(enemy.x - bullet.x) < enemy.w * 0.45 && Math.abs(enemy.y - bullet.y) < enemy.h * 0.45) {
          bullets.splice(j, 1);
          enemy.hp -= bullet.damage;
          burst(bullet.x, bullet.y, '#6df0ff', 3, 60);
          if (enemy.hp <= 0) { killEnemy(i, enemy); break; }
        }
      }
      if (enemies[i] !== enemy) continue;
      const hitDist = enemy.type === 'boss' ? 54 : 26;
      if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < hitDist) {
        if (enemy.type !== 'boss') enemies.splice(i, 1);
        if (shieldTime > 0) {
          burst(enemy.x, enemy.y, '#73efff', 15, 170);
          if (enemy.type === 'boss') {
            enemy.hp -= 3;
            if (enemy.hp <= 0) killEnemy(i, enemy);
          }
        } else hitPlayer(2);
      } else if (enemy.y > height + 42) {
        enemies.splice(i, 1);
      }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];
      const nearestX = Math.max(player.x - 29, Math.min(bullet.x, player.x + 29));
      const nearestY = Math.max(player.y - 23, Math.min(bullet.y, player.y + 23));
      const touchX = bullet.x - nearestX;
      const touchY = bullet.y - nearestY;
      if (touchX * touchX + touchY * touchY <= bullet.r * bullet.r) {
        enemyBullets.splice(i, 1);
        if (shieldTime > 0) burst(bullet.x, bullet.y, '#8a9fff', 7, 100);
        else hitPlayer();
      }
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i];
      pickup.time += dt;
      pickup.y += pickup.vy * dt;
      pickup.x += Math.sin(pickup.time * 2.7) * 23 * dt;
      if (magnetTime > 0) {
        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        const distance = Math.hypot(dx, dy) || 1;
        pickup.x += dx / distance * 430 * dt;
        pickup.y += dy / distance * 430 * dt;
      }
      if (Math.hypot(player.x - pickup.x, player.y - pickup.y) < 33) {
        if (pickup.type === 'heal') {
          lives = Math.min(3, lives + 1);
          $('announcer').textContent = 'Repair cell collected.';
        } else if (pickup.type === 'rapid') {
          rapidTime = 8;
          $('announcer').textContent = 'Rapid fire activated.';
        } else if (pickup.type === 'slow') {
          slowTime = 7;
          $('announcer').textContent = 'Stasis field activated.';
        } else if (pickup.type === 'magnet') {
          magnetTime = 8;
          $('announcer').textContent = 'Salvage magnet activated.';
        } else if (pickup.type === 'speed') {
          speedTime = 7;
          $('announcer').textContent = 'Rocket boost activated.';
        } else if (pickup.type === 'double') {
          doubleScoreTime = 10;
          $('announcer').textContent = 'Double score activated.';
        }
        showBattleToast(`${pickup.type.toUpperCase()} BOOST`, 'POWER-UP ACQUIRED', '#ffe27b');
        showFloatingText(pickup.x, pickup.y, pickup.type.toUpperCase(), '#ffe27b', 12);
        score += 250;
        sound(pickup.type === 'heal' ? 'heal' : pickup.type === 'magnet' ? 'magnet' : 'pickup');
        burst(pickup.x, pickup.y, '#ffe178', 15, 130);
        pickups.splice(i, 1);
        updateHud();
      } else if (pickup.y > height + 40) pickups.splice(i, 1);
    }

    for (const particle of particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vx *= 0.985; particle.vy *= 0.985; particle.life -= dt; }
    particles = particles.filter((particle) => particle.life > 0);
    for (const explosion of explosions) explosion.time += dt;
    explosions = explosions.filter((explosion) => explosion.time < explosion.duration);
  }

  function drawBackground(time) {
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#080d25');
    base.addColorStop(0.56, '#10102e');
    base.addColorStop(1, '#080d20');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    const nebula = ctx.createRadialGradient(width * 0.7, height * 0.34, 5, width * 0.7, height * 0.34, width * 0.62);
    nebula.addColorStop(0, 'rgba(77,61,163,.25)');
    nebula.addColorStop(0.48, 'rgba(35,51,121,.12)');
    nebula.addColorStop(1, 'rgba(8,13,35,0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);
    const nebula2 = ctx.createRadialGradient(width * 0.17, height * 0.72, 0, width * 0.17, height * 0.72, width * 0.38);
    nebula2.addColorStop(0, 'rgba(35,108,151,.1)');
    nebula2.addColorStop(1, 'rgba(5,9,25,0)');
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, width, height);
    drawPlanet(time);
    for (const star of stars) {
      const alpha = 0.2 + (Math.sin(star.phase + time * 0.001) + 1) * 0.32;
      ctx.fillStyle = `rgba(${star.z > 1.65 ? '155,206,255' : '220,230,255'},${alpha})`;
      ctx.fillRect(star.x, star.y, star.r, star.r);
      if (star.z > 1.7 && mode === 'playing') {
        ctx.fillStyle = `rgba(130,190,255,${alpha * 0.12})`;
        ctx.fillRect(star.x, star.y - 8, 1, 8);
      }
    }
    for (const comet of comets) {
      if (comet.wait > 0) continue;
      const gradient = ctx.createLinearGradient(comet.x, comet.y, comet.x - comet.vx * 0.42, comet.y - comet.vy * 0.42);
      gradient.addColorStop(0, 'rgba(192,244,255,.9)');
      gradient.addColorStop(1, 'rgba(101,151,255,0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(comet.x - comet.vx * 0.42, comet.y - comet.vy * 0.42); ctx.stroke();
      ctx.fillStyle = '#e2fbff';
      ctx.beginPath(); ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2); ctx.fill();
    }
    for (const rock of asteroids) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.rotation);
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = `rgb(${rock.shade},${rock.shade + 4},${rock.shade + 18})`;
      ctx.beginPath();
      ctx.moveTo(-rock.size, -rock.size * 0.35);
      ctx.lineTo(-rock.size * 0.45, -rock.size);
      ctx.lineTo(rock.size * 0.55, -rock.size * 0.72);
      ctx.lineTo(rock.size, rock.size * 0.12);
      ctx.lineTo(rock.size * 0.28, rock.size * 0.82);
      ctx.lineTo(-rock.size * 0.65, rock.size * 0.63);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(2,5,18,.5)';
      ctx.beginPath(); ctx.arc(rock.size * 0.15, -rock.size * 0.1, rock.size * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(92,144,211,.07)';
    ctx.lineWidth = 1;
    const horizon = height * 0.83;
    for (let x = -width; x < width * 2; x += 90) {
      ctx.beginPath(); ctx.moveTo(width / 2, horizon); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = horizon; y < height; y += 26) {
      ctx.globalAlpha = (y - horizon) / (height - horizon) * 0.6;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanet(time) {
    const radius = Math.max(70, Math.min(width, height) * 0.145);
    const x = width * 0.79 + Math.sin(time * 0.00009) * 13;
    const y = height * 0.31 + Math.cos(time * 0.00012) * 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.2);
    ctx.strokeStyle = 'rgba(144,132,255,.12)';
    ctx.lineWidth = Math.max(7, radius * 0.09);
    ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.65, radius * 0.37, 0, Math.PI, Math.PI * 2); ctx.stroke();
    const glow = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius * 1.75);
    glow.addColorStop(0, 'rgba(129,104,255,.13)');
    glow.addColorStop(1, 'rgba(92,114,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, radius * 1.75, 0, Math.PI * 2); ctx.fill();
    const sphere = ctx.createRadialGradient(-radius * 0.38, -radius * 0.43, radius * 0.06, 0, 0, radius * 1.08);
    sphere.addColorStop(0, 'rgba(131,171,255,.38)');
    sphere.addColorStop(0.45, 'rgba(86,88,193,.32)');
    sphere.addColorStop(0.82, 'rgba(41,42,116,.36)');
    sphere.addColorStop(1, 'rgba(17,21,62,.08)');
    ctx.fillStyle = sphere;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, radius * 0.98, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#b7c9ff';
    for (let band = -2; band <= 2; band++) {
      ctx.lineWidth = 2 + Math.abs(band);
      ctx.beginPath();
      ctx.ellipse(Math.sin(time * 0.00015 + band) * radius * 0.3, band * radius * 0.27, radius * 0.9, radius * (0.12 + Math.abs(band) * 0.018), 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(166,192,255,.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.65, radius * 0.37, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(time) {
    if (invulnerable > 0 && Math.floor(time / 95) % 2 === 0) return;
    ctx.save();
    ctx.translate(player.x, player.y + Math.sin(time / 160) * 2);
    const ship = currentShip();
    const cruiser = ship.image.startsWith('space_cruiser_');
    if (cloakTime > 0) ctx.globalAlpha = 0.38 + Math.sin(time / 75) * 0.12;
    ctx.shadowColor = ship.id === 'wraith' ? '#b58aff' : ship.id === 'striker' ? '#ff6fbd' : '#66e8ff';
    ctx.shadowBlur = 20;
    const shipImage = images[ship.id];
    if (shipImage.complete && shipImage.naturalWidth) {
      if (cruiser) ctx.rotate(Math.PI);
      ctx.drawImage(shipImage, -29, -23, 58, 46);
    } else {
      drawShipShape(0, 0, 1, '#71efff', '#566ff6');
    }
    ctx.shadowBlur = 0;
    const exhaustY = cruiser ? -22 : 22;
    const exhaustDirection = cruiser ? -1 : 1;
    const flameLength = 12 + Math.sin(time / 42) * 4 + (dashTime > 0 ? 14 : 0);
    for (const offset of [-10, 10]) {
      const flame = ctx.createLinearGradient(0, exhaustY, 0, exhaustY + exhaustDirection * flameLength);
      flame.addColorStop(0, '#f4ffff');
      flame.addColorStop(0.28, '#65efff');
      flame.addColorStop(1, 'rgba(96,123,255,0)');
      ctx.fillStyle = flame;
      ctx.shadowColor = '#55e9ff';
      ctx.shadowBlur = dashTime > 0 ? 19 : 10;
      ctx.beginPath();
      ctx.ellipse(offset, exhaustY + exhaustDirection * flameLength * 0.48, dashTime > 0 ? 4 : 2.8, flameLength * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (shieldTime > 0) {
      ctx.strokeStyle = `rgba(112,239,255,${0.54 + Math.sin(time / 80) * 0.22})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#69efff'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(time / 110) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (dashTime > 0) {
      ctx.strokeStyle = 'rgba(115,210,255,.55)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-12 + i * 12, 22); ctx.lineTo(-12 + i * 12, 45 + Math.random() * 20); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawShipShape(x, y, scale, color, wingColor) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = wingColor;
    ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(22, 11); ctx.lineTo(10, 8); ctx.lineTo(6, 20); ctx.lineTo(-6, 20); ctx.lineTo(-10, 8); ctx.lineTo(-22, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -29); ctx.lineTo(9, 11); ctx.lineTo(5, 20); ctx.lineTo(-5, 20); ctx.lineTo(-9, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7fdff'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(4, -5); ctx.lineTo(0, 1); ctx.lineTo(-4, -5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.type === 'boss') {
      ctx.shadowColor = '#ff4e83'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#612653';
      ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(50, -17); ctx.lineTo(38, -20); ctx.lineTo(30, -30); ctx.lineTo(-30, -30); ctx.lineTo(-38, -20); ctx.lineTo(-50, -17); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fa678f';
      ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(13, -28); ctx.lineTo(6, -23); ctx.lineTo(-6, -23); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f9d1e5'; ctx.fillRect(-21, -13, 9, 4); ctx.fillRect(12, -13, 9, 4);
      ctx.restore(); return;
    }
    const colors = enemy.type === 'swift' ? ['#ffbd72', '#ff6f7e'] : enemy.type === 'heavy' ? ['#b988ff', '#6852ce'] : ['#fa7794', '#a34073'];
    const jetSprite = images[enemy.jet];
    if (jetSprite && jetSprite.complete && jetSprite.naturalWidth) {
      ctx.rotate(Math.PI);
      ctx.shadowColor = colors[0]; ctx.shadowBlur = 12;
      ctx.drawImage(jetSprite, -21, -21, 42, 42);
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }
    ctx.shadowColor = colors[0]; ctx.shadowBlur = 12;
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.moveTo(0, 20); ctx.lineTo(17, -8); ctx.lineTo(30, -14); ctx.lineTo(23, -15); ctx.lineTo(10, -11); ctx.lineTo(6, -17); ctx.lineTo(-6, -17); ctx.lineTo(-10, -11); ctx.lineTo(-23, -15); ctx.lineTo(-30, -14); ctx.lineTo(-17, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = colors[0]; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(7, -13); ctx.lineTo(0, -19); ctx.lineTo(-7, -13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff0d4'; ctx.fillRect(-2, -11, 4, 7);
    ctx.shadowBlur = 0;
    if (enemy.hp < enemy.maxHp) {
      ctx.fillStyle = 'rgba(6,10,27,.8)'; ctx.fillRect(-enemy.w * .4, -enemy.h * .58, enemy.w * .8, 2);
      ctx.fillStyle = '#ff728e'; ctx.fillRect(-enemy.w * .4, -enemy.h * .58, enemy.w * .8 * enemy.hp / enemy.maxHp, 2);
    }
    ctx.restore();
  }

  function drawBossHud() {
    const boss = enemies.find((enemy) => enemy.type === 'boss');
    if (!boss || mode !== 'playing') return;
    const frame = images.healthBarFrame;
    const fill = images.healthBarFill;
    const scale = Math.min(2.5, (width - 24) / 128);
    const x = (width - 128 * scale) / 2;
    const y = mobile ? 118 : 128;
    const health = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (frame.complete && frame.naturalWidth) {
      ctx.drawImage(frame, x, y, 128 * scale, 32 * scale);
      ctx.fillStyle = 'rgba(8,10,19,.78)';
      ctx.fillRect(x + 30 * scale, y + 8 * scale, 89 * scale, 15 * scale);
      if (fill.complete && fill.naturalWidth && health > 0) {
        ctx.drawImage(fill, 30, 8, 42, 15, x + 30 * scale, y + 8 * scale, 89 * scale * health, 15 * scale);
      }
    } else {
      ctx.fillStyle = 'rgba(8,10,19,.86)';
      ctx.fillRect(x, y, 128 * scale, 32 * scale);
      ctx.fillStyle = '#ff536e';
      ctx.fillRect(x + 30 * scale, y + 8 * scale, 89 * scale * health, 15 * scale);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '10px "DM Mono", monospace';
    ctx.fillStyle = '#ffd4df';
    ctx.shadowColor = '#ff536e';
    ctx.shadowBlur = 10;
    ctx.fillText('BOSS · CAPITAL-CLASS', width / 2, y - 5);
    ctx.restore();
  }

  function drawCombatEffects(time) {
    if (mode === 'playing') {
      for (const text of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, text.life / 0.22);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${text.size}px "DM Mono", monospace`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(5,9,24,.82)';
        ctx.strokeText(text.text, text.x, text.y);
        ctx.fillStyle = text.color;
        ctx.shadowColor = text.color;
        ctx.shadowBlur = 12;
        ctx.fillText(text.text, text.x, text.y);
        ctx.restore();
      }
    }
    if (battleToast && mode === 'playing') {
      const progress = battleToast.time / battleToast.duration;
      const fade = Math.min(1, battleToast.time * 5, (1 - progress) * 5);
      const slide = 1 - Math.min(1, battleToast.time * 5);
      const centerY = Math.max(175, height * 0.22);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(width / 2, centerY + slide * -18);
      ctx.fillStyle = 'rgba(7,12,32,.78)';
      ctx.beginPath(); ctx.moveTo(-168, -27); ctx.lineTo(168, -27); ctx.lineTo(151, 34); ctx.lineTo(-151, 34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = battleToast.color;
      ctx.lineWidth = 1;
      ctx.shadowColor = battleToast.color;
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(-168, -27); ctx.lineTo(-153, 28); ctx.lineTo(153, 28); ctx.lineTo(168, -27); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = battleToast.color;
      ctx.font = '700 17px "DM Mono", monospace';
      ctx.fillText(battleToast.title, 0, -6);
      ctx.fillStyle = '#b8c5e1';
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillText(battleToast.detail, 0, 15);
      ctx.restore();
    }
    if (damageFlash > 0) {
      const strength = damageFlash / 0.62;
      const edge = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.72);
      edge.addColorStop(0, 'rgba(255,45,87,0)');
      edge.addColorStop(1, `rgba(255,36,72,${0.42 * strength})`);
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, width, height);
    }
    if (mode === 'playing' && combo >= 3 && comboTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.75, comboTimer / 1.5);
      ctx.fillStyle = '#ffd36e';
      ctx.font = '9px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${combo}× COMBO`, 28, height - 31);
      ctx.restore();
    }
  }

  function draw(time) {
    ctx.save();
    if (screenShake > 0 && mode === 'playing') ctx.translate((Math.random() - .5) * screenShake, (Math.random() - .5) * screenShake);
    drawBackground(time);
    for (const bullet of bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2);
      ctx.shadowColor = '#69edff'; ctx.shadowBlur = 10;
      if (images.rocketBullet.complete && images.rocketBullet.naturalWidth) {
        ctx.drawImage(images.rocketBullet, -5, -12, 10, 24);
      } else {
        ctx.fillStyle = '#c9fdff';
        ctx.beginPath(); ctx.ellipse(0, 0, 2.3, 8, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    for (const bullet of enemyBullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2);
      ctx.shadowColor = bullet.color; ctx.shadowBlur = 12;
      if (images.rocketBullet.complete && images.rocketBullet.naturalWidth) {
        const size = bullet.r >= 6 ? 32 : 24;
        ctx.drawImage(images.rocketBullet, -size * 0.21, -size / 2, size * 0.42, size);
      } else {
        ctx.fillStyle = bullet.color;
        ctx.beginPath(); ctx.arc(0, 0, bullet.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    for (const enemy of enemies) drawEnemy(enemy);
    for (const pickup of pickups) {
      ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(Math.sin(pickup.time * 3) * .15);
      const powerArt = {
        heal: ['powerOrb', '#7bffbd'],
        rapid: ['powerRocket', '#7bbcff'],
        slow: ['powerHourglass', '#e4bd7d'],
        magnet: ['powerMagnet', '#ff658e'],
        speed: ['powerBoot', '#cf78ff'],
        double: ['powerDouble', '#ffd46d']
      }[pickup.type] || ['powerOrb', '#7bffbd'];
      const [imageName, glow] = powerArt;
      const sprite = images[imageName];
      const bob = Math.sin(pickup.time * 4) * 2;
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = glow;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(0, 0, 17 + Math.sin(pickup.time * 5) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowColor = glow; ctx.shadowBlur = 14;
      if (sprite && sprite.complete && sprite.naturalWidth) {
        ctx.drawImage(sprite, -16, -16 + bob, 32, 32);
      } else {
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, bob, 12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    for (const particle of particles) {
      ctx.globalAlpha = Math.min(1, particle.life / .2);
      ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = 8;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    for (const explosion of explosions) {
      const frame = Math.min(8, Math.floor(explosion.time / explosion.duration * 9));
      if (images.explosion.complete && images.explosion.naturalWidth) {
        ctx.globalAlpha = Math.max(0, 1 - explosion.time / explosion.duration);
        ctx.drawImage(images.explosion, frame * 128, 0, 128, 128, explosion.x - explosion.size / 2, explosion.y - explosion.size / 2, explosion.size, explosion.size);
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = `rgba(255,195,120,${1 - explosion.time / explosion.duration})`;
        ctx.beginPath(); ctx.arc(explosion.x, explosion.y, explosion.size * explosion.time / explosion.duration, 0, Math.PI * 2); ctx.stroke();
      }
    }
    if (mode === 'playing') drawPlayer(time);
    else if (mode === 'menu') {
      // The title ship is intentionally handled by the HTML overlay.
    }
    drawBossHud();
    drawCombatEffects(time);
    ctx.restore();
  }

  function frame(time) {
    const dt = Math.min(0.034, (time - (lastTime || time)) / 1000);
    lastTime = time;
    update(dt);
    draw(time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  $('bestValue').textContent = formatScore(best);
  $('soundButton').textContent = soundOn ? '♫' : '♪';
  $('soundButton').classList.toggle('sound-on', soundOn);
  setMode('menu');
})();
