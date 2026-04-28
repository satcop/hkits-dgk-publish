document.addEventListener('DOMContentLoaded', function() {
    // Header Scroll Hide/Show
    let lastScrollTop = 0;
    let scrollThreshold = 100; // 스크롤 임계값
    const header = document.querySelector('#header');
    let ticking = false;

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 스크롤 시 그림자 효과 추가/제거
        if (scrollTop > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 최상단에서는 항상 보이기
        if (scrollTop < scrollThreshold) {
            header.classList.remove('hide');
            ticking = false;
            return;
        }

        // 스크롤 방향에 따라 헤더 표시/숨김
        if (scrollTop > lastScrollTop) {
            // 스크롤 다운 - 헤더 숨기기
            header.classList.add('hide');
        } else {
            // 스크롤 업 - 헤더 보이기
            header.classList.remove('hide');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

/* input 포커스 스타일 - 웹접근성 */
$(document).on('focus', '.input-box .input', function(){
    $(this).closest(".input-box").addClass("focus");
});
$(document).on('blur', '.input-box .input', function(){
    $(this).closest(".input-box").removeClass("focus");
});

/* input only-number — 숫자(0–9)만 허용, maxlength 준수 */
function sanitizeOnlyNumberField(el) {
    if (!el || el.readOnly || el.disabled) return;
    var v = String(el.value).replace(/\D/g, '');
    var max = el.getAttribute('maxlength');
    if (max !== null && max !== '') {
        var n = parseInt(max, 10);
        if (!isNaN(n) && n >= 0 && v.length > n) v = v.slice(0, n);
    }
    if (el.value !== v) el.value = v;
}
$(document).on('input change', 'input.only-number, textarea.only-number', function () {
    sanitizeOnlyNumberField(this);
});
$(document).on('focus', 'input.only-number, textarea.only-number', function () {
    var el = this;
    if (!el.getAttribute('inputmode')) el.setAttribute('inputmode', 'numeric');
    if (!el.getAttribute('pattern')) el.setAttribute('pattern', '[0-9]*');
});
$(document).ready(function () {
    $('input.only-number, textarea.only-number').each(function () {
        sanitizeOnlyNumberField(this);
    });
});

/* textarea 포커스 스타일 - 웹접근성 */
$(document).on('focus', '.textarea-box .textarea', function(){
    $(this).parent('.textarea-box').addClass("focus");
});
$(document).on('blur', '.textarea-box .textarea', function(){
    $(this).parent('.textarea-box').removeClass("focus");
});

/* select 포커스 스타일 - 웹접근성 */
$(document).on('focus', '.select-box select', function(){
    $(this).parent('div').addClass("focus");
});
$(document).on('blur', '.select-box select', function(){
    $(this).parent('div').removeClass("focus");
});

/** 사이드바 접힘 상태 (페이지 이동 후 유지). localStorage 사용 */
var SIDEBAR_FOLDED_KEY = 'dgk_sidebar_folded';

function getSidebarFoldedStored() {
    try {
        return window.localStorage.getItem(SIDEBAR_FOLDED_KEY) === '1';
    } catch (e) {
        return false;
    }
}

function setSidebarFoldedStored(folded) {
    try {
        window.localStorage.setItem(SIDEBAR_FOLDED_KEY, folded ? '1' : '0');
    } catch (e) {}
}

/** 접힘일 때만 a[title] 툴팁 사용 (펼침에서는 span으로 충분) */
function initSidebarNavTitles($sidebar) {
    $sidebar.find('.nav-list ul li a').each(function () {
        var $a = $(this);
        if ($a.data('navTitle') === undefined) {
            var t = $a.attr('title') || $.trim($a.find('span').text());
            $a.data('navTitle', t || '');
        }
    });
}

function syncSidebarNavTitles($sidebar, folded) {
    $sidebar.find('.nav-list ul li a').each(function () {
        var $a = $(this);
        var t = $a.data('navTitle');
        if (folded) {
            if (t) $a.attr('title', t);
        } else {
            $a.removeAttr('title');
        }
    });
}

/** fadeOut·fadeIn 각 150ms → 합 ~0.3s (사이드바 transition 과 맞춤) */
var SIDEBAR_LOGO_FADE_MS = 150;

/**
 * 로고 전환 (layout.css: .logo-fold 는 기본 display:none, .logo-full 은 block)
 * 토글: 한쪽 fadeOut 후 다른 쪽 fadeIn. instant: 표시만 즉시 맞춤.
 */
function syncSidebarLogoFade($sidebar, folded, instant) {
    var $full = $sidebar.find('.logo .logo-full');
    var $fold = $sidebar.find('.logo .logo-fold');
    if (!$full.length || !$fold.length) return;
    $full.stop(true, true);
    $fold.stop(true, true);
    if (instant) {
        if (folded) {
            $full.hide();
            $fold.show();
        } else {
            $fold.hide();
            $full.show();
        }
        return;
    }
    if (folded) {
        $full.fadeOut(SIDEBAR_LOGO_FADE_MS, function () {
            $fold.fadeIn(SIDEBAR_LOGO_FADE_MS);
        });
    } else {
        $fold.fadeOut(SIDEBAR_LOGO_FADE_MS, function () {
            $full.fadeIn(SIDEBAR_LOGO_FADE_MS);
        });
    }
}

function setSidebarFoldedUI($sidebar, folded, options) {
    options = options || {};
    var animateLogo = options.animateLogo !== false;
    var $btn = $sidebar.find('.btn-toggle-sidebar');
    var $container = $('#container');
    if (folded) {
        $sidebar.addClass('active');
        $container.addClass('active');
        $btn.addClass('active').text('');
    } else {
        $sidebar.removeClass('active');
        $container.removeClass('active');
        $btn.removeClass('active').text('접기');
    }
    syncSidebarNavTitles($sidebar, folded);
    syncSidebarLogoFade($sidebar, folded, !animateLogo);
}

$(document).ready(function () {
    var $sidebar = $('aside.sidebar');
    if (!$sidebar.length) return;
    initSidebarNavTitles($sidebar);
    if (getSidebarFoldedStored()) {
        setSidebarFoldedUI($sidebar, true, { animateLogo: false });
    } else {
        setSidebarFoldedUI($sidebar, false, { animateLogo: false });
    }
});

/* sidebar 토글 버튼 클릭 이벤트 */
$(document).on('click', '.btn-toggle-sidebar', function(){
    var $sidebar = $(this).closest('aside.sidebar');
    var folded = !$sidebar.hasClass('active');
    setSidebarFoldedUI($sidebar, folded, { animateLogo: true });
    setSidebarFoldedStored(folded);
});

/**
 * 사이드바 네비 현재 메뉴 활성 (다른 li의 active는 제거)
 * @param {string} menuKey - li에 붙은 클래스명 (예: user, work, deposit, payment-history, stat-work)
 * @param {JQuery|Element|string} [root] - 사이드바 범위. 생략 시 전체 aside.sidebar
 */
function setSidebarNavActive(menuKey, root) {
    var key = String(menuKey || '').trim();
    var $sidebar = root != null ? $(root) : $('aside.sidebar');
    if (!$sidebar.length) return;
    var $items = $sidebar.find('.nav-list ul li');
    $items.removeClass('active');
    if (!key) return;
    $items.filter(function () {
        return this.classList.contains(key);
    }).first().addClass('active');
}

/* 모달 열기 - 웹접근성 추가 */
function modalOpen(target) {
    // 현재 포커스된 요소 저장
    var $modal = $("." + target);
    var activeElement = document.activeElement;
    
    // 모달 요소에 포커스된 요소 저장 (jQuery data 사용)
    $modal.data('previousFocus', activeElement);
    
    // 모달 열기
    $modal.addClass("open").attr("tabindex", 0).focus();
}

/* 모달 닫기 - 웹접근성 추가 */
function modalClose(target) { 
    var $modal = $("." + target);
    
    // 모달 닫기
    $modal.removeClass("open").attr("tabindex", -1);
    
    // 저장된 포커스 요소로 복원
    var previousFocus = $modal.data('previousFocus');
    if (previousFocus && $(previousFocus).length) {
        // 요소가 여전히 DOM에 존재하는지 확인
        try {
            $(previousFocus).focus();
        } catch (e) {
            // 포커스 실패 시 무시
            console.warn('Could not restore focus to previous element:', e);
        }
    }
    
    // 데이터 정리
    $modal.removeData('previousFocus');
} 

/* 비밀번호 보기 버튼 클릭 이벤트 */
$(document).on('click', '.btn-pw-view', function(){
    $(this).toggleClass('active');
    $(this).closest('.input-box').toggleClass('active');
    if($(this).hasClass('active')){
        $(this).closest('.input-box').find('.input').attr('type', 'text');
    }else{
        $(this).closest('.input-box').find('.input').attr('type', 'password');
    }
});

/* 전체선택 — 동일 페이지에 여러 표 가능
 * 래퍼에 .tbl-check-scope, 헤더 체크에 .js-check-all, 행 체크에 .js-check-row */
function syncTblCheckScope($scope) {
    if (!$scope || !$scope.length) return;
    var $rows = $scope.find('.js-check-row');
    var $all = $scope.find('.js-check-all');
    var n = $rows.length;
    var c = $rows.filter(':checked').length;
    $all.prop('checked', n > 0 && c === n);
    $all.prop('indeterminate', c > 0 && c < n);
}
$(document).ready(function () {
    $(document).on('click', '.tbl-check-scope .js-check-all', function () {
        var $scope = $(this).closest('.tbl-check-scope');
        var on = $(this).prop('checked');
        $scope.find('.js-check-row').prop('checked', on);
        $(this).prop('indeterminate', false);
    });
    $(document).on('click', '.tbl-check-scope .js-check-row', function () {
        syncTblCheckScope($(this).closest('.tbl-check-scope'));
    });
    $('.tbl-check-scope').each(function () {
        syncTblCheckScope($(this));
    });
});



/* 첨부파일 드롭존 — 동일 페이지·여러 블록·동적 추가 공통
 * 마크업: .file-drop-zone > .file-native, .file-drop-main, .btn-file-pick, .file-drop-filled(.file-link, .file-meta), .btn-file-remove
 * 옵션: data-max-mb (기본 100), data-accept="jpg,jpeg,png,pdf" (확장자 쉼표, 소문자), data-msg-invalid-ext / data-msg-invalid-size */
$(document).ready(function () {
    var DEFAULT_EXT = ['jpg', 'jpeg', 'png', 'pdf'];
    var DEFAULT_MAX_MB = 100;

    function extListToRegex(list) {
        var esc = list.map(function (x) {
            return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|');
        return new RegExp('\\.(' + esc + ')$', 'i');
    }

    function getAcceptRegex($zone) {
        var raw = $zone.attr('data-accept');
        if (raw && String(raw).trim()) {
            var list = String(raw).split(',').map(function (s) {
                return s.trim().toLowerCase().replace(/^\./, '');
            }).filter(Boolean);
            if (list.length) return extListToRegex(list);
        }
        return extListToRegex(DEFAULT_EXT);
    }

    function formatFileDropSize(bytes) {
        if (bytes >= 1048576) return '(' + (bytes / 1048576).toFixed(1) + 'MB)';
        if (bytes >= 1024) return '(' + Math.round(bytes / 1024) + 'KB)';
        return '(' + bytes + 'B)';
    }

    function setFileDropFilled($zone, file) {
        var $f = $zone.find('.file-drop-filled');
        $f.find('.file-link').text(file.name);
        $f.find('.file-meta').text(formatFileDropSize(file.size));
        $zone.addClass('is-filled');
    }

    function clearFileDropZone($zone) {
        var $input = $zone.find('.file-native');
        $input.val('');
        $zone.removeClass('is-filled');
        $zone.find('.file-link').text('').attr('href', '#');
        $zone.find('.file-meta').text('');
    }

    function validateFileDrop(file, maxMb, acceptRe, $zone) {
        if (!acceptRe.test(file.name)) {
            alert($zone.attr('data-msg-invalid-ext') || '허용된 파일 형식만 업로드할 수 있습니다. (JPG, PNG, PDF)');
            return false;
        }
        if (file.size > maxMb * 1048576) {
            alert($zone.attr('data-msg-invalid-size') || ('파일 크기는 ' + maxMb + 'MB 이하여야 합니다.'));
            return false;
        }
        return true;
    }

    $(document).on('click', '.file-drop-zone .file-link', function (e) {
        e.preventDefault();
    });
    $(document).on('click', '.file-drop-zone .btn-file-pick, .file-drop-zone .file-drop-main', function (e) {
        if ($(e.target).closest('.btn-file-remove, .file-link').length) return;
        $(this).closest('.file-drop-zone').find('.file-native').trigger('click');
    });
    $(document).on('click', '.file-drop-zone .btn-file-remove', function (e) {
        e.stopPropagation();
        clearFileDropZone($(this).closest('.file-drop-zone'));
    });
    $(document).on('change', '.file-drop-zone .file-native', function () {
        var input = this;
        var file = input.files && input.files[0];
        var $zone = $(input).closest('.file-drop-zone');
        var maxMb = parseInt($zone.attr('data-max-mb'), 10);
        if (isNaN(maxMb) || maxMb <= 0) maxMb = DEFAULT_MAX_MB;
        var acceptRe = getAcceptRegex($zone);
        if (!file) return;
        if (!validateFileDrop(file, maxMb, acceptRe, $zone)) {
            input.value = '';
            return;
        }
        setFileDropFilled($zone, file);
    });
    $(document).on('dragover', '.file-drop-zone', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('is-dragover');
    });
    $(document).on('dragleave', '.file-drop-zone', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('is-dragover');
    });
    $(document).on('drop', '.file-drop-zone', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $z = $(this);
        $z.removeClass('is-dragover');
        var dt = e.originalEvent && e.originalEvent.dataTransfer;
        var file = dt && dt.files && dt.files[0];
        var maxMb = parseInt($z.attr('data-max-mb'), 10);
        if (isNaN(maxMb) || maxMb <= 0) maxMb = DEFAULT_MAX_MB;
        var acceptRe = getAcceptRegex($z);
        if (!file) return;
        if (!validateFileDrop(file, maxMb, acceptRe, $z)) return;
        var input = $z.find('.file-native')[0];
        try {
            var d = new DataTransfer();
            d.items.add(file);
            input.files = d.files;
        } catch (err) {
            setFileDropFilled($z, file);
            return;
        }
        setFileDropFilled($z, file);
    });
});

/* 주소찾기 — 카카오(다음) 우편번호 서비스 (주소 검색 팝업)
 * 마크업: .addr-row 안 .input-box.zip .input(우편), .input-box.grow .input 순서(기본주소, 상세)
 * 또는 버튼에 data-target-zip / data-target-base / data-target-detail (CSS 선택자) */
 (function () {
    var postcodeScriptLoading = false;
    var postcodeScriptQueue = [];

    function flushPostcodeQueue() {
        var q = postcodeScriptQueue.slice();
        postcodeScriptQueue = [];
        q.forEach(function (fn) {
            try {
                fn();
            } catch (err) {
                console.error(err);
            }
        });
    }

    function ensureDaumPostcode(callback) {
        if (window.daum && window.daum.Postcode) {
            callback();
            return;
        }
        postcodeScriptQueue.push(callback);
        if (postcodeScriptLoading) return;
        postcodeScriptLoading = true;
        var s = document.createElement('script');
        s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        s.async = true;
        s.onload = function () {
            postcodeScriptLoading = false;
            flushPostcodeQueue();
        };
        s.onerror = function () {
            postcodeScriptLoading = false;
            postcodeScriptQueue = [];
            alert('주소검색 서비스를 불러오지 못했습니다. 네트워크를 확인해 주세요.');
        };
        document.head.appendChild(s);
    }

    function resolveAddrInputs($btn) {
        var $row = $btn.closest('.addr-row');
        var $zip = $();
        var $base = $();
        var $detail = $();
        if ($row.length) {
            $zip = $row.find('.input-box.zip .input').first();
            var $grows = $row.find('.input-box.grow .input');
            $base = $grows.eq(0);
            $detail = $grows.eq(1);
        }
        var z = $btn.attr('data-target-zip');
        var b = $btn.attr('data-target-base');
        var d = $btn.attr('data-target-detail');
        if (z) $zip = $(z);
        if (b) $base = $(b);
        if (d) $detail = $(d);
        return { $zip: $zip, $base: $base, $detail: $detail };
    }

    $(document).on('click', '.btn-zip', function (e) {
        e.preventDefault();
        var $btn = $(this);
        var field = resolveAddrInputs($btn);
        if (!field.$zip.length || !field.$base.length) {
            console.warn('[btn-zip] 우편번호·기본주소 입력칸을 찾지 못했습니다. .addr-row 또는 data-target-* 를 확인하세요.');
            return;
        }
        ensureDaumPostcode(function () {
            new daum.Postcode({
                oncomplete: function (data) {
                    field.$zip.val(data.zonecode);
                    field.$base.val(data.roadAddress || data.jibunAddress || '');
                    if (field.$detail.length) field.$detail.focus();
                }
            }).open();
        });
    });
})();


