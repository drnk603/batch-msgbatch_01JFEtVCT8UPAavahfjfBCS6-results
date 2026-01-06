(function() {
    'use strict';

    const AppController = {
        initialized: false,
        modules: new Map(),

        init() {
            if (this.initialized) return;
            
            this.initScrollSpy();
            this.initSmoothScroll();
            this.initBurgerMenu();
            this.initFormValidation();
            this.initIntersectionObserver();
            this.initScrollAnimations();
            this.initButtonEffects();
            this.initImageAnimations();
            this.initCountUp();
            this.initScrollToTop();
            this.initPrivacyModal();
            this.initNetworkCheck();
            this.initHoneypot();
            
            this.initialized = true;
        },

        initScrollSpy() {
            if (this.modules.has('scrollSpy')) return;

            const navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');
            if (!navLinks.length) return;

            const sections = Array.from(navLinks).map(link => {
                const href = link.getAttribute('href');
                return document.querySelector(href);
            }).filter(Boolean);

            if (!sections.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navLinks.forEach(link => {
                            link.classList.remove('active', 'is-active');
                            if (link.getAttribute('href') === `#${entry.target.id}`) {
                                link.classList.add('active', 'is-active');
                            }
                        });
                    }
                });
            }, {
                rootMargin: '-80px 0px -80% 0px',
                threshold: 0
            });

            sections.forEach(section => observer.observe(section));
            this.modules.set('scrollSpy', observer);
        },

        initSmoothScroll() {
            if (this.modules.has('smoothScroll')) return;

            document.addEventListener('click', (e) => {
                const target = e.target.closest('a[href^="#"]');
                if (!target) return;

                const href = target.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetElement = document.querySelector(href);
                if (!targetElement) return;

                e.preventDefault();
                
                const headerHeight = document.querySelector('.l-header')?.offsetHeight || 72;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                const burgerMenu = document.querySelector('.c-nav.is-open');
                if (burgerMenu) {
                    this.closeBurgerMenu();
                }
            });

            this.modules.set('smoothScroll', true);
        },

        initBurgerMenu() {
            if (this.modules.has('burgerMenu')) return;

            const toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
            const nav = document.querySelector('.navbar-collapse, .c-nav');
            
            if (!toggle || !nav) return;

            const overlay = document.createElement('div');
            overlay.className = 'burger-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: var(--header-height, 72px);
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0);
                backdrop-filter: blur(0px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 999;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);

            const menu = nav.querySelector('.navbar-nav, .c-nav__list');
            if (menu) {
                menu.style.cssText = `
                    transform: translateX(-100%);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                `;
            }

            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = nav.classList.contains('show') || nav.classList.contains('is-open');
                
                if (isOpen) {
                    this.closeBurgerMenu();
                } else {
                    this.openBurgerMenu();
                }
            });

            overlay.addEventListener('click', () => {
                this.closeBurgerMenu();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeBurgerMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    this.closeBurgerMenu();
                }
            });

            this.modules.set('burgerMenu', { toggle, nav, overlay, menu });
        },

        openBurgerMenu() {
            const module = this.modules.get('burgerMenu');
            if (!module) return;

            const { toggle, nav, overlay, menu } = module;

            nav.classList.add('show', 'is-open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';

            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.background = 'rgba(0, 0, 0, 0.5)';
            overlay.style.backdropFilter = 'blur(4px)';
            overlay.style.pointerEvents = 'auto';

            if (menu) {
                menu.style.transform = 'translateX(0)';
            }

            requestAnimationFrame(() => {
                const firstLink = menu?.querySelector('.nav-link, .c-nav__link');
                if (firstLink) {
                    firstLink.focus();
                }
            });
        },

        closeBurgerMenu() {
            const module = this.modules.get('burgerMenu');
            if (!module) return;

            const { toggle, nav, overlay, menu } = module;

            nav.classList.remove('show', 'is-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';

            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.background = 'rgba(0, 0, 0, 0)';
            overlay.style.backdropFilter = 'blur(0px)';
            overlay.style.pointerEvents = 'none';

            if (menu) {
                menu.style.transform = 'translateX(-100%)';
            }
        },

        initFormValidation() {
            if (this.modules.has('formValidation')) return;

            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                const honeypot = document.createElement('input');
                honeypot.type = 'text';
                honeypot.name = 'website';
                honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
                honeypot.tabIndex = -1;
                honeypot.setAttribute('autocomplete', 'off');
                form.appendChild(honeypot);

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    if (honeypot.value) {
                        console.warn('Spam detected');
                        return;
                    }

                    this.validateForm(form);
                });

                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => {
                        this.validateField(input);
                    });

                    input.addEventListener('input', () => {
                        if (input.classList.contains('is-invalid')) {
                            this.validateField(input);
                        }
                    });
                });
            });

            this.modules.set('formValidation', true);
        },

        validateField(field) {
            const fieldName = field.name || field.id;
            let isValid = true;
            let errorMessage = '';

            this.clearFieldError(field);

            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errorMessage = `Поле "${this.getFieldLabel(field)}" обязательно для заполнения`;
            } else if (field.type === 'email' && field.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value.trim())) {
                    isValid = false;
                    errorMessage = 'Введите корректный email адрес (например: example@domain.com)';
                }
            } else if (field.type === 'tel' && field.value.trim()) {
                const phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
                if (!phonePattern.test(field.value.trim())) {
                    isValid = false;
                    errorMessage = 'Введите корректный номер телефона (10-20 символов, только цифры, +, -, (, ))';
                }
            } else if (field.tagName === 'TEXTAREA' && field.value.trim() && field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Сообщение должно содержать не менее 10 символов';
            } else if (field.type === 'text' && field.hasAttribute('required')) {
                const namePattern = /^[a-zA-ZА-Яа-яЁёÀ-ÿ\s\-']{2,50}$/;
                if (!namePattern.test(field.value.trim())) {
                    isValid = false;
                    errorMessage = 'Введите корректное имя (2-50 символов, только буквы, пробелы, дефис и апостроф)';
                }
            } else if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                errorMessage = 'Необходимо согласие с условиями';
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        },

        validateForm(form) {
            let isValid = true;
            const fields = form.querySelectorAll('input:not([name="website"]), textarea, select');
            
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (isValid) {
                this.submitForm(form);
            } else {
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalid.focus();
                }
            }
        },

        submitForm(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Отправка...';

            const formData = new FormData(form);
            formData.delete('website');

            setTimeout(() => {
                if (!navigator.onLine) {
                    this.showNotification('Ошибка соединения. Проверьте подключение к интернету и попробуйте позже.', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    return;
                }

                window.location.href = 'thank_you.html';
            }, 1500);
        },

        showFieldError(field, message) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');

            let errorElement = field.parentElement.querySelector('.invalid-feedback, .c-form__error');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = field.classList.contains('c-form__input') ? 'c-form__error' : 'invalid-feedback';
                field.parentElement.appendChild(errorElement);
            }

            errorElement.textContent = message;
            errorElement.style.display = 'block';
        },

        clearFieldError(field) {
            field.classList.remove('is-invalid');
            const errorElement = field.parentElement.querySelector('.invalid-feedback, .c-form__error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        },

        getFieldLabel(field) {
            const label = field.parentElement.querySelector('label');
            if (label) return label.textContent.replace('*', '').trim();
            
            const placeholder = field.getAttribute('placeholder');
            if (placeholder) return placeholder;
            
            return field.name || field.id || 'Поле';
        },

        initIntersectionObserver() {
            if (this.modules.has('intersectionObserver')) return;

            const animatedElements = document.querySelectorAll('.card, .c-card, .btn, .c-button, img, .feature-card');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            animatedElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                observer.observe(element);
            });

            this.modules.set('intersectionObserver', observer);
        },

        initScrollAnimations() {
            if (this.modules.has('scrollAnimations')) return;

            const header = document.querySelector('.l-header');
            if (!header) return;

            let lastScroll = 0;

            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }

                lastScroll = currentScroll;
            }, { passive: true });

            this.modules.set('scrollAnimations', true);
        },

        initButtonEffects() {
            if (this.modules.has('buttonEffects')) return;

            const buttons = document.querySelectorAll('.btn, .c-button, a[class*="btn"]');

            buttons.forEach(button => {
                button.style.position = 'relative';
                button.style.overflow = 'hidden';

                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '';
                });

                button.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        left: ${x}px;
                        top: ${y}px;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                    `;

                    this.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });

            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);

            const links = document.querySelectorAll('a:not([class*="btn"])');
            links.forEach(link => {
                link.style.transition = 'all 0.3s ease-in-out';
                
                link.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(3px)';
                });

                link.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                });
            });

            this.modules.set('buttonEffects', true);
        },

        initImageAnimations() {
            if (this.modules.has('imageAnimations')) return;

            const images = document.querySelectorAll('img[loading="lazy"]');

            images.forEach(img => {
                if (!img.complete) {
                    img.style.opacity = '0';
                    img.style.transform = 'scale(0.95)';
                    img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

                    img.addEventListener('load', function() {
                        this.style.opacity = '1';
                        this.style.transform = 'scale(1)';
                    });
                }
            });

            this.modules.set('imageAnimations', true);
        },

        initCountUp() {
            if (this.modules.has('countUp')) return;

            const counters = document.querySelectorAll('[data-count]');
            if (!counters.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.counted) {
                        this.animateCounter(entry.target);
                        entry.target.dataset.counted = 'true';
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));

            this.modules.set('countUp', observer);
        },

        animateCounter(element) {
            const target = parseInt(element.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        },

        initScrollToTop() {
            if (this.modules.has('scrollToTop')) return;

            const scrollBtn = document.createElement('button');
            scrollBtn.innerHTML = '↑';
            scrollBtn.className = 'scroll-to-top';
            scrollBtn.setAttribute('aria-label', 'Scroll to top');
            scrollBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--color-primary, #0071E3);
                color: white;
                border: none;
                font-size: 24px;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease-in-out;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;

            document.body.appendChild(scrollBtn);

            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                }
            }, { passive: true });

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            scrollBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            });

            scrollBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            });

            this.modules.set('scrollToTop', scrollBtn);
        },

        initPrivacyModal() {
            if (this.modules.has('privacyModal')) return;

            const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
            
            privacyLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#privacy' || link.getAttribute('href') === 'privacy') {
                        e.preventDefault();
                        this.showPrivacyModal();
                    }
                });
            });

            this.modules.set('privacyModal', true);
        },

        showPrivacyModal() {
            const modal = document.createElement('div');
            modal.className = 'privacy-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                animation: fadeIn 0.3s ease-out;
            `;

            modal.innerHTML = `
                <div class="privacy-modal-content" style="
                    background: white;
                    border-radius: 16px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    padding: 32px;
                    position: relative;
                    animation: slideUp 0.3s ease-out;
                ">
                    <button class="privacy-modal-close" style="
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        background: transparent;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #666;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.2s;
                    ">×</button>
                    <h2 style="margin-bottom: 20px;">Политика конфиденциальности</h2>
                    <p>Нажимая на кнопку отправки формы, вы соглашаетесь с нашей политикой конфиденциальности.</p>
                    <p>Мы обязуемся защищать вашу конфиденциальность и обрабатывать ваши персональные данные в соответствии с законодательством.</p>
                    <div style="margin-top: 24px; display: flex; gap: 12px;">
                        <a href="privacy.html" class="btn btn-primary" style="flex: 1; text-align: center;">Подробнее</a>
                        <button class="btn btn-outline-primary privacy-modal-accept" style="flex: 1;">Принять</button>
                    </div>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .privacy-modal-close:hover {
                    background: #f0f0f0;
                    color: #000;
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(modal);

            const closeModal = () => {
                modal.style.animation = 'fadeIn 0.3s ease-out reverse';
                setTimeout(() => modal.remove(), 300);
            };

            modal.querySelector('.privacy-modal-close').addEventListener('click', closeModal);
            modal.querySelector('.privacy-modal-accept').addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        },

        initNetworkCheck() {
            if (this.modules.has('networkCheck')) return;

            window.addEventListener('online', () => {
                this.showNotification('Соединение восстановлено', 'success');
            });

            window.addEventListener('offline', () => {
                this.showNotification('Отсутствует подключение к интернету', 'error');
            });

            this.modules.set('networkCheck', true);
        },

        initHoneypot() {
            if (this.modules.has('honeypot')) return;
            this.modules.set('honeypot', true);
        },

        showNotification(message, type = 'info') {
            let container = document.querySelector('.notification-container');
            
            if (!container) {
                container = document.createElement('div');
                container.className = 'notification-container';
                container.style.cssText = `
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                `;
                document.body.appendChild(container);
            }

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            
            const colors = {
                success: '#34C759',
                error: '#FF3B30',
                warning: '#FF9500',
                info: '#007AFF'
            };

            notification.style.cssText = `
                background: white;
                color: #1D1D1F;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-left: 4px solid ${colors[type] || colors.info};
                min-width: 300px;
                max-width: 400px;
                pointer-events: auto;
                animation: slideInRight 0.3s ease-out;
                display: flex;
                align-items: center;
                gap: 12px;
            `;

            notification.innerHTML = `
                <span style="font-size: 20px;">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span style="flex: 1;">${message}</span>
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            if (!document.querySelector('style[data-notification]')) {
                style.setAttribute('data-notification', '');
                document.head.appendChild(style);
            }

            container.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AppController.init());
    } else {
        AppController.init();
    }

    window.AppController = AppController;

})();
