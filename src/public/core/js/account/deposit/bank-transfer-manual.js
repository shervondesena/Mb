"use strict";


$(document).ready(() => {
    $(".method-is-maintance").hide();
    initMethodDeposit = new BankTransferManual();
    

    $("#amount").keyup(function () { initMethodDeposit.onChangedAmount($(this)) });
    $("#bankNameUser").keyup(function () { initMethodDeposit.onChangedBankName($(this)) });

    // submit deposit
    $(".btn-submit-deposit").on("click", function () { initMethodDeposit.submitDeposit($(this)) });
});