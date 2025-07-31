// Готовое решение без настройки API ключей

// Переменные
let yandexMap;
const appointmentData = [];
const reviewsData = [];

// DOM элементы
const burger = document.querySelector('.burger');
const navMenu = document.querySelector('.nav-menu');
const appointmentForm = document.getElementById('appointmentForm');
const reviewForm = document.getElementById('reviewForm');
const documentModal = document.getElementById('documentModal');
const closeModal = document.querySelector('.close');
const payButtons = document.querySelectorAll('.pay-btn');

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initForms();
    initMap();
    initPayment();
    initSmoothScroll();
});

// Навигация и бургер меню
function initNavigation() {
    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрытие меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Изменение навигации при скролле
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

// Плавная прокрутка к разделам
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Добавляем класс анимации к элементам
    const animatedElements = document.querySelectorAll('.service-card, .review-card, .document-card, .contact-item');
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// Инициализация форм
function initForms() {
    // Форма записи работает через кнопку email (onclick="sendViaEmail()")
    // Форма отзыва работает через кнопку email (onclick="sendReviewViaEmail()")

    // Валидация телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    // Установка минимальной даты
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Инициализация интерактивных звезд рейтинга
    initRatingStars();
}

// Инициализация интерактивных звезд
function initRatingStars() {
    const ratingContainer = document.querySelector('.rating-input');
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('label');
    const radioInputs = ratingContainer.querySelectorAll('input[type="radio"]');

    // Обработчики для каждой звезды
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            // Получаем значение рейтинга (5-звезд сверху, 1-звезда снизу)
            const ratingValue = 5 - index;
            
            // Отмечаем соответствующий radio input
            const targetRadio = document.getElementById(`star${ratingValue}`);
            if (targetRadio) {
                targetRadio.checked = true;
            }
            
            // Обновляем визуальное отображение
            updateStarsDisplay(ratingValue);
            
            // Показываем выбранный рейтинг
            showRatingFeedback(ratingValue);
        });

        // Эффект наведения
        star.addEventListener('mouseenter', function() {
            const ratingValue = 5 - index;
            highlightStars(ratingValue);
        });
    });

    // Сброс подсветки при уходе мыши с контейнера
    ratingContainer.addEventListener('mouseleave', function() {
        const checkedInput = ratingContainer.querySelector('input[type="radio"]:checked');
        if (checkedInput) {
            const checkedValue = parseInt(checkedInput.value.charAt(0));
            updateStarsDisplay(checkedValue);
        } else {
            resetStars();
        }
    });
}

// Обновление отображения звезд
function updateStarsDisplay(rating) {
    const stars = document.querySelectorAll('.rating-input label');
    stars.forEach((star, index) => {
        const starValue = 5 - index;
        if (starValue <= rating) {
            star.style.color = '#FFD700';
            star.classList.add('active');
        } else {
            star.style.color = '#E0E0E0';
            star.classList.remove('active');
        }
    });
}

// Подсветка звезд при наведении
function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-input label');
    stars.forEach((star, index) => {
        const starValue = 5 - index;
        if (starValue <= rating) {
            star.style.color = '#FFD700';
            star.style.transform = 'scale(1.1)';
        } else {
            star.style.color = '#E0E0E0';
            star.style.transform = 'scale(1)';
        }
    });
}

// Сброс звезд
function resetStars() {
    const stars = document.querySelectorAll('.rating-input label');
    stars.forEach(star => {
        star.style.color = '#E0E0E0';
        star.style.transform = 'scale(1)';
        star.classList.remove('active');
    });
}

