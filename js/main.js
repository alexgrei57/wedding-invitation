let currentSection = 0;
const totalSections = 10;

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
const musicToggle = document.getElementById('musicToggle');
let musicStarted = false;

// Функция запуска музыки
function startMusic() {
    if (music && !musicStarted) {
        music.volume = 0.3;
        music.play().then(() => {
            musicStarted = true;
            musicToggle.classList.add('playing');
            console.log(' Музыка запущена автоматически');
        }).catch(err => {
            console.log('Music autoplay blocked:', err);
            // Если автозапуск заблокирован, показываем иконку включения
            musicToggle.classList.remove('playing');
        });
    }
}

// Управление музыкой — ТОЛЬКО по клику на иконку
const musicToggleIcon = document.querySelector('.music-toggle-icon');

if (musicToggleIcon) {
    musicToggleIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (music) {
            if (music.paused) {
                music.play();
                musicToggle.classList.add('playing');
                musicToggle.querySelector('.music-toggle-text').textContent = 'нажмите, чтобы выключить музыку';
            } else {
                music.pause();
                musicToggle.classList.remove('playing');
                musicToggle.querySelector('.music-toggle-text').textContent = 'нажмите, чтобы включить музыку';
            }
        }
    });
}

    // Остальной код
    updateNavigation();
    
// Клик по сердцу
document.querySelector('.heart-icon')?.addEventListener('click', () => {
    // 🎵 Запускаем музыку СРАЗУ при клике (user gesture)
    if (music && !musicStarted) {
        music.volume = 0.3;
        music.play().then(() => {
            musicStarted = true;
            if (musicToggle) musicToggle.classList.add('playing');
            console.log('🎵 Музыка запущена при клике');
        }).catch(err => {
            console.log('Music autoplay blocked:', err);
            // Если заблокировано - иконка останется в состоянии "включить"
        });
    }
    
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
    
    // ===== Показывать скроллбар при прокрутке =====
    const sectionsContainer = document.getElementById('sectionsContainer');
    let scrollTimeout;
    
    sectionsContainer.addEventListener('scroll', function() {
        sectionsContainer.classList.add('scrolling');
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            sectionsContainer.classList.remove('scrolling');
        }, 1000); // Скрыть через 1 секунду после остановки скролла
    });
    
    // Запускаем обратный отсчёт
    startCountdown();
});

function showSection(index) {
        // 🚫 ЗАПРЕТ возврата на первую страницу
    if (index === 0) return;
    const sectionsContainer = document.getElementById('sectionsContainer');
    const sections = document.querySelectorAll('.section');
    
// Переход 1→2 (клик по сердцу) - плавное появление контейнера
if (currentSection === 0 && index === 1) {
    sections[0].style.transition = 'opacity 1.5s ease-in-out';
    sections[0].style.opacity = '0';
    
    setTimeout(() => {
        sections[0].classList.remove('active');
        sections[0].style.opacity = '1';
        sections[0].style.transition = '';
        
// Показываем контейнер со скроллом (секция 2 внутри контейнера)
sectionsContainer.classList.add('active');
sectionsContainer.scrollTop = 0;

// Сбрасываем анимацию тайминга (чтобы работала при повторном открытии)
setTimeout(() => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => item.classList.remove('visible'));
}, 100);

currentSection = index;
updateNavigation();
updateIndicators();
    }, 1500);
    
    return;
}
    
    // Переход 2→1 (возврат на главную)
    if (currentSection === 1 && index === 0) {
        sectionsContainer.classList.remove('active');
        sections[0].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Переход с любой секции (2-9) на главную (0)
    if (currentSection >= 2 && index === 0) {
        sectionsContainer.classList.remove('active');
        sections[0].classList.add('active');
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
    
    // Для всех переходов внутри контейнера (1-8)
    if (currentSection >= 1 && index >= 1) {
        currentSection = index;
        updateNavigation();
        updateIndicators();
        return;
    }
}

// ===== АНИМАЦИЯ ТАЙМИНГА =====
function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineItems || timelineItems.length === 0) return;
    
    // Сбрасываем все элементы (на случай повторного вызова)
    timelineItems.forEach(item => {
        item.classList.remove('visible');
    });
    
    // Добавляем класс visible каждому элементу с задержкой
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 150); // 300ms между каждым элементом
    });
}

// Запускаем анимацию тайминга при переходе на страницу с таймингом
function checkAndAnimateTimeline() {
    const sectionsContainer = document.getElementById('sectionsContainer');
    const timelineSection = document.getElementById('section5');
    
    if (!sectionsContainer || !timelineSection) return;
    
    // Проверяем, видима ли секция тайминга (прокручена ли она в viewport)
    const containerRect = sectionsContainer.getBoundingClientRect();
    const timelineRect = timelineSection.getBoundingClientRect();
    
    // Если секция тайминга находится в видимой области контейнера
    if (timelineRect.top < containerRect.bottom && timelineRect.bottom > containerRect.top) {
        const visibleItems = document.querySelectorAll('.timeline-item.visible');
        if (visibleItems.length === 0) {
            animateTimeline();
        }
    }
}

// Слушаем скролл в контейнере
document.addEventListener('DOMContentLoaded', function() {
    const sectionsContainer = document.getElementById('sectionsContainer');
    
    if (sectionsContainer) {
        sectionsContainer.addEventListener('scroll', function() {
            // Небольшая задержка для производительности
            clearTimeout(window.timelineScrollTimeout);
            window.timelineScrollTimeout = setTimeout(checkAndAnimateTimeline, 100);
        });
    }
});

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentSection <= 1; // ← Изменили с === 0 на <= 1
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
    // Если мы на секциях 2-9 (внутри контейнера), возвращаем контейнер
    if (currentSection >= 1) {
        return document.getElementById('sectionsContainer');
    }
    
    return null;
}

document.addEventListener('touchstart', function(e) {
    if (currentSection >= 0 && currentSection <= 8) {
        touchStartY = e.changedTouches[0].screenY;
    }
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (currentSection >= 0 && currentSection <= 8) {
        touchEndY = e.changedTouches[0].screenY;
        
        const swipeDistance = touchStartY - touchEndY;
        const scrollableEl = getScrollableElement();
        
        // Если есть скроллящийся элемент (контейнер)
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
    
    // 🚫 ЗАПРЕТ свайпа вверх на первой странице (currentSection === 0)
    if (currentSection === 0 && swipeDistance > minSwipeDistance) {
        return; // Просто выходим, не делаем ничего
    }
    
    // 🚫 ЗАПРЕТ свайпа вниз на второй странице (currentSection === 1)
    if (currentSection === 1 && swipeDistance < -minSwipeDistance) {
        return; // Просто выходим, не делаем ничего
    }
    
    // Свайп вверх → следующая страница
    if (swipeDistance > minSwipeDistance) {
        if (currentSection < totalSections - 1) {
            showSection(currentSection + 1);
        }
    }
    
    // Свайп вниз → предыдущая страница (только если не на второй странице)
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