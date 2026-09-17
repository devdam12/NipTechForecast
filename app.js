import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';

const firebaseConfig = { apiKey: 'AIzaSyCpICikCx_YxbOSyHrnDFY6mh5imiavJCE', authDomain: 'fir-learn-8075a.firebaseapp.com', projectId: 'fir-learn-8075a', storageBucket: 'fir-learn-8075a.firebasestorage.app', messagingSenderId: '814037799575', appId: '1:814037799575:web:7a95a5dc4ce0e8cebecfd2' };
const auth = getAuth(initializeApp(firebaseConfig));
const app = document.querySelector('#app');
const videos = { rain: '/assets/video/raining.mp4', snow: '/assets/video/snow.mp4', clear: '/assets/video/sunny.mp4', cloud: '/assets/video/closdy.mp4', default: '/assets/video/closdy.mp4' };
let currentUser = null;
let requestId = 0;

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const firebaseMessage = (error) => {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/user-not-found': 'No account exists with this email address.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication.',
    'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication.',
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
  };
  return messages[code] || (error?.message || 'Something went wrong.').replace(/^Firebase:\s*/i, '');
};
const iconFor = (description = '') => { const condition = description.toLowerCase(); if (condition.includes('thunder')) return 'fa-bolt'; if (condition.includes('snow')) return 'fa-snowflake'; if (condition.includes('rain') || condition.includes('drizzle')) return 'fa-cloud-rain'; if (condition.includes('clear')) return 'fa-sun'; if (condition.includes('cloud')) return 'fa-cloud'; return 'fa-smog'; };
const videoFor = (description = '') => { const condition = description.toLowerCase(); if (condition.includes('rain') || condition.includes('drizzle')) return videos.rain; if (condition.includes('snow')) return videos.snow; if (condition.includes('clear')) return videos.clear; if (condition.includes('cloud')) return videos.cloud; return videos.default; };

function shell(content) {
  app.innerHTML = `<video id="weather-video" class="weather-video" autoplay muted loop playsinline aria-hidden="true" src="${videos.default}"></video><div class="atmosphere"></div><header class="site-header"><button class="brand" data-action="dashboard"><img src="/assets/images/icons8-upload-to-cloud-60.png" alt="" /><span>NipWeatherForecast</span><i></i></button><nav class="header-actions">${currentUser ? `<span class="user-email">${escapeHtml(currentUser.email)}</span><button class="button button-quiet" data-action="logout">Log out</button>` : '<button class="button button-quiet" data-action="signin">Sign in</button><button class="button button-primary compact" data-action="signup">Get started</button>'}</nav></header><main class="page-content">${content}</main><footer><span>Live weather data by OpenWeatherMap</span><span>NipWeatherForecast</span></footer><div id="toast" role="status" aria-live="polite"></div>`;
  app.querySelectorAll('[data-action]').forEach((element) => element.addEventListener('click', () => handleAction(element.dataset.action)));
}

