(() => {
  const audio = document.querySelector('#audio');
  const musicShell = document.querySelector('#musicShell');
  const waveform = document.querySelector('#waveform');
  const playButton = document.querySelector('#playButton');
  const playIcon = document.querySelector('#playIcon');
  const pauseIcon = document.querySelector('#pauseIcon');
  const backButton = document.querySelector('#backButton');
  const forwardButton = document.querySelector('#forwardButton');
  const volumeButton = document.querySelector('#volumeButton');
  const volumeIcon = document.querySelector('#volumeIcon');
  const mutedIcon = document.querySelector('#mutedIcon');
  const progress = document.querySelector('#progress');
  const currentTimeLabel = document.querySelector('#currentTime');
  const durationLabel = document.querySelector('#duration');
  const playerStatus = document.querySelector('#playerStatus');

  const fallbackDuration = 170.48;
  const barHeights = [
    24, 36, 48, 64, 42, 72, 56, 84, 66, 38, 78, 92, 62, 46, 74, 54,
    88, 68, 44, 80, 58, 96, 70, 52, 86, 64, 40, 76, 50, 68, 34, 58,
  ];

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return '00:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getDuration = () =>
    Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : fallbackDuration;

  const updateProgress = () => {
    const duration = getDuration();
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    progress.max = String(duration);
    progress.value = String(currentTime);
    progress.style.setProperty('--progress', `${Math.min(percentage, 100)}%`);
    progress.setAttribute(
      'aria-valuetext',
      `${formatTime(currentTime)} / ${formatTime(duration)}`,
    );
    currentTimeLabel.textContent = formatTime(currentTime);
    durationLabel.textContent = formatTime(duration);
  };

  const setPlayingState = (isPlaying) => {
    musicShell.dataset.playing = String(isPlaying);
    waveform.dataset.playing = String(isPlaying);
    playIcon.hidden = isPlaying;
    pauseIcon.hidden = !isPlaying;
    playButton.setAttribute('aria-label', isPlaying ? '일시정지' : '재생');
    playerStatus.textContent = isPlaying ? '음악 재생 중' : '음악 일시 정지';
  };

  const togglePlayback = async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlayingState(false);
        playerStatus.textContent = '브라우저에서 음악 재생을 허용해주세요.';
      }
    } else {
      audio.pause();
    }
  };

  const seekTo = (value) => {
    const duration = getDuration();
    audio.currentTime = Math.min(Math.max(value, 0), duration);
    updateProgress();
  };

  barHeights.forEach((height, index) => {
    const bar = document.createElement('span');
    bar.className = 'wave-bar';
    bar.style.setProperty('--bar-height', `${height}%`);
    bar.style.setProperty('--bar-delay', `${index * -0.065}s`);
    waveform.appendChild(bar);
  });

  playButton.addEventListener('click', togglePlayback);
  backButton.addEventListener('click', () => seekTo(audio.currentTime - 10));
  forwardButton.addEventListener('click', () => seekTo(audio.currentTime + 10));

  progress.addEventListener('input', () => seekTo(Number(progress.value)));

  volumeButton.addEventListener('click', () => {
    audio.muted = !audio.muted;
    volumeIcon.hidden = audio.muted;
    mutedIcon.hidden = !audio.muted;
    volumeButton.setAttribute('aria-label', audio.muted ? '소리 켜기' : '음소거');
    volumeButton.setAttribute('aria-pressed', String(audio.muted));
    playerStatus.textContent = audio.muted ? '음소거됨' : '소리 켜짐';
  });

  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('durationchange', updateProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('play', () => setPlayingState(true));
  audio.addEventListener('pause', () => setPlayingState(false));
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    setPlayingState(false);
    updateProgress();
    playerStatus.textContent = '재생이 끝났습니다.';
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isInteractive =
      target instanceof HTMLElement &&
      ['BUTTON', 'INPUT', 'A', 'TEXTAREA', 'SELECT'].includes(target.tagName);

    if (event.code === 'Space' && !isInteractive) {
      event.preventDefault();
      togglePlayback();
    }
  });

  updateProgress();
})();
