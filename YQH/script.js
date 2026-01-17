// 全局变量定义（统一管理定时器和状态）
let countdownTimer; // 倒计时定时器
let photoTimer; // 照片轮播定时器
let snowflakes = []; // 雪花数组
let isMusicPlaying = false; // 音乐播放状态
let confettiTimer; // 礼花定时定时器

// 一、页面加载完成后执行所有初始化逻辑（音乐优先初始化，确保自动播放）
window.onload = function() {
    initConfetti(); // 礼花初始化（随机效果，适配微信）
    initSnowflakes(); // 雪花初始化（真实飘舞，不卡顿）
    initMusic(); // 音乐优先初始化，实现自动播放
    // 修改此处：年会目标时间（格式：年, 月-1, 日, 时, 分, 秒）
    // 示例：2026, 1, 20, 14, 30, 00 对应 2026年2月20日14:30
    initCountdown(new Date(2026, 1, 20, 14, 30, 0)); 
    initPhotoSlider(); // 照片轮播（自适应，不变形）
};

// 二、随机礼花绽放效果（优化：微信端性能友好，不卡顿）
function initConfetti() {
    // 丰富礼花颜色库，增强节日氛围
    const confettiColors = [
        '#FF3366', '#33CCFF', '#FFCC00', '#9966FF', '#33FF66', 
        '#FF9933', '#CC33FF', '#33FFCC', '#FF6633', '#FFFFFF'
    ];

    // 随机取3-6种颜色组合，每次礼花效果不同
    const getRandomColors = () => {
        const count = Math.floor(Math.random() * 4) + 3;
        const shuffled = [...confettiColors].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // 礼花绽放核心函数（优化粒子数，适配微信端）
    const launchConfetti = () => {
        // 微信端优化：减少粒子数，避免卡顿
        const particleCount = Math.floor(Math.random() * 80) + 120;
        const spread = Math.floor(Math.random() * 40) + 60;
        const gravity = Math.random() * 0.4 + 0.6;
        const ticks = Math.floor(Math.random() * 40) + 160;
        const originX = 0.5 + (Math.random() * 0.2 - 0.1); // 随机水平位置

        confetti({
            particleCount: particleCount,
            spread: spread,
            colors: getRandomColors(),
            origin: { x: originX, y: 0.8 }, // 底部绽放，更贴合视觉
            gravity: gravity,
            ticks: ticks,
            scalar: Math.random() * 0.3 + 0.7, // 粒子大小优化
            drift: Math.random() * 1.5 - 0.75, // 减少漂移，降低性能消耗
            disableForReducedMotion: true // 适配低性能设备
        });
    };

    // 页面加载立即绽放一次
    launchConfetti();
    // 微信端优化：延长礼花间隔，6秒一次，减少性能消耗
    confettiTimer = setInterval(launchConfetti, 6000);
}

// 三、随机雪花飘舞效果（优化：微信端流畅，不占用过多资源）
function initSnowflakes() {
    // 多种雪花形状，增强视觉丰富度
    const snowShapes = ['❄', '❅', '❆', '✻', '✼'];

    // 创建单个雪花（随机样式，适配不同屏幕）
    const createSnowflake = () => {
        const snowflake = document.createElement('div');
        const shape = snowShapes[Math.floor(Math.random() * snowShapes.length)];
        const size = Math.random() * 8 + 4; // 缩小雪花尺寸，微信端更精致
        const opacity = Math.random() * 0.5 + 0.4; // 透明度优化，不刺眼
        const speed = Math.random() * 1.5 + 0.8; // 降低飘落速度，更流畅
        const drift = Math.random() * 1.2 - 0.6; // 减少漂移，降低性能消耗
        const rotateSpeed = Math.random() * 1.5 - 0.75; // 旋转速度优化

        // 雪花样式赋值
        snowflake.style.position = 'absolute';
        snowflake.style.color = '#ffffff';
        snowflake.style.fontSize = `${size}px`;
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.top = '-20px';
        snowflake.style.zIndex = '10';
        snowflake.style.userSelect = 'none';
        snowflake.style.opacity = opacity;
        snowflake.style.transition = 'transform 0.1s linear';
        snowflake.innerHTML = shape;

        // 存储雪花状态，用于动画更新
        let x = parseFloat(snowflake.style.left) / 100 * window.innerWidth;
        let y = -20;
        let rotate = 0;

        snowflakes.push({
            element: snowflake,
            x,
            y,
            size,
            speed,
            drift,
            rotate,
            rotateSpeed
        });

        document.body.appendChild(snowflake);
    };

    // 微信端优化：减少雪花数量，按屏幕宽度适配，不卡顿
    const snowCount = Math.floor(window.innerWidth / 12);
    for (let i = 0; i < snowCount; i++) {
        setTimeout(createSnowflake, Math.random() * 2000); // 分批生成，避免瞬间加载
    }

    // 雪花动画（使用requestAnimationFrame，微信端更流畅）
    const animateSnowflakes = () => {
        snowflakes.forEach((snow, index) => {
            // 更新雪花位置（飘落+漂移）
            snow.y += snow.speed;
            snow.x += snow.drift;
            // 更新旋转角度
            snow.rotate += snow.rotateSpeed;

            // 应用样式到DOM
            snow.element.style.left = `${snow.x}px`;
            snow.element.style.top = `${snow.y}px`;
            snow.element.style.transform = `rotate(${snow.rotate}deg)`;

            // 雪花出界后移除并重新创建，循环动画
            if (snow.y > window.innerHeight || snow.x < -50 || snow.x > window.innerWidth + 50) {
                document.body.removeChild(snow.element);
                snowflakes.splice(index, 1);
                createSnowflake();
            }
        });
        requestAnimationFrame(animateSnowflakes);
    };

    animateSnowflakes();

    // 窗口大小改变时，重新调整雪花（适配屏幕旋转，微信端常见）
    window.addEventListener('resize', () => {
        snowflakes.forEach(snow => document.body.removeChild(snow.element));
        snowflakes = [];
        initSnowflakes();
    });
}

// 四、核心：音乐自动播放 + 手动暂停（解决微信端播放限制）
function initMusic() {
    const bgm = document.getElementById('bgm');
    const musicToggle = document.getElementById('musicToggle');

    // 方案1：页面加载后立即尝试自动播放（PC端/部分浏览器直接生效）
    const autoPlayMusic = () => {
        bgm.play().then(() => {
            isMusicPlaying = true;
            musicToggle.innerHTML = '🎵 暂停背景音乐';
            console.log('音乐自动播放成功');
        }).catch(err => {
            console.log('自动播放失败，等待用户交互触发（微信端正常现象）：', err);
            musicToggle.innerHTML = '🎵 点击播放音乐';
        });
    };

    // 立即执行自动播放，优先实现无交互播放
    autoPlayMusic();

    // 方案2：微信端兼容 - 触摸/点击任意位置触发播放（备用方案，解决微信限制）
    const playMusicOnInteraction = () => {
        if (!isMusicPlaying) {
            bgm.play().then(() => {
                isMusicPlaying = true;
                musicToggle.innerHTML = '🎵 暂停背景音乐';
            }).catch(err => {
                console.log('用户交互触发播放失败：', err);
            });
        }
        // 移除事件，避免重复触发
        document.removeEventListener('touchstart', playMusicOnInteraction);
        document.removeEventListener('click', playMusicOnInteraction);
    };

    // 同时监听触摸（移动端/微信）和点击（桌面端）事件，确保兼容性
    document.addEventListener('touchstart', playMusicOnInteraction, { once: true });
    document.addEventListener('click', playMusicOnInteraction, { once: true });

    // 手动暂停/播放切换，状态同步更新
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgm.pause();
            isMusicPlaying = false;
            musicToggle.innerHTML = '🎵 播放背景音乐';
        } else {
            bgm.play().then(() => {
                isMusicPlaying = true;
                musicToggle.innerHTML = '🎵 暂停背景音乐';
            }).catch(err => {
                alert('音乐播放失败，请检查音频文件或浏览器权限');
                console.log('音乐播放失败：', err);
            });
        }
    });
}