function authView(signup = false) {
  shell(`<section class="auth-layout"><div class="auth-intro"><span class="eyebrow">Atmospheric intelligence</span><h1>${signup ? 'Start reading the sky.' : 'Welcome back to the forecast.'}</h1><p>Real conditions, real locations, and a living view of the atmosphere around you.</p></div><form class="auth-card glass-panel" id="auth-form" novalidate><div class="card-kicker">${signup ? 'Create account' : 'Secure sign in'}</div><h2>${signup ? 'Create your account' : 'Sign in to continue'}</h2><p class="muted">${signup ? 'Save your weather workspace and return to it anywhere.' : 'Access live weather observations and your recent location.'}</p><div id="auth-error" class="notice notice-error" hidden></div>${signup ? '<div class="field-row"><label>First name<input name="firstName" type="text" autocomplete="given-name" required /></label><label>Last name<input name="lastName" type="text" autocomplete="family-name" required /></label></div>' : ''}<label>Email address<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="8" placeholder="At least 8 characters" /></label>${signup ? '<label class="check"><input name="terms" type="checkbox" required /> <span>I agree to use this service responsibly.</span></label>' : ''}<button class="button button-primary submit-button" type="submit">${signup ? 'Create account' : 'Sign in'} <i class="fa-solid fa-arrow-right"></i></button><p class="switch-copy">${signup ? 'Already have an account?' : 'New to NipWeatherForecast?'} <button type="button" class="text-button" data-action="${signup ? 'signin' : 'signup'}">${signup ? 'Sign in' : 'Create an account'}</button></p></form></section>`);
    shell(`<section class="auth-layout"><div class="auth-intro"><span class="eyebrow">Atmospheric intelligence</span><h1>${signup ? 'Start reading the sky.' : 'Welcome back to the forecast.'}</h1><p>Real conditions, real locations, and a living view of the atmosphere around you.</p></div><form class="auth-card glass-panel" id="auth-form" novalidate><h2>${signup ? 'Create your account' : 'Sign in to continue'}</h2><p class="muted">${signup ? 'Save your weather workspace and return to it anywhere.' : 'Access live weather observations and your recent location.'}</p><div id="auth-error" class="notice notice-error" hidden></div>${signup ? '<div class="field-row"><label>First name<input name="firstName" type="text" autocomplete="given-name" required /></label><label>Last name<input name="lastName" type="text" autocomplete="family-name" required /></label></div>' : ''}<label>Email address<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="8" placeholder="At least 8 characters" /></label>${signup ? '<label class="check"><input name="terms" type="checkbox" required /> <span>I agree to use this service responsibly.</span></label>' : ''}<button class="button button-primary submit-button" type="submit">${signup ? 'Create account' : 'Sign in'} <i class="fa-solid fa-arrow-right"></i></button><p class="switch-copy">${signup ? 'Already have an account?' : 'New to NipWeatherForecast?'} <button type="button" class="text-button" data-action="${signup ? 'signin' : 'signup'}">${signup ? 'Sign in' : 'Create an account'}</button></p></form></section>`);
  document.querySelector('#auth-form').addEventListener('submit', (event) => handleAuthSubmit(event, signup));
}

function dashboardView() {
  shell(`<section class="dashboard-head"><div><span class="eyebrow">Live observation desk</span><h1>Read the atmosphere.</h1><p>Search any city to reveal current conditions and the next five days.</p></div><form id="search-form" class="search-form"><i class="fa-solid fa-magnifying-glass"></i><input id="city-input" autocomplete="off" placeholder="Search a city or country" /><button class="button button-primary" type="submit">Locate <i class="fa-solid fa-arrow-right"></i></button></form></section><section id="weather-content" class="weather-content"><div class="empty-state glass-panel"><i class="fa-solid fa-compass"></i><h2>Choose a place to begin</h2><p>Your live weather observation will appear here.</p></div></section>`);
  document.querySelector('#search-form').addEventListener('submit', (event) => { event.preventDefault(); const query = document.querySelector('#city-input').value.trim(); if (query) loadWeather(query); });
  const saved = localStorage.getItem('Location'); if (saved) loadWeather(saved);
}

async function loadWeather(query) {
  const content = document.querySelector('#weather-content'); const currentRequest = ++requestId;
  content.innerHTML = '<div class="loading glass-panel"><i class="fa-solid fa-spinner fa-spin"></i><span>Reading live conditions...</span></div>';
  try {
    const base = '/api/weather';
    const encodedQuery = encodeURIComponent(query);
    const [currentResponse, forecastResponse] = await Promise.all([fetch(`${base}?type=current&city=${encodedQuery}`), fetch(`${base}?type=forecast&city=${encodedQuery}`)]);
    const readResponse = async (response) => {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('The local preview server cannot run the Vercel weather API. Deploy to Vercel or use Vercel Dev to test weather locally.');
      }
      return response.json();
    };
    const current = await readResponse(currentResponse); const forecast = await readResponse(forecastResponse);
    if (current.cod === '404') throw new Error('Location not found. Check the spelling and try again.');
    if (!currentResponse.ok) throw new Error(current.message || 'The current weather could not be loaded right now.');
    if (!forecastResponse.ok || !Array.isArray(forecast.list)) throw new Error(forecast.message || 'The forecast could not be loaded right now.');
    if (currentRequest !== requestId) return;
    localStorage.setItem('Location', query); const video = document.querySelector('#weather-video'); video.src = videoFor(current.weather?.[0]?.description); video.load(); video.play().catch(() => {}); renderWeather(current, forecast.list);
  } catch (error) { if (currentRequest === requestId) content.innerHTML = `<div class="notice notice-error glass-panel"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>Weather unavailable</strong><p>${escapeHtml(error.message)}</p></div></div>`; }
}

