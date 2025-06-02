/*
  PROMISE GENERATOR MODÜLü
  Bu modül şunları yapar:
  1. Kullanıcının belirlediği süre sonra çözülecek/reddedilecek promise'ler oluşturur
  2. Promise durumuna göre başarılı/başarısız bildirimleri gösterir
  3. Form işlemlerini ve kullanıcı etkileşimini yönetir
*/

// Bildirim sistemi için iziToast kütüphanesini import et
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

// Sayfa yüklendiğinde çalışacak fonksiyon
window.onload = () => {
  // Sadece snackbar sayfasında çalışsın
  if (window.location.pathname.includes('02-snackbar')) {
    // Form elementlerini seç
    const formElements = document.querySelectorAll('input[type="radio"], input[type="number"]');
    
    // Her form elementine tıklama olayı ekle
    formElements.forEach(element => {
      element.addEventListener('click', () => {
        window.location.href = window.location.origin;
      });
    });

    // Tarayıcının yenileme butonunu yakala
    window.addEventListener('beforeunload', (event) => {
      window.location.href = window.location.origin;
      return null;
    });
  }
};

// Ana sayfaya dönüş yöntemleri
document.addEventListener('keydown', (e) => {
  // Sadece snackbar sayfasında çalışsın
  if (window.location.pathname.includes('02-snackbar')) {
    // ESC tuşuna basılınca ana sayfaya dön
    if (e.key === 'Escape') {
      window.location.href = './';
    }

    // F5 tuşuna basılınca en başa dön
    if (e.key === 'F5' || e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.location.href = window.location.origin;
    }
  }
});

// Sağ tık menüsünü engelle ve ana sayfaya dön (sadece snackbar sayfasında)
document.addEventListener('contextmenu', (e) => {
  if (window.location.pathname.includes('02-snackbar')) {
    e.preventDefault();
    window.location.href = './';
  }
});

// Form elementini seç
const form = document.querySelector('.form');

/**
 * Promise oluşturucu fonksiyon
 * @param {number} delay - Milisaniye cinsinden gecikme süresi
 * @param {string} state - Promise'in durumu ('fulfilled' veya 'rejected')
 * @returns {Promise} Belirtilen süre sonra çözülen/reddedilen promise
 */
function createPromise(delay, state) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === 'fulfilled') {
        resolve(delay);
      } else {
        reject(delay);
      }
    }, delay);
  });
}

// Form gönderildiğinde çalışacak olay dinleyicisi
form.addEventListener('submit', (e) => {
  // Formun varsayılan davranışını engelle
  e.preventDefault();

  // Form verilerini al
  const delay = Number(form.elements.delay.value);
  const state = form.elements.state.value;

  // Promise'i oluştur ve işle
  createPromise(delay, state)
    .then((delay) => {
      iziToast.success({
        title: 'Success',
        message: `✅ Fulfilled promise in ${delay}ms`,
        position: 'topRight',
        timeout: 5000
      });
    })
    .catch((delay) => {
      iziToast.error({
        title: 'Error',
        message: `❌ Rejected promise in ${delay}ms`,
        position: 'topRight',
        timeout: 5000
      });
    });
  
  // Formu sıfırla
  form.reset();
}); 