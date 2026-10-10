const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');
const FRAME_DIR = path.resolve(__dirname, '..', 'docs', 'frames');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(FRAME_DIR)) fs.mkdirSync(FRAME_DIR, { recursive: true });

function generateTrail(pointsCount = 60) {
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const trail = [];
  const startTime = Date.now() - 1800 * 1000;

  for (let i = 0; i < pointsCount; i++) {
    const angle = (i / pointsCount) * Math.PI * 3.5;
    const r = 0.005 * (1 + 0.3 * Math.sin(i / 4));
    const lat = baseLat + r * Math.sin(angle) + (Math.sin(i) * 0.0002);
    const lng = baseLng + r * Math.cos(angle) + (Math.cos(i) * 0.0002);
    trail.push({
      lat,
      lng,
      timestamp: startTime + i * 30000,
      accuracy: 5 + Math.random() * 5,
      speed: 3.1 + Math.sin(i / 5) * 0.4
    });
  }
  return trail;
}

const sampleRoute = generateTrail(75);

const sampleManifest = {
  session_id: 'session_trail_01',
  title: 'Origins of the Marathon & Trail Running',
  topic: 'Origins of Marathon & Trail Running',
  mood: 'energetic',
  duration_minutes: 30,
  target_pace_min_km: 5.5,
  segments: [
    { index: 0, filename: 'segment_0.wav', duration_seconds: 360, text: 'Welcome to your run.' },
    { index: 1, filename: 'segment_1.wav', duration_seconds: 360, text: 'Finding steady cadence.' },
    { index: 2, filename: 'segment_2.wav', duration_seconds: 360, text: 'Halfway mark on the trail.' },
    { index: 3, filename: 'segment_3.wav', duration_seconds: 360, text: 'Cruising the ridge.' },
    { index: 4, filename: 'segment_4.wav', duration_seconds: 360, text: 'Final sprint and cool down.' }
  ],
  pace_nudges: {
    ahead: 'nudge_ahead.wav',
    on_pace: 'nudge_on_pace.wav',
    behind: 'nudge_behind.wav'
  },
  total_duration_seconds: 1800,
  created_at: new Date(Date.now() - 3600 * 1000).toISOString()
};

const sampleHistory = [
  {
    id: 'run-1',
    sessionId: 'session_trail_01',
    title: 'Origins of the Marathon & Trail Running',
    topic: 'Origins of Marathon & Trail Running',
    mood: 'energetic',
    startedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    durationSeconds: 1845,
    distanceMeters: 5720,
    avgPaceMinKm: 5.38,
    route: sampleRoute
  },
  {
    id: 'run-2',
    sessionId: 'session_trail_02',
    title: 'Mindfulness & Trail Flow State',
    topic: 'Mindfulness & Trails',
    mood: 'chill',
    startedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 25.5 * 3600 * 1000).toISOString(),
    durationSeconds: 1335,
    distanceMeters: 4100,
    avgPaceMinKm: 5.43,
    route: sampleRoute.slice(0, 50)
  },
  {
    id: 'run-3',
    sessionId: 'session_trail_03',
    title: 'Running Science: Lactate Thresholds',
    topic: 'Running Science',
    mood: 'focused',
    startedAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 49.5 * 3600 * 1000).toISOString(),
    durationSeconds: 1960,
    distanceMeters: 6500,
    avgPaceMinKm: 5.02,
    route: sampleRoute
  },
  {
    id: 'run-4',
    sessionId: 'session_trail_04',
    title: 'Space Exploration: The Apollo Missions',
    topic: 'Space Exploration',
    mood: 'storytelling',
    startedAt: new Date(Date.now() - 74 * 3600 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 73.5 * 3600 * 1000).toISOString(),
    durationSeconds: 1265,
    distanceMeters: 3850,
    avgPaceMinKm: 5.47,
    route: sampleRoute.slice(0, 45)
  }
];