function renderWeather(current, forecastList) {
  const description = current.weather?.[0]?.description || 'Unknown conditions'; const dayMap = new Map(); forecastList.forEach((item) => { const day = item.dt_txt.slice(0, 10); if (!dayMap.has(day)) dayMap.set(day, item); }); const days = [...dayMap.values()].slice(0, 5); const formatDay = (date) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${date}T12:00:00`));
  document.querySelector('#weather-content').innerHTML = `<section class="weather-grid"><article class="hero-weather glass-panel"><div class="location-line"><span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(current.name)}, ${escapeHtml(current.sys?.country || '')}</span><b><i></i> LIVE</b></div><div class="temperature-line"><div><strong>${Math.round(current.main.temp)}<sup>°C</sup></strong><span>Feels like ${Math.round(current.main.feels_like)}° · H ${Math.round(current.main.temp_max)}° · L ${Math.round(current.main.temp_min)}°</span></div><i class="fa-solid ${iconFor(description)} weather-symbol"></i></div><h2>${escapeHtml(description)}</h2><p class="condition-copy">Observed now at ${escapeHtml(current.name)}.</p><div class="coordinates"><span>Humidity <b>${current.main.humidity}%</b></span><span>Wind <b>${Math.round((current.wind?.speed || 0) * 3.6)} km/h</b></span><span>Pressure <b>${current.main.pressure} hPa</b></span></div></article><aside class="metrics"><div class="metric glass-panel"><span>Visibility</span><strong>${((current.visibility || 0) / 1000).toFixed(1)} <small>km</small></strong><i class="fa-solid fa-eye"></i></div><div class="metric glass-panel"><span>Wind direction</span><strong>${current.wind?.deg ?? '—'}<small>°</small></strong><i class="fa-solid fa-compass"></i></div><div class="metric glass-panel"><span>Cloud cover</span><strong>${current.clouds?.all ?? '—'}<small>%</small></strong><i class="fa-solid fa-cloud"></i></div><div class="metric glass-panel"><span>Sunrise</span><strong>${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(current.sys.sunrise * 1000))}</strong><i class="fa-solid fa-sun"></i></div></aside></section><section class="forecast-section"><div class="section-heading"><div><span class="eyebrow">Near-term outlook</span><h2>Five-day forecast</h2></div><span class="source-label">OpenWeatherMap</span></div><div class="forecast-grid">${days.map((day) => `<article class="forecast-card glass-panel"><span>${formatDay(day.dt_txt.slice(0, 10))}</span><i class="fa-solid ${iconFor(day.weather?.[0]?.description)}"></i><strong>${Math.round(day.main.temp)}°</strong><small>${escapeHtml(day.weather?.[0]?.description || '')}</small></article>`).join('')}</div></section>`;
}

async function handleAuthSubmit(event, signup) {
  event.preventDefault(); const form = event.currentTarget; const error = document.querySelector('#auth-error'); const submit = form.querySelector('button[type="submit"]'); error.hidden = true; if (!form.reportValidity()) return; submit.disabled = true;
  try { const email = form.email.value.trim(); const password = form.password.value; if (signup) await createUserWithEmailAndPassword(auth, email, password); else await signInWithEmailAndPassword(auth, email, password); } catch (authError) { error.textContent = firebaseMessage(authError); error.hidden = false; submit.disabled = false; }
}

async function handleAction(action) { if (action === 'signin') return authView(false); if (action === 'signup') return authView(true); if (action === 'dashboard') return currentUser ? dashboardView() : authView(false); if (action === 'logout') await signOut(auth); }
onAuthStateChanged(auth, (user) => { currentUser = user; if (user) dashboardView(); else authView(window.initialView === 'signup'); });