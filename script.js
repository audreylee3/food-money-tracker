document.addEventListener("DOMContentLoaded", loadOrders);

let editingIndex = -1;

document.getElementById("orderForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let food = document.getElementById("food").value;
    let date = document.getElementById("date").value;
    let amount = document.getElementById("amount").value;

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (editingIndex === -1) {
        orders.push({ name, food, date, amount, paid: false });
    } else {
        orders[editingIndex] = { name, food, date, amount, paid: false };
        editingIndex = -1;
        document.getElementById("orderForm").querySelector("button").innerText = "Add Order";
    }

    localStorage.setItem("orders", JSON.stringify(orders));
    document.getElementById("orderForm").reset();
    loadOrders();
});

function loadOrders() {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let orderList = document.getElementById("orderList");
    orderList.innerHTML = "";

    let totalOwed = {};

    orders.forEach((order, index) => {
        let row = `<tr class="${order.paid ? 'paid' : ''}">
            <td>${order.name}</td>
            <td>${order.food}</td>
            <td>${order.date}</td>
            <td>$${order.amount}</td>
            <td><input type="checkbox" ${order.paid ? 'checked' : ''} onchange="markPaid(${index})"></td>
            <td>
                <button onclick="editOrder(${index})">Edit</button>
                <button onclick="deleteOrder(${index})">Delete</button>
            </td>
        </tr>`;
        orderList.innerHTML += row;

        if (!order.paid) {
            totalOwed[order.name] = (totalOwed[order.name] || 0) + parseFloat(order.amount);
        }
    });

    document.getElementById("summary").innerHTML = Object.entries(totalOwed)
        .map(([name, total]) => `<p>${name}: $${total.toFixed(2)}</p>`)
        .join("");
}

function markPaid(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders[index].paid = !orders[index].paid;
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrders();
}

function editOrder(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let order = orders[index];

    document.getElementById("name").value = order.name;
    document.getElementById("food").value = order.food;
    document.getElementById("date").value = order.date;
    document.getElementById("amount").value = order.amount;

    editingIndex = index;
    document.getElementById("orderForm").querySelector("button").innerText = "Update Order";
}

