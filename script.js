// 全局变量定义（统一管理定时器和状态）
let countdownTimer; // 倒计时定时器
let photoTimer;     // 照片轮播定时器
let snowflakes = [];// 雪花/马年图标数组
let isMusicPlaying = false; // 音乐播放状态
let confettiTimer;  // 礼花定时定时器

// 页面加载完成后执行所有初始化逻辑
window.onload = function() {
    initConfetti();        // 礼花初始化（马年配色）
    initSnowflakes();      // 雪花/马年图标初始化（修复下滑消失问题）
    initMusic();           // 音乐播放控制初始化
    // 年会目标时间：2026年2月9日19:00（月份1对应2月）
    initCountdown(new Date(2026, 1, 9, 19, 0, 0)); 
    initPhotoSlider();     // 照片轮播初始化
    initDishScrollPause(); // 菜品滚动暂停/恢复初始化
};

// 1. 礼花绽放效果（适配微信端，马年专属红金配色）
function initConfetti() {
    // 马年喜庆配色：红、金、黄、橙为主
    const confettiColors = [
        '#FF0000', '#FFD700', '#FFA500', '#FFFF00', '#8B4513', 
        '#FFFFFF', '#FF6347', '#FF8C00'
    ];

    // 随机获取3-6种颜色
    const getRandomColors = () => {
        const count = Math.floor(Math.random() * 4) + 3;
        const shuffled = [...confettiColors].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // 发射礼花
    const launchConfetti = () => {
        const particleCount = Math.floor(Math.random() * 80) + 120;
        const spread = Math.floor(Math.random() * 40) + 60;
        const gravity = Math.random() * 0.4 + 0.6;
        const ticks = Math.floor(Math.random() * 40) + 160;
        const originX = 0.5 + (Math.random() * 0.2 - 0.1);

        confetti({
            particleCount: particleCount,
            spread: spread,
            colors: getRandomColors(),
            origin: { x: originX, y: 0.8 },
            gravity: gravity,
            ticks: ticks,
            scalar: Math.random() * 0.3 + 0.7,
            drift: Math.random() * 1.5 - 0.75,
            disableForReducedMotion: true
        });
    };

    launchConfetti(); // 页面加载立即发射一次
    confettiTimer = setInterval(launchConfetti, 6000); // 每6秒发射一次
}

// 2. 雪花/马年图标飘舞效果（修复下滑消失、只显示一半问题）
function initSnowflakes() {
    // 马年专属图标：重点突出马、灯笼、红包，少量雪花点缀
    const snowShapes = ['🐴', '🐎', '🏮', '🧧', '✨', '❄'];

    // 创建单个雪花/图标
    const createSnowflake = () => {
        const snowflake = document.createElement('div');
        const shape = snowShapes[Math.floor(Math.random() * snowShapes.length)];
        // 图标大小：4-10px，视觉更明显
        const size = Math.random() * 6 + 4;
        const opacity = Math.random() * 0.6 + 0.3;
        const speed = Math.random() * 1.2 + 0.6;
        const drift = Math.random() * 1 - 0.5;
        const rotateSpeed = Math.random() * 1.2 - 0.6;

        // 设置雪花样式
        snowflake.style.position = 'absolute';
        snowflake.style.color = '#ffffff';
        snowflake.style.fontSize = `${size}px`;
        // 水平位置：整个页面宽度随机
        snowflake.style.left = `${Math.random() * 100}vw`;
        // 垂直位置：可视区上方-50px到0px，避免初始扎堆
        snowflake.style.top = `${Math.random() * -50}px`;
        // 层级8：低于菜品/音乐按钮，高于背景
        snowflake.style.zIndex = '8';
        snowflake.style.userSelect = 'none';
        snowflake.style.opacity = opacity;
        // 不遮挡点击事件
        snowflake.style.pointerEvents = 'none';
        snowflake.innerHTML = shape;

        // 存储雪花状态（兼容页面滚动）
        let x = parseFloat(snowflake.style.left) / 100 * document.documentElement.clientWidth;
        let y = parseFloat(snowflake.style.top);
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

    // 按页面总高度生成图标，保证数量充足（每150px生成1个）
    const totalHeight = Math.max(document.body.scrollHeight, window.innerHeight);
    const snowCount = Math.floor(totalHeight / 150);
    // 分批生成，避免页面卡顿
    for (let i = 0; i < snowCount; i++) {
        setTimeout(createSnowflake, Math.random() * 3000);
    }

    // 雪花动画（核心：兼容页面滚动的出界判定）
    const animateSnowflakes = () => {
        // 获取当前滚动位置、可视区尺寸
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientH = window.innerHeight;
        const clientW = window.innerWidth;

        snowflakes.forEach((snow, index) => {
            snow.y += snow.speed;
            snow.x += snow.drift;
            snow.rotate += snow.rotateSpeed;

            // 更新图标位置
            snow.element.style.left = `${snow.x}px`;
            snow.element.style.top = `${snow.y}px`;
            snow.element.style.transform = `rotate(${snow.rotate}deg)`;

            // 出界判定：兼容滚动，超出滚动后可视区才移除
            const isOutY = snow.y > scrollTop + clientH + 50;
            const isOutX = snow.x < -50 || snow.x > clientW + 50;

            if (isOutY || isOutX) {
                // 出界后立即重建，保证图标持续存在
                document.body.removeChild(snow.element);
                snowflakes.splice(index, 1);
                createSnowflake();
            }
        });
        requestAnimationFrame(animateSnowflakes);
    };

    animateSnowflakes();

    // 窗口大小改变/滚动时补充图标，防止数量不足
    const handleWindowChange = () => {
        if (snowflakes.length < Math.floor(window.innerHeight / 200)) {
            for (let i = 0; i < 5; i++) {
                createSnowflake();
            }
        }
    };
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange);
}

// 3. 音乐播放控制（解决微信端自动播放限制）
function initMusic() {
    const bgm = document.getElementById('bgm');
    const musicToggle = document.getElementById('musicToggle');

    // 自动播放尝试
    const autoPlayMusic = () => {
        bgm.play().then(() => {
            isMusicPlaying = true;
            musicToggle.innerHTML = '🎵 暂停背景音乐';
        }).catch(err => {
            console.log('自动播放失败，等待用户交互：', err);
            musicToggle.innerHTML = '🎵 点击播放音乐';
        });
    };

    autoPlayMusic();

    // 交互触发播放（微信端兼容）
    const playMusicOnInteraction = () => {
        if (!isMusicPlaying) {
            bgm.play().then(() => {
                isMusicPlaying = true;
                musicToggle.innerHTML = '🎵 暂停背景音乐';
            }).catch(err => {
                console.log('交互播放失败：', err);
            });
        }
        document.removeEventListener('touchstart', playMusicOnInteraction);
        document.removeEventListener('click', playMusicOnInteraction);
    };

    document.addEventListener('touchstart', playMusicOnInteraction, { once: true });
    document.addEventListener('click', playMusicOnInteraction, { once: true });

    // 手动切换播放/暂停
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
            });
        }
    });
}

