let currentSection = 0;
const totalSections = 9;

// ===== Глобальная функция для клика по сердцу =====
// Объявляем в самом начале чтобы была доступна везде
function changeSection(targetIndex) {
    showSection(targetIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    // Скрываем loader и показываем контент
    document.body.classList.add('loaded');
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 300); // Небольшая задержка чтобы CSS точно загрузился
    }
    
    // ===== ⬅️ СЮДА ДОБАВЬ КОД МУЗЫКИ =====
    const music = document.getElementById('weddingMusic');
    let musicStarted = false;
    
    function startMusic() {
        if (music && !musicStarted) {
            music.volume = 0.3;  // Громкость 30%
            music.play().then(() => {
                musicStarted = true;
                console.log('🎵 Музыка запущена');
            }).catch(err => {
                console.log('Music autoplay blocked:', err);
            });
        }
    }
    
    // Запуск при первом взаимодействии
    document.addEventListener('click', startMusic, { once: true });
    document.addEventListener('touchstart', startMusic, { once: true });
    document.addEventListener('keydown', startMusic, { once: true });
    // ===== КОНЕЦ КОДА МУЗЫКИ =====

    // Остальной код...
    updateNavigation();
    
        // Клик по сердцу
    document.querySelector('.heart-icon')?.addEventListener('click', () => {
        showSection(1);
    });

    // Клик по подсказке
    document.querySelector('.tap-hint')?.addEventListener('click', () => {
        changeSection(1);
    });
    
    // Клик по индикаторам
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSection(index);
        });
    });
    
    // Запускаем обратный отсчёт
    startCountdown();
});

function showSection(index) {
    const sections = document.querySelectorAll('.section');
    
    // Переход 1→2 (клик по сердцу)
    if (currentSection === 0 && index === 1) {
        sections[0].classList.remove('active');
        sections[index].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход 2→1
    if (currentSection === 1 && index === 0) {
        sections[1].classList.remove('active');
        sections[1].classList.add('go-up');
        sections[0].classList.add('active');
        setTimeout(() => {
            sections[1].classList.remove('go-up');
        }, 1200);
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход вперёд (2→3, 3→4, 4→5, 5→6, 6→7, 7→8)
    if (index > currentSection) {
        sections[currentSection].classList.remove('active');
        sections[currentSection].classList.add('go-up');
        sections[index].classList.remove('go-up');
        sections[index].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
    }
    // Переход назад (8→7, 7→6, 6→5, 5→4, 4→3, 3→2)
    else if (index < currentSection) {
        sections[currentSection].classList.remove('active');
        sections[currentSection].classList.remove('go-up');
        sections[index].classList.add('go-up');
        setTimeout(() => {
            sections[index].classList.remove('go-up');
            sections[index].classList.add('active');
            currentSection = index;
            updateNavigation();
            updateIndicators();
        }, 50);
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentSection === 0;
    if (nextBtn) nextBtn.disabled = currentSection === totalSections - 1;
}

function updateIndicators() {
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSection);
    });
}

// ===== Swipe (свайпы) между страницами 2-8 =====
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

document.addEventListener('touchstart', function(e) {
    if (currentSection >= 1 && currentSection <= 8) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, false);

document.addEventListener('touchend', function(e) {
    if (currentSection >= 1 && currentSection <= 8) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }
}, false);

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    
    // Свайп вверх → следующая страница
    if (swipeDistance > minSwipeDistance) {
        if (currentSection < totalSections - 1) {
            showSection(currentSection + 1);
        }
    }
    
    // Свайп вниз → предыдущая страница
    if (swipeDistance < -minSwipeDistance) {
        if (currentSection > 1) {
            showSection(currentSection - 1);
        }
    }
}

// ===== Обратный отсчёт до свадьбы =====
function startCountdown() {
    const weddingDate = new Date('2026-09-12T16:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }
    }
    
    // Обновляем каждую секунду
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Первый запуск
}

