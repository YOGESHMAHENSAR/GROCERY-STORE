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
  const form = document.querySelector('.needs-validation');
  const loaderOverlay = document.getElementById('addProductLoaderOverlay')
    || document.getElementById('loginLoaderOverlay')
    || document.getElementById('loaderOverlay');
  
  if (form && loaderOverlay) {    
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      e.preventDefault();
      if (loaderOverlay.classList) {
        loaderOverlay.classList.add('active');
      }
      loaderOverlay.style.display = 'flex';

      requestAnimationFrame(() => {
        form.submit();
      });
    });
  } else {
    console.error('Form or loader overlay not found!');
  }
});

//mode selection card or cod
const payBtn = document.getElementById("pay-btn");
if (payBtn) {
  payBtn.addEventListener("click", function(){
    const mode = document.getElementById("payment-mode");
    if (!mode || !mode.value) {
      alert("Please select a payment mode first");
      return;
    }
    if (mode.value === 'COD') {
      initiateCod();
    }
    if (mode.value === 'Razorpay') {
      initiateCard();
    }
  });
}

async function initiateCod() {
    const btn = document.getElementById("pay-btn");
    // btn.disabled = true;
    // btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...`;

    try {
        // ✅ Get amount from DOM — same as initiateCard does
        const Total = document.querySelector(".grand-total-final");
        const amount = parseFloat(Total.innerText.replace("₹", "").replace(/,/g, "").trim());

        const res = await fetch("/create-cod-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });

        const data = await res.json();

        if(data.success) {
            window.location.href = "/order-success";
        } else {
            alert(data.message || "Failed to place order");
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-bag-shopping me-2"></i> Place Order`;
        }
    } catch(err) {
        console.error("COD Order Error:", err);
        alert("An error occurred. Please try again.");
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-bag-shopping me-2"></i> Place Order`;
    }
}

//open the payment model of the razorpay
async function initiateCard(){
  const btn = document.getElementById("pay-btn")
  if(!btn) return;
  const key = btn.getAttribute("data-key");
  const Total  = document.querySelector(".grand-total-final");
  // btn.disabled = true;
  // btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;

    const amount = parseFloat(Total.innerText.replace("₹", "").trim());
  try{
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

      config: {
          display: {
              blocks: {
                  upi_intent: {
                      name: "Pay via UPI",
                      instruments: [
                          { method: "upi", flows: ["intent"] }, // ← intent not collect
                      ]
                  },
              },
              sequence: ["block.upi_intent", "block.other"],
              preferences: { show_default_blocks: true }
          }
      },

      //after successful payement

      handler: async function(response) {
        console.log(response);
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
              // ✅ Pass orderId as query param for mobile fallback
              window.location.href = `/order-success?id=${verifyData.orderId}`;
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
  } catch(err) {
        console.error(err);
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-bag-shopping me-2"></i> Place Order`;
    }
}

//inititate cod payment  method
// for tax prefitted in the select box of the category
const categoryTax = {
  "Beverages": 12,
  "Snacks": 18,
  "Dairy": 2,
  "Grocery": 5
};

function setTax(category) {
  const taxInputs = document.querySelectorAll('input[name="listing[Tax]"]');
  if (!taxInputs || taxInputs.length === 0) return;

  const tax = categoryTax[category];
  const value = tax ?? "";
  taxInputs.forEach(inp => { inp.value = value; });
}

// initialize on load and wire change events
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const taxInputs = document.querySelectorAll('input[name="listing[Tax]"]');

  if (categorySelect && taxInputs.length) {
    setTax(categorySelect.value);
    categorySelect.addEventListener("change", (event) => {
      setTax(event.target.value);
    });
  }
});