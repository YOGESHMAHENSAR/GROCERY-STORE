self.addEventListener("push", function(event) {
    // ✅ Handle both plain text (DevTools) and JSON (real push)
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch(e) {
        data = {
            title: "🛒 New Order!",
            body: event.data ? event.data.text() : "New order received",
            url: "/orders-delivery"
        };
    }

    const options = {
        body: data.body,
        icon: "/css/grocery-image.png",
        badge: "/css/grocery-image.png",
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: data.url },
        actions: [
            { action: "view", title: "View Order" },
            { action: "dismiss", title: "Dismiss" }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Grocery Store", options)
    );
});

self.addEventListener("notificationclick", function(event) {
    event.notification.close();
    if(event.action === "view" || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || "/orders-delivery")
        );
    }
});