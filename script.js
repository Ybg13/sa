import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔴 KENDİ FİREBASE BİLGİLERİNİ GİR */
const firebaseConfig = {
  apiKey: "AIzaSyDVKpMX2P3bUZiNUNS7mm3zhfe6SxZNebA",
  authDomain: "gelir-gider-2cff5.firebaseapp.com",
  projectId: "gelir-gider-2cff5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authBox = document.getElementById("authBox");
const appBox = document.getElementById("app");
const list = document.getElementById("transactionList");

let chart;

document.getElementById("registerBtn").onclick = () =>
  createUserWithEmailAndPassword(auth, email.value, password.value);

document.getElementById("loginBtn").onclick = () =>
  signInWithEmailAndPassword(auth, email.value, password.value);

document.getElementById("logoutBtn").onclick = () => signOut(auth);

document.getElementById("addBtn").onclick = async () => {
  await addDoc(collection(db, "transactions"), {
    uid: auth.currentUser.uid,
    title: titleInput.value,
    amount: Number(amountInput.value),
    type: typeInput.value
  });
  loadData();
};

async function loadData() {
  list.innerHTML = "";
  let income = 0, expense = 0;

  const q = query(
    collection(db, "transactions"),
    where("uid", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(d => {
    const t = d.data();
    t.type === "income" ? income += t.amount : expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${t.title} - ${t.amount} ₺
      <button class="delete-btn">Sil</button>
    `;
    li.querySelector("button").onclick = async () => {
      await deleteDoc(doc(db, "transactions", d.id));
      loadData();
    };
    list.appendChild(li);
  });

  incomeTotal.textContent = income + " ₺";
  expenseTotal.textContent = expense + " ₺";
  drawChart(income, expense);
}

function drawChart(income, expense) {
  if (chart) chart.destroy();
  chart = new Chart(chartCtx, {
    type: "doughnut",
    data: {
      labels: ["Gelir", "Gider"],
      datasets: [{ data: [income, expense] }]
    }
  });
}

const chartCtx = document.getElementById("chart");

onAuthStateChanged(auth, user => {
  if (user) {
    authBox.style.display = "none";
    appBox.style.display = "block";
    loadData();
  } else {
    authBox.style.display = "block";
    appBox.style.display = "none";
  }
});
