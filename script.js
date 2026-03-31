document.addEventListener('DOMContentLoaded', () => {


    const phoneDisplay = document.getElementById('phone-number');
    const phoneLink = document.getElementById('hotline-float');


    const phoneList = [
        { label: "0398273770", value: "0398273770" },

    ];

    let currentPhoneIndex = 0;

    if (phoneDisplay && phoneLink) {
        setInterval(() => {
            currentPhoneIndex = (currentPhoneIndex + 1) % phoneList.length;

            // Hiệu ứng fade cho số điện thoại
            phoneDisplay.classList.remove('number-fade');
            void phoneDisplay.offsetWidth; // Restart animation
            phoneDisplay.classList.add('number-fade');

            // Cập nhật số sau một chút để khớp hiệu ứng fade
            setTimeout(() => {
                phoneDisplay.innerText = phoneList[currentPhoneIndex].label;
                phoneLink.setAttribute('href', 'tel:' + phoneList[currentPhoneIndex].value);
            }, 100);
        }, 4000); // Nhảy số sau mỗi 4 giây
    }

    // --- 2. XỬ LÝ SLIDER (TỰ CHẠY) ---
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
            slideInterval = setInterval(nextSlide, 5000); // Chuyển slide sau 5 giây
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

    // --- 3. ĐÓNG SIDEBAR KHI CLICK CHỌN MỤC ---
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

    // --- 4. CUỘN TRANG MƯỢT MÀ (SMOOTH SCROLL) ---
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

    // --- Tự động làm nổi bật mục menu theo trang hiện tại ---

    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});

// Gộp 2 xử lý vào một hàm duy nhất
const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    // 1. Lấy thông tin thời gian chung
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('vi-VN') + " " + now.toLocaleDateString('vi-VN');

    // 2. Cấu hình các URL (Giữ nguyên của bạn)
    const googleSheetURL = 'https://script.google.com/macros/s/AKfycbwDjAIYdcdh_jtRpJ2EyWamSErYaZhql2L31UDHvUU-HdHGwltNFYFwqbfXMAfTsdk5hg/exec';
    const formspreeURL = "https://formspree.io/f/xdawrnkk";
    const botToken = "8603752192:AAE7c1E_urBShOVtOvGAVxKzhSFMG9b4W3M";
    const chatId = "6685083277";

    // 3. Phân loại dữ liệu dựa trên Form ID
    let name, phone, email, message;
    let requests = [];

    if (form.id === 'teleForm') {
        // --- XỬ LÝ CHO TELEGRAM ---
        name = form.querySelector('[name="Khách Hàng"]').value;
        phone = form.querySelector('[name="Số Điện Thoại"]').value;
        email = form.querySelector('[name="Email"]').value;
        message = form.querySelector('[name="Nội Dung"]').value || "Không có nội dung";

        const teleText = `🔔 KHÁCH TELEGRAM MỚI!\n━━━━━━━━━━━━━━━\n⏰: ${formattedTime}\n👤: ${name}\n📞: ${phone}\n📧: ${email}\n💬: ${message}`;
        const teleUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(teleText)}`;

        requests.push(fetch(teleUrl)); // Gửi Tele
    } else {
        // --- XỬ LÝ CHO EMAIL ---
        const formData = new FormData(form);
        name = formData.get('user_name');
        phone = formData.get('user_phone');
        email = formData.get('user_email');
        message = formData.get('user_message') || "Không có nội dung";

        requests.push(fetch(formspreeURL, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })); // Gửi Formspree
    }

    // 4. Chuẩn bị dữ liệu gửi Google Sheets (Cả 2 đều gửi về Sheet)
    const sheetParams = new URLSearchParams();
    sheetParams.append('time', formattedTime);
    sheetParams.append('name', name);
    sheetParams.append('phone', phone);
    sheetParams.append('email', email);
    sheetParams.append('message', message);

    requests.push(fetch(googleSheetURL, { method: 'POST', body: sheetParams, headers: { "Content-Type": "application/x-www-form-urlencoded" } }));

    // 5. Thực thi gửi tất cả đồng thời
    Promise.all(requests)
        .then(() => {
            Swal.fire({
                title: 'XIN CẢM ƠN',
                text: 'Thông tin của bạn đã được gửi thành công!',
                icon: 'success',
                confirmButtonColor: '#0084ff',
                background: '#1a1a1a',
                color: '#fff'
            }).then(() => {
                form.reset();
                window.location.href = "index.html";
            });
        })
        .catch(() => {
            Swal.fire('Lỗi!', 'Không thể gửi dữ liệu, vui lòng thử lại.', 'error');
        });
};

// Gán sự kiện cho cả 2 form (Email và Tele)
document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('emailForm');
    const teleForm = document.getElementById('teleForm');

    if (emailForm) emailForm.addEventListener('submit', handleFormSubmit);
    if (teleForm) teleForm.addEventListener('submit', handleFormSubmit);
});

function toggleContact(type) {
    const emailSection = document.getElementById('emailSection');
    const teleSection = document.getElementById('teleSection');
    const btnEmail = document.getElementById('btnEmail');
    const btnTele = document.getElementById('btnTele');

    if (type === 'email') {
        // Hiện Email - Ẩn Tele
        emailSection.classList.remove('d-none');
        teleSection.classList.add('d-none');

        // Cập nhật trạng thái nút bấm
        btnEmail.classList.add('active', 'btn-primary');
        btnEmail.classList.remove('btn-outline-primary');

        btnTele.classList.remove('active', 'btn-info');
        btnTele.classList.add('btn-outline-info');
    } else {
        // Hiện Tele - Ẩn Email
        teleSection.classList.remove('d-none');
        emailSection.classList.add('d-none');

        // Cập nhật trạng thái nút bấm
        btnTele.classList.add('active', 'btn-info');
        btnTele.classList.remove('btn-outline-info');

        btnEmail.classList.remove('active', 'btn-primary');
        btnEmail.classList.add('btn-outline-primary');
    }
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
    window.addEventListener('load', () => {
    // 1. Kiểm tra ngôn ngữ từ URL trước (Ví dụ: ?lang=lo)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    // 2. Lấy ngôn ngữ đã lưu từ localStorage
    let savedLang = localStorage.getItem("lang");

    if (langParam) {
        // Nếu trên link có ?lang= thì ưu tiên dùng nó và cập nhật lại bộ nhớ
        changeLang(langParam);
        localStorage.setItem("lang", langParam);
    } else if (savedLang && savedLang !== 'vi') {
        // Nếu không có trên link thì mới dùng ngôn ngữ đã lưu cũ
        changeLang(savedLang);
    }

    // Luôn kiểm tra để ẩn banner mỗi khi trang load
    setInterval(hideGoogleBanner, 500);
});

const boxes = document.querySelectorAll('.why-box');

window.addEventListener('scroll', () => {
  const trigger = window.innerHeight * 0.85;

  boxes.forEach(box => {
    const top = box.getBoundingClientRect().top;

    if (top < trigger) {
      box.style.opacity = 1;
      box.style.transform = "translateY(0)";
    }
  });
});

// mặc định ẩn
boxes.forEach(box => {
  box.style.opacity = 0;
  box.style.transform = "translateY(40px)";
  box.style.transition = "0.5s";
});
