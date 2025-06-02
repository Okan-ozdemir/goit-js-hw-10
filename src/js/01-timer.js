/*
  TIMER (GERİ SAYIM) UYGULAMASI
  
  Bu uygulama şunları yapıyor:
  1. Kullanıcıdan gelecekte bir tarih/saat seçmesini istiyor
  2. Seçilen tarihe kadar geri sayım yapıyor
  3. Geri sayımı günler, saatler, dakikalar ve saniyeler şeklinde gösteriyor
  4. Geçmiş tarih seçimi veya hatalı durumları kontrol ediyor
  5. Bildirimleri iziToast ile gösteriyor
*/

// Gerekli kütüphanelerin import edilmesi
import flatpickr from "flatpickr";  // Tarih/saat seçici kütüphanesi
import "flatpickr/dist/flatpickr.min.css";  // flatpickr stil dosyası
import iziToast from "izitoast";  // Bildirim kütüphanesi
import "izitoast/dist/css/iziToast.min.css";  // iziToast stil dosyası

// HTML elementlerinin seçilmesi
const datetimePicker = document.querySelector('#datetime-picker');  // Tarih seçici input
const startButton = document.querySelector('[data-start]');  // Başlatma butonu
const daysElement = document.querySelector('[data-days]');  // Gün göstergesi
const hoursElement = document.querySelector('[data-hours]');  // Saat göstergesi
const minutesElement = document.querySelector('[data-minutes]');  // Dakika göstergesi
const secondsElement = document.querySelector('[data-seconds]');  // Saniye göstergesi

// Global değişkenler
let userSelectedDate = null;  // Kullanıcının seçtiği tarihi tutacak değişken
let countdownInterval = null;  // setInterval referansını tutacak değişken

// Başlangıçta start butonu devre dışı bırakılıyor
// Kullanıcı geçerli bir tarih seçene kadar aktif olmayacak
startButton.disabled = true;

// flatpickr kütüphanesi için ayarlar
const options = {
  enableTime: true,  // Saat seçimini etkinleştir
  time_24hr: true,  // 24 saat formatını kullan
  defaultDate: new Date(),  // Varsayılan tarih: şimdiki zaman
  minuteIncrement: 1,  // Dakika artış miktarı
  onClose(selectedDates) {  // Tarih seçildiğinde çalışacak fonksiyon
    const selectedDate = selectedDates[0];
    const now = new Date();

    // Geçmiş tarih kontrolü
    if (selectedDate < now) {
      // Geçmiş tarih seçildiyse hata bildirimi göster
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
        timeout: 3000,
        backgroundColor: '#EF4444',
        messageColor: '#fff',
        titleColor: '#fff',
        progressBar: false,
        close: false
      });
      startButton.disabled = true;  // Start butonunu devre dışı bırak
      userSelectedDate = null;  // Seçilen tarihi sıfırla
    } else {
      // Gelecek tarih seçildiyse butonu aktifleştir
      startButton.disabled = false;
      userSelectedDate = selectedDate;  // Seçilen tarihi kaydet
    }
  },
};

// flatpickr'ı başlat ve input'a bağla
const datePicker = flatpickr(datetimePicker, options);

/**
 * Milisaniyeleri gün, saat, dakika ve saniyeye çeviren fonksiyon
 * @param {number} ms - Milisaniye cinsinden süre
 * @returns {Object} Gün, saat, dakika ve saniye değerlerini içeren nesne
 */
function convertMs(ms) {
  const second = 1000;  // 1 saniye = 1000 ms
  const minute = second * 60;  // 1 dakika = 60 saniye
  const hour = minute * 60;  // 1 saat = 60 dakika
  const day = hour * 24;  // 1 gün = 24 saat

  // Her bir zaman birimini hesapla
  const days = Math.floor(ms / day);  // Toplam günü bul
  const hours = Math.floor((ms % day) / hour);  // Kalan saati bul
  const minutes = Math.floor(((ms % day) % hour) / minute);  // Kalan dakikayı bul
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);  // Kalan saniyeyi bul

  return { days, hours, minutes, seconds };
}

/**
 * Sayıları iki basamaklı formata çeviren fonksiyon
 * Örnek: 5 -> "05", 10 -> "10"
 * @param {number} value - Formatlanacak sayı
 * @returns {string} İki basamaklı formatta sayı
 */
function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

/**
 * Timer arayüzünü güncelleyen fonksiyon
 * @param {Object} time - Gün, saat, dakika ve saniye değerlerini içeren nesne
 */
function updateTimerUI({ days, hours, minutes, seconds }) {
  // Günler 100'den büyükse olduğu gibi, değilse iki basamaklı göster
  daysElement.textContent = days < 100 ? addLeadingZero(days) : days.toString();
  hoursElement.textContent = addLeadingZero(hours);
  minutesElement.textContent = addLeadingZero(minutes);
  secondsElement.textContent = addLeadingZero(seconds);
}

/**
 * Timer'ı başlatan fonksiyon
 * Start butonuna tıklandığında çalışır
 */
function startTimer() {
  // Tarih seçili değilse hata göster
  if (!userSelectedDate) {
    iziToast.error({
      title: 'Error',
      message: 'Please choose a valid date first!',
      position: 'topRight',
      timeout: 3000,
      backgroundColor: '#EF4444',
      messageColor: '#fff',
      titleColor: '#fff',
      progressBar: false,
      close: false
    });
    return;
  }

  const targetDate = userSelectedDate.getTime();  // Hedef tarihi milisaniye cinsine çevir
  
  // Varsa önceki interval'i temizle
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // UI elementlerini devre dışı bırak
  startButton.disabled = true;
  datetimePicker.disabled = true;

  // Her saniye çalışacak interval'i başlat
  countdownInterval = setInterval(() => {
    const now = new Date().getTime();  // Şimdiki zaman
    const timeLeft = targetDate - now;  // Kalan süre

    // Süre dolduysa
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);  // Interval'i durdur
      datetimePicker.disabled = false;  // Input'u aktifleştir
      updateTimerUI({ days: 0, hours: 0, minutes: 0, seconds: 0 });  // Sayacı sıfırla
      
      // Başarı bildirimi göster
      iziToast.success({
        title: 'Success',
        message: 'Countdown finished!',
        position: 'topRight',
        timeout: 3000,
        backgroundColor: '#22C55E',
        messageColor: '#fff',
        titleColor: '#fff',
        progressBar: false,
        close: false
      });
      return;
    }

    // Kalan süreyi hesapla ve göster
    const time = convertMs(timeLeft);
    updateTimerUI(time);
  }, 1000);  // Her saniye tekrarla
}

// Start butonuna tıklama olayını dinle
startButton.addEventListener('click', startTimer); 