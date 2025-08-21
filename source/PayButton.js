function MYwait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function toggleInfo(infoId) {
    const infoElement = document.getElementById(infoId);

    if (infoElement.classList.contains('show')) {
        setTimeout(() => {
            infoElement.style.display = "none";
            infoElement.classList.remove('show');
        }, 500);
        infoElement.style.maxHeight = "0";
        infoElement.style.opacity = "0";
    } else {
        // Find any other element that has the 'show' class and perform an action
        const otherShowElement = document.querySelector('.show');
        if (otherShowElement) {
            console.log("Another element has 'show', performing action...");
            setTimeout(() => {
                otherShowElement.style.display = "none";
                otherShowElement.classList.remove('show');
            }, 500)
            otherShowElement.style.maxHeight = "0";
            otherShowElement.style.opacity = "0";
            await MYwait(500);
        }

        // Hide all payment info elements
        // document.querySelectorAll('.payment-info').forEach(info => {
        //     setTimeout(() => {
        //         info.style.display = "none";
        //         info.classList.remove('show');
        //     }, 500)
        //     info.style.display = "none";
        //     info.classList.remove('show');
        // });
        // Show the new element
        infoElement.classList.add('show');
        infoElement.style.display = "block";
        setTimeout(() => {
            infoElement.style.maxHeight = "400px";
            infoElement.style.opacity = "1";
        }, 100);
    }
}
