// Vite 入口：直接 import SCSS，由 Vite 编译
import $ from 'jquery';
import Swal from 'sweetalert2';
import { createIcons, BookOpen, User, LogOut, ChevronDown, ChevronLeft, ChevronRight, KeyRound, Lock, CheckCircle2, ShieldCheck, MessageSquareCode, Info, FileText, Eye, Download } from 'lucide';
import './common.scss';
import iconTitlePic from './img/icon-titlePic.png';
import btnIKnow from './img/btn-i-know.png';
import iconTips from './img/icon-tips.png';
import qrcodeImg from './img/qrcode.png';
import btnTest from './img/btn-test.png';
import iconLive from './img/icon-live.png';
import iconReplay from './img/icon-replay.png';

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
                Download
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

        function syncCardHeight(hasLive) {
            if (window.innerWidth > 1080) {
                var sidebarH = $('.course-sidebar').outerHeight() || 0;
                if (sidebarH > 0) {
                    if (hasLive) {
                        var liveH = $('#dailyLiveCard').outerHeight(true) || 0;
                        var remH = Math.max(480, sidebarH - liveH);
                        $('#emptyLearningCard').css({ 'min-height': remH + 'px', 'padding-top': '60px' });
                        $('#lockedLearningCard').css({ 'min-height': remH + 'px', 'padding-top': '60px' });
                    } else {
                        $('#emptyLearningCard').css({ 'min-height': sidebarH + 'px', 'padding-top': '130px' });
                        $('#lockedLearningCard').css({ 'min-height': sidebarH + 'px', 'padding-top': '100px' });
                    }
                }
            } else {
                $('#emptyLearningCard').css({ 'min-height': '', 'padding-top': '' });
                $('#lockedLearningCard').css({ 'min-height': '', 'padding-top': '' });
            }
        }

        $(window).on('resize', function () {
            syncCardHeight($('#dailyLiveCard').is(':visible'));
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
                syncCardHeight($('#dailyLiveCard').is(':visible'));
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

                $liveCard.slideDown(250, function () {
                    syncCardHeight(true);
                });

                if (isLocked) {
                    // 尚未解锁：展示“其他学习内容将在当日上午8点解锁”，隐藏常规区和空内容区
                    $mainContent.hide();
                    $emptyCard.hide();
                    $lockedCard.stop(true, true).fadeIn(200);
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
                syncCardHeight(false);
                $lockedCard.stop(true, true).fadeIn(200);
            } else if (isWeekend && !isDone) {
                // 周末无安排（16/22/23/29/30号）：无直播/回放卡片，全区展示“当日没有学习内容”
                $liveCard.slideUp(200);
                $lockedCard.hide();
                $mainContent.hide();
                $emptyTitle.text('当日没有学习内容');
                syncCardHeight(false);
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
                    window.location.href = 'course.html';
                }
            });
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

