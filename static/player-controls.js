document.addEventListener('DOMContentLoaded', () => {
    const videoFrame = document.querySelector('.video-frame');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const qualitySelect = document.getElementById('quality-select');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Handle fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (videoFrame.requestFullscreen) {
            videoFrame.requestFullscreen();
        } else if (videoFrame.webkitRequestFullscreen) {
            videoFrame.webkitRequestFullscreen();
        }
    });
    
    // Handle quality change
    qualitySelect.addEventListener('change', (e) => {
        const currentSrc = videoFrame.src;
        const newSrc = currentSrc.split('?')[0] + `?quality=${e.target.value}`;
        videoFrame.src = newSrc;
    });
    
    // Handle volume change
    volumeSlider.addEventListener('input', (e) => {
        try {
            videoFrame.contentWindow.postMessage({
                event: 'volumechange',
                volume: e.target.value
            }, '*');
        } catch (e) {
            console.log('Volume control not available');
        }
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'f':
                fullscreenBtn.click();
                break;
            case 'm':
                volumeSlider.value = volumeSlider.value > 0 ? 0 : 1;
                volumeSlider.dispatchEvent(new Event('input'));
                break;
            case ' ':
                // Spacebar play/pause
                e.preventDefault();
                break;
        }
    });
});
