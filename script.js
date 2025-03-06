{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 document.addEventListener("DOMContentLoaded", loadOrders);\
\
let editingIndex = -1;\
\
document.getElementById("orderForm").addEventListener("submit", function (event) \{\
    event.preventDefault();\
\
    let name = document.getElementById("name").value;\
    let food = document.getElementById("food").value;\
    let date = document.getElementById("date").value;\
    let amount = document.getElementById("amount").value;\
\
    let orders = JSON.parse(localStorage.getItem("orders")) || [];\
\
    if (editingIndex === -1) \{\
        orders.push(\{ name, food, date, amount, paid: false \});\
    \} else \{\
        orders[editingIndex] = \{ name, food, date, amount, paid: false \};\
        editingIndex = -1;\
        document.getElementById("orderForm").querySelector("button").innerText = "Add Order";\
    \}\
\
    localStorage.setItem("orders", JSON.stringify(orders));\
    document.getElementById("orderForm").reset();\
    loadOrders();\
\});\
\
function loadOrders() \{\
    let orders = JSON.parse(localStorage.getItem("orders")) || [];\
    let orderList = document.getElementById("orderList");\
    orderList.innerHTML = "";\
\
    let totalOwed = \{\};\
\
    orders.forEach((order, index) => \{\
        let row = `<tr class="$\{order.paid ? 'paid' : ''\}">\
            <td>$\{order.name\}</td>\
            <td>$\{order.food\}</td>\
            <td>$\{order.date\}</td>\
            <td>$$\{order.amount\}</td>\
            <td><input type="checkbox" $\{order.paid ? 'checked' : ''\} onchange="markPaid($\{index\})"></td>\
            <td>\
                <button onclick="editOrder($\{index\})">Edit</button>\
                <button onclick="deleteOrder($\{index\})">Delete</button>\
            </td>\
        </tr>`;\
        orderList.innerHTML += row;\
\
        if (!order.paid) \{\
            totalOwed[order.name] = (totalOwed[order.name] || 0) + parseFloat(order.amount);\
        \}\
    \});\
\
    document.getElementById("summary").innerHTML = Object.entries(totalOwed)\
        .map(([name, total]) => `<p>$\{name\}: $$\{total.toFixed(2)\}</p>`)\
        .join("");\
\}\
\
function markPaid(index) \{\
    let orders = JSON.parse(localStorage.getItem("orders")) || [];\
    orders[index].paid = !orders[index].paid;\
    localStorage.setItem("orders", JSON.stringify(orders));\
    loadOrders();\
\}\
\
function deleteOrder(index) \{\
    let orders = JSON.parse(localStorage.getItem("orders")) || [];\
    orders.splice(index, 1);\
    localStorage.setItem("orders", JSON.stringify(orders));\
    loadOrders();\
\}\
\
function editOrder(index) \{\
    let orders = JSON.parse(localStorage.getItem("orders")) || [];\
    let order = orders[index];\
\
    document.getElementById("name").value = order.name;\
    document.getElementById("food").value = order.food;\
    document.getElementById("date").value = order.date;\
    document.getElementById("amount").value = order.amount;\
\
    editingIndex = index;\
    document.getElementById("orderForm").querySelector("button").innerText = "Update Order";\
\}\
\
async function processReceipt() \{\
    let file = document.getElementById("receiptUpload").files[0];\
    if (!file) \{\
        alert("Please upload a receipt.");\
        return;\
    \}\
\
    let reader = new FileReader();\
    reader.onload = async function () \{\
        let typedArray = new Uint8Array(this.result);\
        let pdf = await pdfjsLib.getDocument(typedArray).promise;\
        let text = "";\
\
        for (let i = 1; i <= pdf.numPages; i++) \{\
            let page = await pdf.getPage(i);\
            let textContent = await page.getTextContent();\
            text += textContent.items.map(item => item.str).join(" ") + "\\n";\
        \}\
\
        extractOrderDetails(text);\
    \};\
\
    reader.readAsArrayBuffer(file);\
\}\
\
function extractOrderDetails(text) \{\
    let orderDetails = text.match(/Total: \\$(\\d+\\.\\d\{2\})/);\
    let amount = orderDetails ? orderDetails[1] : "0.00";\
\
    let foodItems = text.match(/(.*?)(?=\\$[\\d\\.]+$)/gm);\
    let food = foodItems ? foodItems[foodItems.length - 1].trim() : "Unknown Item";\
\
    document.getElementById("name").value = "Unknown Friend";\
    document.getElementById("food").value = food;\
    document.getElementById("date").value = new Date().toISOString().split("T")[0];\
    document.getElementById("amount").value = amount;\
\}\
}