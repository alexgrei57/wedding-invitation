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
    const sectionsContainer = document.getElementById('sectionsContainer');
    const sections = document.querySelectorAll('.section');
    const namesSection = document.querySelector('.names-section');
    
    // Управляем видимостью контейнера 3-9
    if (index >= 2) {
        // Показываем контейнер с секциями 3-9
        sectionsContainer.classList.add('active');
        if (namesSection) {
            namesSection.classList.remove('active');
        }
    } else {
        // Скрываем контейнер, показываем секцию 2
        sectionsContainer.classList.remove('active');
        if (namesSection && index === 1) {
            namesSection.classList.add('active');
        }
    }
    
    // Переход 1→2 (клик по сердцу) - плавное исчезновение
    if (currentSection === 0 && index === 1) {
        sections[0].style.transition = 'opacity 0.8s ease';
        sections[0].style.opacity = '0';
        
        setTimeout(() => {
            sections[0].classList.remove('active');
            sections[0].style.opacity = '1';
            sections[0].style.transition = '';
            
            // Показываем секцию 2
            if (namesSection) {
                namesSection.classList.add('active');
            }
            
            currentSection = index;
            updateNavigation();
            updateIndicators();
        }, 800);
        
        return;
    }
    
    // Переход 2→1
    if (currentSection === 1 && index === 0) {
        if (namesSection) {
            namesSection.classList.remove('active');
        }
        sections[0].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход со 2-й на 3-ю
    if (currentSection === 1 && index === 2) {
        // Прокручиваем к началу контейнера
        sectionsContainer.scrollTop = 0;
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Для остальных переходов внутри 3-9
    if (currentSection >= 2 && index >= 2) {
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход с 3-й и выше на 2-ю
    if (currentSection >= 2 && index === 1) {
        sectionsContainer.classList.remove('active');
        if (namesSection) {
            namesSection.classList.add('active');
        }
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
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

// ===== Swipe (свайпы) между страницами с поддержкой скролла =====
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

// Функция проверки, находится ли элемент в начале скролла
function isScrolledToTop(element) {
    return element.scrollTop <= 1;
}

// Функция проверки, находится ли элемент в конце скролла
function isScrolledToBottom(element) {
    return element.scrollHeight - element.scrollTop - element.clientHeight < 5;
}

// Получить скроллящийся элемент
function getScrollableElement() {
    // Если мы на секциях 3-9, возвращаем контейнер
    if (currentSection >= 2) {
        return document.getElementById('sectionsContainer');
    }
    
    // Иначе ищем content-wrapper внутри текущей секции
    const sections = document.querySelectorAll('.section');
    const currentSectionEl = sections[currentSection];
    
    if (!currentSectionEl) return null;
    
    const contentWrapper = currentSectionEl.querySelector('.content-wrapper');
    
    if (!contentWrapper) return null;
    
    if (contentWrapper.scrollHeight > contentWrapper.clientHeight + 5) {
        return contentWrapper;
    }
    
    return null;
}

document.addEventListener('touchstart', function(e) {
    if (currentSection >= 1 && currentSection <= 8) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (currentSection >= 1 && currentSection <= 8) {
        touchEndY = e.changedTouches[0].screenY;
        
        const swipeDistance = touchStartY - touchEndY;
        const scrollableEl = getScrollableElement();
        
        // Если есть скроллящийся элемент
        if (scrollableEl) {
            // Свайп вверх (хотим на следующую страницу)
            if (swipeDistance > minSwipeDistance) {
                // Если НЕ в конце скролла — не переключаем страницу
                if (!isScrolledToBottom(scrollableEl)) {
                    return;
                }
            }
            
            // Свайп вниз (хотим на предыдущую страницу)
            if (swipeDistance < -minSwipeDistance) {
                // Если НЕ в начале скролла — не переключаем страницу
                if (!isScrolledToTop(scrollableEl)) {
                    return;
                }
            }
        }
        
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