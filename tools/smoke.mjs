/* =========================================================================
 * 冒烟测试脚本：用 headless Chrome 逐个加载每个数据集，验证可正常启动。
 *   运行：node tools/smoke.mjs           （测试全部）
 *        node tools/smoke.mjs sanguo     （只测指定 id）
 *
 * 自动启动本地 http.server（随机端口），测完自动关闭。
 * Chrome 路径可用环境变量 CHROME 覆盖。
 * ========================================================================= */

import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ATLAS_MANIFEST } from '../js/data/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PORT = 8199;
const CHROME = process.env.CHROME
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function startServer() {
  const p = spawn('python3', ['-m', 'http.server', String(PORT)], {
    cwd: ROOT, stdio: 'ignore',
  });
  return p;
}

function dumpDom(url, budget = 20000) {
  return new Promise((resolveP) => {
    const profile = mkdtempSync(resolve(tmpdir(), 'cra-smoke-'));
    execFile(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--disable-background-networking', '--disable-sync',
      `--user-data-dir=${profile}`,
      `--virtual-time-budget=${budget}`, `--timeout=${budget + 8000}`,
      '--dump-dom', '--enable-logging=stderr', '--v=0', url,
    ], { maxBuffer: 20 * 1024 * 1024, timeout: budget + 12000, killSignal: 'SIGKILL' },
    (error, stdout, stderr) => {
      rmSync(profile, { recursive: true, force: true });
      const timedOut = error && error.killed;
      resolveP({ dom: stdout || '', log: (stderr || '') + (timedOut ? '\nTIMEOUT: chrome 超时被终止' : '') });
    });
  });
}

/** 带重试的 DOM dump：首次失败则加倍 budget 重试一次 */
async function dumpDomWithRetry(url) {
  let r = await dumpDom(url, 20000);
  // 若 stat-persons 为 0 且无 JS 错误，可能是 lazy-load 慢，重试一次
  const looksEmpty = !/id="stat-persons">[1-9]/.test(r.dom);
  const hasJSErr = /(SyntaxError|Uncaught|does not provide|is not defined|TypeError)/.test(r.log);
  if (looksEmpty && !hasJSErr) {
    r = await dumpDom(url, 35000);
  }
  return r;
}

function checkOne(id, dom, log) {
  const problems = [];
  if (!/loading-overlay[^"']*\bhide\b/.test(dom)) problems.push('加载遮罩未隐藏（可能初始化失败）');
  const m = dom.match(/id="stat-persons">(\d+)/);
  if (!m || parseInt(m[1], 10) <= 0) problems.push('stat-persons 为 0（无人物渲染）');
  const jsErr = (log.match(/(SyntaxError|Uncaught|does not provide|is not defined|TypeError)[^\n]*/g) || [])
    .filter(l => !/GPU|GL |Vulkan|voice|Fontconfig/i.test(l));
  if (jsErr.length) problems.push('JS 错误：' + jsErr.slice(0, 3).join(' | '));
  return problems;
}

async function main() {
  const only = process.argv[2];
  const metas = only ? ATLAS_MANIFEST.filter(m => m.id === only) : ATLAS_MANIFEST;
  if (only && metas.length === 0) { console.error(`未找到数据集：${only}`); process.exit(2); }

  const server = startServer();
  await sleep(1200);

  let failed = 0;
  try {
    for (const meta of metas) {
      const url = `http://localhost:${PORT}/index.html?atlas=${meta.id}`;
      const { dom, log } = await dumpDomWithRetry(url);
      const problems = checkOne(meta.id, dom, log);
      if (problems.length) {
        failed++;
        console.log(`[FAIL] ${meta.id}`);
        problems.forEach(p => console.log(`   ✗ ${p}`));
      } else {
        const persons = (dom.match(/id="stat-persons">(\d+)/) || [])[1];
        console.log(`[PASS] ${meta.id} — 人物 ${persons}，无 JS 错误`);
      }
    }
  } finally {
    server.kill('SIGTERM');
  }

  console.log(`\n汇总：${metas.length} 个数据集，${failed} 个失败。`);
  process.exit(failed ? 1 : 0);
}

main();
