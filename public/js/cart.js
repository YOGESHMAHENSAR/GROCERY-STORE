document.addEventListener("DOMContentLoaded", updateCalculation);

const qtyTimers = {};

async function chnageQty(productId, delta, btn) {
    const qtyEl   = document.getElementById(`qty-${productId}`); // ✅ consistent name
    const current = parseInt(qtyEl.innerText);
    const newQty  = current + delta;

    // ✅ fixed condition
    if (newQty < 1 || newQty > 3) return;

    qtyEl.innerText = newQty;
    updateCalculation();

    clearTimeout(qtyTimers[productId]);
    qtyTimers[productId] = setTimeout(async () => {
        try {
            const response = await fetch(`/cart/${productId}/quantity`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQty })
            });

            const data = await response.json();

            if (!data.success) {
                qtyEl.innerText = current; // ✅ qtyEl not qtyE
                updateCalculation();
            }
        } catch(err) {
            console.error(err);
            qtyEl.innerText = current; // ✅ qtyEl not qtyE
            updateCalculation();
        }
    }, 600);
}

function updateCalculation() {
    let subTotal = 0;
    let totalTax = 0;

    document.querySelectorAll(".qty-number").forEach(qtyEl => {
        const productId = qtyEl.id.replace("qty-", "");
        const qty       = parseInt(qtyEl.innerText);
        const priceEl   = document.getElementById(`price-${productId}`);
        const price     = parseFloat(priceEl.dataset.price);
        const tax       = parseFloat(priceEl.dataset.tax) / 100; // ✅ works if Tax is stored as number

        const itemTotal = price * qty;
        subTotal += itemTotal;
        totalTax += itemTotal * tax;

        const itemTotalEl = document.getElementById(`item-total-${productId}`);
        if (itemTotalEl) itemTotalEl.innerText = `₹${itemTotal}`;
    });

    const grandTotal = subTotal + totalTax + 10;

    document.getElementById("subtotal").innerText   = `₹${subTotal}`;
    document.getElementById("tax").innerText        = `₹${totalTax.toFixed(2)}`;
    document.getElementById("grandTotal").innerText = `₹${grandTotal.toFixed(2)}`;
}