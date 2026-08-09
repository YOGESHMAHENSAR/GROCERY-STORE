document.addEventListener("DOMContentLoaded", updateCalculation);

const qtyTimers = {};

async function chnageQty(productId, variantId, delta, btn) {
    const qtyEl   = document.getElementById(`qty-${variantId}`); // keyed by variant, matches EJS
    const current = parseInt(qtyEl.innerText);
    const newQty  = current + delta;

    if (newQty < 1 || newQty > 3) return;

    qtyEl.innerText = newQty;
    updateCalculation();

    clearTimeout(qtyTimers[variantId]);
    qtyTimers[variantId] = setTimeout(async () => {
        try {
            const response = await fetch(`/cart/${productId}/quantity`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQty, variantId })
            });

            const data = await response.json();

            if (!data.success) {
                qtyEl.innerText = current;
                updateCalculation();
                if (data.message) alert(data.message); // surface stock-limit errors etc.
            }
        } catch(err) {
            console.error(err);
            qtyEl.innerText = current;
            updateCalculation();
        }
    }, 600);
}

function updateCalculation() {
    let subTotal = 0;
    let totalTax = 0;

    document.querySelectorAll(".qty-number").forEach(qtyEl => {
        const variantId = qtyEl.id.replace("qty-", "");
        const qty       = parseInt(qtyEl.innerText);
        const priceEl   = document.getElementById(`price-${variantId}`);
        const price     = parseFloat(priceEl.dataset.price);
        const tax       = parseFloat(priceEl.dataset.tax) / 100;

        const itemTotal = price * qty;
        subTotal += itemTotal;
        totalTax += itemTotal * tax;

        const itemTotalEl = document.getElementById(`item-total-${variantId}`);
        if (itemTotalEl) itemTotalEl.innerText = `₹${itemTotal.toFixed(2)}`;
    });

    const grandTotal = subTotal + totalTax + 10;
    const sgst = totalTax / 2;
    const cgst = totalTax / 2;

    document.getElementById("subtotal").innerText   = `₹${subTotal.toFixed(2)}`;
    document.getElementById("tax").innerText        = `₹${totalTax.toFixed(2)}`;
    document.getElementById("cgst").innerText        = `₹${cgst.toFixed(2)}`;
    document.getElementById("sgst").innerText        = `₹${sgst.toFixed(2)}`;
    document.getElementById("grandTotal").innerText = `₹${grandTotal.toFixed(2)}`;
}