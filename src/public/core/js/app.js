"use strict";

const LIST_PRODUCT_TYPE = [
  "slot",
  "live",
  "fish",
  "sport",
  "lottery",
  "board",
  "cockfighting",
  "livestream",
];

$(document).ready(() => {
  $(".category-list").on("click", "li", function () {
    var productType = $(this).attr("data-product-type");
    if (productType === "slot") {
      initAuthNotifyModal(true, "Sảnh game đang bảo trì");
      return;
    }
    $(".category-list li.active").removeClass("active");
    $(this).addClass("active");
    changeTabGame(productType);
  });

  // Click vào game trong #gameListAllDetail để mở modal chuyển quỹ
  $("#gameListAllDetail").on("click", ".game-item img", function () {
    const product = $(this).attr("game-product");
    const type = $(this).attr("game-type");
    if (product && type) {
      launchGame(product, type);
    }
  });
});

function hideAllProduct() {
  LIST_PRODUCT_TYPE.forEach((product) => {
    $("#list-product-" + product).hide();
  });
}

function changeTabGame(type) {
  hideAllProduct();
  $("#list-product-" + type).fadeIn();
}

function reloadBalance() {
  $(".game-transfer-wallet-modal-v2__item-amount").first().text("Đang tải...");
  $.ajax({
    url: `${mainApi}/api/auth/me`,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    type: "get",
    dataType: "json",
  })
    .done(function (result) {
      if (result.status) {
        const readableCoin = (result.user.coin / 1000).toFixed(1);
        $(".game-transfer-wallet-modal-v2__item-amount")
          .first()
          .text(`${numberWithCommas(readableCoin)} K`);
      } else {
        $(".game-transfer-wallet-modal-v2__item-amount").first().text("Lỗi");
        initAuthNotifyModal(true, "Phiên đăng nhập hết hiệu lực!");
      }
    })
    .fail(function () {
      $(".game-transfer-wallet-modal-v2__item-amount").first().text("Lỗi");
      initAuthNotifyModal(true, "Không thể tải số dư. Vui lòng thử lại!");
    });
}

const getWallet = (gameID) => {
  $(".game-transfer-wallet-modal-v2__item-amount").eq(1).text("Đang tải...");
  $.ajax({
    url: `${mainApi}/api/game/wallets/${gameID.toUpperCase()}`,
    method: "GET",
    timeout: 0,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
  })
    .done((response) => {
      if (response.status) {
        const readableBalance = (response.balance / 1000).toFixed(1);
        $(".game-transfer-wallet-modal-v2__item-amount")
          .eq(1)
          .text(`${numberWithCommas(readableBalance)} K`);
      } else {
        $(".game-transfer-wallet-modal-v2__item-amount").eq(1).text("Lỗi");
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      $(".game-transfer-wallet-modal-v2__item-amount").eq(1).text("Lỗi");
      console.error("AJAX call failed: ", textStatus, errorThrown);
    });
};

let isTransferring = false;

function submitAllCashInOut(gameID, transferType) {
  if (isTransferring) return;
  isTransferring = true;
  $(".game-transfer-wallet-modal-v2__item button").prop("disabled", true);

  let currentAmount = 0;

  const unlockTransfer = function () {
    isTransferring = false;
  };

  // Function to handle submitting cash in after getting user data
  const handleCashIn = function () {
    // Kiểm tra xem số tiền hiện tại có hợp lệ không
    if (currentAmount < 1000) {
      initAuthNotifyModal(true, "Số tiền phải lớn hơn 1000 VND.");
      unlockTransfer();
      return;
    }

    $.ajax({
      url: `${mainApi}/api/game/wallet-transfer`,
      method: "POST",
      timeout: 0,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        amount: Number(currentAmount),
        id: gameID,
        transferType: 0,
      }),
    })
      .done(function (response) {
        if (response.status) {
          reloadBalance();
          getWallet(gameID);
        } else {
          initAuthNotifyModal(true, response.msg);
        }
      })
      .fail(function () {
        initAuthNotifyModal(true, "Có lỗi xảy ra vui lòng thử lại.");
      })
      .always(unlockTransfer);
  };

  const handleCashOut = function () {
    // Kiểm tra xem số tiền hiện tại có hợp lệ không
    if (currentAmount < 1) {
      initAuthNotifyModal(true, "Số tiền phải lớn hơn 1K.");
      unlockTransfer();
      return;
    }

    $.ajax({
      url: `${mainApi}/api/game/wallet-transfer`,
      method: "POST",
      timeout: 0,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        amount: Number(currentAmount / 1000),
        id: gameID,
        transferType: 1,
      }),
    })
      .done(function (response) {
        if (response.status) {
          reloadBalance();
          getWallet(gameID);
        } else {
          initAuthNotifyModal(true, response.msg);
        }
      })
      .fail(function () {
        initAuthNotifyModal(true, "Có lỗi xảy ra vui lòng thử lại.");
      })
      .always(unlockTransfer);
  };

  if (transferType == 0) {
    // Gọi API để lấy dữ liệu người dùng
    $.ajax({
      url: `${mainApi}/api/auth/me`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      type: "get",
      dataType: "json",
    })
      .done(function (result) {
        if (result.status) {
          const meData = result.user;
          currentAmount = meData.coin;
          handleCashIn();
        } else {
          initAuthNotifyModal(true, "Phiên đăng nhập hết hiệu lực!");
          unlockTransfer();
        }
      })
      .fail(function () {
        initAuthNotifyModal(true, "Có lỗi xảy ra vui lòng thử lại.");
        unlockTransfer();
      });
  }
  if (transferType == 1) {
    $.ajax({
      url: `${mainApi}/api/game/wallets/${gameID.toUpperCase()}`,
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    })
      .done((response) => {
        if (response.status) {
          currentAmount = response.balance;
          handleCashOut();
        } else {
          console.error("Failed to retrieve balance");
          unlockTransfer();
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("AJAX call failed: ", textStatus, errorThrown);
        unlockTransfer();
      });
  }
}

