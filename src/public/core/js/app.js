"use strict";

const LIST_PRODUCT_TYPE = [
    'slot',
    'live',
    'fish',
    'sport',
    'lottery',
    'board',
    'cockfighting',
    'livestream'
];


$(document).ready(() => {
    $(".category-list").on('click', 'li', function () {
        var productType = $(this).attr("data-product-type");
        if (productType === "slot") {
            alert("Sảnh game đang bảo trì");
            return;
        }
        $(".category-list li.active").removeClass("active");
        $(this).addClass("active");
        changeTabGame(productType);
    });
    getFishGameList();
});

function getFishGameList() {
    $.ajax({
        url: `${mainApi}/api/product/fish`,
        headers: {
            "Content-Type": "application/json",
        },
        type: "get",
        dataType: "json",
        success: function (result) {
            if (result.status) {
                $("#list-product-fish").html(``);
                for (var product in result.data) {
                    $("#list-product-fish").append(`
                        <div _ngcontent-serverapp-c162="" onclick="launchGame('${result.data[product].product}', '${product}')"
                            class="third:mr-0 relative mt-[2%] mr-[1%] box-border inline-block min-h-[82px] w-[32%] min-w-[74px] text-center">
                            <div _ngcontent-serverapp-c162="" class="relative flex h-[64px] items-center justify-center">
                                <img _ngcontent-serverapp-c162="" class="max-h-[100%] max-w-[100%] rounded-t"
                                    src="${result.data[product].icon}">
                            </div>
                            <div _ngcontent-serverapp-c162=""
                                class="bg-customized-bg-quaternary text-customized-text-secondary h-[26px] truncate rounded-b text-center text-sm leading-[22px] tracking-tighter">
                                <span _ngcontent-serverapp-c162="" class="text-xs">
                                ${result.data[product].name}
                                </span>
                            </div>
                        </div>
                    `);
                }
            } else { }
        },
    });
}

function hideAllProduct() {
    LIST_PRODUCT_TYPE.forEach((product) => {
        $("#list-product-" + product).hide();
    });
}

function changeTabGame(type) {
    hideAllProduct();
    $("#list-product-" + type).fadeIn();
}

function openSlotProduct(product) {
    window.location = "/lobby/slot/" + product.attr("data-product");
}

function openLiveCasino(product) {
    launchGame(product.attr("data-product"), product.attr("data-code"));
}

function openSportProduct(product) {
    launchGame(product.attr("data-product"), product.attr("data-code"));
}

function openLotteryProduct(product) {
    launchGame(product.attr("data-product"), product.attr("data-code"));
}

function openBoardProduct(product) {
    // window.location = "/lobby/board/" + product.attr("data-product");
    launchGame(product.attr("data-product"), product.attr("data-code"));
}


function launchGame(gameProduct, gameCode) {
    const product = gameProduct;
    const code = gameCode;

    if (!isLogin) {
        initAuthNotifyModal(true, "Vui lòng đăng nhập trước khi khởi chạy trò chơi!");
        return;
    }

    $.ajax({
        url: `${mainApi}/api/game/launchgame/${product.toUpperCase()}?code=${code}&platform=mobile`,
        headers: {
            "Authorization": `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
        },
        type: "get",
        dataType: "json",
        success: function (result) {
            if (result.status) {
                setTimeout(() => {
                    // window.location = "/Redirect?url=" + utoa(result.data.playUrl);
                    var userAgent = window.navigator.userAgent.toLowerCase(),
                        ios = /iphone|ipod|ipad/.test(userAgent);
                    if (ios) {
                        window.location = result.data.playUrl;
                    } else {
                        var anchor = document.createElement('a');
                        anchor.href = "/Redirect?url=" + utoa(result.data.playUrl);
                        anchor.target = "_blank";
                        anchor.click();
                    }
                }, 300);
            } else {
                initAuthNotifyModal(true, result.msg);
            }
        },
    });
}


// Detect Device To Redict
(!isMobile.any()) ? window.location = "https://www." + (new URL(window.location.href)).hostname.replace('m.', '') : null;