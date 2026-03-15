"use strict";

$(document).ready(() => {
    $(".auth-method").on('click', 'li a', function () {
        $(".auth-method li a").removeClass("current");
        $(this).addClass("current");
        changeTabMethod($(this).attr("data-method-type"));
    });

    // Check URL param for register
    var urlParams = new URLSearchParams(window.location.search);
    var authType = urlParams.get('type');
    if (authType === 'register') {
        $("app-login").hide();
        $("app-register").show();
        $(".auth-method li a").removeClass("current");
        $(".auth-method li a[data-method-type='register']").addClass("current");
    } else {
        $("app-login").show();
        $("app-register").hide();
    }

    // add phone and email to form register
    $('#registerForm input#email').val(`guest000${RandomUserName(8).toLowerCase()}@gmail.com`);
    // $('#registerForm input#phone').val(randomPhone());

    // login btn
    $(".btn-submit-login").on("click", function () { loginPOST($(this)) });
    // register btn
    $(".btn-submit-register").on("click", function () { registerPOST($(this)) });
});

function hideAllMethod() {
    $("app-login").hide();
    $("app-register").hide();
}

function changeTabMethod(type) {
    hideAllMethod();

    if (type == "register") {
        $("app-register").show();
    } else if (type == "login") {
        $("app-login").show();
    }
}

let isLoginSubmitting = false;
function loginPOST(element) {
    try {
        if (isLoginSubmitting) return;

        const username = $('#loginForm input#username').val();
        const password = $('#loginForm input#password').val();

        if (!username || !password) {
            initAuthNotifyModal(true, "Vui lòng đầy đủ thông tin");
            return;
        }
        isLoginSubmitting = true;
        element.prop("disabled", true);
        $.ajax({
            "url": "/auth/login",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "username": username,
                "password": password
            }),
        }).done(function (response) {
            isLoginSubmitting = false;
            element.prop("disabled", false);
            if (response.status) {
                setTimeout(() => {
                    window.location = "/";
                }, 200);
            } else {
                initAuthNotifyModal(true, response.msg);
            }
        }).fail(function () {
            isLoginSubmitting = false;
            element.prop("disabled", false);
            initAuthNotifyModal(true, "Yêu cầu thất bại. Vui lòng thử lại.");
        });
    } catch (e) {
        console.log(e);
        isLoginSubmitting = false;
        initAuthNotifyModal(true, "Có lỗi xảy ra, vui lòng thử lại!");
    }
}

let isRegisterSubmitting = false;
function registerPOST(element) {
    try {
        if (isRegisterSubmitting) return;

        // Convert username to lowercase
        var usernameInput = $('#registerForm input#username');
        usernameInput.val(usernameInput.val().toLowerCase());

        if (!$('#registerForm input#username').val() ||
            !$('#registerForm input#password').val() ||
            !$('#registerForm input#password_cf').val() ||
            !$('#registerForm input#name').val() ||
            !$('#registerForm input#phone').val() ||
            !$('#registerForm input#email').val()) {
            initAuthNotifyModal(true, "Vui lòng đầy đủ thông tin");
            return;
        }

        const testUsername = new RegExp('^[a-z0-9]+$');
        const testName = new RegExp("^[a-zA-Z \s\.\!\?\"\-]+$");
        const testEmail = new RegExp("[a-z0-9]+@[a-z]+\.[a-z]{2,3}");

        // validate input type  
        if (!testUsername.test($('#registerForm input#username').val())) {
            initAuthNotifyModal(true, "Tên tài khoản chỉ được sử dụng chữ thường và số!");
            return;
        }
        if (!testName.test($('#registerForm input#name').val())) {
            initAuthNotifyModal(true, "Họ và tên không hợp lệ!");
            return;
        }
        if (!testEmail.test($('#registerForm input#email').val())) {
            initAuthNotifyModal(true, "Email không hợp lệ");
            return;
        }

        // validate string length
        if ($('#registerForm input#username').val().length < 6 || $('#registerForm input#username').val().length > 12) {
            initAuthNotifyModal(true, "Tên tài khoản phải từ 6 đến 12 ký tự!");
            return;
        }
        if ($('#registerForm input#name').val().length <= 5 || $('#registerForm input#name').val().length > 50) {
            initAuthNotifyModal(true, "Họ và tên phải từ 5 đến 50 ký tự!");
            return;
        }
        if ($('#registerForm input#email').val().length < 5 || $('#registerForm input#email').val().length > 50) {
            initAuthNotifyModal(true, "Email không hợp lệ");
            return;
        }
        if ($('#registerForm input#phone').val().length < 9 || $('#registerForm input#phone').val().length > 15) {
            initAuthNotifyModal(true, "Số điện thoại không hợp lệ!");
            return;
        }
        if ($('#registerForm input#password').val().length < 6 || $('#registerForm input#password').val().length > 20) {
            initAuthNotifyModal(true, "Mật khẩu phải từ 6 đến 20 ký tự");
            return;
        }
        if ($('#registerForm input#password').val() !== $('#registerForm input#password_cf').val()) {
            initAuthNotifyModal(true, "2 mật khẩu không trùng khớp!");
            return;
        }

        isRegisterSubmitting = true;
        element.prop("disabled", true);
        $.ajax({
            "url": "/auth/register",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "name": $('#registerForm input#name').val(),
                "username": $('#registerForm input#username').val(),
                "refcode": (!$('#registerForm input#refcode').val()) ? null : $('#registerForm input#refcode').val(),
                "email": $('#registerForm input#email').val(),
                "phone": $('#registerForm input#phone').val(),
                "password": $('#registerForm input#password').val()
            }),
        }).done(function (response) {
            isRegisterSubmitting = false;
            element.prop("disabled", false);
            if (response.status) {
                setTimeout(() => {
                    window.location = "/";
                }, 200);
            } else {
                initAuthNotifyModal(true, response.msg);
            }
        }).fail(function () {
            isRegisterSubmitting = false;
            element.prop("disabled", false);
            initAuthNotifyModal(true, "Yêu cầu thất bại. Vui lòng thử lại.");
        });

    } catch (e) {
        console.log(e);
        isRegisterSubmitting = false;
        initAuthNotifyModal(true, "Có lỗi xảy ra, vui lòng thử lại!");
    }
}
