document.addEventListener('DOMContentLoaded', function() {
    // Переключение между вкладками
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Валидация формы регистрации
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm').value;
        const terms = document.getElementById('terms').checked;
        
        let isValid = true;
        
        // Сброс сообщений об ошибках
        document.querySelectorAll('#register-form .error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Проверка имени пользователя
        if (username.length < 3) {
            showError('reg-username', 'Имя пользователя должно содержать минимум 3 символа');
            isValid = false;
        }
        
        // Проверка email
        if (!isValidEmail(email)) {
            showError('reg-email', 'Введите корректный email адрес');
            isValid = false;
        }
        
        // Проверка пароля
        if (password.length < 8) {
            showError('reg-password', 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        }
        
        // Проверка подтверждения пароля
        if (password !== confirmPassword) {
            showError('reg-confirm', 'Пароли не совпадают');
            isValid = false;
        }
        
        // Проверка принятия условий
        if (!terms) {
            showError('terms', 'Необходимо принять условия использования');
            isValid = false;
        }
        
        if (isValid) {
            // Сохраняем данные пользователя
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                email: email
            }));
            
            // Перенаправляем на страницу игры
            window.location.href = 'index.html';
        }
    });
    
    // Валидация формы входа
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        let isValid = true;
        
        // Сброс сообщений об ошибках
        document.querySelectorAll('#login-form .error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Проверка имени пользователя
        if (username.length === 0) {
            showError('login-username', 'Введите имя пользователя или email');
            isValid = false;
        }
        
        // Проверка пароля
        if (password.length === 0) {
            showError('login-password', 'Введите пароль');
            isValid = false;
        }
        
        if (isValid) {
            // Сохраняем данные пользователя
            localStorage.setItem('currentUser', JSON.stringify({
                username: username
            }));
            
            // Перенаправляем на страницу игры
            window.location.href = 'index.html';
        }
    });
    
    // Функция для проверки email
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Функция для показа ошибок
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = input.parentNode.querySelector('.error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Добавляем класс ошибки к полю ввода
        input.style.borderColor = 'var(--fail)';
        
        // Убираем класс ошибки при следующем вводе
        input.addEventListener('input', function() {
            this.style.borderColor = 'var(--border)';
            errorElement.style.display = 'none';
        }, { once: true });
    }
});