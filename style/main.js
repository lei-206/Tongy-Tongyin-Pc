// Vite 入口：直接 import SCSS，由 Vite 编译
import $ from 'jquery';
import Swal from 'sweetalert2';
import './common.scss';


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
    });