// 五、年会倒计时功能（精准计算，微信端实时更新）
function initCountdown(targetDate) {
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // 更新倒计时核心函数
    const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate - now;

        // 计算天、时、分、秒
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // 补零格式化，保持视觉统一
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');

        // 倒计时结束处理
        if (diff <= 0) {
            clearInterval(countdownTimer);
            clearInterval(confettiTimer); // 停止定时礼花
            // 更新倒计时文案
            document.querySelector('.countdown-box').innerHTML = '<span style="color: #ffd700; font-size: 24px;">年会已盛大开启！</span>';
            // 触发结束礼花（强化效果）
            confetti({
                particleCount: 300,
                spread: 120,
                colors: ['#FF3366', '#FFCC00', '#33CCFF', '#FFFFFF'],
                origin: { y: 0.8 },
                gravity: 0.7,
                ticks: 250,
                scalar: 1.2
            });
        }
    };

    // 立即更新一次，避免延迟
    updateCountdown();
    // 每秒更新倒计时
    countdownTimer = setInterval(updateCountdown, 1000);
}

// 六、照片轮播功能（核心：自适应不变形，微信端触摸友好）
function initPhotoSlider() {
    const photos = document.querySelectorAll('.photo-item');
    const dotsContainer = document.getElementById('photoDots');
    let currentIndex = 0;

    // 创建轮播圆点指示器
    photos.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'photo-dot' + (index === 0 ? ' active' : '');
        dot.dataset.index = index;
        // 圆点点击切换照片
        dot.addEventListener('click', () => switchPhoto(index));
        dotsContainer.appendChild(dot);
    });

    // 切换照片核心函数
    const switchPhoto = (index) => {
        if (index === currentIndex) return;
        // 移除当前激活状态
        photos[currentIndex].classList.remove('active');
        document.querySelectorAll('.photo-dot')[currentIndex].classList.remove('active');
        // 更新当前索引
        currentIndex = index;
        // 添加新激活状态
        photos[currentIndex].classList.add('active');
        document.querySelectorAll('.photo-dot')[currentIndex].classList.add('active');
    };

    // 自动轮播函数（3秒切换一次）
    const autoPlay = () => {
        photoTimer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % photos.length;
            switchPhoto(nextIndex);
        }, 3000);
    };

    // 启动自动轮播
    autoPlay();

    // 微信端优化：触摸/鼠标悬浮暂停轮播，离开恢复
    const slider = document.getElementById('photoSlider');
    // 鼠标悬浮/触摸开始
    slider.addEventListener('mouseenter', () => clearInterval(photoTimer));
    slider.addEventListener('touchstart', () => clearInterval(photoTimer));
    // 鼠标离开/触摸结束
    slider.addEventListener('mouseleave', autoPlay);
    slider.addEventListener('touchend', autoPlay);
}

// 七、地址复制功能（微信端适配，友好提示）
function copyAddress() {
    // 修改此处：替换为实际年会地址
    const actualAddress = 'XX市XX区XX路XX号XX大厦XX楼 XX宴会厅';
    // 调用浏览器剪贴板API
    navigator.clipboard.writeText(actualAddress).then(() => {
        // 微信端友好提示
        alert(`地址已成功复制！\n\n${actualAddress}\n\n可粘贴到微信/高德/百度地图导航`);
    }).catch(err => {
        // 复制失败降级处理
        alert(`地址复制失败，请手动记录：\n\n${actualAddress}`);
        console.log('地址复制失败原因：', err);
    });
}