// 4. 年会倒计时功能
function initCountdown(targetDate) {
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // 更新倒计时
    const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate - now;

        // 倒计时结束处理
        if (diff <= 0) {
            clearInterval(countdownTimer);
            clearInterval(confettiTimer);
            document.querySelector('.countdown-box').innerHTML = '<span style="color: #ffd700; font-size: 24px;">年会已盛大开启！</span>';
            // 发射庆祝礼花
            confetti({
                particleCount: 300,
                spread: 120,
                colors: ['#FF0000', '#FFD700', '#FFFFFF'],
                origin: { y: 0.8 },
                gravity: 0.7,
                ticks: 250,
                scalar: 1.2
            });
            return;
        }

        // 计算天/时/分/秒
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // 补零格式化
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    };

    updateCountdown(); // 立即更新一次
    countdownTimer = setInterval(updateCountdown, 1000); // 每秒更新
}

// 5. 照片轮播功能
function initPhotoSlider() {
    const photos = document.querySelectorAll('.photo-item');
    const dotsContainer = document.getElementById('photoDots');
    let currentIndex = 0;

    // 创建轮播圆点
    photos.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'photo-dot' + (index === 0 ? ' active' : '');
        dot.dataset.index = index;
        dot.addEventListener('click', () => switchPhoto(index));
        dotsContainer.appendChild(dot);
    });

    // 切换照片
    const switchPhoto = (index) => {
        if (index === currentIndex) return;
        photos[currentIndex].classList.remove('active');
        document.querySelectorAll('.photo-dot')[currentIndex].classList.remove('active');
        currentIndex = index;
        photos[currentIndex].classList.add('active');
        document.querySelectorAll('.photo-dot')[currentIndex].classList.add('active');
    };

    // 自动轮播
    const autoPlay = () => {
        photoTimer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % photos.length;
            switchPhoto(nextIndex);
        }, 3000);
    };

    autoPlay();

    // 鼠标/触摸悬浮暂停轮播
    const slider = document.getElementById('photoSlider');
    slider.addEventListener('mouseenter', () => clearInterval(photoTimer));
    slider.addEventListener('touchstart', () => clearInterval(photoTimer));
    slider.addEventListener('mouseleave', autoPlay);
    slider.addEventListener('touchend', autoPlay);
}

// 6. 菜品滚动悬浮暂停/恢复功能
function initDishScrollPause() {
    const dishContainers = document.querySelectorAll('.dish-container');
    const dishLists = document.querySelectorAll('.dish-list');

    dishContainers.forEach((container, index) => {
        // 鼠标悬浮/触摸开始：暂停滚动
        container.addEventListener('mouseenter', () => {
            dishLists[index].classList.add('pause');
        });
        container.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 阻止移动端触摸默认行为
            dishLists[index].classList.add('pause');
        });

        // 鼠标离开/触摸结束：恢复滚动
        container.addEventListener('mouseleave', () => {
            dishLists[index].classList.remove('pause');
        });
        container.addEventListener('touchend', () => {
            dishLists[index].classList.remove('pause');
        });
    });
}

// 7. 地址复制功能
function copyAddress() {
    const actualAddress = '南沙区大岗镇繁荣路173号悦龙酒店悦龙厅';
    navigator.clipboard.writeText(actualAddress).then(() => {
        alert(`地址已成功复制！\n\n${actualAddress}\n\n可粘贴到微信/高德/百度地图导航`);
    }).catch(err => {
        alert(`地址复制失败，请手动记录：\n\n${actualAddress}`);
        console.log('地址复制失败：', err);
    });
}