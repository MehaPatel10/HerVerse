import api from '../api/axiosClient.js';

// Records one visit each time the site is opened in a browser session.
// The same person coming back later (new session) is counted again.
export function trackVisit() {
  try {
    if (sessionStorage.getItem('herverse_visit_logged')) return;
    sessionStorage.setItem('herverse_visit_logged', '1');

    let id = localStorage.getItem('herverse_visitor_id');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem('herverse_visitor_id', id);
    }
    api.post('/track/visit', { visitorId: id }).catch(() => sessionStorage.removeItem('herverse_visit_logged'));
  } catch (e) {
    // storage blocked - skip tracking silently
  }
}
