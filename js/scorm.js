/* SCORM 1.2 for the 2027 sample: finds the LMS API, keeps progress in cmi.suspend_data, reports
   completion, and falls back to local storage when the page runs outside an LMS. */
(function () {
  'use strict';
  const KEY = 'qafco-coc-2027-sample';
  let api = null, started = false, t0 = Date.now();

  function findAPI(win) {
    for (let n = 0; win && n < 12; n++) {
      if (win.API) return win.API;
      if (win.parent && win.parent !== win) win = win.parent; else break;
    }
    return null;
  }
  api = findAPI(window) || (window.opener && findAPI(window.opener)) || null;

  const get = (k) => { try { return api ? String(api.LMSGetValue(k) || '') : ''; } catch (e) { return ''; } };
  const set = (k, v) => { try { if (api) api.LMSSetValue(k, String(v)); } catch (e) { /* ignore */ } };
  const commit = () => { try { if (api) api.LMSCommit(''); } catch (e) { /* ignore */ } };

  function init() {
    if (started) return;
    started = true;
    if (api) { try { api.LMSInitialize(''); } catch (e) { /* ignore */ } }
    const st = get('cmi.core.lesson_status');
    if (api && (!st || st === 'not attempted')) { set('cmi.core.lesson_status', 'incomplete'); commit(); }
  }

  function load() {
    init();
    /* Inside an LMS only the LMS's record counts; local storage is the fallback when there is no LMS. */
    let raw = '';
    if (api) raw = get('cmi.suspend_data');
    else { try { raw = localStorage.getItem(KEY) || ''; } catch (e) { raw = ''; } }
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  function save(state, complete) {
    init();
    const raw = JSON.stringify(state);
    if (api) {
      set('cmi.suspend_data', raw);
      set('cmi.core.lesson_location', String(state.screen));
      if (complete) set('cmi.core.lesson_status', 'completed');
      commit();
    }
    else { try { localStorage.setItem(KEY, raw); } catch (e) { /* ignore */ } }
  }

  const hhmmss = (ms) => { const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return String(h).padStart(4, '0') + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
  let finished = false;
  function finish(complete) {
    if (!api || finished) return;
    finished = true;
    set('cmi.core.session_time', hhmmss(Date.now() - t0));
    set('cmi.core.exit', complete ? '' : 'suspend');
    commit();
    try { api.LMSFinish(''); } catch (e) { /* ignore */ }
  }

  window.SCO = { load, save, finish, inLMS: () => !!api };
})();
