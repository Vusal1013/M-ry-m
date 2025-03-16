document.addEventListener('DOMContentLoaded', () => {
    // Mesaj zamanlaması ayarları (milisaniye cinsinden)
    const CONFIG = {
        normalMessageDuration: 2000,    // Normal mesajların görünme süresi
        linkMessageDuration: 6000,      // Link içeren mesajların görünme süresi
        typingSpeed: 100,              // Yazma hızı (her karakter arası süre)
        fadeSpeed: 50                  // Solma efekti hızı
    };

    const messages = [
        "Sən mənim  hələlik ən dəyərli dostumsan! ❤️",
        "Səninlə keçirdiyim hər an çok dəyərlidir! ❤️",
        "3 ilin hardasa toplasan 5 ayını danışmısıq, bunun uzun müddət davam etməyini istəyirəm.💗",
        "İllər sonra birinə güvənib sənə dəyər vermək istəyirəm.💗",
        "Buda məndən sənə bir iltifat, sıra səndədir gözəllik 💝",
        '<a href="https://wa.me/+994504527994" target="_blank" class="message-link">WhatsApp\'tan mesaj at! 💝</a>'
    ];
    let currentMessageIndex = 0;
    const typingText = document.querySelector('.typing-text');
    const floatingHeartsContainer = document.querySelector('.floating-hearts');
    const sparksContainer = document.getElementById('sparks');
    let charIndex = 0;
    let isTyping = true;
    let currentTimeout = null;
    let fadeInterval = null;

    // Performance optimization for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const heartCreationInterval = isMobile ? 500 : 300;
    const sparkCreationInterval = isMobile ? 200 : 100;
    const maxSimultaneousSparks = isMobile ? 3 : 5;

    // Temizleme fonksiyonu
    function cleanup() {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
        }
        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
    }

    // Typing animation
    function typeText() {
        cleanup(); // Önceki zamanlayıcıları temizle
        if (!isTyping) return;

        const currentMessage = messages[currentMessageIndex];
        
        // HTML içeriği varsa direkt göster
        if (currentMessage.includes('<a')) {
            typingText.innerHTML = currentMessage;
            charIndex = currentMessage.length;
            currentTimeout = setTimeout(() => {
                if (isTyping) {
                    fadeOutText(() => {
                        typingText.innerHTML = '';
                        charIndex = 0;
                        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
                        typeText();
                    });
                }
            }, CONFIG.linkMessageDuration);
            return;
        }

        // Normal metin için karakter karakter yaz
        if (charIndex < currentMessage.length) {
            typingText.textContent += currentMessage.charAt(charIndex);
            charIndex++;
            currentTimeout = setTimeout(typeText, CONFIG.typingSpeed);
        } else {
            currentTimeout = setTimeout(() => {
                if (isTyping) {
                    fadeOutText(() => {
                        typingText.textContent = '';
                        charIndex = 0;
                        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
                        typeText();
                    });
                }
            }, CONFIG.normalMessageDuration);
        }
    }

    function fadeOutText(callback) {
        cleanup(); // Önceki efektleri temizle
        let opacity = 1;
        typingText.style.opacity = opacity;
        
        fadeInterval = setInterval(() => {
            if (opacity > 0 && isTyping) {
                opacity -= 0.1;
                typingText.style.opacity = opacity;
            } else {
                clearInterval(fadeInterval);
                fadeInterval = null;
                typingText.style.opacity = 1;
                if (callback && isTyping) {
                    setTimeout(callback, 100); // Kısa bir gecikme ekle
                }
            }
        }, CONFIG.fadeSpeed);
    }

    // Create floating hearts with performance optimization
    function createFloatingHeart(x = null, y = null) {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = ['❤️', '💖', '💝', '💗'][Math.floor(Math.random() * 4)];
        
        if (x !== null && y !== null) {
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
        } else {
            heart.style.left = Math.random() * 100 + 'vw';
        }
        
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        floatingHeartsContainer.appendChild(heart);

        const cleanup = () => {
            heart.remove();
            heart.removeEventListener('animationend', cleanup);
        };
        heart.addEventListener('animationend', cleanup);
    }

    // Create sparks with performance optimization
    function createSpark(x = null, y = null) {
        const spark = document.createElement('div');
        spark.classList.add('spark');
        
        if (x !== null && y !== null) {
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
        } else {
            spark.style.left = Math.random() * 100 + 'vw';
        }
        
        spark.style.setProperty('--x', (Math.random() * 100 - 50) + 'px');
        sparksContainer.appendChild(spark);

        const cleanup = () => {
            spark.remove();
            spark.removeEventListener('animationend', cleanup);
        };
        spark.addEventListener('animationend', cleanup);
    }

    // Event handlers for both mouse and touch
    function handleInteraction(e) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        createFloatingHeart(x, y);
        
        for (let i = 0; i < maxSimultaneousSparks; i++) {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    createSpark(x, y);
                }
            }, i * 100);
        }
    }

    // Start animations
    typeText();
    
    // Create background elements only when page is visible
    let heartInterval, sparkInterval;
    
    function startBackgroundAnimations() {
        if (document.visibilityState === 'visible') {
            heartInterval = setInterval(createFloatingHeart, heartCreationInterval);
            sparkInterval = setInterval(createSpark, sparkCreationInterval);
        }
    }
    
    function stopBackgroundAnimations() {
        clearInterval(heartInterval);
        clearInterval(sparkInterval);
    }

    // Sayfadan ayrılma veya sekme değiştirme durumunda temizlik yap
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            isTyping = true;
            cleanup();
            startBackgroundAnimations();
            if (!typingText.textContent) {
                charIndex = 0;
                typeText();
            }
        } else {
            isTyping = false;
            cleanup();
            stopBackgroundAnimations();
        }
    });

    // Hata durumunda kurtarma
    window.addEventListener('error', () => {
        cleanup();
        isTyping = true;
        charIndex = 0;
        currentMessageIndex = 0;
        typingText.textContent = '';
        typingText.style.opacity = 1;
        setTimeout(typeText, 1000);
    });

    // Start background animations initially
    startBackgroundAnimations();

    // Add event listeners for both mouse and touch
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction, { passive: true });
}); 
