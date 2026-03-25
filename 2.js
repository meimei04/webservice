document.addEventListener('DOMContentLoaded', () => {

    // ================= 1. HOTLINE =================
    const phoneDisplay = document.getElementById('phone-number');
    const phoneLink = document.getElementById('hotline-float');

    const phoneList = [
        { label: "0398273770", value: "0398273770" },
    ];

    let currentPhoneIndex = 0;

    if (phoneDisplay && phoneLink) {
        setInterval(() => {
            currentPhoneIndex = (currentPhoneIndex + 1) % phoneList.length;

            phoneDisplay.classList.remove('number-fade');
            void phoneDisplay.offsetWidth;
            phoneDisplay.classList.add('number-fade');

            setTimeout(() => {
                phoneDisplay.innerText = phoneList[currentPhoneIndex].label;
                phoneLink.setAttribute('href', 'tel:' + phoneList[currentPhoneIndex].value);
            }, 100);
        }, 4000);
    }

    // ================= 2. SLIDER =================
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetInterval();
            });
        });

        startAutoSlide();
    }

    // ================= 3. SIDEBAR =================
    const sidebarElement = document.getElementById('sidebarLeft');
    const sidebarLinks = document.querySelectorAll('.offcanvas-body a');

    if (sidebarElement) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
                if (bsOffcanvas) bsOffcanvas.hide();
            });
        });
    }

    // ================= 4. SMOOTH SCROLL =================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== "#") {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ================= 5. ACTIVE MENU =================
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    // ================= 6. FORM =================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const now = new Date();
            const formattedTime = now.toLocaleTimeString('vi-VN') + " - " + now.toLocaleDateString('vi-VN');

            const formData = new FormData(this);

            const googleSheetURL = "https://script.google.com/macros/s/AKfycbwDjAIYdcdh_jtRpJ2EyWamSErYaZhql2L31UDHvUU-HdHGwltNFYFwqbfXMAfTsdk5hg/exec";
            const formspreeURL = "https://formspree.io/f/xdawrnkk";

            const sheetParams = new URLSearchParams();
            sheetParams.append('time', formattedTime);
            sheetParams.append('name', formData.get('user_name'));
            sheetParams.append('phone', formData.get('user_phone'));
            sheetParams.append('email', formData.get('user_email'));
            sheetParams.append('message', formData.get('user_message') || "Không có nội dung");

            Promise.all([
                fetch(formspreeURL, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } }),
                fetch(googleSheetURL, { method: 'POST', body: sheetParams, headers: { "Content-Type": "application/x-www-form-urlencoded" } })
            ]).then(responses => {
                if (responses[0].ok) {
                    Swal.fire({
                        title: 'XIN CẢM ƠN',
                        text: 'Thông tin đã được gửi!',
                        icon: 'success'
                    }).then(() => {
                        this.reset();
                        window.location.href = "index.html";
                    });
                }
            }).catch(() => Swal.fire('Lỗi!', 'Không gửi được!', 'error'));
        });
    }

    // ================= 7. GOOGLE TRANSLATE =================
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            // pageLanguage: 'vi',
            includedLanguages: 'vi,lo,my,km,th',
            autoDisplay: false
        }, 'google_translate_element');
    }

    function loadGoogleTranslate() {
        let script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
    }

    window.googleTranslateElementInit = googleTranslateElementInit;

    // Hàm quan trọng nhất: Quét và xóa banner liên tục khi nó vừa xuất hiện
    function hideGoogleBanner() {
        const banner = document.querySelector(".goog-te-banner-frame");
        if (banner) {
            banner.style.display = "none";
            banner.style.visibility = "hidden";
        }
        document.body.style.top = "0px";
        document.body.style.position = "static";
        document.documentElement.style.standard = "0px"; // Fix cho một số trình duyệt
    }


    function changeLang(lang) {
        if (!lang) return;
        localStorage.setItem("lang", lang);

        let checkExist = setInterval(() => {
            let select = document.querySelector(".goog-te-combo");
            if (select) {
                select.value = lang;
                select.dispatchEvent(new Event("change"));

                // Gọi hàm ẩn banner ngay khi dịch
                hideGoogleBanner();

                // Chạy thêm một vòng lặp nhỏ để đảm bảo nó không hiện lại sau 1s
                setTimeout(hideGoogleBanner, 500);
                setTimeout(hideGoogleBanner, 1000);

                clearInterval(checkExist);
            }
        }, 100);
    }

    window.changeLang = changeLang;
    loadGoogleTranslate();

    window.addEventListener('load', () => {
        let savedLang = localStorage.getItem("lang");
        if (savedLang && savedLang !== 'vi') {
            changeLang(savedLang);
        }
        // Luôn kiểm tra để ẩn banner mỗi khi trang load
        setInterval(hideGoogleBanner, 500);
    });
    (function () {
        var googleTranslateElement = document.querySelector('.goog-te-banner-frame');
        if (googleTranslateElement) {
            googleTranslateElement.parentNode.removeChild(googleTranslateElement);
        }
        document.body.style.top = '0px';
    })();



});