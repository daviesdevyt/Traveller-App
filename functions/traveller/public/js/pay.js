$(document).ready(function () {
  const paymentForm = document.querySelector("#paymentForm");
  paymentForm.addEventListener("click", payWithPaystack);

  function payWithPaystack(e) {
    e.preventDefault();
    let handler = PaystackPop.setup({
      key: "pk_test_875c4e6dd98140d5d9840eaaca20763791d1ec3c",
      email: user.email_id,
      amount: document.querySelector("total").innerHTML * 100,
      // label: "Optional string that replaces customer email"
      onClose: function () {
        alert('Payment was not completed.');
      },
      callback: function (response) {
        let message = 'Payment complete! Reference: ' + response.reference+". Check "+user.email_id+" for your reciept";
        alert(message);
        $.ajax({
          url: '/server/traveller/verify_transaction?reference=' + response.reference,
          method: 'get',
          success: function (response) {
            console.log(response)
            window.location = "/server/traveller/orders"
            // the transaction status is in response.data.status
          }
        });
      }
    });

    handler.openIframe();
  }
}
);
