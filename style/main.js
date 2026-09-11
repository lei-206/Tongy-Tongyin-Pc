// Vite 入口：直接 import SCSS，由 Vite 编译
import $ from 'jquery';
import Swal from 'sweetalert2';
import * as echarts from 'echarts';
import { createIcons, BookOpen, User, LogOut, ChevronDown, ChevronLeft, ChevronRight, KeyRound, Lock, CheckCircle2, ShieldCheck, MessageSquareCode, Info, FileText, Eye, Download, Play, Pause, Check, Mic, Upload } from 'lucide';
import './common.scss';
import iconTitlePic from './img/icon-titlePic.png';
import btnIKnow from './img/btn-i-know.png';
import iconTips from './img/icon-tips.png';
import qrcodeImg from './img/qrcode.png';
import btnTest from './img/btn-test.png';
import iconLive from './img/icon-live.png';
import iconReplay from './img/icon-replay.png';
import avtImg from './img/avt.png';
import btnReading from './img/btn-reading.png';
import btnRecording from './img/btn-recording.png';
import btnRecordingRepeat from './img/btn-recording-repeat.png';
import btnUpload from './img/btn-upload.png';
import btnUploadRepeat from './img/btn-upload-repeat.png';

// 初始化 Lucide 图标库
function renderLucideIcons(root) {
    try {
        createIcons({
            root: root || document,
            icons: {
                BookOpen,
                User,
                LogOut,
                ChevronDown,
                ChevronLeft,
                ChevronRight,
                KeyRound,
                Lock,
                CheckCircle2,
                ShieldCheck,
                MessageSquareCode,
                Info,
                FileText,
                Eye,
                Download,
                Play,
                Pause,
                Check,
                Mic,
                Upload
            }
        });
    } catch (e) {
        console.warn('[Lucide] Failed to render icons:', e);
    }
}


    var stepTitles = [
        '',
        '第一步：填写基本信息',
        '第二步：获取账号信息',
        '第三步：绑定微信号',
        '第四步：选择课程班级',
        '第五步：绑定微信号',
        '第六步：完成报名'
    ];

    // 切换步骤
    function goToStep(step) {
        var $stepTitle = $('#stepTitle');
        var $stepContents = $('.step-content');
        var $stepperItems = $('.stepper-item');

        // 更新标题
        $stepTitle.text(stepTitles[step]);

        // 更新内容区
        $stepContents.removeClass('active');
        $('#step' + step).addClass('active');

        // 更新步骤条
        $stepperItems.each(function () {
            var $item = $(this);
            var itemStep = parseInt($item.data('step'), 10);

            $item.removeClass('active completed');
            if (itemStep === step) {
                $item.addClass('active');
            } else if (itemStep < step) {
                $item.addClass('completed');
            }
        });


    }

    // 短信验证码倒计时
    function startSmsCountdown($btn) {
        var seconds = 60;
        $btn.prop('disabled', true).text(seconds + 's后重试');

        var timer = setInterval(function () {
            seconds--;
            if (seconds <= 0) {
                clearInterval(timer);
                $btn.prop('disabled', false).text('获取验证码');
            } else {
                $btn.text(seconds + 's后重试');
            }
        }, 1000);
    }

    // 仅针对个人中心：左右两边尽量等高
    function syncProfileHeight() {
        if (window.innerWidth <= 1080 || $('#courseProfileContent').length === 0 || !$('#courseProfileContent').is(':visible')) {
            $('.profile-card-body').css('min-height', '');
            return;
        }

        // 先清空 inline min-height，以获取各栏真实自然高度
        $('.profile-card-body').css('min-height', '');

        setTimeout(function () {
            if (!$('#courseProfileContent').is(':visible')) return;

            var sidebarH = $('.course-sidebar').outerHeight() || 0;
            var tabH = $('.profile-card-tabs-header').outerHeight() || 60;
            var profileCardH = $('.profile-main-card').outerHeight() || 0;

            var maxH = Math.max(sidebarH, profileCardH);
            if (maxH > 0) {
                var targetBodyH = maxH - tabH + 2;
                $('.profile-card-body').css('min-height', targetBodyH + 'px');
            }
        }, 40);
    }

    // 针对学员作业：左右两边尽量等高
    function syncHomeworkHeight() {
        if (window.innerWidth <= 1080 || $('#courseHomeworkContent').length === 0 || !$('#courseHomeworkContent').is(':visible')) {
            $('.homework-card-body').css('min-height', '');
            return;
        }

        $('.homework-card-body').css('min-height', '');

        setTimeout(function () {
            if (!$('#courseHomeworkContent').is(':visible')) return;

            var sidebarH = $('.course-sidebar').outerHeight() || 0;
            var tabH = $('.homework-card-tabs-header').outerHeight() || 60;
            var hwCardH = $('.homework-student-card').outerHeight() || 0;

            var maxH = Math.max(sidebarH, hwCardH);
            if (maxH > 0) {
                var targetBodyH = maxH - tabH + 2;
                $('.homework-card-body').css('min-height', targetBodyH + 'px');
            }
        }, 40);
    }

    $(document).ready(function () {
        // 以第一步的实际高度为基准，统一所有步骤的最小高度
        var step1Height = $('#step1').outerHeight(true);
        if (step1Height) {
            $('.step-content').css('min-height', step1Height + 'px');
        }

        // 带 data-step 属性的按钮统一跳转（排除"我要报名"，单独处理）
        $(document).on('click', '[data-step]:not(.btn-table)', function () {
            var step = parseInt($(this).data('step'), 10);
            if (!isNaN(step) && step >= 1 && step <= 6) {
                goToStep(step);
            }
        });

        // "我要报名"按钮：先弹确认框
        $(document).on('click', '.btn-table', function () {
            var $row = $(this).closest('tr');
            var className = $row.find('td').eq(0).text();
            var dateRange = $row.find('td').eq(1).text();
            // 已选期次
            var periodName = $('.period-card.active .period-name').text() || '';

            Swal.fire({
                title: '报名确认',
                html: '您将报名<strong>' + periodName + '</strong><strong>' + className + '</strong>，开课时间：' + dateRange + '<br><br>是否确认？',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: '确定报名',
                cancelButtonText: '取消重选',
                reverseButtons: true,
                customClass: {
                    popup:         'swal-popup',
                    title:         'swal-title',
                    confirmButton: 'swal-confirm',
                    cancelButton:  'swal-cancel',
                    closeButton:   'swal-close',
                },
                buttonsStyling: false,
            }).then(function (result) {
                if (result.isConfirmed) {
                    goToStep(5);
                }
            });
        });

        // 第一步表单提交
        $('#formStep1').on('submit', function (e) {
            e.preventDefault();
            if (this.checkValidity()) {
                goToStep(2);
            } else {
                this.reportValidity();
            }
        });

        // 短信验证码
        $('#btnSms').on('click', function () {
            var $btn = $(this);
            if ($btn.prop('disabled')) return;
            startSmsCountdown($btn);
        });

        // 期次卡片选择
        $('.period-card').on('click', function () {
            $('.period-card').removeClass('active');
            $(this).addClass('active');
        });

        // 初始化页面 Lucide 图标
        renderLucideIcons();

        // ==================== 顶部右上角用户“我的”菜单 ====================
        if ($('#userMenuBtn').length > 0) {
            initUserHeaderMenu();
        }

        // ==================== 登录页交互逻辑 ====================
        if ($('#loginForm').length > 0) {
            initLoginPage();
        }

        // ==================== 重置密码页交互逻辑 ====================
        if ($('#resetStep1Form').length > 0) {
            initForgetPasswordPage();
        }

        // ==================== 课程学习页交互逻辑 ====================
        if ($('.course-page-body').length > 0 || $('.course-main-layout').length > 0 || $('#studyVideo').length > 0) {
            initCoursePage();
        }

        // ==================== 课程学习首次进入页交互逻辑 ====================
        if ($('#btnStartPthTest').length > 0 || $('.course-first-card').length > 0) {
            initCourseFirstPage();
        }

        // ==================== 教师批阅作业页交互逻辑 ====================
        if ($('.homework-review-layout').length > 0) {
            initHomeworkReviewPage();
        }

        // ==================== 个人中心交互逻辑 ====================
        if ($('.profile-layout').length > 0 || $('#courseProfileContent').length > 0 || $('.profile-main-card').length > 0) {
            initProfilePage();
        }

        // ==================== 学员作业交互逻辑 ====================
        if ($('#courseHomeworkContent').length > 0 || $('.homework-student-card').length > 0) {
            initHomeworkStudentPage();
        }
    });

    function initLoginPage() {
        renderLucideIcons();

        // 登录直接跳转至“我的课程”页面，无需弹窗提示
        $('#btnLoginSubmit').on('click', function (e) {
            e.preventDefault();
            window.location.href = 'my-courses.html';
        });

        $('#btnForgetPwd').on('click', function (e) {
            e.preventDefault();
            window.location.href = 'forget-password.html';
        });
    }

    function initForgetPasswordPage() {
        renderLucideIcons();

        var $phone = $('#resetPhone');
        var $code = $('#resetCode');
        var $btnGetCode = $('#btnGetResetCode');
        var $step1Form = $('#resetStep1Form');
        var $step2Form = $('#resetStep2Form');
        var $newPwd = $('#resetNewPwd');
        var $confirmPwd = $('#resetConfirmPwd');

        // 发送验证码（演示展示，直接启动倒计时）
        $btnGetCode.on('click', function () {
            startSmsCountdown($btnGetCode);
        });

        // 第一步：点击下一步（纯展示，直接切换到设置新密码）
        function goToStep2() {
            $step1Form.fadeOut(200, function () {
                $step2Form.fadeIn(250);
                $newPwd.focus();
            });
        }

        $('#btnResetNext').on('click', function (e) {
            e.preventDefault();
            goToStep2();
        });

        $step1Form.on('submit', function (e) {
            e.preventDefault();
            goToStep2();
        });

        // 返回上一步
        $('#btnBackToStep1').on('click', function (e) {
            e.preventDefault();
            $step2Form.fadeOut(200, function () {
                $step1Form.fadeIn(250);
            });
        });

        // 第二步：完成重置（纯展示，直接提示成功并返回登录）
        function finishReset() {
            Swal.fire({
                icon: 'success',
                title: '重置密码成功',
                text: '新密码已生效，请使用新密码重新登录！',
                confirmButtonText: '去登录',
                confirmButtonColor: '#00bd98'
            }).then(function () {
                window.location.href = 'login.html';
            });
        }

        $('#btnResetSubmit').on('click', function (e) {
            e.preventDefault();
            finishReset();
        });

        $step2Form.on('submit', function (e) {
            e.preventDefault();
            finishReset();
        });
    }

    // 打开普通话水平测试答题主弹窗（初测 / 终测通用，严格根据设计布局）
    function openPutonghuaTestModal(currentStep, customTitle) {
        var step = currentStep || 1;
        var titleText = customTitle || '普通话水平终测';
        var playInterval = null;
        var isPlaying = false;
        var currentPlaySeconds = 0;
        var totalDurationSeconds = 28;

        // 1. 生成步骤导航 HTML (单字朗读 - 词汇朗读 - 篇章朗读)
        var stepNavHtml = 
            '<div class="pth-step-nav-wrap">' +
            '  <div class="pth-step-pill ' + (step === 1 ? 'active' : '') + '" data-step="1">单字朗读</div>' +
            '  <div class="pth-step-pill ' + (step === 2 ? 'active' : '') + '" data-step="2">词汇朗读</div>' +
            '  <div class="pth-step-pill ' + (step === 3 ? 'active' : '') + '" data-step="3">篇章朗读</div>' +
            '</div>';

        // 2. 生成题目内容 HTML
        var contentHtml = '';
        if (step === 1) {
            // 第一题：读单音节字词（10列 x 4行，白底 / 浅绿底交替真题字）
            var charsRow1 = ['摆', '爬', '苗', '符', '递', '妥', '努', '炉', '砸', '错'];
            var charsRow2 = ['纯', '刷', '摘', '抽', '惹', '杂', '擦', '洒', '若', '枕'];
            var charsRow3 = ['关', '宽', '黄', '团', '暖', '卵', '端', '乱', '酸', '算'];
            var charsRow4 = ['彭', '忙', '讽', '登', '坑', '恒', '曾', '僧', '萌', '腾'];

            var renderRow = function (arr, isCyan) {
                var tds = '';
                for (var i = 0; i < 10; i++) {
                    tds += '<td>' + arr[i] + '</td>';
                }
                return '<tr class="' + (isCyan ? 'row-cyan' : 'row-white') + '">' + tds + '</tr>';
            };

            contentHtml = 
                '<div class="pth-section-head">' +
                '  <div class="pth-section-title-wrap">' +
                '    <span class="pth-section-num-title">一、读单音节字词</span>' +
                '    <span class="pth-section-sub-tip">一次性完成下方所有文字的朗读</span>' +
                '  </div>' +
                '</div>' +
                '<div class="pth-char-table-container">' +
                '  <table class="pth-char-grid-table">' +
                '    <tbody>' +
                renderRow(charsRow1, false) +
                renderRow(charsRow2, true) +
                renderRow(charsRow3, false) +
                renderRow(charsRow4, true) +
                '    </tbody>' +
                '  </table>' +
                '</div>';
        } else if (step === 2) {
            // 第二题：读多音节词语（5列 x 4行）
            var vocabRows = [
                ['朋友', '学习', '广播', '国家', '创造'],
                ['温暖', '健康', '发展', '丰富', '卓越'],
                ['光明', '和谐', '精神', '科学', '自然'],
                ['美好', '希望', '阳光', '理想', '未来']
            ];
            var tableBody = '';
            for (var r = 0; r < vocabRows.length; r++) {
                var rowTds = '';
                for (var c = 0; c < vocabRows[r].length; c++) {
                    rowTds += '<td>' + vocabRows[r][c] + '</td>';
                }
                tableBody += '<tr>' + rowTds + '</tr>';
            }

            contentHtml = 
                '<div class="pth-section-head">' +
                '  <div class="pth-section-title-wrap">' +
                '    <span class="pth-section-num-title">二、读多音节词语</span>' +
                '    <span class="pth-section-sub-tip">一次性完成下方所有词语的朗读</span>' +
                '  </div>' +
                '</div>' +
                '<div class="pth-char-table-container">' +
                '  <table class="pth-vocab-table">' +
                '    <tbody>' + tableBody + '</tbody>' +
                '  </table>' +
                '</div>';
        } else {
            // 第三题：朗读短文
            contentHtml = 
                '<div class="pth-section-head">' +
                '  <div class="pth-section-title-wrap">' +
                '    <span class="pth-section-num-title">三、朗读短文</span>' +
                '    <span class="pth-section-sub-tip">一次性完成下方短文的朗读，限时4分钟</span>' +
                '  </div>' +
                '</div>' +
                '<div class="pth-article-box">' +
                '  <p>我们家的后园有半亩空地。母亲说：“让它荒着怪可惜的，你们那么爱吃花生，就开辟出来种花生吧。”我们姐弟几个都很高兴，买种、翻地、播种、浇水，没过几个月，居然收获了！母亲说：“今晚我们过一个收获节，请你们的父亲也来尝尝我们的新花生，好不好？”母亲把花生做成了好几样食品，还吩咐就在后园的茅亭里过这个节。父亲说：“花生的用处固然很多，但有一样是很可贵的。这小小的豆子虽然不起眼，可是结的果实埋在泥土里，不炫耀自己，默默为人们做贡献。”父亲接下去说：“所以你们要像花生，它虽然不好看，可是很有用。”我说：“那么，人要做有用的人，不要做只讲体面，而对别人没有好处的人。”</p>' +
                '</div>';
        }

        // 3. 生成底部操作面板 HTML（严格参考效果图样式，风格颜色统一）
        var submitPanelHtml = 
            '<div class="pth-submit-panel">' +
            '  <!-- 1. 录音结果展示行（松开鼠标后显示在上方，如效果图所示） -->' +
            '  <div class="pth-audio-result-row" id="pthAudioResultRow" style="display: none;">' +
            '    <div class="pth-audio-result-inner">' +
            '      <div class="pth-player-capsule">' +
            '        <button type="button" class="btn-player-play" id="btnPthAudioPlay" title="播放/暂停">' +
            '          <svg class="icon-play-triangle" viewBox="0 0 24 24" width="20" height="20" fill="#111827">' +
            '            <polygon points="6 3 20 12 6 21 6 3"></polygon>' +
            '          </svg>' +
            '        </button>' +
            '        <div class="pth-player-track" id="pthPlayerTrack">' +
            '          <div class="pth-player-fill" id="pthPlayerFill" style="width: 0%;"></div>' +
            '        </div>' +
            '        <div class="pth-player-time-box">' +
            '          <span class="pth-player-time" id="pthPlayerTime">00:00 / 03:22</span>' +
            '        </div>' +
            '      </div>' +
            '      <button type="button" class="btn-pth-next-topic" id="btnPthNextStep">' +
            (step < 3 ? '下一题' : '完成测试') +
            '      </button>' +
            '    </div>' +
            '  </div>' +
            '  <!-- 2. 操作按钮行：按住并朗读/录制（录音后变为重新录制），完全仿效果图金橙色胶囊按钮风格 -->' +
            '  <div class="pth-submit-action-row" id="pthSubmitActionRow">' +
            '    <button type="button" class="btn-hw-action" id="btnPthRecord" title="按住并朗读" data-state="initial">' +
            '      <img src="' + btnReading + '" alt="按住并朗读" class="btn-hw-img" id="imgBtnPthRecord">' +
            '      <!-- 按钮上的录音特效 HUD -->' +
            '      <div class="btn-rec-hud" id="btnPthRecordHud" style="display: none;">' +
            '        <span class="rec-dot-red"></span>' +
            '        <span class="rec-text-status">录音中 <strong class="rec-timer-num" id="btnRecTimer">00:01</strong></span>' +
            '        <div class="rec-sound-waves">' +
            '          <span></span><span></span><span></span><span></span><span></span>' +
            '        </div>' +
            '      </div>' +
            '    </button>' +
            '    <span class="hw-submit-or">或</span>' +
            '    <button type="button" class="btn-hw-action" id="btnPthUpload" title="上传文件" data-state="initial">' +
            '      <img src="' + btnUpload + '" alt="上传文件" class="btn-hw-img" id="imgBtnPthUpload">' +
            '    </button>' +
            '    <input type="file" id="pthAudioFileInput" accept=".mp3,.wav,.m4a,.aac" style="display: none;">' +
            '  </div>' +
            '  <!-- 3. 提示信息行 -->' +
            '  <div class="pth-submit-tips-row">' +
            '    <div class="hw-tip-item">' +
            '      <img src="' + iconTips + '" alt="提示" class="hw-tip-icon">' +
            '      <span class="hw-tip-text">需要有麦克风并授权<br>录音才可进行录制</span>' +
            '    </div>' +
            '    <div class="hw-tip-item">' +
            '      <img src="' + iconTips + '" alt="提示" class="hw-tip-icon">' +
            '      <span class="hw-tip-text">如您的设备没有麦克风，<br>请直接上传MP3格式文件</span>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        // 4. 组装完整窗口内容
        var modalFullHtml = 
            '<div class="pth-test-win-header">' +
            '  <span class="pth-test-win-title">' + titleText + '</span>' +
            '  <button type="button" class="pth-test-win-close" id="btnClosePthWin" aria-label="关闭">&times;</button>' +
            '</div>' +
            stepNavHtml +
            contentHtml +
            submitPanelHtml;

        // 5. 弹出 SweetAlert2 弹窗
        Swal.fire({
            html: modalFullHtml,
            showConfirmButton: false,
            showCloseButton: false,
            allowOutsideClick: true,
            customClass: {
                popup: 'pth-test-window-popup'
            },
            didOpen: function () {
                var $popup = $(Swal.getPopup());
                // 确保移除任何外部或多余的 swal2-close 按钮，仅保留弹窗内的唯一关闭按钮
                $popup.find('> button.swal2-close, button.swal2-close').not('#btnClosePthWin').remove();
                renderLucideIcons($popup[0]);

                // 录音与计时状态变量
                var isRecording = false;
                var recTimer = null;
                var recSeconds = 1;
                var pressStartTime = 0;
                var finishTimeout = null;

                // 播放器状态变量
                var isPlaying = false;
                var playInterval = null;
                var currentPlaySeconds = 0;
                var totalDurationSeconds = 202; // 03:22 (对应效果图)

                var playTriangleSvg = '<svg class="icon-play-triangle" viewBox="0 0 24 24" width="20" height="20" fill="#111827"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
                var pauseBarsSvg = '<svg class="icon-pause-bars" viewBox="0 0 24 24" width="20" height="20" fill="#111827"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';

                // 格式化时间为 mm:ss
                function formatTime(s) {
                    var m = Math.floor(s / 60);
                    var sec = s % 60;
                    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
                }

                function updatePlayUi(playing) {
                    var $btn = $popup.find('#btnPthAudioPlay');
                    if (playing) {
                        $btn.html(pauseBarsSvg);
                    } else {
                        $btn.html(playTriangleSvg);
                    }
                }

                function stopAudioPlayback() {
                    if (playInterval) {
                        clearInterval(playInterval);
                        playInterval = null;
                    }
                    isPlaying = false;
                    updatePlayUi(false);
                }

                // 开始在按钮上做录音动效
                function startButtonRecording() {
                    if (isRecording) return;
                    isRecording = true;
                    pressStartTime = Date.now();
                    recSeconds = 1;
                    stopAudioPlayback();

                    var $btn = $popup.find('#btnPthRecord');
                    $btn.addClass('is-recording');
                    $popup.find('#btnRecTimer').text('00:01');
                    $popup.find('#btnPthRecordHud').show();

                    if (recTimer) clearInterval(recTimer);
                    recTimer = setInterval(function () {
                        recSeconds++;
                        $popup.find('#btnRecTimer').text(formatTime(recSeconds));
                    }, 1000);
                }

                // 结束录音并在上方展示录音结果，按钮变为“重新录制”
                function finishButtonRecording() {
                    if (!isRecording) return;
                    isRecording = false;
                    if (recTimer) {
                        clearInterval(recTimer);
                        recTimer = null;
                    }

                    var $btn = $popup.find('#btnPthRecord');
                    $btn.removeClass('is-recording');
                    $popup.find('#btnPthRecordHud').hide();

                    // “按住并朗读”按钮变为“重新录制”按钮，仿效果图金橙色切图
                    $btn.attr('title', '重新录制').attr('data-state', 'recorded');
                    $popup.find('#imgBtnPthRecord').attr('src', btnRecordingRepeat).attr('alt', '重新录制');

                    // “上传文件”变为“重新上传”
                    $popup.find('#btnPthUpload').attr('title', '重新上传').attr('data-state', 'recorded');
                    $popup.find('#imgBtnPthUpload').attr('src', btnUploadRepeat).attr('alt', '重新上传');

                    // 上方显示录音结果（00:00 / 03:22 播放条）
                    currentPlaySeconds = 0;
                    $popup.find('#pthPlayerFill').css('width', '0%');
                    $popup.find('#pthPlayerTime').text('00:00 / 03:22');
                    stopAudioPlayback();
                    $popup.find('#pthAudioResultRow').slideDown(240);
                }

                // 关闭按钮
                $popup.on('click', '#btnClosePthWin', function () {
                    stopAudioPlayback();
                    if (recTimer) clearInterval(recTimer);
                    $(document).off('mouseup.pthRec touchend.pthRec');
                    Swal.close();
                });

                // 步骤条切换
                $popup.on('click', '.pth-step-pill', function () {
                    var targetStep = parseInt($(this).data('step'), 10) || 1;
                    stopAudioPlayback();
                    if (recTimer) clearInterval(recTimer);
                    $(document).off('mouseup.pthRec touchend.pthRec');
                    openPutonghuaTestModal(targetStep, titleText);
                });

                // 鼠标按下 / 触屏按住“按住并朗读 / 重新录制”按钮
                $popup.on('mousedown touchstart', '#btnPthRecord', function (e) {
                    e.preventDefault();
                    if (finishTimeout) {
                        clearTimeout(finishTimeout);
                        finishTimeout = null;
                    }
                    startButtonRecording();
                });

                // 鼠标松开 / 触屏松开：在全局监听，确保移动到外部也能平稳结束录音并在上方显示结果
                $(document).off('mouseup.pthRec touchend.pthRec').on('mouseup.pthRec touchend.pthRec', function () {
                    if (!isRecording) return;
                    var heldMs = Date.now() - pressStartTime;
                    if (heldMs < 600) {
                        // 若轻击未长时间按住，保留1秒录音动效以便看清，再自动完成呈现
                        finishTimeout = setTimeout(function () {
                            finishButtonRecording();
                        }, 1000);
                    } else {
                        finishButtonRecording();
                    }
                });

                // 上传文件交互
                $popup.on('click', '#btnPthUpload', function (e) {
                    e.preventDefault();
                    $popup.find('#pthAudioFileInput').click();
                });

                $popup.on('change', '#pthAudioFileInput', function () {
                    var file = this.files && this.files[0];
                    if (file) {
                        // 按钮变为重新录制 / 重新上传
                        $popup.find('#btnPthRecord').attr('title', '重新录制').attr('data-state', 'recorded');
                        $popup.find('#imgBtnPthRecord').attr('src', btnRecordingRepeat).attr('alt', '重新录制');
                        $popup.find('#btnPthUpload').attr('title', '重新上传').attr('data-state', 'recorded');
                        $popup.find('#imgBtnPthUpload').attr('src', btnUploadRepeat).attr('alt', '重新上传');

                        // 显示录音结果
                        currentPlaySeconds = 0;
                        $popup.find('#pthPlayerFill').css('width', '0%');
                        $popup.find('#pthPlayerTime').text('00:00 / 03:22');
                        stopAudioPlayback();
                        $popup.find('#pthAudioResultRow').slideDown(240);

                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: '已上传音频：' + file.name
                        });
                    }
                });

                // 试听播放 / 暂停交互
                $popup.on('click', '#btnPthAudioPlay', function (e) {
                    e.preventDefault();
                    if (isPlaying) {
                        stopAudioPlayback();
                    } else {
                        isPlaying = true;
                        updatePlayUi(true);
                        playInterval = setInterval(function () {
                            currentPlaySeconds++;
                            if (currentPlaySeconds > totalDurationSeconds) {
                                stopAudioPlayback();
                                currentPlaySeconds = 0;
                                $popup.find('#pthPlayerFill').css('width', '0%');
                                $popup.find('#pthPlayerTime').text('00:00 / 03:22');
                                return;
                            }
                            var pct = Math.min(100, Math.round((currentPlaySeconds / totalDurationSeconds) * 100));
                            $popup.find('#pthPlayerFill').css('width', pct + '%');
                            $popup.find('#pthPlayerTime').text(formatTime(currentPlaySeconds) + ' / 03:22');
                        }, 1000);
                    }
                });

                // 点击进度条跳转
                $popup.on('click', '#pthPlayerTrack', function (e) {
                    var width = $(this).width();
                    var clickX = e.pageX - $(this).offset().left;
                    var ratio = Math.max(0, Math.min(1, clickX / width));
                    currentPlaySeconds = Math.round(ratio * totalDurationSeconds);
                    var pct = Math.round(ratio * 100);
                    $popup.find('#pthPlayerFill').css('width', pct + '%');
                    $popup.find('#pthPlayerTime').text(formatTime(currentPlaySeconds) + ' / 03:22');
                });

                // 下一步 / 最终提交交互
                $popup.on('click', '#btnPthNextStep', function () {
                    stopAudioPlayback();
                    if (recTimer) clearInterval(recTimer);
                    $(document).off('mouseup.pthRec touchend.pthRec');
                    if (step < 3) {
                        openPutonghuaTestModal(step + 1, titleText);
                    } else {
                        // 第3题完成提交
                        var isFirstCourse = window.location.pathname.indexOf('course-first') !== -1;
                        Swal.fire({
                            title: '测试录音提交成功！',
                            html: 
                                '<div style="text-align: center; padding: 10px 0;">' +
                                '  <div style="color: #0da178; margin-bottom: 12px;">' +
                                '    <i data-lucide="check-circle-2" style="width: 52px; height: 52px; display: inline-block;"></i>' +
                                '  </div>' +
                                '  <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">' + titleText + '已完成答题</div>' +
                                '  <div style="font-size: 14px; color: #64748b; line-height: 1.6; max-width: 420px; margin: 0 auto;">系统已将您的单字、词汇及短文朗读录音同步至普通话水平智能评分系统与指导教师考评端，成绩将在2个工作日内公布。</div>' +
                            '</div>',
                            confirmButtonText: isFirstCourse ? '确定并进入课程' : '确定并返回课程',
                            confirmButtonColor: '#0da178',
                            customClass: {
                                popup: 'notice-modal-popup'
                            },
                            didOpen: function () {
                                renderLucideIcons(Swal.getPopup());
                            }
                        }).then(function () {
                            if (isFirstCourse) {
                                window.location.href = 'course.html';
                            } else {
                                // 将左侧终测状态从未完成置为已完成
                                var $badge = $('#taskTest').find('.badge-status-orange');
                                if ($badge.length) {
                                    $badge.removeClass('badge-status-orange').css({
                                        'background': '#e6f9f0',
                                        'color': '#0da178',
                                        'border': '1px solid #a3e8cc',
                                        'padding': '2px 8px',
                                        'border-radius': '10px',
                                        'font-size': '12px',
                                        'font-weight': '600'
                                    }).text('已完成');
                                }
                            }
                        });
                    }
                });
            },
            willClose: function () {
                $(document).off('mouseup.pthRec touchend.pthRec');
                if (playInterval) clearInterval(playInterval);
            }
        });
    }

    function initCoursePage() {
        // 渲染课程页中的 Lucide 图标
        renderLucideIcons();

        // --- 视频播放器逻辑 ---
        var $video = $('#studyVideo');
        if ($video.length > 0) {
            var video = $video[0];
            var $playBtn = $('#ctrlPlayBtn');
            var $overlayPlay = $('#videoOverlayPlay');
            var $currentTime = $('#ctrlCurrentTime');
            var $totalDuration = $('#ctrlTotalTime');
            var $progressBar = $('#ctrlProgressBar');
            var $progressFill = $('#ctrlProgressFill');
            var $progressThumb = $('#ctrlProgressThumb');
            var $volumeBtn = $('#ctrlMuteBtn');
            var $fullscreenBtn = $('#ctrlFullscreenBtn');

            function formatTime(seconds) {
                var min = Math.floor(seconds / 60);
                var sec = Math.floor(seconds % 60);
                return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
            }

            function togglePlay() {
                if (video.paused || video.ended) {
                    var playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(function (err) {
                            console.warn('Video play interrupted or forbidden:', err);
                        });
                    }
                } else {
                    video.pause();
                }
            }

            // 同步原生播放/暂停事件
            $video.on('play', function () {
                $playBtn.find('.ctrl-icon-play').hide();
                $playBtn.find('.ctrl-icon-pause').show();
                $overlayPlay.addClass('hidden');
            });

            $video.on('pause', function () {
                $playBtn.find('.ctrl-icon-play').show();
                $playBtn.find('.ctrl-icon-pause').hide();
                $overlayPlay.removeClass('hidden');
            });

            $playBtn.on('click', function (e) {
                e.stopPropagation();
                togglePlay();
            });

            $overlayPlay.on('click', function (e) {
                e.stopPropagation();
                togglePlay();
            });

            $video.on('click', function (e) {
                e.stopPropagation();
                togglePlay();
            });

            $('#videoBox').on('click', function (e) {
                if ($(e.target).closest('#customControls').length === 0) {
                    togglePlay();
                }
            });

            $video.on('loadedmetadata', function () {
                $totalDuration.text(formatTime(video.duration || 35));
            });

            $video.on('timeupdate', function () {
                var current = video.currentTime;
                var total = video.duration || 35;
                var pct = (current / total) * 100;
                $currentTime.text(formatTime(current));
                $progressFill.css('width', pct + '%');
                $progressThumb.css('left', pct + '%');
            });

            $video.on('ended', function () {
                $playBtn.find('.ctrl-icon-play').show();
                $playBtn.find('.ctrl-icon-pause').hide();
                $overlayPlay.removeClass('hidden');
                $('.study-completion-tip').removeClass('is-unfinished');
                $('.tip-text-content').text('提示： 本视频已完成学习');
            });

            // 进度条点击跳转
            $progressBar.on('click', function (e) {
                var offset = $(this).offset();
                var clickPos = e.pageX - offset.left;
                var totalWidth = $(this).width();
                var fraction = Math.max(0, Math.min(1, clickPos / totalWidth));
                var duration = video.duration || 35;
                video.currentTime = fraction * duration;
                $progressFill.css('width', (fraction * 100) + '%');
                $progressThumb.css('left', (fraction * 100) + '%');
            });

            // 音量静音切换
            $volumeBtn.on('click', function () {
                video.muted = !video.muted;
                $(this).css('opacity', video.muted ? '0.4' : '1');
            });

            // 全屏
            $fullscreenBtn.on('click', function () {
                var playerEl = document.getElementById('videoBox');
                if (!document.fullscreenElement) {
                    if (playerEl.requestFullscreen) {
                        playerEl.requestFullscreen();
                    } else if (playerEl.webkitRequestFullscreen) {
                        playerEl.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });
        }

        // --- 分类 Tab 点击切换 ---
        var cateResourceTitles = {
            'video': '资源名称资源名称资源名称',
            'language': '幼儿教师普通话标准语音与发音技巧',
            'teaching': '幼儿园语言领域教学设计与实践策略',
            'development': '学前教育名师专业成长与教学反思',
            'support': '普通话教学数字化资源库与教学指南'
        };

        $('.category-item').on('click', function () {
            $('.category-item').removeClass('active');
            $(this).addClass('active');

            var type = $(this).data('type');
            var title = cateResourceTitles[type] || '资源名称资源名称资源名称';
            $('#currentResourceTitle').text(title);

            // 切换时轻微提示
            var badgeText = $(this).find('.cate-status-badge').text().trim();
            if (badgeText === '已完成') {
                $('.study-completion-tip').removeClass('is-unfinished');
                $('.tip-text-content').text('提示： 本视频已完成学习');
            } else {
                $('.study-completion-tip').addClass('is-unfinished');
                $('.tip-text-content').text('提示： 本视频未完成学习');
            }
        });

        function showNoticeModal(options) {
            options = options || {};
            var header = options.header || '通知公告';
            var title = options.title || '资源名称资源名称资源名称';
            var date = options.date || 'yyyy-mm-dd hh:mm:s';
            var content = options.content || '自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本内容自定义富文本自定义。';

            Swal.fire({
                title: header,
                html: '<div class="calendar-notice-content">' +
                      '  <div class="calendar-notice-title-wrapper">' +
                      '    <img src="' + iconTitlePic + '" alt="" class="calendar-notice-deco-img">' +
                      '    <h3 class="calendar-notice-resource-title">' + title + '</h3>' +
                      '  </div>' +
                      '  <p class="calendar-notice-date">' + date + '</p>' +
                      '  <div class="calendar-notice-body">' + content + '</div>' +
                      '</div>',
                showCloseButton: true,
                confirmButtonText: '<img src="' + btnIKnow + '" alt="我已知晓" class="calendar-notice-btn-img">',
                confirmButtonAriaLabel: '我已知晓',
                customClass: {
                    popup: 'calendar-notice-modal-popup',
                    title: 'calendar-notice-modal-title',
                    closeButton: 'calendar-notice-modal-close',
                    confirmButton: 'calendar-notice-modal-confirm'
                },
                buttonsStyling: false
            });
        }

        $(window).on('resize', function () {
            if ($('#courseProfileContent').is(':visible')) {
                syncProfileHeight();
            }
            if ($('#courseHomeworkContent').is(':visible')) {
                syncHomeworkHeight();
            }
        });

        // --- 当日有直播/直播回放卡片：折叠 / 展开 ---
        $('#btnLiveCollapse').on('click', function () {
            var $activeBody = $('#dailyLiveCard .live-card-body.active-body');
            if (!$activeBody.length) {
                $activeBody = $('#liveCardBody');
            }
            var $btn = $(this);
            var $text = $btn.find('.collapse-text');

            $activeBody.slideToggle(200, function () {
                if ($activeBody.is(':visible')) {
                    $text.text('折叠');
                    $btn.removeClass('is-collapsed');
                } else {
                    $text.text('展开');
                    $btn.addClass('is-collapsed');
                }
            });
        });

        // --- 日历日期点击切换 ---
        $('.cal-cell').on('click', function () {
            $('.cal-cell').removeClass('is-selected');
            $(this).addClass('is-selected');

            var isLive = $(this).hasClass('tag-live');
            var isPlayback = $(this).hasClass('tag-playback');
            var isLocked = $(this).data('locked') === true || $(this).data('day') == '20' || $(this).data('day') == '21';
            var colIndex = $(this).index() % 7;
            var isWeekend = (colIndex === 5 || colIndex === 6) || $(this).data('weekend') === true;
            var isDone = $(this).hasClass('is-done');

            var $liveCard = $('#dailyLiveCard');
            var $mainContent = $('#courseMainContent');
            var $emptyCard = $('#emptyLearningCard');
            var $emptyTitle = $emptyCard.find('.empty-content-title');
            var $lockedCard = $('#lockedLearningCard');
            var $titleText = $('#liveCardTitleText');
            var $liveTitleIcon = $('#liveTitleIcon');
            var $liveBody = $('#liveCardBody');
            var $playbackBody = $('#playbackCardBody');
            var $btn = $('#btnLiveCollapse');
            var $text = $btn.find('.collapse-text');

            if (isLive || isPlayback) {
                // 展开内容体并重置为“折叠”状态
                $btn.removeClass('is-collapsed');
                $text.text('折叠');

                if (isLive) {
                    $titleText.text('当日有直播');
                    if ($liveTitleIcon.length) {
                        $liveTitleIcon.attr('src', iconLive).attr('alt', '当日有直播');
                    }
                    $liveBody.addClass('active-body').show();
                    $playbackBody.removeClass('active-body').hide();
                } else {
                    $titleText.text('直播回放');
                    if ($liveTitleIcon.length) {
                        $liveTitleIcon.attr('src', iconReplay).attr('alt', '直播回放');
                    }
                    $liveBody.removeClass('active-body').hide();
                    $playbackBody.addClass('active-body').show();
                }

                $liveCard.slideDown(250);

                if (isLocked) {
                    // 尚未解锁：展示“其他学习内容将在当日上午8点解锁”，隐藏常规区和空内容区
                    $mainContent.hide();
                    $emptyCard.hide();
                    $lockedCard.addClass('has-live-above').stop(true, true).fadeIn(200);
                } else if (isWeekend) {
                    // 周末有直播/回放：下方展示“当日没有其他学习内容”，隐藏常规学习区和未解锁区
                    $mainContent.hide();
                    $lockedCard.hide();
                    $emptyTitle.text('当日没有其他学习内容');
                    $emptyCard.stop(true, true).fadeIn(200);
                } else {
                    // 工作日且已解锁：展示常规学习区，隐藏未解锁区与“无其他学习内容”卡片
                    $lockedCard.hide();
                    $emptyCard.hide();
                    $mainContent.stop(true, true).fadeIn(200);
                }
            } else if (isLocked) {
                // 工作日尚未解锁且无直播（如21号）：无直播卡片，全区展示“其他学习内容将在当日上午8点解锁”，不弹窗
                $liveCard.slideUp(200);
                $emptyCard.hide();
                $mainContent.hide();
                $lockedCard.removeClass('has-live-above').stop(true, true).fadeIn(200);
            } else if (isWeekend && !isDone) {
                // 周末无安排（16/22/23/29/30号）：无直播/回放卡片，全区展示“当日没有学习内容”
                $liveCard.slideUp(200);
                $lockedCard.hide();
                $mainContent.hide();
                $emptyTitle.text('当日没有学习内容');
                $emptyCard.stop(true, true).fadeIn(200);
            } else {
                // 工作日常规学习日期
                $liveCard.slideUp(200);
                $emptyCard.hide();
                $lockedCard.hide();
                $mainContent.show();
                showNoticeModal();
            }
        });

        // --- 课程资源 5 个分类 Tab 切换交互 ---
        $('.category-item').on('click', function () {
            $('.category-item').removeClass('active');
            $(this).addClass('active');

            var type = $(this).data('type');
            var $articleCard = $('#courseArticleCard');
            var $electiveTip = $('#electiveAiTip');
            var $supportCard = $('#supportResourceCard');

            if (type === 'support') {
                // 切换至“资源保障”专属列表
                $articleCard.hide();
                $electiveTip.hide();
                $supportCard.stop(true, true).fadeIn(200, function () {
                    renderLucideIcons($supportCard[0]);
                });
            } else {
                // 切换至常规学习内容（教学视频、语言素养、教学能力、专业发展）
                $supportCard.hide();
                $articleCard.stop(true, true).fadeIn(200);

                if (type === 'development') {
                    // “专业发展”展示选学AI提示
                    $electiveTip.stop(true, true).css('display', 'flex').hide().fadeIn(200, function () {
                        renderLucideIcons($electiveTip[0]);
                    });
                } else {
                    $electiveTip.stop(true, true).fadeOut(150);
                }
            }
        });

        // --- 资源保障列表分页交互 ---
        function setSupportPage(targetPage) {
            targetPage = parseInt(targetPage, 10);
            if (isNaN(targetPage) || targetPage < 1) targetPage = 1;
            if (targetPage > 10) targetPage = 10;

            var $pagination = $('#supportPagination');
            var $pages = $pagination.find('.page-num');
            var $prev = $('#btnPagePrev');
            var $next = $('#btnPageNext');
            var $jumper = $('#pageJumperInput');

            $pages.removeClass('active');
            $pages.filter('[data-page="' + targetPage + '"]').addClass('active');

            if (targetPage <= 1) {
                $prev.addClass('disabled');
            } else {
                $prev.removeClass('disabled');
            }

            if (targetPage >= 10) {
                $next.addClass('disabled');
            } else {
                $next.removeClass('disabled');
            }

            $jumper.val(targetPage);

            // 轻量换页过渡效果
            var $list = $('.support-resource-list');
            $list.css('opacity', '0.4');
            setTimeout(function () {
                $list.css('opacity', '1');
            }, 120);
        }

        $(document).off('click', '#supportPagination .page-num').on('click', '#supportPagination .page-num', function () {
            var p = $(this).data('page');
            setSupportPage(p);
        });

        $(document).off('click', '#btnPagePrev').on('click', '#btnPagePrev', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#supportPagination .page-num.active').data('page'), 10) || 1;
            setSupportPage(cur - 1);
        });

        $(document).off('click', '#btnPageNext').on('click', '#btnPageNext', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#supportPagination .page-num.active').data('page'), 10) || 1;
            setSupportPage(cur + 1);
        });

        $(document).off('change', '#pageJumperInput').on('change', '#pageJumperInput', function () {
            setSupportPage($(this).val());
        });

        $(document).off('keydown', '#pageJumperInput').on('keydown', '#pageJumperInput', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                setSupportPage($(this).val());
            }
        });

        // --- 通知公告列表分页交互 ---
        function setNoticePage(targetPage) {
            targetPage = parseInt(targetPage, 10);
            if (isNaN(targetPage) || targetPage < 1) targetPage = 1;
            if (targetPage > 93) targetPage = 93;

            var $pagination = $('#noticePagination');
            var $pages = $pagination.find('.notice-page-num');
            var $prev = $('#btnNoticePrev');
            var $next = $('#btnNoticeNext');

            $pages.removeClass('active');
            $pages.filter('[data-page="' + targetPage + '"]').addClass('active');

            if (targetPage <= 1) {
                $prev.addClass('disabled');
            } else {
                $prev.removeClass('disabled');
            }

            if (targetPage >= 93) {
                $next.addClass('disabled');
            } else {
                $next.removeClass('disabled');
            }

            var $list = $('.notice-list-wrap');
            $list.css('opacity', '0.4');
            setTimeout(function () {
                $list.css('opacity', '1');
            }, 120);
        }

        $(document).off('click', '#noticePagination .notice-page-num').on('click', '#noticePagination .notice-page-num', function () {
            var p = $(this).data('page');
            setNoticePage(p);
        });

        $(document).off('click', '#btnNoticePrev').on('click', '#btnNoticePrev', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#noticePagination .notice-page-num.active').data('page'), 10) || 1;
            setNoticePage(cur - 1);
        });

        $(document).off('click', '#btnNoticeNext').on('click', '#btnNoticeNext', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#noticePagination .notice-page-num.active').data('page'), 10) || 1;
            setNoticePage(cur + 1);
        });

        // --- 小手心大世界话题交流分页交互 ---
        function setXsxTopicPage(targetPage) {
            targetPage = parseInt(targetPage, 10);
            if (isNaN(targetPage) || targetPage < 1) targetPage = 1;
            if (targetPage > 93) targetPage = 93;

            var $pagination = $('#xsxTopicPagination');
            var $pages = $pagination.find('.xsx-page-num');
            var $prev = $('#btnXsxTopicPrev');
            var $next = $('#btnXsxTopicNext');

            $pages.removeClass('active');
            $pages.filter('[data-page="' + targetPage + '"]').addClass('active');

            if (targetPage <= 1) {
                $prev.addClass('disabled');
            } else {
                $prev.removeClass('disabled');
            }

            if (targetPage >= 93) {
                $next.addClass('disabled');
            } else {
                $next.removeClass('disabled');
            }

            var $list = $('.xsx-topic-list');
            $list.css('opacity', '0.4');
            setTimeout(function () {
                $list.css('opacity', '1');
            }, 120);
        }

        $(document).off('click', '#xsxTopicPagination .xsx-page-num').on('click', '#xsxTopicPagination .xsx-page-num', function () {
            var p = $(this).data('page');
            setXsxTopicPage(p);
        });

        $(document).off('click', '#btnXsxTopicPrev').on('click', '#btnXsxTopicPrev', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#xsxTopicPagination .xsx-page-num.active').data('page'), 10) || 1;
            setXsxTopicPage(cur - 1);
        });

        $(document).off('click', '#btnXsxTopicNext').on('click', '#btnXsxTopicNext', function () {
            if ($(this).hasClass('disabled')) return;
            var cur = parseInt($('#xsxTopicPagination .xsx-page-num.active').data('page'), 10) || 1;
            setXsxTopicPage(cur + 1);
        });

        // --- 课程学习、个人中心、作业、通知公告平滑视图切换 ---
        function showProfileView() {
            $('#courseStudyContent').hide();
            $('#courseHomeworkContent').hide();
            $('#courseNoticeContent').hide();
            $('#courseXsxTopicContent').hide();
            $('.homework-card-body').css('min-height', '');
            $('#courseProfileContent').css('display', 'flex').hide().stop(true, true).fadeIn(200, function () {
                renderLucideIcons($('#courseProfileContent')[0]);
                syncProfileHeight();
            });
            $('#btnPersonalNotice').addClass('active');
            $('#taskHomework').removeClass('active');
            $('#btnNoticeList').removeClass('active');
            $('#btnTopicBanner').removeClass('active');
            window.location.hash = '#profile';
            syncProfileHeight();
        }

        function showHomeworkView() {
            $('#courseStudyContent').hide();
            $('#courseProfileContent').hide();
            $('#courseNoticeContent').hide();
            $('#courseXsxTopicContent').hide();
            $('.profile-card-body').css('min-height', '');
            $('#courseHomeworkContent').css('display', 'flex').hide().stop(true, true).fadeIn(200, function () {
                renderLucideIcons($('#courseHomeworkContent')[0]);
                syncHomeworkHeight();
            });
            $('#taskHomework').addClass('active');
            $('#btnPersonalNotice').removeClass('active');
            $('#btnNoticeList').removeClass('active');
            $('#btnTopicBanner').removeClass('active');
            window.location.hash = '#homework';
            syncHomeworkHeight();
        }

        function showNoticeView() {
            $('#courseStudyContent').hide();
            $('#courseProfileContent').hide();
            $('#courseHomeworkContent').hide();
            $('#courseXsxTopicContent').hide();
            $('.profile-card-body').css('min-height', '');
            $('.homework-card-body').css('min-height', '');
            $('#courseNoticeContent').css('display', 'flex').hide().stop(true, true).fadeIn(200, function () {
                renderLucideIcons($('#courseNoticeContent')[0]);
            });
            $('#btnNoticeList').addClass('active');
            $('#btnPersonalNotice').removeClass('active');
            $('#taskHomework').removeClass('active');
            $('#btnTopicBanner').removeClass('active');
            window.location.hash = '#notice';
        }

        function showStudyView() {
            $('#courseProfileContent').hide();
            $('#courseHomeworkContent').hide();
            $('#courseNoticeContent').hide();
            $('#courseXsxTopicContent').hide();
            $('.profile-card-body').css('min-height', '');
            $('.homework-card-body').css('min-height', '');
            $('#courseStudyContent').stop(true, true).fadeIn(200);
            $('#btnPersonalNotice').removeClass('active');
            $('#taskHomework').removeClass('active');
            $('#btnNoticeList').removeClass('active');
            $('#btnTopicBanner').removeClass('active');
            if (window.location.hash === '#profile' || window.location.hash === '#homework' || window.location.hash === '#notice' || window.location.hash === '#topic') {
                if (history.replaceState) {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                } else {
                    window.location.hash = '';
                }
            }
        }

        function showXsxTopicView() {
            $('#courseStudyContent').hide();
            $('#courseProfileContent').hide();
            $('#courseHomeworkContent').hide();
            $('#courseNoticeContent').hide();
            $('.profile-card-body').css('min-height', '');
            $('.homework-card-body').css('min-height', '');
            $('#courseXsxTopicContent').css('display', 'flex').hide().stop(true, true).fadeIn(200, function () {
                renderLucideIcons($('#courseXsxTopicContent')[0]);
            });
            $('#btnTopicBanner').addClass('active');
            $('#btnPersonalNotice').removeClass('active');
            $('#taskHomework').removeClass('active');
            $('#btnNoticeList').removeClass('active');
            window.location.hash = '#topic';
        }

        // 点击左侧“作业”任务按钮，切换至右侧作业视图
        $(document).off('click', '#taskHomework').on('click', '#taskHomework', function (e) {
            e.preventDefault();
            showHomeworkView();
        });

        // 点击左侧“普通话终测”任务按钮，弹出大尺寸测试指引弹窗；点击“开始测试”后切换为图1答题窗口（参考图2作业样式）
        $(document).off('click', '#taskTest').on('click', '#taskTest', function (e) {
            e.preventDefault();
            e.stopPropagation();
            Swal.fire({
                title: '普通话水平终测',
                html: '<div class="pth-test-modal-content">' +
                      '  <img src="' + iconTips + '" alt="提示" class="pth-modal-icon-tips">' +
                      '  <p class="pth-modal-tip-red">建议使用有麦克风的设备进行本测试。</p>' +
                      '  <p class="pth-modal-tip-red">如您的设备没有麦克风，推荐使用手机完成本测试</p>' +
                      '  <div class="pth-modal-qr-card">' +
                      '    <div class="pth-qr-img-box">' +
                      '      <img src="' + qrcodeImg + '" alt="微信二维码">' +
                      '    </div>' +
                      '    <div class="pth-qr-text-box">' +
                      '      <div class="pth-qr-main">关注</div>' +
                      '      <div class="pth-qr-sub">“泛在云课堂”微信公众号</div>' +
                      '      <div class="pth-qr-sub">使用手机同步学习</div>' +
                      '    </div>' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                confirmButtonText: '<img src="' + btnTest + '" alt="开始测试" class="pth-test-btn-img">',
                confirmButtonAriaLabel: '开始测试',
                customClass: {
                    popup: 'pth-test-modal-popup',
                    title: 'pth-test-modal-title',
                    closeButton: 'pth-test-modal-close',
                    confirmButton: 'pth-test-modal-confirm'
                },
                buttonsStyling: false
            }).then(function (result) {
                if (result.isConfirmed) {
                    openPutonghuaTestModal(1, '普通话水平终测');
                }
            });
        });

        $(document).off('keydown', '#taskTest').on('keydown', '#taskTest', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $('#taskTest').trigger('click');
            }
        });

        // 点击左侧导航“个人中心”按钮
        $('#btnPersonalNotice').on('click', function () {
            showProfileView();
        });

        // 顶栏下拉菜单“个人中心”
        $('#menuItemProfile').on('click', function (e) {
            e.preventDefault();
            $('#userHeaderMenuWrap').removeClass('is-open');
            $('#userMenuBtn').attr('aria-expanded', 'false');
            showProfileView();
        });

        // 点击左侧导航"通知公告"，显示通知公告视图
        $('#btnNoticeList').on('click', function () {
            showNoticeView();
        });

        // 点击左侧"新思想专题" Banner，切换至专题视图
        $('#btnTopicBanner').on('click', function (e) {
            e.preventDefault();
            showXsxTopicView();
        });

        // 点击日历日期，如果当前在个人中心/作业/通知/专题视图，切换回课程学习视图
        $('.cal-cell').on('click', function () {
            if ($('#courseProfileContent').is(':visible') || $('#courseHomeworkContent').is(':visible') || $('#courseNoticeContent').is(':visible') || $('#courseXsxTopicContent').is(':visible')) {
                showStudyView();
            }
        });

        // 页面初始化：如果 URL 带 #profile、#homework、#notice 或 #topic，则默认展开对应视图
        if (window.location.hash === '#profile') {
            showProfileView();
        } else if (window.location.hash === '#homework') {
            showHomeworkView();
        } else if (window.location.hash === '#notice') {
            showNoticeView();
        } else if (window.location.hash === '#topic') {
            showXsxTopicView();
        }

        // 监听浏览器前进后退 hash 变化
        $(window).on('hashchange', function () {
            if (window.location.hash === '#profile') {
                showProfileView();
            } else if (window.location.hash === '#homework') {
                showHomeworkView();
            } else if (window.location.hash === '#notice') {
                showNoticeView();
            } else if (window.location.hash === '#topic') {
                showXsxTopicView();
            } else if ($('#courseProfileContent').is(':visible') || $('#courseHomeworkContent').is(':visible') || $('#courseNoticeContent').is(':visible') || $('#courseXsxTopicContent').is(':visible')) {
                showStudyView();
            }
        });
    }

    // ==================== 顶部右上角用户“我的”下拉菜单 ====================
    function initUserHeaderMenu() {
        var $userHeaderMenuWrap = $('#userHeaderMenuWrap');
        var $userMenuBtn = $('#userMenuBtn');

        if (!$userMenuBtn.length) return;

        $userMenuBtn.on('click', function (e) {
            e.stopPropagation();
            var isOpen = $userHeaderMenuWrap.hasClass('is-open');
            $userHeaderMenuWrap.toggleClass('is-open');
            $userMenuBtn.attr('aria-expanded', !isOpen);
        });

        // 点击页面任意空白区域关闭菜单
        $(document).on('click', function (e) {
            if (!$(e.target).closest('#userHeaderMenuWrap').length) {
                $userHeaderMenuWrap.removeClass('is-open');
                $userMenuBtn.attr('aria-expanded', 'false');
            }
        });

        // 菜单项1：我的课程
        $('#menuItemMyCourse').on('click', function (e) {
            $userHeaderMenuWrap.removeClass('is-open');
            $userMenuBtn.attr('aria-expanded', 'false');

            if (window.location.pathname.indexOf('my-courses') !== -1) {
                e.preventDefault();
                $('html, body').animate({ scrollTop: 0 }, 300);
            } else {
                window.location.href = 'my-courses.html';
            }
        });

        // 菜单项2：修改密码
        $('#menuItemChangePwd').on('click', function (e) {
            e.preventDefault();
            $userHeaderMenuWrap.removeClass('is-open');
            $userMenuBtn.attr('aria-expanded', 'false');

            Swal.fire({
                title: '修改密码',
                html: '<div class="pwd-dialog-form">' +
                      '  <div class="pwd-field-row">' +
                      '    <label for="oldPwd"><i data-lucide="key-round" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:4px;"></i> 原密码</label>' +
                      '    <input type="password" id="oldPwd" class="custom-pwd-input" placeholder="请输入原密码">' +
                      '  </div>' +
                      '  <div class="pwd-field-row">' +
                      '    <label for="newPwd"><i data-lucide="lock" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:4px;"></i> 新密码</label>' +
                      '    <input type="password" id="newPwd" class="custom-pwd-input" placeholder="请输入6-18位新密码">' +
                      '  </div>' +
                      '  <div class="pwd-field-row">' +
                      '    <label for="confirmPwd"><i data-lucide="lock" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:4px;"></i> 确认新密码</label>' +
                      '    <input type="password" id="confirmPwd" class="custom-pwd-input" placeholder="请再次输入新密码">' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: '确定修改',
                cancelButtonText: '取消',
                customClass: {
                    popup: 'notice-modal-popup pwd-modal-popup',
                    title: 'notice-modal-title-bar',
                    confirmButton: 'notice-modal-btn-confirm',
                    cancelButton: 'notice-modal-btn-cancel'
                },
                buttonsStyling: false,
                didOpen: function () {
                    renderLucideIcons(Swal.getPopup());
                },
                preConfirm: function () {
                    var oldVal = ($('#oldPwd').val() || '').trim();
                    var newVal = ($('#newPwd').val() || '').trim();
                    var confVal = ($('#confirmPwd').val() || '').trim();
                    if (!oldVal) {
                        Swal.showValidationMessage('请输入原密码');
                        return false;
                    }
                    if (!newVal || newVal.length < 6) {
                        Swal.showValidationMessage('新密码长度不能少于6位');
                        return false;
                    }
                    if (newVal !== confVal) {
                        Swal.showValidationMessage('两次输入的新密码不一致');
                        return false;
                    }
                    return true;
                }
            }).then(function (result) {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: '提示',
                        html: '<div style="text-align:center; padding: 10px 0;"><div style="color: #00a86b; margin-bottom: 8px;"><i data-lucide="check-circle-2" style="width: 36px; height: 36px; display: inline-block;"></i></div><div style="font-size: 15px; color: #00a86b; font-weight: 600;">密码修改成功，请妥善保管新密码！</div></div>',
                        showCloseButton: true,
                        confirmButtonText: '确定',
                        customClass: {
                            popup: 'notice-modal-popup',
                            title: 'notice-modal-title-bar',
                            confirmButton: 'notice-modal-btn-confirm'
                        },
                        buttonsStyling: false,
                        didOpen: function () {
                            renderLucideIcons(Swal.getPopup());
                        }
                    });
                }
            });
        });

        // 菜单项3：退出登录（直接跳转至登录页）
        $('#menuItemLogout').on('click', function (e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }

    // ==================== 课程学习首次进入页交互 ====================
    function initCourseFirstPage() {
        renderLucideIcons();

        $(document).off('click', '#btnStartPthTest').on('click', '#btnStartPthTest', function (e) {
            e.preventDefault();
            e.stopPropagation();
            Swal.fire({
                title: '普通话水平初测',
                html: '<div class="pth-test-modal-content">' +
                      '  <img src="' + iconTips + '" alt="提示" class="pth-modal-icon-tips">' +
                      '  <p class="pth-modal-tip-red">建议使用有麦克风的设备进行本测试。</p>' +
                      '  <p class="pth-modal-tip-red">如您的设备没有麦克风，推荐使用手机完成本测试</p>' +
                      '  <div class="pth-modal-qr-card">' +
                      '    <div class="pth-qr-img-box">' +
                      '      <img src="' + qrcodeImg + '" alt="微信二维码">' +
                      '    </div>' +
                      '    <div class="pth-qr-text-box">' +
                      '      <div class="pth-qr-main">关注</div>' +
                      '      <div class="pth-qr-sub">“泛在云课堂”微信公众号</div>' +
                      '      <div class="pth-qr-sub">使用手机同步学习</div>' +
                      '    </div>' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                confirmButtonText: '<img src="' + btnTest + '" alt="开始测试" class="pth-test-btn-img">',
                confirmButtonAriaLabel: '开始测试',
                customClass: {
                    popup: 'pth-test-modal-popup',
                    title: 'pth-test-modal-title',
                    closeButton: 'pth-test-modal-close',
                    confirmButton: 'pth-test-modal-confirm'
                },
                buttonsStyling: false
            }).then(function (result) {
                if (result.isConfirmed) {
                    openPutonghuaTestModal(1, '普通话水平初测');
                }
            });
        });

        $(document).off('keydown', '#btnStartPthTest').on('keydown', '#btnStartPthTest', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $('#btnStartPthTest').trigger('click');
            }
        });
    }

    // AI伴学悬浮球通用点击交互
    $(document).on('click', '#aiCompanionBtn', function () {
        Swal.fire({
            title: 'AI伴学小助手',
            html: '<div style="text-align:center; padding: 12px 0;">' +
                  '  <div style="font-size: 15px; color: #333; line-height: 1.8;">您好！我是您的智能伴学助手小音。<br>在接下来的课程学习与普通话测试中，有任何问题都可以随时找我！</div>' +
                  '</div>',
            confirmButtonText: '开始学习',
            confirmButtonColor: '#00a86b'
        });
    });

    // ==================== 教师批阅作业页交互逻辑 ====================
    function initHomeworkReviewPage() {
        renderLucideIcons();

        var isLoading = false;
        var defaultPageSize = 10;
        var loadBatchSize = 10;

        // 获取当前激活 Tab 的状态 ('unreviewed' 或 'reviewed')
        function getCurrentStatus() {
            return $('.hw-card-tabs-header .hw-tab-btn.active').data('status') || 'unreviewed';
        }

        // 获取当前选中作业在当前状态下的总条数
        function getCurrentTotal() {
            var $curHw = $('#hwMenuList .hw-menu-item.active');
            var status = getCurrentStatus();
            if (status === 'unreviewed') {
                return parseInt($curHw.data('unreviewed'), 10) || 24;
            } else {
                return parseInt($curHw.data('reviewed'), 10) || 354;
            }
        }

        // 获取当前列表容器
        function getCurrentList() {
            var status = getCurrentStatus();
            return status === 'unreviewed' ? $('#unreviewedStudentList') : $('#reviewedStudentList');
        }

        // 创建学员条目 HTML
        function createStudentRowHtml(index, status) {
            var id = (status === 'unreviewed' ? 100 : 200) + index;
            var actionHtml = '<span class="hw-audio-duration">时长: mm:ss</span>';
            if (status === 'reviewed') {
                actionHtml += '<span class="hw-student-score">分数：XX</span>';
            }
            return '' +
                '<li class="hw-student-row' + (status === 'reviewed' ? ' hw-student-reviewed' : '') + '" data-id="' + id + '" data-name="昵称xxxxxxxx" data-duration="mm:ss" title="点击开始作业批阅">' +
                '  <div class="hw-student-info">' +
                '    <div class="hw-avatar-wrap">' +
                '      <img src="' + avtImg + '" alt="学员头像" class="hw-student-avatar">' +
                '    </div>' +
                '    <span class="hw-student-name">昵称xxxxxxxx</span>' +
                '  </div>' +
                '  <div class="hw-student-action">' +
                '    ' + actionHtml +
                '  </div>' +
                '</li>';
        }

        // 重置指定列表为默认 10 条
        function resetList(status) {
            var $list = status === 'unreviewed' ? $('#unreviewedStudentList') : $('#reviewedStudentList');
            var total = (status === 'unreviewed')
                ? (parseInt($('#hwMenuList .hw-menu-item.active').data('unreviewed'), 10) || 24)
                : (parseInt($('#hwMenuList .hw-menu-item.active').data('reviewed'), 10) || 354);
            var initialCount = Math.min(defaultPageSize, total);

            var html = '';
            for (var i = 1; i <= initialCount; i++) {
                html += createStudentRowHtml(i, status);
            }
            $list.html(html);
            updateLoadingStatus();
        }

        // 更新触底状态提示
        function updateLoadingStatus() {
            var $status = $('#hwLoadingStatus');
            var total = getCurrentTotal();
            var count = getCurrentList().children('.hw-student-row').length;

            if (isLoading) {
                $status.html('<div class="hw-loading-spinner"></div><span>正在加载更多数据...</span>').show();
            } else if (count >= total) {
                $status.html('<span>— 已加载全部数据 —</span>').show();
            } else {
                $status.hide();
            }
        }

        // 动态加载下一批 10 条
        function loadMoreItems() {
            if (isLoading) return;

            var $list = getCurrentList();
            var total = getCurrentTotal();
            var currentCount = $list.children('.hw-student-row').length;

            if (currentCount >= total) {
                updateLoadingStatus();
                return;
            }

            isLoading = true;
            updateLoadingStatus();

            setTimeout(function () {
                var itemsToAdd = Math.min(loadBatchSize, total - currentCount);
                var newHtml = '';
                var status = getCurrentStatus();

                for (var i = 1; i <= itemsToAdd; i++) {
                    newHtml += createStudentRowHtml(currentCount + i, status);
                }

                var $newElements = $(newHtml);
                $newElements.hide();
                $list.append($newElements);
                $newElements.fadeIn(250);

                isLoading = false;
                updateLoadingStatus();
            }, 300);
        }

        // 检测是否滚动或滑动到底部
        function checkScrollToBottom() {
            if (isLoading) return;

            var $cardBody = $('.hw-card-body');
            if (!$cardBody.length) return;

            var cardBottom = $cardBody.offset().top + $cardBody.outerHeight();
            var windowBottom = $(window).scrollTop() + $(window).height();

            // 当视口底部距离卡片底部小于等于 120px 时触发加载
            if (windowBottom >= cardBottom - 120) {
                loadMoreItems();
            }
        }

        // 绑定窗口滚动事件（防抖/节流）
        var scrollTimer = null;
        $(window).on('scroll', function () {
            if (scrollTimer) return;
            scrollTimer = setTimeout(function () {
                scrollTimer = null;
                checkScrollToBottom();
            }, 100);
        });

        // 绑定鼠标滚轮向下滑动事件（支持大屏或未完全占满视口时的下滑意图）
        $(window).on('wheel', function (e) {
            if (e.originalEvent && e.originalEvent.deltaY > 0) {
                var $cardBody = $('.hw-card-body');
                if (!$cardBody.length) return;
                var cardBottom = $cardBody.offset().top + $cardBody.outerHeight();
                var windowBottom = $(window).scrollTop() + $(window).height();
                if (windowBottom >= cardBottom - 160) {
                    loadMoreItems();
                }
            }
        });

        // 1. 左侧作业菜单项点击切换
        $('#hwMenuList').on('click', '.hw-menu-item', function () {
            var $item = $(this);
            if ($item.hasClass('active')) return;

            $('#hwMenuList .hw-menu-item').removeClass('active');
            $item.addClass('active');

            var unreviewed = $item.data('unreviewed') || 0;
            var reviewed = $item.data('reviewed') || 0;

            $('#countUnfinished').text('(' + unreviewed + ')');
            $('#countFinished').text('(' + reviewed + ')');

            // 切换作业时重置当前列表为 10 条
            isLoading = false;
            resetList('unreviewed');
            resetList('reviewed');
        });

        // 2. 右侧顶栏 Tab 切换（未完成批阅 / 已完成批阅）
        $('.hw-card-tabs-header').on('click', '.hw-tab-btn', function () {
            var $tab = $(this);
            if ($tab.hasClass('active')) return;

            $('.hw-card-tabs-header .hw-tab-btn').removeClass('active');
            $tab.addClass('active');

            var status = $tab.data('status');
            if (status === 'unreviewed') {
                $('#panelUnfinished').addClass('active');
                $('#panelFinished').removeClass('active');
            } else {
                $('#panelFinished').addClass('active');
                $('#panelUnfinished').removeClass('active');
            }

            isLoading = false;
            updateLoadingStatus();
        });

        // 3. 点击学员行打开“作业批阅”弹窗
        $(document).off('click', '.hw-student-row').on('click', '.hw-student-row', function (e) {
            e.preventDefault();
            var $row = $(this);
            var studentId = $row.data('id') || '101';
            var studentName = $row.find('.hw-student-name').text().trim() || '学员作业';
            var isReviewed = $row.hasClass('hw-student-reviewed');
            var hwTitle = $('#hwMenuList .hw-menu-item.active').data('title') || '作业一：声母发音训练';

            // 初始评分 (语音发音: 12, 共鸣气息: 15, 技巧运用: 15, 情感表达: 15，总分 57)
            var scores = {
                pronunciation: 12,
                breath: 15,
                skill: 15,
                emotion: 15
            };

            function calcTotal() {
                return scores.pronunciation + scores.breath + scores.skill + scores.emotion;
            }

            var modalHtml = '' +
                '<div class="hw-review-modal-box">' +
                '  <div class="hw-review-modal-head">' +
                '    <h2 class="hw-review-modal-title">作业批阅</h2>' +
                '  </div>' +
                '  <div class="hw-review-modal-body">' +
                '    <!-- 视音频播放器 -->' +
                '    <div class="hw-review-player-card">' +
                '      <div class="hw-review-video-stage" id="hwReviewVideoStage">' +
                '        <video id="hwReviewVideo" src="style/img/v.mp4" poster="style/img/p01.jpg" preload="metadata" playsinline></video>' +
                '        <div class="hw-video-center-play" id="hwReviewCenterPlay" title="点击播放">' +
                '          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>' +
                '        </div>' +
                '      </div>' +
                '      <div class="hw-review-player-ctrls">' +
                '        <button type="button" class="btn-ctrl-play" id="hwReviewBtnPlay" title="播放/暂停">' +
                '          <svg class="icon-play-ctrl" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>' +
                '        </button>' +
                '        <span class="hw-review-time-txt" id="hwReviewCurrentTime">00:00</span>' +
                '        <div class="hw-review-progress-track" id="hwReviewTrack" title="点击拖拽调整进度">' +
                '          <div class="hw-review-progress-fill" id="hwReviewFill" style="width: 0%;"></div>' +
                '          <div class="hw-review-progress-thumb" id="hwReviewThumb" style="left: 0%;"></div>' +
                '        </div>' +
                '        <span class="hw-review-time-txt" id="hwReviewTotalTime">00:35</span>' +
                '        <select class="hw-review-rate-select" id="hwReviewRateSelect" title="播放倍速">' +
                '          <option value="0.75">0.75x</option>' +
                '          <option value="1.0" selected>1.0x</option>' +
                '          <option value="1.25">1.25x</option>' +
                '          <option value="1.5">1.5x</option>' +
                '          <option value="2.0">2.0x</option>' +
                '        </select>' +
                '        <button type="button" class="btn-ctrl-fullscreen" id="hwReviewFullscreenBtn" title="全屏">' +
                '          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>' +
                '          </svg>' +
                '        </button>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- 评分滑块列表 -->' +
                '    <div class="hw-review-criteria-list">' +
                '      <!-- 维度 1：语音发音 -->' +
                '      <div class="hw-criteria-row" data-field="pronunciation">' +
                '        <label class="hw-criteria-label">语音发音：</label>' +
                '        <span class="hw-scale-bound">0</span>' +
                '        <div class="hw-slider-box">' +
                '          <div class="hw-slider-track">' +
                '            <div class="hw-slider-fill" style="width: 48%;"></div>' +
                '            <div class="hw-slider-badge-thumb" style="left: 48%;">12</div>' +
                '          </div>' +
                '          <input type="range" class="hw-range-input" min="0" max="25" value="12" data-field="pronunciation">' +
                '        </div>' +
                '        <span class="hw-scale-bound">25</span>' +
                '      </div>' +
                '' +
                '      <!-- 维度 2：共鸣气息 -->' +
                '      <div class="hw-criteria-row" data-field="breath">' +
                '        <label class="hw-criteria-label">共鸣气息：</label>' +
                '        <span class="hw-scale-bound">0</span>' +
                '        <div class="hw-slider-box">' +
                '          <div class="hw-slider-track">' +
                '            <div class="hw-slider-fill" style="width: 60%;"></div>' +
                '            <div class="hw-slider-badge-thumb" style="left: 60%;">15</div>' +
                '          </div>' +
                '          <input type="range" class="hw-range-input" min="0" max="25" value="15" data-field="breath">' +
                '        </div>' +
                '        <span class="hw-scale-bound">25</span>' +
                '      </div>' +
                '' +
                '      <!-- 维度 3：技巧运用 -->' +
                '      <div class="hw-criteria-row" data-field="skill">' +
                '        <label class="hw-criteria-label">技巧运用：</label>' +
                '        <span class="hw-scale-bound">0</span>' +
                '        <div class="hw-slider-box">' +
                '          <div class="hw-slider-track">' +
                '            <div class="hw-slider-fill" style="width: 60%;"></div>' +
                '            <div class="hw-slider-badge-thumb" style="left: 60%;">15</div>' +
                '          </div>' +
                '          <input type="range" class="hw-range-input" min="0" max="25" value="15" data-field="skill">' +
                '        </div>' +
                '        <span class="hw-scale-bound">25</span>' +
                '      </div>' +
                '' +
                '      <!-- 维度 4：情感表达 -->' +
                '      <div class="hw-criteria-row" data-field="emotion">' +
                '        <label class="hw-criteria-label">情感表达：</label>' +
                '        <span class="hw-scale-bound">0</span>' +
                '        <div class="hw-slider-box">' +
                '          <div class="hw-slider-track">' +
                '            <div class="hw-slider-fill" style="width: 60%;"></div>' +
                '            <div class="hw-slider-badge-thumb" style="left: 60%;">15</div>' +
                '          </div>' +
                '          <input type="range" class="hw-range-input" min="0" max="25" value="15" data-field="emotion">' +
                '        </div>' +
                '        <span class="hw-scale-bound">25</span>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- 总分 -->' +
                '    <div class="hw-review-total-row">' +
                '      <span class="hw-total-label">总分：</span>' +
                '      <span class="hw-total-number" id="hwReviewTotalScore">57</span>' +
                '      <span class="hw-total-max">/ 100分</span>' +
                '    </div>' +
                '  </div>' +
                '' +
                '  <!-- 弹窗底部操作条 -->' +
                '  <div class="hw-review-modal-foot">' +
                '    <div class="hw-review-foot-tip">' +
                '      <span class="tip-tag">逻辑说明：</span>评分后列表数据动态异步刷新' +
                '    </div>' +
                '    <div class="hw-review-foot-actions">' +
                '      <button type="button" class="btn-hw-review-submit" id="btnHwReviewSubmit">评分</button>' +
                '      <button type="button" class="btn-hw-review-cancel" id="btnHwReviewCancel">放弃</button>' +
                '    </div>' +
                '  </div>' +
                '</div>';

            Swal.fire({
                html: modalHtml,
                showConfirmButton: false,
                showCloseButton: true,
                customClass: {
                    popup: 'hw-review-modal-popup',
                    closeButton: 'hw-review-modal-close'
                },
                buttonsStyling: false,
                didOpen: function () {
                    var $popup = $(Swal.getPopup());
                    var videoEl = $popup.find('#hwReviewVideo')[0];
                    var $btnPlay = $popup.find('#hwReviewBtnPlay');
                    var $centerPlay = $popup.find('#hwReviewCenterPlay');
                    var $timeCur = $popup.find('#hwReviewCurrentTime');
                    var $timeTotal = $popup.find('#hwReviewTotalTime');
                    var $track = $popup.find('#hwReviewTrack');
                    var $fill = $popup.find('#hwReviewFill');
                    var $thumb = $popup.find('#hwReviewThumb');
                    var $rateSelect = $popup.find('#hwReviewRateSelect');
                    var $fullscreenBtn = $popup.find('#hwReviewFullscreenBtn');
                    var $totalScore = $popup.find('#hwReviewTotalScore');

                    var playSvg = '<svg class="icon-play-ctrl" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
                    var pauseSvg = '<svg class="icon-pause-ctrl" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';

                    function formatVideoTime(s) {
                        var m = Math.floor(s / 60);
                        var sec = Math.floor(s % 60);
                        return (m < 10 ? '0' + m : '' + m) + ':' + (sec < 10 ? '0' + sec : '' + sec);
                    }

                    function updateVideoProgress() {
                        if (!videoEl.duration) return;
                        var pct = (videoEl.currentTime / videoEl.duration) * 100;
                        $fill.css('width', pct + '%');
                        $thumb.css('left', pct + '%');
                        $timeCur.text(formatVideoTime(videoEl.currentTime));
                    }

                    // 播放与暂停切换
                    function toggleVideoPlay() {
                        if (videoEl.paused || videoEl.ended) {
                            videoEl.play().catch(function () {});
                            $btnPlay.html(pauseSvg);
                            $centerPlay.fadeOut(150);
                        } else {
                            videoEl.pause();
                            $btnPlay.html(playSvg);
                            $centerPlay.fadeIn(150);
                        }
                    }

                    $btnPlay.on('click', toggleVideoPlay);
                    $centerPlay.on('click', toggleVideoPlay);
                    $popup.find('#hwReviewVideoStage').on('click', function (e) {
                        if (e.target.id === 'hwReviewVideo') {
                            toggleVideoPlay();
                        }
                    });

                    videoEl.addEventListener('loadedmetadata', function () {
                        $timeTotal.text(formatVideoTime(videoEl.duration || 35));
                    });

                    videoEl.addEventListener('timeupdate', updateVideoProgress);

                    videoEl.addEventListener('ended', function () {
                        $btnPlay.html(playSvg);
                        $centerPlay.fadeIn(150);
                    });

                    // 拖拽/点击进度条寻道
                    $track.on('click', function (e) {
                        var trackW = $(this).width();
                        var clickX = e.pageX - $(this).offset().left;
                        var pct = Math.max(0, Math.min(1, clickX / trackW));
                        if (videoEl.duration) {
                            videoEl.currentTime = pct * videoEl.duration;
                            updateVideoProgress();
                        }
                    });

                    // 倍速调整
                    $rateSelect.on('change', function () {
                        videoEl.playbackRate = parseFloat($(this).val()) || 1.0;
                    });

                    // 视频全屏
                    $fullscreenBtn.on('click', function () {
                        if (videoEl.requestFullscreen) {
                            videoEl.requestFullscreen();
                        } else if (videoEl.webkitRequestFullscreen) {
                            videoEl.webkitRequestFullscreen();
                        } else if (videoEl.msRequestFullscreen) {
                            videoEl.msRequestFullscreen();
                        }
                    });

                    // 4个滑动评分条交互
                    $popup.find('.hw-range-input').on('input', function () {
                        var $input = $(this);
                        var val = parseInt($input.val(), 10);
                        var field = $input.data('field');
                        var max = parseInt($input.attr('max'), 10) || 25;
                        var pct = (val / max) * 100;

                        scores[field] = val;

                        var $row = $input.closest('.hw-criteria-row');
                        $row.find('.hw-slider-fill').css('width', pct + '%');
                        $row.find('.hw-slider-badge-thumb').css('left', pct + '%').text(val);

                        // 更新总分
                        $totalScore.text(calcTotal());
                    });

                    // 放弃按钮
                    $popup.find('#btnHwReviewCancel').on('click', function () {
                        videoEl.pause();
                        Swal.close();
                    });

                    // 评分提交按钮：异步更新列表数据
                    $popup.find('#btnHwReviewSubmit').on('click', function () {
                        var finalTotal = calcTotal();
                        videoEl.pause();

                        // 异步更新数据
                        var $curItem = $('#hwMenuList .hw-menu-item.active');
                        var unreviewedCount = parseInt($curItem.data('unreviewed'), 10) || 24;
                        var reviewedCount = parseInt($curItem.data('reviewed'), 10) || 354;

                        if (!isReviewed && unreviewedCount > 0) {
                            unreviewedCount--;
                            reviewedCount++;
                            $curItem.data('unreviewed', unreviewedCount);
                            $curItem.data('reviewed', reviewedCount);

                            $('#countUnfinished').text('(' + unreviewedCount + ')');
                            $('#countFinished').text('(' + reviewedCount + ')');

                            // 如果未完成为0，移除红点
                            if (unreviewedCount === 0) {
                                $curItem.find('.hw-item-dot').remove();
                            }

                            // 动态从当前“未完成批阅”列表中移除该行并以淡出动画过渡
                            $row.fadeOut(300, function () {
                                $(this).remove();
                                updateLoadingStatus();
                            });

                            // 动态向“已完成批阅”列表头部插入该学员行
                            var newReviewedRow = '' +
                                '<li class="hw-student-row hw-student-reviewed" data-id="' + studentId + '" data-name="' + studentName + '" data-duration="01:25" title="点击查看批阅详情">' +
                                '  <div class="hw-student-info">' +
                                '    <div class="hw-avatar-wrap">' +
                                '      <img src="' + avtImg + '" alt="学员头像" class="hw-student-avatar">' +
                                '    </div>' +
                                '    <span class="hw-student-name">' + studentName + '</span>' +
                                '  </div>' +
                                '  <div class="hw-student-action">' +
                                '    <span class="hw-audio-duration">时长: 01:25</span>' +
                                '    <span class="hw-student-score" style="color:#0da178; font-weight:700;">分数：' + finalTotal + '分</span>' +
                                '  </div>' +
                                '</li>';

                            var $newRow = $(newReviewedRow);
                            $('#reviewedStudentList').prepend($newRow);
                        } else if (isReviewed) {
                            // 若是修改已批阅学员的评分，直接刷新分数显示
                            $row.find('.hw-student-score').html('分数：<strong style="color:#0da178;">' + finalTotal + '分</strong>');
                        }

                        Swal.fire({
                            html: '<div class="hw-score-icon-wrap">' +
                                  '  <i data-lucide="check-circle-2" class="hw-score-lucide-icon"></i>' +
                                  '</div>' +
                                  '<h2 class="hw-score-success-title">评分完成</h2>' +
                                  '<div class="hw-score-card-box">' +
                                  '  <div class="hw-score-student-line">学员 <span class="student-badge-highlight">' + studentName + '</span> 本次作业总分为：<span class="score-badge-highlight">' + finalTotal + '</span><span style="font-size:14px; color:#0da178; font-weight:700;">分</span></div>' +
                                  '  <div class="hw-score-sub-tip">批阅列表数据已动态异步更新</div>' +
                                  '</div>',
                            confirmButtonText: '确定',
                            showCloseButton: true,
                            customClass: {
                                popup: 'hw-score-success-popup',
                                closeButton: 'hw-score-success-close',
                                confirmButton: 'hw-score-confirm-btn'
                            },
                            buttonsStyling: false,
                            didOpen: function () {
                                var popupEl = Swal.getPopup();
                                renderLucideIcons(popupEl);
                            }
                        });
                    });
                }
            });
        });

        // 初始状态更新
        updateLoadingStatus();
    }

    // ==================== 个人中心页交互逻辑 (profile.html) ====================
    function initProfilePage() {
        renderLucideIcons();

        // 1. 三项 Folder-Tab 选项卡切换
        $('.profile-card-tabs-header').on('click', '.profile-tab-btn', function () {
            var $tab = $(this);
            if ($tab.hasClass('active')) return;

            $('.profile-card-tabs-header .profile-tab-btn').removeClass('active');
            $tab.addClass('active');

            var targetId = $tab.data('target');
            $('.profile-card-body .profile-panel').removeClass('active');
            $('#' + targetId).addClass('active');
            renderLucideIcons($('#' + targetId)[0]);
            if (targetId === 'panelProfileArchive') {
                renderArchiveCharts();
            }
            syncProfileHeight();
        });

        // 2. 短信验证码倒计时
        $('#btnGetCode').on('click', function () {
            startSmsCountdown($(this));
        });

        // 3. 更换微信操作弹窗 (按设计图定制)
        $('#btnChangeWechat').on('click', function (e) {
            e.preventDefault();
            Swal.fire({
                title: '<div class="wechat-modal-title-text">修改关联的微信</div><div class="wechat-modal-tip">微信仅可更换一次！</div>',
                html: '<div class="wechat-modal-form">' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label">当前关联的微信：</label>' +
                      '    <div class="wechat-modal-val wechat-user-val">' +
                      '      <img src="' + avtImg + '" alt="微信头像" class="wechat-modal-avatar">' +
                      '      <span class="wechat-modal-nickname">昵称xxxxx</span>' +
                      '    </div>' +
                      '  </div>' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label">手机号：</label>' +
                      '    <div class="wechat-modal-val">' +
                      '      <span class="wechat-modal-phone-text">186****1234（回显时隐藏中间4位）</span>' +
                      '    </div>' +
                      '  </div>' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label"><span class="wechat-modal-star">*</span>短信验证码：</label>' +
                      '    <div class="wechat-modal-val wechat-code-val">' +
                      '      <input type="text" id="modalWechatCode" class="wechat-modal-code-input" placeholder="" maxlength="6">' +
                      '      <button type="button" class="btn-wechat-getcode" id="modalBtnGetWechatCode">获取验证码</button>' +
                      '    </div>' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: '确认修改',
                cancelButtonText: '取消',
                customClass: {
                    popup: 'notice-modal-popup wechat-modal-popup',
                    title: 'notice-modal-title-bar wechat-modal-title-bar',
                    actions: 'wechat-modal-actions',
                    confirmButton: 'wechat-modal-btn-confirm',
                    cancelButton: 'wechat-modal-btn-cancel'
                },
                buttonsStyling: false,
                didOpen: function () {
                    $('#modalBtnGetWechatCode').on('click', function () {
                        startSmsCountdown($(this));
                    });
                },
                preConfirm: function () {
                    var code = ($('#modalWechatCode').val() || '').trim();
                    if (!code) {
                        Swal.showValidationMessage('请输入短信验证码');
                        return false;
                    }
                    return true;
                }
            }).then(function (res) {
                if (res.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: '修改成功',
                        text: '您已成功更换绑定微信！',
                        confirmButtonText: '确定',
                        confirmButtonColor: '#0da178',
                        customClass: {
                            popup: 'notice-modal-popup',
                            title: 'notice-modal-title-bar',
                            confirmButton: 'wechat-modal-btn-confirm'
                        },
                        buttonsStyling: false
                    });
                }
            });
        });

        // 4. 修改手机号操作弹窗 (按设计图定制)
        $('#btnChangePhone').on('click', function (e) {
            e.preventDefault();
            Swal.fire({
                title: '<div class="wechat-modal-title-text">修改手机号</div>',
                html: '<div class="wechat-modal-form">' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label">手机号：</label>' +
                      '    <div class="wechat-modal-val">' +
                      '      <span class="wechat-modal-phone-text">186****1234（回显时隐藏中间4位）</span>' +
                      '    </div>' +
                      '  </div>' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label"><span class="wechat-modal-star">*</span>短信验证码：</label>' +
                      '    <div class="wechat-modal-val wechat-code-val">' +
                      '      <input type="text" id="modalOldPhoneCode" class="wechat-modal-code-input" placeholder="" maxlength="6">' +
                      '      <button type="button" class="btn-wechat-getcode" id="modalBtnGetOldPhoneCode">获取验证码</button>' +
                      '    </div>' +
                      '  </div>' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label"><span class="wechat-modal-star">*</span>更换的手机号：</label>' +
                      '    <div class="wechat-modal-val">' +
                      '      <input type="text" id="modalNewPhone" class="wechat-modal-code-input" placeholder="" maxlength="11">' +
                      '    </div>' +
                      '  </div>' +
                      '  <div class="wechat-modal-row">' +
                      '    <label class="wechat-modal-label"><span class="wechat-modal-star">*</span>短信验证码：</label>' +
                      '    <div class="wechat-modal-val wechat-code-val">' +
                      '      <input type="text" id="modalNewPhoneCode" class="wechat-modal-code-input" placeholder="" maxlength="6">' +
                      '      <button type="button" class="btn-wechat-getcode" id="modalBtnGetNewPhoneCode">获取验证码</button>' +
                      '    </div>' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: '确认修改',
                cancelButtonText: '取消',
                customClass: {
                    popup: 'notice-modal-popup wechat-modal-popup',
                    title: 'notice-modal-title-bar wechat-modal-title-bar',
                    actions: 'wechat-modal-actions',
                    confirmButton: 'wechat-modal-btn-confirm',
                    cancelButton: 'wechat-modal-btn-cancel'
                },
                buttonsStyling: false,
                didOpen: function () {
                    $('#modalBtnGetOldPhoneCode').on('click', function () {
                        startSmsCountdown($(this));
                    });
                    $('#modalBtnGetNewPhoneCode').on('click', function () {
                        var np = ($('#modalNewPhone').val() || '').trim();
                        if (!np || np.length !== 11) {
                            Swal.showValidationMessage('请先输入正确的11位更换的手机号');
                            return;
                        }
                        startSmsCountdown($(this));
                    });
                },
                preConfirm: function () {
                    var oldCode = ($('#modalOldPhoneCode').val() || '').trim();
                    var newPhone = ($('#modalNewPhone').val() || '').trim();
                    var newCode = ($('#modalNewPhoneCode').val() || '').trim();

                    if (!oldCode) {
                        Swal.showValidationMessage('请输入原手机号的短信验证码');
                        return false;
                    }
                    if (!newPhone || newPhone.length !== 11) {
                        Swal.showValidationMessage('请输入正确的11位更换的手机号');
                        return false;
                    }
                    if (!newCode) {
                        Swal.showValidationMessage('请输入新手机号的短信验证码');
                        return false;
                    }
                    return { newPhone: newPhone };
                }
            }).then(function (res) {
                if (res.isConfirmed && res.value) {
                    var masked = res.value.newPhone.slice(0, 3) + '****' + res.value.newPhone.slice(7);
                    $('.profile-phone-text').text(masked + ' (回显时隐藏中间4位)');
                    Swal.fire({
                        icon: 'success',
                        title: '修改成功',
                        text: '手机号已成功变更为 ' + masked,
                        confirmButtonText: '确定',
                        confirmButtonColor: '#0da178',
                        customClass: {
                            popup: 'notice-modal-popup',
                            title: 'notice-modal-title-bar',
                            confirmButton: 'wechat-modal-btn-confirm'
                        },
                        buttonsStyling: false
                    });
                }
            });
        });

        // 5. 确认修改按钮
        $('#btnSubmitProfile').on('click', function () {
            var school = ($('#inputSchool').val() || '').trim();
            if (!school) {
                Swal.fire({
                    icon: 'warning',
                    title: '请填写所在学校',
                    confirmButtonText: '确定',
                    confirmButtonColor: '#0da178'
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: '修改成功',
                text: '您的个人资料信息已保存生效！',
                confirmButtonText: '确定',
                confirmButtonColor: '#0da178'
            });
        });

        // 6. 结业证书预览与下载
        $('#btnCertPreview, #btnCertDownload, #btnViewCert').on('click', function () {
            Swal.fire({
                title: '“童语同音” 研修结业证书',
                html: '<div style="text-align:center; padding: 10px 0;">' +
                      '  <div style="border: 2px solid #5ecb96; border-radius: 12px; padding: 18px; background:#f9fdfa; margin-bottom:12px;">' +
                      '    <div style="font-size:20px; font-weight:bold; color:#0da178; margin-bottom:6px;">结 业 证 书</div>' +
                      '    <div style="font-size:13px; color:#666; margin-bottom:14px;">CERTIFICATE OF COMPLETION</div>' +
                      '    <div style="font-size:15px; color:#333; line-height:1.8;">兹证明 <strong style="color:#0da178;">张三</strong> 老师参加学前儿童普通话师资培训，修完规定课程，考核成绩合格，准予结业。</div>' +
                      '    <div style="margin-top:16px; font-size:13px; color:#888; text-align:right;">证书编号：TYTY-2026-02-0612<br>发证日期：2026年09月</div>' +
                      '  </div>' +
                      '</div>',
                showCloseButton: true,
                confirmButtonText: '下载高清证书 (PDF)',
                confirmButtonColor: '#0da178',
                showCancelButton: true,
                cancelButtonText: '关闭',
                customClass: {
                    confirmButton: 'notice-modal-btn-confirm',
                    cancelButton: 'notice-modal-btn-cancel'
                },
                buttonsStyling: false
            }).then(function (res) {
                if (res.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: '开始下载',
                        text: '结业证书已开始生成并下载！',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
        });

        // 7. 个人中心左侧计划表常规交互复用
        if ($('.profile-layout').length > 0) {
            $('#btnNoticeList').on('click', function () {
                window.location.href = 'course.html';
            });
        }

        // 8. 成长档案 ECharts 统计图表渲染 (与页面色彩风格统一)
        var archiveCharts = {
            video: null,
            quizScore: null,
            quizCount: null,
            compare: null,
            radar: null
        };

        function renderArchiveCharts() {
            setTimeout(function () {
                var $videoEl = $('#chartVideoWatch');
                if ($videoEl.length === 0 || !$('#panelProfileArchive').hasClass('active')) return;

                // 1. 视频观看曲线 (主题绿配色)
                if (!archiveCharts.video && $videoEl.length) {
                    archiveCharts.video = echarts.init($videoEl[0]);
                    var videoDates = [];
                    for (var d = 1; d <= 28; d++) {
                        videoDates.push('2026/2/' + d);
                    }
                    var videoValues = [5, 3, 0, 7, 2, 3, 8, 1, 0, 6, 7, 2, 4, 2, 1, 2, 4, 3, 1, 0, 6, 4, 8, 9, 4, 1, 3, 5];
                    archiveCharts.video.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b}<br/>观看视频：{c} 个'
                        },
                        grid: {
                            top: 25,
                            left: 30,
                            right: 25,
                            bottom: 45,
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: videoDates,
                            axisLine: { lineStyle: { color: '#a1e2c1' } },
                            axisTick: { show: false },
                            axisLabel: {
                                color: '#555555',
                                interval: function (idx) {
                                    return idx === 0 || idx === 7 || idx === 14 || idx === 21 || idx === 27;
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            min: 0,
                            max: 10,
                            interval: 2.5,
                            splitLine: {
                                lineStyle: { color: '#eef8f2' }
                            },
                            axisLabel: {
                                color: '#888888'
                            }
                        },
                        dataZoom: [
                            {
                                type: 'slider',
                                show: true,
                                height: 22,
                                bottom: 4,
                                start: 0,
                                end: 100,
                                borderColor: '#a1e2c1',
                                fillerColor: 'rgba(13, 161, 120, 0.12)',
                                handleStyle: { color: '#0da178', borderColor: '#0da178' },
                                textStyle: { color: '#666666' }
                            }
                        ],
                        series: [
                            {
                                name: '视频观看数',
                                type: 'line',
                                smooth: true,
                                symbol: 'circle',
                                symbolSize: 7,
                                itemStyle: {
                                    color: '#0da178',
                                    borderColor: '#ffffff',
                                    borderWidth: 2
                                },
                                lineStyle: {
                                    width: 2.5,
                                    color: '#0da178'
                                },
                                areaStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: 'rgba(13, 161, 120, 0.28)' },
                                        { offset: 1, color: 'rgba(13, 161, 120, 0.02)' }
                                    ])
                                },
                                label: {
                                    show: true,
                                    position: 'top',
                                    distance: 5,
                                    color: '#222222',
                                    fontSize: 12,
                                    fontWeight: 500
                                },
                                data: videoValues
                            }
                        ]
                    });
                } else if (archiveCharts.video) {
                    archiveCharts.video.resize();
                }

                // 2. 普通话小测成绩曲线 (主题绿配色)
                var $scoreEl = $('#chartQuizScore');
                var quizDates = [];
                for (var q = 1; q <= 15; q++) {
                    quizDates.push('2026/2/' + q);
                }
                if (!archiveCharts.quizScore && $scoreEl.length) {
                    archiveCharts.quizScore = echarts.init($scoreEl[0]);
                    var quizScoreValues = [68, 95, 94, 71, 88, 90, 78, 95, 47, 67, 97, 67, 88, 66, 97];
                    archiveCharts.quizScore.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b}<br/>小测成绩：{c} 分'
                        },
                        grid: {
                            top: 25,
                            left: 30,
                            right: 25,
                            bottom: 45,
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: quizDates,
                            axisLine: { lineStyle: { color: '#a1e2c1' } },
                            axisTick: { show: false },
                            axisLabel: {
                                color: '#555555',
                                interval: function (idx) {
                                    return idx % 3 === 0 || idx === 14;
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            min: 0,
                            max: 100,
                            interval: 25,
                            splitLine: {
                                lineStyle: { color: '#eef8f2' }
                            },
                            axisLabel: {
                                color: '#888888'
                            }
                        },
                        dataZoom: [
                            {
                                type: 'slider',
                                show: true,
                                height: 22,
                                bottom: 4,
                                start: 0,
                                end: 100,
                                borderColor: '#a1e2c1',
                                fillerColor: 'rgba(13, 161, 120, 0.12)',
                                handleStyle: { color: '#0da178', borderColor: '#0da178' },
                                textStyle: { color: '#666666' }
                            }
                        ],
                        series: [
                            {
                                name: '小测成绩',
                                type: 'line',
                                smooth: true,
                                symbol: 'circle',
                                symbolSize: 7,
                                itemStyle: {
                                    color: '#0da178',
                                    borderColor: '#ffffff',
                                    borderWidth: 2
                                },
                                lineStyle: {
                                    width: 2.5,
                                    color: '#0da178'
                                },
                                areaStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: 'rgba(13, 161, 120, 0.28)' },
                                        { offset: 1, color: 'rgba(13, 161, 120, 0.02)' }
                                    ])
                                },
                                label: {
                                    show: true,
                                    position: 'top',
                                    distance: 5,
                                    color: '#222222',
                                    fontSize: 12,
                                    fontWeight: 500
                                },
                                data: quizScoreValues
                            }
                        ]
                    });
                } else if (archiveCharts.quizScore) {
                    archiveCharts.quizScore.resize();
                }

                // 3. 普通话小测每日完成次数 (主题绿配色)
                var $countEl = $('#chartQuizCount');
                if (!archiveCharts.quizCount && $countEl.length) {
                    archiveCharts.quizCount = echarts.init($countEl[0]);
                    var quizCountValues = [5, 3, 0, 7, 2, 3, 8, 1, 0, 6, 7, 2, 4, 2, 1];
                    archiveCharts.quizCount.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b}<br/>完成次数：{c} 次'
                        },
                        grid: {
                            top: 25,
                            left: 30,
                            right: 25,
                            bottom: 45,
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: quizDates,
                            axisLine: { lineStyle: { color: '#a1e2c1' } },
                            axisTick: { show: false },
                            axisLabel: {
                                color: '#555555',
                                interval: function (idx) {
                                    return idx % 3 === 0 || idx === 14;
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            min: 0,
                            max: 8,
                            interval: 2,
                            splitLine: {
                                lineStyle: { color: '#eef8f2' }
                            },
                            axisLabel: {
                                color: '#888888'
                            }
                        },
                        dataZoom: [
                            {
                                type: 'slider',
                                show: true,
                                height: 22,
                                bottom: 4,
                                start: 0,
                                end: 100,
                                borderColor: '#a1e2c1',
                                fillerColor: 'rgba(13, 161, 120, 0.12)',
                                handleStyle: { color: '#0da178', borderColor: '#0da178' },
                                textStyle: { color: '#666666' }
                            }
                        ],
                        series: [
                            {
                                name: '完成次数',
                                type: 'line',
                                smooth: true,
                                symbol: 'circle',
                                symbolSize: 7,
                                itemStyle: {
                                    color: '#0da178',
                                    borderColor: '#ffffff',
                                    borderWidth: 2
                                },
                                lineStyle: {
                                    width: 2.5,
                                    color: '#0da178'
                                },
                                areaStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: 'rgba(13, 161, 120, 0.28)' },
                                        { offset: 1, color: 'rgba(13, 161, 120, 0.02)' }
                                    ])
                                },
                                label: {
                                    show: true,
                                    position: 'top',
                                    distance: 5,
                                    color: '#222222',
                                    fontSize: 12,
                                    fontWeight: 500
                                },
                                data: quizCountValues
                            }
                        ]
                    });
                } else if (archiveCharts.quizCount) {
                    archiveCharts.quizCount.resize();
                }

                // 4. 初测/终测成绩对比 (薄荷绿渐变双柱)
                var $compareEl = $('#chartScoreCompare');
                if (!archiveCharts.compare && $compareEl.length) {
                    archiveCharts.compare = echarts.init($compareEl[0]);
                    archiveCharts.compare.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b}：{c} 分'
                        },
                        grid: {
                            top: 30,
                            left: 30,
                            right: 25,
                            bottom: 25,
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            data: ['普通话水平初测', '普通话水平终测'],
                            axisLine: { lineStyle: { color: '#a1e2c1' } },
                            axisTick: { show: false },
                            axisLabel: {
                                color: '#333333',
                                fontSize: 13,
                                fontWeight: 500
                            }
                        },
                        yAxis: {
                            type: 'value',
                            min: 0,
                            max: 100,
                            interval: 25,
                            splitLine: {
                                lineStyle: { color: '#eef8f2' }
                            },
                            axisLabel: {
                                color: '#888888'
                            }
                        },
                        series: [
                            {
                                name: '测试成绩',
                                type: 'bar',
                                barWidth: 68,
                                label: {
                                    show: true,
                                    position: 'top',
                                    color: '#222222',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    formatter: '{c}分'
                                },
                                data: [
                                    {
                                        value: 83,
                                        itemStyle: {
                                            color: '#6edbb3',
                                            borderRadius: [6, 6, 0, 0]
                                        }
                                    },
                                    {
                                        value: 91,
                                        itemStyle: {
                                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                { offset: 0, color: '#27d49e' },
                                                { offset: 1, color: '#0da178' }
                                            ]),
                                            borderRadius: [6, 6, 0, 0]
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                } else if (archiveCharts.compare) {
                    archiveCharts.compare.resize();
                }

                // 5. 多维能力模型 (直接渲染雷达图，不用切换)
                var $radarEl = $('#chartRadarModel');
                if (!archiveCharts.radar && $radarEl.length) {
                    archiveCharts.radar = echarts.init($radarEl[0]);
                    archiveCharts.radar.setOption({
                        tooltip: {
                            trigger: 'item'
                        },
                        legend: {
                            bottom: 5,
                            data: ['初测水平', '终测水平'],
                            textStyle: { color: '#555555', fontSize: 12 },
                            selectedMode: false
                        },
                        radar: {
                            indicator: [
                                { name: '声母发音', max: 100 },
                                { name: '韵母发音', max: 100 },
                                { name: '声调准度', max: 100 },
                                { name: '语流音变', max: 100 },
                                { name: '表达感染力', max: 100 },
                                { name: '规范词汇', max: 100 }
                            ],
                            radius: '62%',
                            center: ['50%', '46%'],
                            axisName: {
                                color: '#333333',
                                fontSize: 12,
                                fontWeight: 500
                            },
                            splitArea: {
                                areaStyle: {
                                    color: ['#ffffff', '#f4fbf7', '#e8f7f0', '#def5e9']
                                }
                            },
                            axisLine: { lineStyle: { color: '#a1e2c1' } },
                            splitLine: { lineStyle: { color: '#a1e2c1' } }
                        },
                        series: [
                            {
                                name: '能力维度对比',
                                type: 'radar',
                                data: [
                                    {
                                        value: [72, 78, 65, 80, 75, 70],
                                        name: '初测水平',
                                        symbol: 'circle',
                                        symbolSize: 6,
                                        itemStyle: { color: '#298ef9' },
                                        lineStyle: { width: 2, color: '#298ef9' },
                                        areaStyle: { color: 'rgba(41, 142, 249, 0.2)' }
                                    },
                                    {
                                        value: [92, 95, 88, 93, 91, 95],
                                        name: '终测水平',
                                        symbol: 'circle',
                                        symbolSize: 6,
                                        itemStyle: { color: '#0da178' },
                                        lineStyle: { width: 2, color: '#0da178' },
                                        areaStyle: { color: 'rgba(13, 161, 120, 0.28)' }
                                    }
                                ]
                            }
                        ]
                    });
                } else if (archiveCharts.radar) {
                    archiveCharts.radar.resize();
                }

                syncProfileHeight();
            }, 60);
        }

        // 窗口改变尺寸时自适应重绘
        window.addEventListener('resize', function () {
            if ($('#panelProfileArchive').hasClass('active')) {
                Object.keys(archiveCharts).forEach(function (key) {
                    if (archiveCharts[key]) {
                        archiveCharts[key].resize();
                    }
                });
            }
        });

        // 若初始化时成长档案已是激活态，直接绘制
        if ($('#panelProfileArchive').hasClass('active')) {
            renderArchiveCharts();
        }
    }

    // ==================== 学员作业交互逻辑 ====================
    function initHomeworkStudentPage() {
        var playSvg = '<svg class="icon-play-triangle" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
        var pauseSvg = '<svg class="icon-pause-bars" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';

        var allPlayers = [];

        function stopAllAudioPlayers() {
            allPlayers.forEach(function (p) {
                if (p && typeof p.stop === 'function') {
                    p.stop();
                }
            });
        }

        // 通用音频播放器组件控制器
        function setupAudioPlayer($playerBar, totalSeconds) {
            if (!$playerBar || !$playerBar.length) return null;
            totalSeconds = totalSeconds || 202; // 默认 03:22 = 202s
            var currentSecs = 0;
            var isPlaying = false;
            var timer = null;

            var $btnPlay = $playerBar.find('.btn-audio-play');
            var $track = $playerBar.find('.hw-player-track');
            var $fill = $playerBar.find('.hw-player-fill');
            var $time = $playerBar.find('.hw-player-time');

            function formatTime(s) {
                var m = String(Math.floor(s / 60)).padStart(2, '0');
                var sec = String(s % 60).padStart(2, '0');
                return m + ':' + sec;
            }

            var totalStr = formatTime(totalSeconds);

            function updateUI() {
                var pct = totalSeconds > 0 ? (currentSecs / totalSeconds * 100) : 0;
                $fill.css('width', pct + '%');
                $time.text(formatTime(currentSecs) + ' / ' + totalStr);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
                isPlaying = false;
                $btnPlay.html(playSvg);
            }

            function reset() {
                stop();
                currentSecs = 0;
                updateUI();
            }

            $btnPlay.on('click', function () {
                if (!isPlaying) {
                    stopAllAudioPlayers();
                    isPlaying = true;
                    $btnPlay.html(pauseSvg);

                    if (currentSecs >= totalSeconds) {
                        currentSecs = 0;
                    }

                    timer = setInterval(function () {
                        currentSecs++;
                        if (currentSecs >= totalSeconds) {
                            currentSecs = totalSeconds;
                            updateUI();
                            stop();
                            currentSecs = 0;
                            setTimeout(updateUI, 500);
                            return;
                        }
                        updateUI();
                    }, 1000);
                } else {
                    stop();
                }
            });

            $track.on('click', function (e) {
                var trackWidth = $(this).width();
                var clickX = e.pageX - $(this).offset().left;
                var percent = Math.max(0, Math.min(1, clickX / trackWidth));
                currentSecs = Math.round(percent * totalSeconds);
                updateUI();
            });

            updateUI();

            var instance = {
                stop: stop,
                reset: reset,
                updateUI: updateUI
            };
            allPlayers.push(instance);
            return instance;
        }

        // 初始化三个状态下的播放器
        var playerUnfinished = setupAudioPlayer($('#hwPlayerBar'), 202);
        var playerCompleted = setupAudioPlayer($('#hwPlayerBarCompleted'), 202);
        var playerReviewed = setupAudioPlayer($('#hwPlayerBarReviewed'), 202);

        // ==================== 按住并录制 / 重新录制 交互逻辑 ====================
        var isHwRecording = false;
        var hwRecTimer = null;
        var hwRecStartTime = 0;
        var hwRecSeconds = 0;
        var $activeRecordingBtn = null;

        function startHomeworkRecording($btn) {
            if (isHwRecording) return;
            stopAllAudioPlayers();

            isHwRecording = true;
            $activeRecordingBtn = $btn;
            hwRecStartTime = Date.now();
            hwRecSeconds = 1;

            $btn.addClass('is-recording');
            $btn.find('.btn-rec-hud').show();
            $btn.find('.rec-timer-num').text('00:01');

            if (hwRecTimer) clearInterval(hwRecTimer);
            hwRecTimer = setInterval(function () {
                hwRecSeconds++;
                var mins = String(Math.floor(hwRecSeconds / 60)).padStart(2, '0');
                var secs = String(hwRecSeconds % 60).padStart(2, '0');
                $btn.find('.rec-timer-num').text(mins + ':' + secs);
            }, 1000);
        }

        function finishHomeworkRecording() {
            if (!isHwRecording || !$activeRecordingBtn) return;
            isHwRecording = false;

            var $btn = $activeRecordingBtn;
            $activeRecordingBtn = null;

            if (hwRecTimer) {
                clearInterval(hwRecTimer);
                hwRecTimer = null;
            }

            var elapsed = Date.now() - hwRecStartTime;
            var delay = elapsed < 650 ? (750 - elapsed) : 0;

            setTimeout(function () {
                $btn.removeClass('is-recording');
                $btn.find('.btn-rec-hud').hide();

                // 更新未完成面板按钮与音频展示
                $('#imgBtnHwRecord').attr('src', btnRecordingRepeat);
                $('#btnHwRecord').attr('title', '重新录制').attr('data-state', 'recorded');
                $('#imgBtnHwUpload').attr('src', btnUploadRepeat);
                $('#btnHwUpload').attr('title', '重新上传').attr('data-state', 'recorded');

                $('#hwUnfinishedAudioRow').slideDown(240);
                if (playerUnfinished) {
                    playerUnfinished.reset();
                }
                if (playerCompleted) {
                    playerCompleted.reset();
                }

                // 更新 Tab 1 徽标为“已完成”
                var $tab1Badge = $('.hw-tab-item[data-status="unfinished"] .hw-tab-badge');
                $tab1Badge.removeClass('badge-unfinished').addClass('badge-completed').text('已完成');

                // 保持左侧任务栏作业“1个未完成”标签状态不变
                syncHomeworkHeight();
            }, delay);
        }

        // 绑定按住录制事件（支持鼠标与触屏长按）
        $('#btnHwRecord, #btnHwReRecord').on('mousedown touchstart', function (e) {
            e.preventDefault();
            startHomeworkRecording($(this));
        });

        $(document).on('mouseup.hwRec touchend.hwRec', function () {
            if (isHwRecording) {
                finishHomeworkRecording();
            }
        });

        // 重新上传与上传文件交互
        $('#btnHwUpload, #btnHwReUpload').on('click', function (e) {
            e.preventDefault();
            $('#hwFileInput').click();
        });

        $('#hwFileInput').on('change', function () {
            var file = this.files[0];
            if (file) {
                $('#imgBtnHwRecord').attr('src', btnRecordingRepeat);
                $('#btnHwRecord').attr('title', '重新录制').attr('data-state', 'recorded');
                $('#imgBtnHwUpload').attr('src', btnUploadRepeat);
                $('#btnHwUpload').attr('title', '重新上传').attr('data-state', 'recorded');

                $('#hwUnfinishedAudioRow').slideDown(240);
                if (playerUnfinished) {
                    playerUnfinished.reset();
                }
                if (playerCompleted) {
                    playerCompleted.reset();
                }

                var $tab1Badge = $('.hw-tab-item[data-status="unfinished"] .hw-tab-badge');
                $tab1Badge.removeClass('badge-unfinished').addClass('badge-completed').text('已完成');
                // 保持左侧任务栏作业“1个未完成”标签状态不变

                syncHomeworkHeight();

                Swal.fire({
                    icon: 'success',
                    title: '音频文件上传成功',
                    html: '<div style="font-size:15px; color:#333; margin-top: 8px;">已选择文件：<strong style="color:#0da178;">' + file.name + '</strong></div>' +
                          '<div style="font-size:13px; color:#888; margin-top:8px;">作业已更新，老师批阅前可随时重新替换。</div>',
                    confirmButtonText: '确定',
                    customClass: {
                        popup: 'record-feedback-popup',
                        confirmButton: 'record-modal-btn-confirm'
                    },
                    buttonsStyling: false
                });
            }
        });

        // 作业 Tab 点击切换
        $('.homework-card-tabs-header').on('click', '.hw-tab-item', function () {
            var $tab = $(this);
            if ($tab.hasClass('active')) return;

            $('.homework-card-tabs-header .hw-tab-item').removeClass('active');
            $tab.addClass('active');

            var hwId = $tab.data('hw-id') || 1;
            var hwTitle = $tab.data('title') || '作业标题作业标题作业标题';
            var deadline = $tab.data('deadline') || 'yyyy-mm-dd hh:mm:ss';
            var status = $tab.data('status') || 'unfinished';

            $('#hwDetailTitle').text(hwTitle);
            $('#hwDetailDeadline').text('截止时间：' + deadline);

            stopAllAudioPlayers();

            // 根据状态切换三个面板
            if (status === 'reviewed') {
                $('#hwSubmitUnfinished').hide();
                $('#hwSubmitCompleted').hide();
                $('#hwSubmitReviewed').show();
            } else if (status === 'completed') {
                $('#hwSubmitUnfinished').hide();
                $('#hwSubmitReviewed').hide();
                $('#hwSubmitCompleted').show();
                renderLucideIcons($('#hwSubmitCompleted')[0]);
            } else {
                $('#hwSubmitCompleted').hide();
                $('#hwSubmitReviewed').hide();
                $('#hwSubmitUnfinished').show();
            }

            syncHomeworkHeight();
        });
    }


