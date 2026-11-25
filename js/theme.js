(function () {
    const lightTheme = localStorage.getItem('pong_light_theme') === 'true';
    if (lightTheme) document.body.classList.add('light-theme');

    window.soundEnabled = localStorage.getItem('pong_sound_enabled') !== 'false';

    const st = document.getElementById('soundToggle');
    const tt = document.getElementById('themeToggle');
    if (st) st.checked = window.soundEnabled;
    if (tt) tt.checked = lightTheme;
})();