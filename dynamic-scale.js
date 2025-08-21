document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');

    if (!container) {
        console.error('Container element not found for dynamic scaling.');
        return;
    }

    // Define the breakpoints and corresponding scales from your CSS
    // You can adjust these points to fine-tune the scaling behavior
    // Define the breakpoints and corresponding scales
    const scalePoints = [
        { width: 992, scale: 0.8 },
        { width: 1920, scale: 1 },
        { width: 2400, scale: 1.6 },
        { width: 3840, scale: 2.5 },
        { width: 6000, scale: 3 },
        { width: 9000, scale: 6 }
    ];

    function calculateScale(width) {
        // Default scale for widths below the first breakpoint
        if (width < scalePoints[0].width) {
            return 1;
        }

        // Find the correct segment for linear interpolation
        for (let i = 0; i < scalePoints.length - 1; i++) {
            if (width >= scalePoints[i].width && width < scalePoints[i+1].width) {
                const lowerPoint = scalePoints[i];
                const upperPoint = scalePoints[i+1];
                
                const widthRange = upperPoint.width - lowerPoint.width;
                const scaleRange = upperPoint.scale - lowerPoint.scale;
                const widthFraction = (width - lowerPoint.width) / widthRange;

                // Interpolate to find the current scale
                return lowerPoint.scale + (widthFraction * scaleRange);
            }
        }

        // For widths beyond the last breakpoint, extrapolate based on the last segment's rate
        const lastPoint = scalePoints[scalePoints.length - 1];
        const secondLastPoint = scalePoints[scalePoints.length - 2];
        const lastRate = (lastPoint.scale - secondLastPoint.scale) / (lastPoint.width - secondLastPoint.width);
        return lastPoint.scale + (width - lastPoint.width) * lastRate;
    }

    function updateScale() {
        const windowWidth = window.innerWidth;
        const scale = calculateScale(windowWidth);
        container.style.transform = `scale(${scale})`;
    }

    // Set the initial scale when the page loads
    updateScale();

    // Update the scale whenever the window is resized
    window.addEventListener('resize', updateScale);
});