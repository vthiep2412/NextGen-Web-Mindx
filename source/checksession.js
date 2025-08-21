function checkSession() {
    try {
        const now = new Date().getTime();

        if (now > userSession.expiry) {
            // Phiên đã hết hạn, xóa dữ liệu và chuyển hướng về trang đăng nhập
            localStorage.removeItem('user_session');
            if(!location.pathname.endsWith('index.html')){
                location.href = location.pathname.replace(/[^\/]+$/, 'index.html');
            }
        } else { 
            console.log("Phiên còn hợp lệ");
            if(window.location.pathname.endsWith("index.html")){
                location.href = location.pathname.replace(/[^\/]+$/, 'main.html');
            }
            syncFirebaseCartToLocal();
            syncLocalCartToFirebase();
        }
    } catch (error){
        // Không có phiên, chuyển hướng về trang đăng nhập
        console.error(`Không có phiên: ${error}`);
        if(!location.pathname.endsWith('index.html')){
            location.href = location.pathname.replace(/[^\/]+$/, 'index.html');
        }
    }
}