function launchGame(gameProduct, gameType) {
  const product = gameProduct;
  let type = gameType;

  if (!isLogin) {
    initAuthNotifyModal(
      true,
      "Vui lòng đăng nhập trước khi khởi chạy trò chơi!",
    );
    return;
  }

  // Kiểm tra sảnh game có hoạt động không
  const activeProducts = ["SEX", "EG", "BG", "DG", "WM", "SBO"];
  if (!activeProducts.includes(product)) {
    initAuthNotifyModal(true, "Sảnh game đang bảo trì");
    return;
  }

  // Xay dung modal chuyen quy ngay tai day
  const modalHtml = `
    <div class="game-transfer-wallet-modal-v2 undefined open">
    <div class="game-transfer-wallet-modal-v2__main">
      <div class="game-transfer-wallet-modal-v2__header">
        <div class="game-transfer-wallet-modal-v2__title">Nạp tự động
          <button class="game-transfer-wallet-modal-v2__close">X
          </button>
        </div>
      </div>
      <div class="game-transfer-wallet-modal-v2__content">
        <div class="game-transfer-wallet-modal-v2__item"><span>Ví chính</span>
          <div><span class="game-transfer-wallet-modal-v2__item-amount">0 K</span><button>Nạp hết</button></div>
        </div>
        <div class="game-transfer-wallet-modal-v2__item"><span class="game-transfer-wallet-modal-v2__wallet-title" color="danger">${product}</span>
          <div><span class="game-transfer-wallet-modal-v2__item-amount">0 K</span><button>Rút hết</button></div>
        </div>
      </div>
      <div class="game-transfer-wallet-modal-v2__footer">
        <button color="danger">Vào game</button>
      </div>
    </div>
  </div>
    `;
  // Thêm sự kiện click vào phần tử .game-transfer-wallet-modal-container
  $("#game-transfer-wallet-modal-container").html(modalHtml);

  // Sự kiện để đóng modal khi nhấn vào nút HỦY
  $("#game-transfer-wallet-modal-container").on(
    "click",
    ".game-transfer-wallet-modal-v2__close",
    function () {
      $("#game-transfer-wallet-modal-container").empty();
    },
  );

  // Call getWallet with the gameID (which is the same as the product)
  getWallet(product);
  // Call balance of user
  reloadBalance();

  // all cash in (Nạp hết)
  $(".game-transfer-wallet-modal-v2__item")
    .eq(0)
    .find("button")
    .on("click", function () {
      const button = $(this);
      button.prop("disabled", true);
      submitAllCashInOut(product, 0);
    });
  // all cash out (Rút hết)
  $(".game-transfer-wallet-modal-v2__item")
    .eq(1)
    .find("button")
    .on("click", function () {
      const button = $(this);
      button.prop("disabled", true);
      submitAllCashInOut(product, 1);
    });

  // start game
  $(".game-transfer-wallet-modal-v2__footer")
    .eq(0)
    .find("button")
    .on("click", function () {
      startGame(product, type);
    });
}
function startGame(product, type) {
  // Site mobile - luôn mở game trong cửa sổ mới
  const winRef = window.open();

  fetch(
    `${mainApi}/api/game/launchgame/${product.toUpperCase()}?type=${type}&device=mobile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((result) => {
      if (result.status) {
        winRef.location = "/Redirect?url=" + utoa(result.data.playUrl);
        $("#game-transfer-wallet-modal-container").empty();
      } else {
        winRef.close();
        initAuthNotifyModal(true, result.msg);
      }
    })
    .catch((error) => {
      console.error("Error launching game:", error);
      winRef.close();
      initAuthNotifyModal(
        true,
        "Không thể khởi chạy trò chơi. Vui lòng thử lại sau.",
      );
    });
}
