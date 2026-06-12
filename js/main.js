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
    
    console.log('=== НАЧАЛО ОТПРАВКИ ===');
    
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccess');
    
    // Получаем данные формы
    const nameInput = document.querySelector('input[type="text"]');
    const attendanceInput = document.querySelector('input[name="attendance"]:checked');
    const drinksInputs = document.querySelectorAll('input[name="drinks"]:checked');
    
    console.log('Name input:', nameInput);
    console.log('Attendance input:', attendanceInput);
    console.log('Drinks inputs:', drinksInputs);
    
    if (!nameInput || !attendanceInput) {
        alert('Пожалуйста, заполните имя и подтвердите присутствие');
        return;
    }
    
    const formData = {
        name: nameInput.value.trim(),
        attendance: attendanceInput.value,
        drinks: Array.from(drinksInputs).map(cb => cb.value).join(', ')
    };
    
    console.log('Form data:', formData);
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'ОТПРАВКА...';

    try {
        console.log('Отправляем запрос...');
        
        const response = await fetch('https://htcrttlarrvnuldbpewk.supabase.co/rest/v1/guests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'sb_publishable_GJ2XLsO4uCAF0HPajueP8g_LmO0H6aH',
                'Authorization': 'Bearer sb_publishable_GJ2XLsO4uCAF0HPajueP8g_LmO0H6aH',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Ошибка сервера: ' + response.status);
        }

        const result = await response.json();
        console.log('Success:', result);
        
        // Показываем сообщение об успехе
        successMsg.style.display = 'block';
        
        // Очищаем форму
        nameInput.value = '';
        document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
        
        // Прокручиваем к сообщению
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } catch (error) {
        console.error('Catch error:', error);
        alert('Произошла ошибка при отправке: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ОТПРАВИТЬ';
    }
    
    console.log('=== КОНЕЦ ОТПРАВКИ ===');
}