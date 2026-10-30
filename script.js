let members = [];
let expenses = [];
let memberIdCounter = 1;
let expenseIdCounter = 1;
let totalBudget = 0;
const MAX_MEMBERS = 20;

// --- App Entry ---
function startApp() {
    const splash = document.getElementById('splash-screen');
    const mainApp = document.getElementById('main-app');
    
    splash.style.opacity = '0';
    setTimeout(() => {
        splash.style.display = 'none';
        mainApp.style.display = 'block';
    }, 500);
}

// --- Trip & Dashboard Setup ---
function setupTrip() {
    const name = document.getElementById('trip-name').value.trim();
    const budget = parseFloat(document.getElementById('trip-budget').value);
    if (name) document.getElementById('app-title').innerText = `💸 ${name}`;
    if (!isNaN(budget) && budget > 0) {
        totalBudget = budget;
        document.getElementById('budget-dashboard').style.display = 'block';
        updateDashboard();
    }
}

// --- Member Management ---
function renderDropdowns() {
    const list = document.getElementById('member-list');
    const payerSelect = document.getElementById('payer-select');
    const modalSender = document.getElementById('modal-sender');
    const modalReceiver = document.getElementById('modal-receiver');
    
    list.innerHTML = '';
    payerSelect.innerHTML = '<option value="" disabled selected>Who paid?</option>';
    modalSender.innerHTML = '<option value="" disabled selected>Who is paying?</option>';
    modalReceiver.innerHTML = '<option value="" disabled selected>Select person to pay</option>';

    members.forEach(m => {
        list.innerHTML += `<div class="chip">👤 ${m.name} <button class="remove-btn" onclick="removeMember(${m.id})">✕</button></div>`;
        payerSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
        modalSender.innerHTML += `<option value="${m.id}">${m.name}</option>`;
        
        let upiTag = m.upi ? `(UPI: ${m.upi})` : `(No UPI)`;
        modalReceiver.innerHTML += `<option value="${m.id}">${m.name} ${upiTag}</option>`;
    });
}

function addMember() {
    if (members.length >= MAX_MEMBERS) return alert(`Maximum limit of ${MAX_MEMBERS} members reached!`);
    const nameInput = document.getElementById('member-name');
    const upiInput = document.getElementById('member-upi');
    const name = nameInput.value.trim();
    if (!name) return;

    members.push({ id: memberIdCounter++, name: name, upi: upiInput.value.trim() });
    renderDropdowns();
    nameInput.value = ''; upiInput.value = ''; nameInput.focus();
}

function removeMember(id) {
    if (expenses.some(exp => exp.payer_id === id || exp.splits.some(s => s.member_id === id))) {
        return alert("Cannot remove member part of an existing expense/payment. Delete history first.");
    }
    members = members.filter(m => m.id !== id);
    renderDropdowns();
}

// --- Expenses & History ---
function addExpense() {
    if (members.length === 0) return alert("Add members first!");
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const payerId = parseInt(document.getElementById('payer-select').value);
    
    if (!desc || isNaN(amount) || isNaN(payerId)) return alert("Fill all fields.");
    
    const splits = members.map(m => ({ member_id: m.id, amount: amount / members.length }));
    saveTransaction(payerId, amount, desc, splits, 'expense');
    
    document.getElementById('desc').value = ''; document.getElementById('amount').value = '';
}

function saveTransaction(payerId, amount, desc, splits, type) {
    const timestamp = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    expenses.push({ id: expenseIdCounter++, payer_id: payerId, amount: amount, splits: splits, desc: desc, date: timestamp, type: type });
    
    const msg = document.getElementById('action-success');
    msg.innerText = `✅ Success! ₹${amount} recorded.`;
    setTimeout(() => msg.innerText = '', 3000);
    updateDashboard();
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    updateDashboard();
}

function updateDashboard() {
    const historyList = document.getElementById('history-list');
    if (expenses.length === 0) {
        historyList.innerHTML = `<p style="text-align:center; color:#a0aec0;">No activity yet.</p>`;
    } else {
        historyList.innerHTML = expenses.map(exp => {
            let payerName = members.find(m => m.id === exp.payer_id)?.name || "Unknown";
            let typeTag = exp.type === 'payment' ? `<span class="payment-type">💸 Direct Payment to ${members.find(m=>m.id===exp.splits[0].member_id).name}</span>` : '';
            return `
                <div class="history-item">
                    <div class="history-details">
                        <p><strong>${exp.desc}</strong> (₹${exp.amount}) <br>${typeTag}</p>
                        <p class="history-date">${exp.type === 'expense' ? 'Paid by '+payerName : 'Sent by '+payerName} • ${exp.date}</p>
                    </div>
                    <button class="btn-delete" onclick="deleteExpense(${exp.id})">Delete</button>
                </div>`;
        }).reverse().join('');
    }

    if (totalBudget > 0) {
        const spent = expenses.filter(e => e.type === 'expense').reduce((sum, exp) => sum + exp.amount, 0);
        document.getElementById('display-budget').innerText = `₹${totalBudget}`;
        document.getElementById('display-spent').innerText = `₹${spent}`;
        document.getElementById('display-remaining').innerText = `₹${totalBudget - spent}`;
        document.getElementById('display-remaining').className = (totalBudget - spent) < 0 ? 'text-red' : 'text-green';
        
        let perc = Math.min((spent / totalBudget) * 100, 100);
        document.getElementById('budget-progress').style.width = `${perc}%`;
        document.getElementById('budget-progress').className = spent > totalBudget ? 'progress-fill danger' : 'progress-fill';
    }

    calculateSettlements();
}

