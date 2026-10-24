const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FFMPEG_PATH = require('ffmpeg-static');
const OUTPUT_MP4 = path.resolve('MnVisionAI_Live_Walkthrough_Demo.mp4');
const APP_URL = 'http://127.0.0.1:8000/';

const CONFIG = {
  viewport: { width: 1280, height: 720 },
  fps: 20,
  quality: 85,
  crf: 20
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function smoothScroll(page, distance, steps = 18, delayMs = 30) {
  const step = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((s) => window.scrollBy(0, s), step);
    await sleep(delayMs);
  }
}

async function runDemoWalkthrough() {
  console.log(`[1/5] Launching Chrome (${CONFIG.viewport.width}x${CONFIG.viewport.height})...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  console.log(`[2/5] Navigating to ${APP_URL}...`);
  await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2500);

  console.log('[3/5] Attaching Chrome DevTools Protocol (CDP) screencast...');
  const client = await page.target().createCDPSession();
  let currentFrameBuffer = null;

  client.on('Page.screencastFrame', async (frame) => {
    currentFrameBuffer = Buffer.from(frame.data, 'base64');
    try {
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: CONFIG.quality,
    everyNthFrame: 1
  });

  while (!currentFrameBuffer) {
    await sleep(25);
  }

  console.log(`[4/5] Spawning FFmpeg encoder -> ${OUTPUT_MP4}...`);
  const ffmpeg = spawn(FFMPEG_PATH, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(CONFIG.fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', String(CONFIG.crf),
    '-movflags', '+faststart',
    OUTPUT_MP4
  ]);

  ffmpeg.stderr.on('data', () => {});

  const intervalMs = Math.round(1000 / CONFIG.fps);
  const frameInterval = setInterval(() => {
    if (currentFrameBuffer && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(currentFrameBuffer);
    }
  }, intervalMs);

  console.log('[5/5] Executing 60-second interactive UI choreography...');
  try {
    // Scene 1: Platform Header, Live Telemetry & Satellite View (0s - 10s)
    console.log('-> Scene 1: Platform Overview & Sentinel-2 Telemetry (0s - 10s)');
    await sleep(4000);
    // Smooth scroll down to target ranking table
    await smoothScroll(page, 450, 16, 30);
    await sleep(2500);
    await smoothScroll(page, -450, 16, 30);
    await sleep(2500);

    // Scene 2: Basemap Switcher & High-Resolution Tile Exploration (10s - 22s)
    console.log('-> Scene 2: Basemap Switcher: Esri Satellite & Topo Relief (10s - 22s)');
    // Switch to Esri Satellite
    try {
      const basemapButtons = await page.$$('.basemap-segmented button');
      if (basemapButtons && basemapButtons.length >= 3) {
        console.log('Switching to Esri Satellite basemap...');
        await basemapButtons[0].click();
        await sleep(3500);

        console.log('Switching to Topo Relief basemap...');
        await basemapButtons[2].click();
        await sleep(3500);

        console.log('Switching back to Dark Geodetic Grid...');
        await basemapButtons[1].click();
        await sleep(2500);
      }
    } catch (e) {
      console.warn('Basemap switcher interaction fallback', e);
    }

    // Scene 3: Drill Target Inspection & Explainable AI (XAI) Modal (22s - 36s)
    console.log('-> Scene 3: Ranked Drill Targets & XAI Modal (22s - 36s)');
    await smoothScroll(page, 380, 12, 30);
    await sleep(1500);

    try {
      // Find XAI & Log button on #1 ranked target
      const xaiButtons = await page.$$('button.btn-action-sm');
      if (xaiButtons && xaiButtons.length > 0) {
        console.log('Opening XAI & 3D Borehole Stratigraphy Modal...');
        await xaiButtons[0].click();
        await sleep(3000);

        // Scroll inside modal to reveal 3D borehole strip log
        await page.evaluate(() => {
          const modalBody = document.querySelector('.modal-content, .xai-modal-body, .modal-scroll, div[style*="overflow-y"]');
          if (modalBody) modalBody.scrollBy({ top: 350, behavior: 'smooth' });
        });
        await sleep(4000);

        // Close modal
        console.log('Closing XAI Modal...');
        const closeBtn = await page.$('.modal-close, button.close, svg.lucide-x');
        if (closeBtn) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await sleep(1500);
      }
    } catch (e) {
      console.warn('XAI modal interaction fallback', e);
    }
    await smoothScroll(page, -380, 12, 30);
    await sleep(1500);

    // Scene 4: MOIL Operations Planner & SciPy HiGHS LP Solver (36s - 48s)
    console.log('-> Scene 4: MOIL Operations Shortfall Forecaster & SciPy LP Solver (36s - 48s)');
    try {
      const navTabs = await page.$$('.nav-tabs button');
      if (navTabs && navTabs.length >= 3) {
        console.log('Switching to MOIL Operations & Shortfalls tab...');
        await navTabs[1].click();
        await sleep(2500);

        // Click Re-Run LP Solver button
        const lpBtn = await page.$('button.map-btn');
        if (lpBtn) {
          console.log('Triggering SciPy HiGHS LP Optimizer...');
          await lpBtn.click();
          await sleep(2500);
        }

        // Scroll through Waterfall flow & mine rebalancing breakdown
        await smoothScroll(page, 320, 12, 30);
        await sleep(3500);
        await smoothScroll(page, -320, 12, 30);
        await sleep(1500);
      }
    } catch (e) {
      console.warn('Operations planner interaction fallback', e);
    }

    // Scene 5: UNFC G-2 Exploration Dossier & Summary (48s - 56s)
    console.log('-> Scene 5: UNFC G-2 Reserve Dossier View (48s - 56s)');
    try {
      const navTabs = await page.$$('.nav-tabs button');
      if (navTabs && navTabs.length >= 3) {
        console.log('Switching to Drill Targets & Reports tab...');
        await navTabs[2].click();
        await sleep(3500);
        await smoothScroll(page, 280, 10, 30);
        await sleep(2500);
        await smoothScroll(page, -280, 10, 30);
        await sleep(1500);
      }
    } catch (e) {
      console.warn('Dossier interaction fallback', e);
    }

    // Scene 6: Command Finale on GIS Map (56s - 62s)
    console.log('-> Scene 6: Returning to Space Exploration GIS (56s - 62s)');
    try {
      const navTabs = await page.$$('.nav-tabs button');
      if (navTabs && navTabs.length >= 1) {
        await navTabs[0].click();
        await sleep(3000);
      }
    } catch (e) {}
    await sleep(2000);

  } finally {
    clearInterval(frameInterval);
    try {
      await client.send('Page.stopScreencast');
    } catch (e) {}

    await browser.close();
    ffmpeg.stdin.end();

    await new Promise((resolve) => {
      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg encoding completed with exit code ${code}`);
        resolve();
      });
    });

    if (fs.existsSync(OUTPUT_MP4)) {
      const stats = fs.statSync(OUTPUT_MP4);
      console.log(`✅ SUCCESS: Walkthrough video generated: ${OUTPUT_MP4} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    } else {
      console.error('❌ ERROR: MP4 output file was not found.');
    }
  }
}

runDemoWalkthrough().catch(console.error);
