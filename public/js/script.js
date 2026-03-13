// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const loaderOverlay = document.getElementById('loaderOverlay');
  
  if (form && loaderOverlay) {    
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      loaderOverlay.classList.add('active');  // ← shows your overlay
    });
  } else {
    console.error('Form or loader overlay not found!');
  }
});

//open the payment model of the razorpay
document.addEventListener("DOMContentLoaded", ()=>{
  const btn = document.getElementById("pay-btn")
  if(!btn) return;
  const key = btn.getAttribute("data-key");
  const Total  = document.querySelector(".grand-total-final");

  btn.addEventListener("click", async ()=> {
    console.log("btn was clicked");
    const amount = parseFloat(Total.innerText.replace("₹", "").trim());

    //create order on backend
    const orderRes = await fetch("/create-order",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ amount }),
    })

    const orderData = await orderRes.json();

    if(!orderData.success){
      alert("Order Creation Failed!");
      return;
    }

    //open razorpay popup
    const options = {
      key: key,
      amount: orderData.order.amount,
      currency: "INR",
      name: "GROCERY-STORE",
      description: "ORDER-PAYMENT",
      image: "/css/grocery-image.png",
      order_id: orderData.order.id,

      //after successful payement

      handler: async function(response) {
          const verifyRes  = await fetch('/verify-payment', {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature
              })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
              window.location.href = "/order-success"; // ✅ redirect
          } else {
              alert("Payment verification failed!");
          }
      },
      prefill: {
          name:  "<%= currUser.username %>",
          email: "<%= currUser.email %>"
      },

      theme: { color: "#4f46e5" }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response) => {
        alert("Payment failed: " + response.error.description);
    });

    rzp.open();
  })
});
