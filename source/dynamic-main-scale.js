document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;

    function setScale() {
        const screenWidth = window.innerWidth;

        // Define breakpoints and their corresponding scales
        const breakpoints = [
            { width: 992, scale: 1.0 },
            { width: 3000, scale: 1.5 },
            { width: 6000, scale: 2.0 },
            { width: 9000, scale: 3.0 }
        ];

        // Default scale for screens smaller than the first breakpoint
        if (screenWidth < breakpoints[0].width) {
            body.style.transform = 'scale(1)';
            return;
        }

        // Find the two breakpoints the current screen width is between
        let lowerBound = breakpoints[0];
        let upperBound = breakpoints[breakpoints.length - 1];

        for (let i = 0; i < breakpoints.length - 1; i++) {
            if (screenWidth >= breakpoints[i].width && screenWidth < breakpoints[i + 1].width) {
                lowerBound = breakpoints[i];
                upperBound = breakpoints[i + 1];
                break;
            }
        }
        
        if(screenWidth >= breakpoints[breakpoints.length-1].width){
            lowerBound = breakpoints[breakpoints.length-1];
            upperBound = lowerBound;
        }


        // Linear interpolation
        const screenRange = upperBound.width - lowerBound.width;
        const scaleRange = upperBound.scale - lowerBound.scale;
        const scale = lowerBound.scale + ((screenWidth - lowerBound.width) / screenRange) * scaleRange;

        body.style.transform = `scale(${scale})`;
    }

    // Set scale on initial load and on window resize
    setScale();
    window.addEventListener('resize', setScale);
});