// Показать обратную связь о выбранном рейтинге
function showRatingFeedback(rating) {
    // Удаляем предыдущую обратную связь
    const existingFeedback = document.querySelector('.rating-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Создаем новую обратную связь
    const feedback = document.createElement('div');
    feedback.className = 'rating-feedback';
    feedback.style.cssText = `
        margin-top: 0.5rem;
        color: var(--primary-color);
        font-weight: 500;
        font-size: 0.9rem;
        animation: fadeInUp 0.3s ease;
    `;

    const ratingTexts = {
        1: '1 звезда - Плохо',
        2: '2 звезды - Неудовлетворительно', 
        3: '3 звезды - Удовлетворительно',
        4: '4 звезды - Хорошо',
        5: '5 звезд - Отлично!'
    };

    feedback.innerHTML = `✨ Выбрано: ${ratingTexts[rating]}`;

    // Добавляем после контейнера рейтинга
    const ratingContainer = document.querySelector('.rating-input');
    ratingContainer.parentNode.insertBefore(feedback, ratingContainer.nextSibling);
}

// Форматирование номера телефона
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('8')) {
        value = '7' + value.slice(1);
    }
    
    if (value.startsWith('7')) {
        const formatted = value.replace(/^7(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($1) $2-$3-$4');
        e.target.value = formatted;
    }
}

// Форма записи теперь работает только через email - простое и надежное решение

// Форма отзывов теперь тоже работает через email - простое и надежное решение

// Валидация формы записи
function validateAppointmentForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Введите корректный номер телефона');
    }

    if (data.email && !isValidEmail(data.email)) {
        errors.push('Введите корректный email адрес');
    }

    if (!data.format) {
        errors.push('Выберите формат консультации');
    }

    if (!data.service) {
        errors.push('Выберите тип консультации');
    }

    if (!data.privacy) {
        errors.push('Необходимо согласие на обработку персональных данных');
    }

    if (errors.length > 0) {
        showFormResult(appointmentForm, 'error', errors.join('<br>'));
        return false;
    }

    return true;
}

// Валидация формы отзыва
function validateReviewForm(data) {
    const errors = [];

    if (!data.reviewName || data.reviewName.trim().length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }

    if (!data.rating) {
        errors.push('Поставьте оценку');
    }

    if (!data.reviewText || data.reviewText.trim().length < 10) {
        errors.push('Отзыв должен содержать минимум 10 символов');
    }

    if (errors.length > 0) {
        showFormResult(reviewForm, 'error', errors.join('<br>'));
        return false;
    }

    return true;
}

// Вспомогательные функции валидации
function isValidPhone(phone) {
    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(phone);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Получение названия услуги
function getServiceName(serviceKey) {
    const services = {
        'individual': 'Индивидуальная консультация',
        'family': 'Семейная терапия',
        'behavior': 'Коррекция поведения',
        'package': 'Пакет из 5 сессий'
    };
    return services[serviceKey] || serviceKey;
}

// Показать результат формы
function showFormResult(form, type, message) {
    const resultDiv = form.querySelector('.form-result');
    if (resultDiv) {
        resultDiv.className = `form-result ${type}`;
        resultDiv.innerHTML = message;
        resultDiv.style.display = 'block';
        
        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 5000);

        // Прокрутить к результату
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Показать загрузчик
function showFormLoader(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loader"></div>';
        
        // Вернуть обычное состояние через 3 секунды (на случай ошибки)
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = form === appointmentForm ? 'Отправить заявку' : 'Отправить отзыв';
        }, 3000);
    }
}

// Добавить отзыв на страницу
function addReviewToPage(review) {
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (!reviewsGrid) return;

    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.innerHTML = `
        <div class="review-rating">
            <span>${'⭐'.repeat(review.rating)}</span>
        </div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-author">
            <strong>${review.name}</strong>
            <span>${getServiceName(review.service)}</span>
        </div>
    `;

    reviewsGrid.appendChild(reviewCard);
    
    // Анимация появления
    reviewCard.style.opacity = '0';
    reviewCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        reviewCard.style.transition = 'all 0.5s ease';
        reviewCard.style.opacity = '1';
        reviewCard.style.transform = 'translateY(0)';
    }, 100);
}