// --- Settlements Algorithm ---
function calculateSettlements() {
    let balances = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(exp => {
        balances[exp.payer_id] += exp.amount; 
        exp.splits.forEach(split => balances[split.member_id] -= split.amount);
    });

    let debtors = [], creditors = [];
    for (let id in balances) {
        if (balances[id] < -0.01) debtors.push({id: parseInt(id), amount: Math.abs(balances[id])});
        else if (balances[id] > 0.01) creditors.push({id: parseInt(id), amount: balances[id]});
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let transactions = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        let settleAmt = Math.min(debtors[i].amount, creditors[j].amount);
        transactions.push({ 
            from: members.find(m => m.id === debtors[i].id), 
            to: members.find(m => m.id === creditors[j].id), 
            amount: settleAmt.toFixed(2) 
        });
        debtors[i].amount -= settleAmt; creditors[j].amount -= settleAmt;
        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    document.getElementById('balances-list').innerHTML = members.map(m => {
        let net = balances[m.id].toFixed(2);
        return `<div class="balance-item"><span>${m.name}</span><span class="${net > 0 ? 'text-green' : (net < 0 ? 'text-red' : 'text-gray')}">${net > 0 ? 'Gets ₹'+net : (net < 0 ? 'Owes ₹'+Math.abs(net) : 'Settled')}</span></div>`;
    }).join('') || "No balances yet.";

    const tList = document.getElementById('transactions-list');
    if (transactions.length === 0) {
        tList.innerHTML = `<div style="text-align:center; padding:10px;">🎉 Everyone is settled up!</div>`;
    } else {
        tList.innerHTML = transactions.map(t => `
            <div class="transaction-item">
                <div>💸 <strong>${t.from.name}</strong> owes <strong>${t.to.name}</strong> <br><span class="text-red">₹${t.amount}</span></div>
                <button class="initiate-pay-btn" onclick="openPaymentModal(${t.from.id}, ${t.to.id}, ${t.amount})">💳 Pay</button>
            </div>
        `).join('');
    }
}

// --- Smart Payment Modal Logic ---
function openPaymentModal(fromId = '', toId = '', amount = '') {
    document.getElementById('payment-modal').style.display = 'flex';
    document.getElementById('modal-sender').value = fromId;
    document.getElementById('modal-receiver').value = toId;
    document.getElementById('modal-amount').value = amount;
    
    document.getElementById('modal-qr-container').style.display = 'none';
    updateModalUPI();
}

function closeModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

function updateModalUPI() {
    const recId = parseInt(document.getElementById('modal-receiver').value);
    const amt = document.getElementById('modal-amount').value;
    const payBtn = document.getElementById('modal-pay-btn');
    const qrBtn = document.getElementById('modal-qr-btn');
    const qrCont = document.getElementById('modal-qr-container');

    if (!recId || !amt) {
        payBtn.style.display = 'none'; qrBtn.style.display = 'none'; qrCont.style.display = 'none';
        return;
    }

    const receiver = members.find(m => m.id === recId);

    if (receiver && receiver.upi) {
        const upiStr = `upi://pay?pa=${receiver.upi}&pn=${receiver.name}&am=${amt}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`;

        payBtn.href = upiStr;
        payBtn.style.display = 'block';
        qrBtn.style.display = 'block';
        
        qrCont.innerHTML = `<p style="font-size:0.8rem; margin-bottom:10px; color:#4a5568;">Scan to pay ${receiver.name} ₹${amt}</p><img src="${qrUrl}" style="max-width:180px; border-radius:8px;">`;
        if (qrCont.style.display === 'block') qrCont.style.display = 'block'; 
    } else {
        payBtn.style.display = 'none';
        qrBtn.style.display = 'none';
        qrCont.style.display = 'none';
    }
}

function toggleModalQR() {
    const el = document.getElementById('modal-qr-container');
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function confirmModalPayment() {
    const senderId = parseInt(document.getElementById('modal-sender').value);
    const receiverId = parseInt(document.getElementById('modal-receiver').value);
    const amount = parseFloat(document.getElementById('modal-amount').value);

    if (isNaN(senderId) || isNaN(receiverId) || isNaN(amount) || amount <= 0) return alert("Select sender, receiver, and enter a valid amount.");
    if (senderId === receiverId) return alert("You cannot pay yourself.");

    const splits = [{ member_id: receiverId, amount: amount }];
    saveTransaction(senderId, amount, "Settled Debt", splits, 'payment');

    closeModal();
}