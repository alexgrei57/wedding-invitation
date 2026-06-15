let currentSection = 0;
const totalSections = 9;

// ===== Глобальная функция для клика по сердцу =====
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
        }, 300);
    }
    
    // ===== КОД МУЗЫКИ =====
    const music = document.getElementById('weddingMusic');
    let musicStarted = false;
    
    function startMusic() {
        if (music && !musicStarted) {
            music.volume = 0.3;
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

    // Остальной код
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
    
    // Переход 1→2 (клик по сердцу) - плавное исчезновение
    if (currentSection === 0 && index === 1) {
        sections[0].style.transition = 'opacity 0.8s ease';
        sections[0].style.opacity = '0';
        
        setTimeout(() => {
            sections[0].classList.remove('active');
            sections[0].style.opacity = '1';
            sections[0].style.transition = '';
            sections[index].classList.add('active');
            currentSection = index;
            updateNavigation();
            updateIndicators();
        }, 800);
        
        return;
    }
    
    // Переход 2→1
    if (currentSection === 1 && index === 0) {
        sections[1].classList.remove('active');
        sections[1].classList.add('go-down');
        sections[0].classList.add('active');
        setTimeout(() => {
            sections[1].classList.remove('go-down');
        }, 1200);
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход вперёд
    if (index > currentSection) {
        sections[currentSection].classList.remove('active');
        sections[currentSection].classList.add('go-up');
        sections[index].classList.remove('go-down');
        sections[index].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
    }
    // Переход назад
    else if (index < currentSection) {
        sections[currentSection].classList.remove('active');
        sections[currentSection].classList.add('go-down');
        sections[index].classList.remove('go-up');
        sections[index].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
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

// ===== Swipe (свайпы) между страницами 2-8 с проверкой скролла =====
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

// Функция проверки, есть ли скролл внутри секции
function hasScrollableContent() {
    const sections = document.querySelectorAll('.section');
    const currentSectionEl = sections[currentSection];
    
    if (!currentSectionEl) return false;
    
    const contentWrapper = currentSectionEl.querySelector('.content-wrapper');
    
    if (!contentWrapper) return false;
    
    // Проверяем, превышает ли контент высоту контейнера
    return contentWrapper.scrollHeight > contentWrapper.clientHeight;
}

document.addEventListener('touchstart', function(e) {
    // Если есть скролл внутри секции — не перехватываем свайп
    if (hasScrollableContent()) {
        return;
    }
    
    if (currentSection >= 1 && currentSection <= 8) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    // Если есть скролл внутри секции — не обрабатываем свайп
    if (hasScrollableContent()) {
        return;
    }
    
    if (currentSection >= 1 && currentSection <= 8) {
        touchEndY = e.changedTouches[0].screenY;
        
        // Небольшая задержка для плавности
        setTimeout(() => {
            handleSwipe();
        }, 50);
    }
}, { passive: true });

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
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Запрет контекстного меню на изображениях
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

// Запрет перетаскивания
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});



/*
// ===== Отправка формы в Supabase (ЕДИНСТВЕННАЯ ФУНКЦИЯ) =====
async function sendToServer(event) {
    event.preventDefault();
    
    console.log('=== НАЧАЛО ОТПРАВКИ В SUPABASE ===');
    
    const form = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('formSuccess');
    const errorMsg = document.getElementById('formError');
    
    // Скрываем предыдущие сообщения
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Получаем данные формы
    const nameInput = document.getElementById('guestName');
    const attendanceInput = document.querySelector('input[name="attendance"]:checked');
    const drinksInputs = document.querySelectorAll('input[name="drinks"]:checked');
    
    if (!nameInput || !attendanceInput) {
        alert('Пожалуйста, заполните имя и подтвердите присутствие');
        return;
    }
    
    const formData = {
        name: nameInput.value.trim(),
        attendance: attendanceInput.value,
        drinks: Array.from(drinksInputs).map(cb => cb.value).join(', ') || 'Не выбрано'
    };
    
    console.log('Form data:', formData);
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'ОТПРАВКА...';

    try {
        // Используем Supabase клиент (он уже инициализирован в index.html)
        const { data, error } = await supabaseClient
            .from('guests')
            .insert([formData])
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('✅ Успешно сохранено:', data);
        
        // Показываем сообщение об успехе
        if (successMsg) successMsg.style.display = 'block';
        
        // Очищаем форму
        form.reset();
        
        // Прокручиваем к сообщению
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Меняем текст кнопки на время
        submitBtn.textContent = 'ОТПРАВЛЕНО ✓';
        setTimeout(() => {
            submitBtn.textContent = 'ОТПРАВИТЬ';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = '✗ Ошибка отправки: ' + error.message;
        } else {
            alert('Произошла ошибка при отправке: ' + error.message);
        }
    } finally {
        submitBtn.disabled = false;
    }
    
    console.log('=== КОНЕЦ ОТПРАВКИ ===');
}
    */