// Инициализация EmailJS
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Замените на ваш публичный ключ
})();

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
    // Форма записи на прием
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Форма отзыва
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

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

// Обработка формы записи на прием
async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(appointmentForm);
    const data = Object.fromEntries(formData);
    
    // Валидация
    if (!validateAppointmentForm(data)) {
        return;
    }

    // Показать загрузку
    showFormLoader(appointmentForm);

    try {
        // Отправка через EmailJS
        const templateParams = {
            from_name: data.name,
            from_phone: data.phone,
            from_email: data.email || 'Не указан',
            service_type: getServiceName(data.service),
            format: data.format === 'online' ? 'Онлайн' : 'Очно в кабинете',
            preferred_date: data.date || 'Не указана',
            preferred_time: data.time || 'Не указано',
            message: data.message || 'Дополнительной информации нет',
            reply_to: data.email || 'noreply@example.com'
        };

        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
        
        // Сохранить данные
        appointmentData.push({
            ...data,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });

        // Показать успех
        showFormResult(appointmentForm, 'success', 'Заявка успешно отправлена! Я свяжусь с вами в течение 24 часов.');
        appointmentForm.reset();

    } catch (error) {
        console.error('Ошибка отправки:', error);
        showFormResult(appointmentForm, 'error', 'Произошла ошибка при отправке заявки. Попробуйте еще раз или свяжитесь по телефону.');
    }
}

// Обработка формы отзыва
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(reviewForm);
    const data = Object.fromEntries(formData);
    
    if (!validateReviewForm(data)) {
        return;
    }

    showFormLoader(reviewForm);

    try {
        // Создать новый отзыв
        const newReview = {
            id: Date.now(),
            name: data.reviewName,
            service: data.reviewService,
            rating: parseInt(data.rating),
            text: data.reviewText,
            timestamp: new Date().toISOString()
        };

        // Добавить в массив
        reviewsData.push(newReview);

        // Отправить уведомление психологу
        const templateParams = {
            reviewer_name: data.reviewName,
            service_type: getServiceName(data.reviewService),
            rating: '⭐'.repeat(parseInt(data.rating)),
            review_text: data.reviewText,
            review_date: new Date().toLocaleDateString('ru-RU')
        };

        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_REVIEW_TEMPLATE_ID', templateParams);

        // Добавить отзыв на страницу
        addReviewToPage(newReview);
        
        showFormResult(reviewForm, 'success', 'Спасибо за ваш отзыв! Он появится на сайте после модерации.');
        reviewForm.reset();

    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        showFormResult(reviewForm, 'error', 'Произошла ошибка при отправке отзыва. Попробуйте еще раз.');
    }
}

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
        // Координаты для метро Лесная
        const coordinates = [60.0138, 30.3461];

        yandexMap = new ymaps.Map("map", {
            center: coordinates,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавление метки
        const placemark = new ymaps.Placemark(coordinates, {
            balloonContent: `
                <div style="padding: 10px;">
                    <h3>Кабинет психолога</h3>
                    <p>Васильева Елена</p>
                    <p>Метро Лесная</p>
                    <p>Точный адрес сообщается при записи</p>
                </div>
            `,
            hintContent: 'Кабинет психолога - метро Лесная'
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

// Инициализация системы оплаты
function initPayment() {
    payButtons.forEach(button => {
        button.addEventListener('click', handlePayment);
    });
}

// Обработка оплаты
async function handlePayment(e) {
    const paymentOption = e.target.closest('.payment-option');
    const service = paymentOption.dataset.service;
    const price = paymentOption.dataset.price;
    
    // Показать загрузку
    e.target.disabled = true;
    e.target.innerHTML = '<div class="loader"></div>';

    try {
        // Здесь будет интеграция с реальной платежной системой
        // Пример для ЮKassa
        await simulatePayment(service, price);
        
        alert(`Переход к оплате услуги на сумму ${price} ₽.\nВ реальной версии здесь будет интеграция с ЮKassa или другой платежной системой.`);
        
    } catch (error) {
        console.error('Ошибка при инициализации оплаты:', error);
        alert('Произошла ошибка при инициализации оплаты. Попробуйте еще раз.');
    } finally {
        // Вернуть кнопку в исходное состояние
        setTimeout(() => {
            e.target.disabled = false;
            e.target.innerHTML = 'Оплатить';
        }, 1000);
    }
}

// Симуляция оплаты (заменить на реальную интеграцию)
function simulatePayment(service, price) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Инициализация оплаты для ${service} на сумму ${price} ₽`);
            resolve();
        }, 1000);
    });
}

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

// Экспорт функций для глобального доступа
window.openDocumentModal = openDocumentModal;
window.getAppointmentData = getAppointmentData;
window.getReviewsData = getReviewsData;
window.updatePrices = updatePrices;

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