// Инициализация карты Яндекс
function initMap() {
    if (typeof ymaps === 'undefined') {
        console.log('Яндекс.Карты не загружены');
        return;
    }

    ymaps.ready(function() {
        // Координаты для Кантемировская улица, 39
        const coordinates = [59.985652, 30.356029];

        yandexMap = new ymaps.Map("map", {
            center: coordinates,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавление метки
        const placemark = new ymaps.Placemark(coordinates, {
            balloonContent: `
                <div style="padding: 10px;">
                    <h3>Кабинет психолога</h3>
                    <p>Васильева Елена</p>
                    <p>Кантемировская улица, 39</p>
                    <p>Санкт-Петербург, метро Лесная</p>
                </div>
            `,
            hintContent: 'Кабинет психолога - Кантемировская ул., 39'
        }, {
            preset: 'islands#pinkIcon',
            iconLayout: 'default#image',
            iconImageHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFOEI0QjgiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEwNDYgMiAxNCAyLjg5NTQzIDE0IDRDMTQgNS4xMDQ1NyAxMy4xMDQ2IDYgMTIgNkMxMC44OTU0IDYgMTAgNS4xMDQ1NyAxMCA0QzEwIDIuODk1NDMgMTAuODk1NCAyIDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgOEMxNC4yMDkxIDggMTYgOS43OTA4NiAxNiAxMlYyMEMxNiAyMS4xMDQ2IDE1LjEwNDYgMjIgMTQgMjJIMTBDOC44OTU0MyAyMiA4IDIxLjEwNDYgOCAyMFYxMkM4IDkuNzkwODYgOS43OTA4NiA4IDEyIDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+',
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -32]
        });

        yandexMap.geoObjects.add(placemark);

        // Отключение прокрутки карты колесом мыши
        yandexMap.behaviors.disable('scrollZoom');
    });
}

// // Инициализация системы оплаты
// function initPayment() {
//     payButtons.forEach(button => {
//         button.addEventListener('click', handlePayment);
//     });
// }

// // Обработка оплаты
// async function handlePayment(e) {
//     const paymentOption = e.target.closest('.payment-option');
//     const service = paymentOption.dataset.service;
//     const price = paymentOption.dataset.price;
    
//     // Показать загрузку
//     e.target.disabled = true;
//     e.target.innerHTML = '<div class="loader"></div>';

//     try {
//         // Здесь будет интеграция с реальной платежной системой
//         // Пример для ЮKassa
//         await simulatePayment(service, price);
        
//         alert(`Переход к оплате услуги на сумму ${price} ₽.\nВ реальной версии здесь будет интеграция с ЮKassa или другой платежной системой.`);
        
//     } catch (error) {
//         console.error('Ошибка при инициализации оплаты:', error);
//         alert('Произошла ошибка при инициализации оплаты. Попробуйте еще раз.');
//     } finally {
//         // Вернуть кнопку в исходное состояние
//         setTimeout(() => {
//             e.target.disabled = false;
//             e.target.innerHTML = 'Оплатить';
//         }, 1000);
//     }
// }

// // Симуляция оплаты (заменить на реальную интеграцию)
// function simulatePayment(service, price) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             console.log(`Инициализация оплаты для ${service} на сумму ${price} ₽`);
//             resolve();
//         }, 1000);
//     });
// }

// Модальные окна для документов
function openDocumentModal(documentId) {
    const modal = document.getElementById('documentModal');
    const content = document.getElementById('documentContent');
    
    // Содержимое для разных документов
    const documents = {
        'diploma': {
            title: 'Диплом о высшем образовании',
            content: 'Здесь будет отображаться диплом о высшем образовании. Загрузите изображение диплома в папку проекта и обновите путь в коде.'
        },
        'certificate1': {
            title: 'Сертификат профессиональной переподготовки',
            content: 'Здесь будет отображаться сертификат профессиональной переподготовки.'
        },
        'certificate2': {
            title: 'Сертификат повышения квалификации',
            content: 'Здесь будет отображаться сертификат повышения квалификации по семейной терапии.'
        },
        'certificate3': {
            title: 'Сертификат психологического общества',
            content: 'Здесь будет отображаться сертификат членства в Российском психологическом обществе.'
        }
    };

    const doc = documents[documentId];
    if (doc) {
        content.innerHTML = `
            <h2>${doc.title}</h2>
            <p>${doc.content}</p>
            <p style="margin-top: 20px; color: #666; font-style: italic;">
                Для добавления реальных документов загрузите изображения в папку проекта 
                и обновите пути в функции openDocumentModal().
            </p>
        `;
        modal.style.display = 'block';
    }
}

// Закрытие модального окна
if (closeModal) {
    closeModal.addEventListener('click', () => {
        documentModal.style.display = 'none';
    });
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === documentModal) {
        documentModal.style.display = 'none';
    }
});