async function capture() {
  console.log('Launching browser with path:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2
  });

  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

  console.log('Navigating to root...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Setup Screen
  console.log('Capturing 01-setup.png...');
  const topicInput = await page.$('input[placeholder*="Origins of Marathon Running"]');
  if (topicInput) {
    await topicInput.click();
    await topicInput.type('Origins of the Marathon & Trail Running', { delay: 10 });
  }

  await page.screenshot({ path: path.join(OUT_DIR, '01-setup.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_01_setup.png') });

  // 2. Generating Screen Mid-Progress (58%)
  console.log('Capturing 02-generating.png (mid-progress)...');
  await page.evaluate((manifest) => {
    window.__stores.useSessionStore.setState({
      isGenerating: true,
      progress: {
        status: 'generating_audio',
        progress: 58,
        message: 'Synthesizing segment 3 of 5 with Kokoro...',
        segment: 3,
        total: 5,
        title: manifest.title
      },
      manifest: null,
      isOfflineReady: false,
      error: null
    });
    window.__navigate('/generating');
  }, sampleManifest);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '02-generating.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_03_generating_58.png') });

  // Extra GIF frames: 25% and 88%
  await page.evaluate((manifest) => {
    window.__stores.useSessionStore.setState({
      progress: {
        status: 'generating_script',
        progress: 25,
        message: 'Drafting podcast script with Gemma 2B...',
        title: manifest.title
      }
    });
  }, sampleManifest);
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_02_generating_25.png') });

  await page.evaluate((manifest) => {
    window.__stores.useSessionStore.setState({
      progress: {
        status: 'generating_audio',
        progress: 88,
        message: 'Recording offline pace nudges...',
        segment: 5,
        total: 5,
        title: manifest.title
      }
    });
  }, sampleManifest);
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_04_generating_88.png') });

  // 3. Offline-Ready Screen
  console.log('Capturing 03-offline-ready.png...');
  await page.evaluate((manifest) => {
    window.__stores.useSessionStore.setState({
      isGenerating: false,
      progress: {
        status: 'complete',
        progress: 100,
        message: 'Generation complete'
      },
      manifest: manifest,
      isOfflineReady: true,
      error: null
    });
  }, sampleManifest);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '03-offline-ready.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_05_ready.png') });

  // 4. Run Screen (Idle state for GIF frame)
  await page.evaluate((data) => {
    window.__stores.useSessionStore.setState({ manifest: data.manifest });
    window.__stores.useRunStore.setState({
      status: 'idle',
      startTime: null,
      elapsed: 0,
      distance: 0,
      currentPace: null,
      route: []
    });
    window.__navigate('/run');
  }, { manifest: sampleManifest });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_06_run_idle.png') });

  // 4b. Run Screen (Early run for GIF)
  await page.evaluate((data) => {
    window.__stores.useRunStore.setState({
      status: 'running',
      startTime: Date.now() - 245 * 1000,
      elapsed: 245,
      distance: 740,
      currentPace: 5.32,
      route: data.route.slice(0, 15)
    });
  }, { route: sampleRoute });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_07_run_early.png') });

  // 4c. Run Screen Mid-Run (Official 04-run.png)
  console.log('Capturing 04-run.png (mid-run HUD)...');
  await page.evaluate((data) => {
    window.__stores.useRunStore.setState({
      status: 'running',
      startTime: Date.now() - 862 * 1000,
      elapsed: 862, // 14:22
      distance: 2680, // 2.68 km
      currentPace: 5.35, // 5:21 /km
      route: data.route.slice(0, 35)
    });
  }, { route: sampleRoute });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '04-run.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_08_run_mid.png') });

  // 4d. Run Screen Coach Nudge active for GIF
  await page.evaluate(() => {
    // Trigger audio coach visual
    const badge = document.querySelector('span.text-amber-400');
    if (!badge) {
      // Simulate coach state in UI
      const container = document.querySelector('div.flex.justify-between.text-xs');
      if (container && container.firstElementChild) {
        container.firstElementChild.innerHTML = '<span class="text-amber-400 font-bold animate-pulse">🎯 Pace Coach Speaking...</span>';
      }
    }
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_09_run_coach.png') });

  // 5. Summary Screen
  console.log('Capturing 05-summary.png...');
  await page.evaluate((data) => {
    window.__stores.useSessionStore.setState({ manifest: data.manifest });
    window.__stores.useRunStore.setState({
      status: 'finished',
      startTime: Date.now() - 1845 * 1000,
      elapsed: 1845, // 30:45
      distance: 5720, // 5.72 km
      currentPace: 5.38,
      route: data.route
    });
    window.__navigate('/summary');
  }, { manifest: sampleManifest, route: sampleRoute });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '05-summary.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_10_summary.png') });

  // 6. History Screen
  console.log('Capturing 06-history.png...');
  await page.evaluate(async (runs) => {
    if (window.__stores && window.__stores.saveRun) {
      for (const r of runs) {
        await window.__stores.saveRun(r);
      }
      await window.__stores.useHistoryStore.getState().loadRuns();
    }
    window.__navigate('/history');
  }, sampleHistory);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '06-history.png') });
  await page.screenshot({ path: path.join(FRAME_DIR, 'frame_11_history.png') });

  await browser.close();
  console.log('All screenshots and GIF frames captured!');

  // Trigger GIF compilation
  console.log('Compiling demo.gif with python scripts/make_gif.py...');
  execSync('python scripts/make_gif.py', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
