"use strict";

let initMethodDeposit;
let selectedPaymentMethodAlt; // Biến lưu trữ giá trị alt của ảnh được click

function formatCurrency(amount) {
    // Chuyển đổi số thành chuỗi và đảm bảo rằng nó là số
    amount = Number(amount);

    // Định dạng chuỗi tiền tệ VND
    return amount.toLocaleString('vi-VN');
}

$(document).ready(function () {

    changeMethod($(this).attr("bank-transfer-manual"));

    // Add click event listener for quick deposit buttons
    $(".deposit-select-amount li").on("click", function () {
        // Remove .selected class from all buttons
        $(".deposit-select-amount li").removeClass("selected");

        // Add .selected class to the clicked button
        $(this).addClass("selected");

        // Set the value of the input field with the ID "amount"
        let amount = $(this).attr("data-amount");
        $("#amount").val(amount);
    });

    // Add click event listener for images in .functionPayment
    $(".functionPayment img").on("click", function () {
        selectedPaymentMethodAlt = $(this).attr("alt");

        // Hide .functionPayment and show .selectAmount
        $(".functionPayment").hide();
        $(".selectAmount").show();
    });

    // Add click event listener for .taoLenhNap button
    $(".taoLenhNap").on("click", function () {
        let amount = $("#amount").val();

        // Check if amount is a valid number
        if (isNaN(amount) || amount == "" || !amount) {
            alert("Vui lòng nhập đúng giá trị số.");
            return;
        }

        // Convert amount to number
        amount = parseInt(amount, 10);

        // Check if amount is less than 100,000
        if (amount < 100000) {
            alert("Số tiền tối thiểu là 100,000 VND.");
            return;
        }

        // Check if selectedPaymentMethodAlt is valid
        if (!selectedPaymentMethodAlt) {
            alert("Vui lòng chọn phương thức thanh toán.");
            return;
        }

        $.ajax({
            url: `${mainApi}/api/payment/createRequestQR`,
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
            data: JSON.stringify({
                bank: selectedPaymentMethodAlt,
                amountDeposit: amount
            })
        }).done(function (response) {
            if (response.status) {

                // Ẩn firstStep
                $('.selectAmount').hide();

                // Thêm lớp active vào bước tiếp theo trong thanh tiến trình
                $('.containerProgress .item').removeClass('active');
                $('.containerProgress .item').eq(1).addClass('active'); // Bước tiếp theo

                // Hiển thị secondStep
                $('.secondStep').show();

                // Cập nhật nội dung secondStep dựa trên response trả về
                $('.content__tentk__value').text(response.inforPayment.bankName);
                $('.content__sotk__value').text(response.inforPayment.bankNumber);
                $('.content__ndck__value').text(response.inforPayment.fullContent);
                $('.content__sotien__value').text(formatCurrency(response.inforPayment.amount));
                $('.qrCode img').attr('src', response.qrCodeUrl);

                // Cập nhật hình ảnh trong class logo dựa trên bankProvide
                let bankProvide = response.inforPayment.bankProvide;
                let logoSrc;
                switch (bankProvide) {
                    case 'ACB':
                        logoSrc = '/images/bankList/acb.jpg';
                        break;
                    case 'TECHCOMBANK':
                        logoSrc = '/images/bankList/techcombank.png';
                        break;
                    case 'VIETCOMBANK':
                        logoSrc = '/images/bankList/vietcombank.jpg';
                        break;
                    case 'NCB':
                        logoSrc = '/images/bankList/ncbLogo.png';
                        break;
                    case 'MB':
                        logoSrc = '/images/bankList/mbLogo.jpg';
                        break;
                    case 'VIB0':
                        logoSrc = '/images/bankList/vibLogo.jpg';
                        break;
                    case 'VIB1':
                        logoSrc = '/images/bankList/vibLogo.jpg';
                        break;
                    default:
                        logoSrc = '/images/default-bank-logo.jpg'; // Trường hợp không khớp với bất kỳ ngân hàng nào
                }
                $('.logo img').attr('src', logoSrc);
            } else {
                // Xử lý khi thất bại
                alert('Vui lòng chọn phương thức khác');
            }
        });
    });



    // Thêm sự kiện click vào phần tử .confirmDeposit
    $('.confirmDeposit').on('click', function () {
        const modalHtml = `
        <div class="confirmDeposit-layout">
            <div class="confirmDeposit-modal">
                <div class="confirmDeposit-modal__title">
                    <h2>Confirm Transaction</h2>
                    <button class="cancel-confirmDeposit-modal">X</button>
                </div>
                <div class="confirmDeposit-modal__content">
                    <p>Vui lòng chuyển tiền xong mới nhấn "XÁC NHẬN"</p>
                </div>
                <div class="confirmDeposit-modal__active">
                    <button class="yes-confirmDeposit-modal btn-submit-deposit">XÁC NHẬN</button>
                </div>
            </div>
        </div>
    `;
        $('#modal-container').html(modalHtml);
        // Sự kiện để đóng modal khi nhấn vào nút HỦY
        $('#modal-container').on('click', '.cancel-confirmDeposit-modal', function () {
            $('#modal-container').empty();
        });
        // Sự kiện submit khi nhấn vào nút XÁC NHẬN
        $('#modal-container').on('click', '.btn-submit-deposit', function () {
            const bank = "nothingmb";
            const amountDeposit = getOnlyNumberInString($('#amount').val()) >> 0;
            const nameDeposit = document.querySelector('.content__tentk__value').textContent;
            const numberDeposit = document.querySelector('.content__sotk__value').textContent;
            const bankDeposit = selectedPaymentMethodAlt;
            const transIdDeposit = document.querySelector('.content__ndck__value').textContent;

            if (!nameDeposit ||
                !numberDeposit ||
                !bankDeposit
            ) {
                initAuthNotifyModal(true, `Vui lòng nhập đầy đủ thông tin trước khi nhấn xác nhận!`);
                return;
            }

            if (amountDeposit <= 0) {
                initAuthNotifyModal(true, `Số tiền nạp không hợp lệ!`);
                return;
            }

            setTimeout(() => {
                $.ajax({
                    "url": `${mainApi}/api/payment/createRequestManualBank`,
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Authorization": `Bearer ${bearerToken}`,
                        "Content-Type": "application/json",
                    },
                    "data": JSON.stringify({
                        bank,
                        nameDeposit,
                        bankDeposit,
                        numberDeposit,
                        transIdDeposit,
                        amountDeposit
                    }),
                }).done(function (response) {
                    $(".confirmDeposit").hide()
                    $('#modal-container').empty();
                    if (response.status) {
                        initAuthNotifyModal(true, `${response.msg}`);
                        window.location.reload();
                    } else {
                        initAuthNotifyModal(true, `${response.msg}`);
                        window.location.reload();
                    }
                }).fail(function () {
                    $(".confirmDeposit").hide()
                    $('#modal-container').empty();
                    initAuthNotifyModal(true, "Yêu cầu thất bại. Vui lòng thử lại.");
                    window.location.reload(); // Tải lại trang khi thất bại
                });;
            }, 2000);
        });
    });

});


function changeMethod(type) {
    $(".no-method-select").hide();
    loadScript(type);
}


function loadScript(scriptName) {
    /* Adding the script tag to the head as suggested before */
    var scriptPosistion = document.getElementById('scriptMethod');
    scriptMethod.innerHTML = "";
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "/core/js/account/deposit/" + scriptName + ".js";
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = handler;
    script.onload = handler;

    // Fire the loading
    scriptPosistion.appendChild(script);

    function handler() {
        //console.log('script ' + scriptName + ' was added!');
    }
}

// Class Handle Method

class BankTransferManual {

}