// Утилиты для разработки
function getAppointmentData() {
    return appointmentData;
}

function getReviewsData() {
    return reviewsData;
}

// Обновление цен (для будущего админ-панели)
function updatePrices(newPrices) {
    const priceElements = document.querySelectorAll('.price-online, .price-offline, .price');
    
    // Обновление цен в DOM
    // Реализация зависит от структуры объекта newPrices
    console.log('Обновление цен:', newPrices);
}

// Функция отправки через Telegram
async function sendViaEmail() {
    const form = document.getElementById('appointmentForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const normalizedData = {
        name: data['Имя клиента'],
        phone: data['Телефон для связи'],
        email: data['Email клиента'],
        format: data['Формат консультации'],
        service: data['Тип услуги'],
        date: data['Желаемая дата'],
        time: data['Желаемое время'],
        message: data['Дополнительная информация от клиента'],
        privacy: data['privacy']
    };
    
    // Валидация
    if (!validateAppointmentForm(normalizedData)) {
        return;
    }
    
    // Показываем индикатор загрузки
    const submitButton = form.querySelector('button[type="button"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loader"></div> Отправка...';

    try {
        // Отправляем в Telegram
        await sendToTelegram('appointment', normalizedData);
        
        // Сохранить данные локально
        appointmentData.push({
            ...normalizedData,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });

        showFormResult(form, 'success', 
            '✅ Заявка отправлена в Telegram!<br>' +
            '📱 Психолог получит уведомление и свяжется с вами в ближайшее время.<br>' +
            '📞 Если нужна срочная консультация, позвоните: <strong>+7 (812) 777-88-99</strong>');
        
        form.reset();

    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        
        // Fallback на email если Telegram не работает
        sendViaEmailFallback(normalizedData);
        
        showFormResult(form, 'warning', 
            '⚠️ Telegram временно недоступен.<br>' +
            '📧 Заявка отправлена через email.<br>' +
            '📞 Или позвоните напрямую: <strong>+7 (812) 777-88-99</strong>');
        
        form.reset();
    } finally {
        // Восстанавливаем кнопку
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1000);
    }
}

