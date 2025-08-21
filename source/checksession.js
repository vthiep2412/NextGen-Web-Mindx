function checkSession() {
    try {
        const now = new Date().getTime();

        if (now > userSession.expiry) {
            // Phiên đã hết hạn, xóa dữ liệu và chuyển hướng về trang đăng nhập
            localStorage.removeItem('user_session');
            if(window.location.href != "http://127.0.0.1:5500/coffee/index.html"){
                window.location.href = "/coffee/index.html";
            }
        } else {
            console.log("Phiên còn hợp lệ");
            if(window.location.href == "http://127.0.0.1:5500/coffee/index.html"){
                window.location.href = 'main.html';
            }
            syncFirebaseCartToLocal();
            syncLocalCartToFirebase();
        }
    } catch (error){
        // Không có phiên, chuyển hướng về trang đăng nhập
        console.error(`Không có phiên: ${error}`);
        if(window.location.href != "http://127.0.0.1:5500/coffee/index.html"){
            window.location.href = "/coffee/index.html";
        }
    }
}