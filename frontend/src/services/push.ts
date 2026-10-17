import axios from 'axios';

export async function hasBrowserPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  return Boolean(await registration?.pushManager.getSubscription());
}

export async function enableBrowserPush() {
  const userAgent = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  if (isAppleMobile && !isStandalone) {
    throw new Error('On iPhone or iPad, tap Share → Add to Home Screen, then open JalDrishti from its Home Screen icon. Push notifications work from the installed web app on iOS/iPadOS 16.4 or later.');
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (isAppleMobile) {
      throw new Error('This iPhone/iPad needs iOS or iPadOS 16.4 or later. Add JalDrishti to the Home Screen and open it from the new icon.');
    }
    throw new Error('Push notifications are not supported in this browser.');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Allow notifications in your browser to receive updates.');

  const { data } = await axios.get('/api/notifications/public-key');
  await navigator.serviceWorker.register('/sw.js');
  const registration = await navigator.serviceWorker.ready;
  const value = data.public_key as string;
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const applicationServerKey = Uint8Array.from(raw, char => char.charCodeAt(0));
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  await axios.post('/api/notifications/subscribe', subscription.toJSON());
}