// Функция отправки отзыва через Telegram
async function sendReviewViaEmail() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const normalizedData = {
        reviewName: data['Имя автора отзыва'],
        reviewService: data['Услуга по которой отзыв'],
        rating: data['Оценка в звездах']?.replace(' звезд', '').replace(' звезды', '').replace(' звезда', ''),
        reviewText: data['Текст отзыва']
    };
    
    // Валидация
    if (!validateReviewForm(normalizedData)) {
        return;
    }
    
    // Показываем индикатор загрузки
    const submitButton = form.querySelector('button[type="button"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loader"></div> Отправка...';

    try {
        // Отправляем в Telegram
        await sendToTelegram('review', normalizedData);
        
        // Создать новый отзыв для отображения на сайте
        const newReview = {
            id: Date.now(),
            name: normalizedData.reviewName,
            service: normalizedData.reviewService,
            rating: parseInt(normalizedData.rating || 5),
            text: normalizedData.reviewText,
            timestamp: new Date().toISOString()
        };

        // Добавить в массив
        reviewsData.push(newReview);

        // Добавить отзыв на страницу сразу
        addReviewToPage(newReview);
        
        showFormResult(form, 'success', 
            '⭐ Спасибо за ваш отзыв! Уведомление отправлено в Telegram.<br>' +
            '📱 Психолог увидит ваш отзыв и будет благодарна за обратную связь.<br>' +
            'Отзыв добавлен на сайт!');
        
        form.reset();
        
        // Сбросить звезды и убрать feedback
        resetStars();
        const existingFeedback = document.querySelector('.rating-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

    } catch (error) {
        console.error('Ошибка отправки отзыва в Telegram:', error);
        
        // Fallback на email если Telegram не работает
        sendReviewViaEmailFallback(normalizedData);
        
        // Все равно добавляем отзыв на сайт
        const newReview = {
            id: Date.now(),
            name: normalizedData.reviewName,
            service: normalizedData.reviewService,
            rating: parseInt(normalizedData.rating || 5),
            text: normalizedData.reviewText,
            timestamp: new Date().toISOString()
        };
        reviewsData.push(newReview);
        addReviewToPage(newReview);
        
        showFormResult(form, 'warning', 
            '⚠️ Telegram временно недоступен.<br>' +
            '📧 Отзыв отправлен через email.<br>' +
            'Отзыв добавлен на сайт!');
        
        form.reset();
        resetStars();
        const existingFeedback = document.querySelector('.rating-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
    } finally {
        // Восстанавливаем кнопку
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1000);
    }
}

// ===== TELEGRAM BOT API ФУНКЦИИ =====

// Настройки Telegram бота (ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ!)
const TELEGRAM_CONFIG = {
    BOT_TOKEN: '8474353441:AAEDKFK8BeXZb0S57LSZB9bgvBLV1Ql2D78', // Токен вашего бота от @BotFather
    CHAT_ID: '-1002705276542'      // ID чата, куда отправлять сообщения (ЗАМЕНИТЕ ЕСЛИ НУЖНО)
};

// Основная функция отправки в Telegram
async function sendToTelegram(type, data) {
    // Проверяем настройки
    if (TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN' || TELEGRAM_CONFIG.CHAT_ID === 'YOUR_CHAT_ID') {
        throw new Error('Telegram бот не настроен. Необходимо указать BOT_TOKEN и CHAT_ID.');
    }

    let message = '';
    
    if (type === 'appointment') {
        message = formatAppointmentMessage(data);
    } else if (type === 'review') {
        message = formatReviewMessage(data);
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
    
    const payload = {
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    };

    console.log('Отправка в Telegram:', {
        url: url,
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        message_length: message.length
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    console.log('Ответ Telegram API:', response.status, response.statusText);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка Telegram API:', errorData);
        throw new Error(`Telegram API error: ${errorData.description || 'Неизвестная ошибка'}`);
    }

    const result = await response.json();
    console.log('Успешная отправка в Telegram:', result);
    return result;
}

// Форматирование сообщения для заявки на консультацию
function formatAppointmentMessage(data) {
    const timestamp = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
🔔 <b>НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ</b>

👤 <b>Имя:</b> ${data.name}
📞 <b>Телефон:</b> ${data.phone}
📧 <b>Email:</b> ${data.email || 'Не указан'}
💻 <b>Формат:</b> ${data.format}
🎯 <b>Услуга:</b> ${data.service}
📅 <b>Желаемая дата:</b> ${data.date || 'Не указана'}
🕐 <b>Желаемое время:</b> ${data.time || 'Не указано'}

💬 <b>Дополнительная информация:</b>
${data.message || 'Нет дополнительной информации'}

⏰ <b>Время подачи заявки:</b> ${timestamp}
🌐 <b>Источник:</b> Сайт психолога Васильевой Елены

<i>Для ответа клиенту используйте указанные контакты.</i>
    `.trim();
}

// Форматирование сообщения для отзыва
function formatReviewMessage(data) {
    const ratingStars = '⭐'.repeat(parseInt(data.rating || 5));
    const timestamp = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
⭐ <b>НОВЫЙ ОТЗЫВ НА САЙТЕ</b>

👤 <b>Имя:</b> ${data.reviewName}
🎯 <b>Услуга:</b> ${data.reviewService || 'Не указана'}
⭐ <b>Оценка:</b> ${ratingStars} (${data.rating || 5} из 5)

💬 <b>Текст отзыва:</b>
${data.reviewText}

⏰ <b>Время публикации:</b> ${timestamp}
🌐 <b>Источник:</b> Сайт психолога Васильевой Елены

<i>Отзыв автоматически добавлен на сайт в разделе "Отзывы".</i>
    `.trim();
}

// Fallback функция для отправки заявки через email
function sendViaEmailFallback(data) {
    const mailtoData = `
🔔 ЗАЯВКА НА КОНСУЛЬТАЦИЮ

👤 Имя: ${data.name}
📞 Телефон: ${data.phone}
📧 Email: ${data.email || 'Не указан'}
💻 Формат: ${data.format}
🎯 Услуга: ${data.service}
📅 Дата: ${data.date || 'Не указана'}
🕐 Время: ${data.time || 'Не указано'}

💬 Дополнительная информация:
${data.message || 'Нет дополнительной информации'}

---
Отправлено с сайта психолога Васильевой Елены
    `.trim();
    
    const mailtoLink = `mailto:wave.capuletti@gmail.com?subject=🔔 Новая заявка на консультацию - Сайт психолога&body=${encodeURIComponent(mailtoData)}`;
    window.open(mailtoLink, '_blank');
}

// Fallback функция для отправки отзыва через email
function sendReviewViaEmailFallback(data) {
    const ratingStars = '⭐'.repeat(parseInt(data.rating || 5));
    
    const mailtoData = `
⭐ НОВЫЙ ОТЗЫВ НА САЙТЕ

👤 Имя: ${data.reviewName}
🎯 Услуга: ${data.reviewService || 'Не указана'}
⭐ Оценка: ${ratingStars} (${data.rating || 5} из 5)

💬 Текст отзыва:
${data.reviewText}

---
Отправлено с сайта психолога Васильевой Елены
    `.trim();
    
    const mailtoLink = `mailto:wave.capuletti@gmail.com?subject=⭐ Новый отзыв на сайте психолога&body=${encodeURIComponent(mailtoData)}`;
    window.open(mailtoLink, '_blank');
    const existingFeedback = document.querySelector('.rating-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
}

// Экспорт функций для глобального доступа
window.openDocumentModal = openDocumentModal;
window.getAppointmentData = getAppointmentData;
window.getReviewsData = getReviewsData;
window.updatePrices = updatePrices;
window.sendViaEmail = sendViaEmail;
window.sendReviewViaEmail = sendReviewViaEmail;

// Логирование для отладки
console.log('Сайт психолога инициализирован');
console.log('Доступные функции:', {
    openDocumentModal: 'Открытие модального окна с документами',
    getAppointmentData: 'Получение данных записей',
    getReviewsData: 'Получение данных отзывов',
    updatePrices: 'Обновление цен на услуги'
});

// Обработка ошибок JavaScript
window.addEventListener('error', function(e) {
    console.error('JavaScript ошибка:', e.error);
    console.error('Файл:', e.filename);
    console.error('Строка:', e.lineno);
});

// Проверка поддержки современных функций
if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver не поддерживается. Анимации при скролле могут не работать.');
}

if (!window.fetch) {
    console.warn('Fetch API не поддерживается. Возможны проблемы с отправкой форм.');
}