// ===== Обработка формы анкеты =====
async function submitForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('rsvpForm');
    const formData = new FormData(form);
    
    const data = {
        name: form.querySelector('input[type="text"]').value,
        attendance: form.querySelector('input[name="attendance"]:checked').value,
        drinks: Array.from(form.querySelectorAll('input[name="drinks"]:checked')).map(cb => cb.value)
    };
    
    try {
        const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Анкета успешно отправлена!');
            form.reset();
        } else {
            alert('Произошла ошибка при отправке.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке.');
    }
}

// ===== Отправка формы в Telegram =====
async function sendToTelegram(event) {
    event.preventDefault();
    
    const form = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccess');
    
    // Ваши данные из шагов 1-2
    const BOT_TOKEN = '8800836918:AAGSZVQXDmr-Uvhaw1zT_FUK7_7lFc2Cemo';
    const CHAT_ID = '1481688749';
    
    // Собираем данные формы
    const formData = new FormData(form);
    const name = form.querySelector('input[type="text"]').value;
    const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
    const drinks = Array.from(form.querySelectorAll('input[name="drinks"]:checked'))
        .map(cb => cb.nextElementSibling.textContent)
        .join(', ') || 'Не указано';
    
    // Формируем сообщение
    const message = `
🎊 <b>НОВАЯ АНКЕТА ГОСТЯ!</b>

👤 <b>Имя:</b> ${name}
✅ <b>Присутствие:</b> ${attendance === 'yes' ? 'Да, с удовольствием!' : 'К сожалению, не смогу'}
🥂 <b>Напитки:</b> ${drinks}

📅 <b>Дата:</b> ${new Date().toLocaleDateString('ru-RU')}
    `.trim();
    
    // Блокируем кнопку (добавили ?., чтобы не было ошибки, если кнопки нет)
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
    }
    
    try {
        // Отправляем в Telegram
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (response.ok) {
            // Успех
            form.reset();
            if (successMsg) successMsg.style.display = 'block';
            if (submitBtn) submitBtn.textContent = 'ОТПРАВЛЕНО ✓';
            
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'ОТПРАВИТЬ';
                }
                if (successMsg) successMsg.style.display = 'none';
            }, 3000);
        } else {
            throw new Error('Ошибка Telegram API');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке. Попробуйте ещё раз.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'ОТПРАВИТЬ';
    }
}

// ===== Отправка формы на сервер =====
async function sendToServer(event) {
    event.preventDefault();
    
    const form = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccess');
    
    const formData = {
        name: form.querySelector('input[type="text"]').value,
        attendance: form.querySelector('input[name="attendance"]:checked')?.value,
        drinks: Array.from(form.querySelectorAll('input[name="drinks"]:checked'))
            .map(cb => cb.nextElementSibling.textContent)
    };
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'ОТПРАВКА...';
    }
    
    try {
        const response = await fetch('https://htcrtllarrvnuldbpewk.supabase.co/rest/v1/guests', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sb_publishable_GJ2XLsO4uCAF0HPajueP8g_LmO0H6aH',  // Вставь свой ANON key
        'apikey': 'sb_publishable_GJ2XLsO4uCAF0HPajueP8g_LmO0H6aH' 
    },
        body: JSON.stringify({
        name: formData.name,
        attendance: formData.attendance,
        drinks: formData.drinks ? formData.drinks.join(', ') : null
    })
});
        
        const result = await response.json();
        
        if (response.ok) {
            form.reset();
            if (successMsg) successMsg.style.display = 'block';
            if (submitBtn) submitBtn.textContent = 'ОТПРАВЛЕНО ✓';
            
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'ОТПРАВИТЬ';
                }
                if (successMsg) successMsg.style.display = 'none';
            }, 3000);
        } else {
            throw new Error(result.error || 'Ошибка сервера');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке: ' + error.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ОТПРАВИТЬ';
        }
    }
}