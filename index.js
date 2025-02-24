import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjZmvq16kBPs_xhlJp5FkiCzw42WhX5fM",
    authDomain: "kkgs-32.firebaseapp.com",
    databaseURL: "https://kkgs-32-default-rtdb.firebaseio.com",
    projectId: "kkgs-32",
    storageBucket: "kkgs-32.firebasestorage.app",
    messagingSenderId: "76744845820",
    appId: "1:76744845820:web:0c566764c5c1ae1bc4ea79",
    measurementId: "G-H3Q5DXL6SV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            console.error("ログインエラー:", error.message);
            alert("ログインエラー");
        });
});

document.getElementById("logoutButton").addEventListener("click", () => {
    signOut(auth).then(() => {
        localStorage.removeItem("lastLoginDate");
        location.reload();
    }).catch((error) => {
        console.error("ログアウトエラー:", error.message);
        alert("ログアウトエラー");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const postList = document.getElementById("postList");
    const loginFormContainer = document.getElementById("loginFormContainer");
    const blogManagementContainer = document.getElementById("blogManagementContainer");
    const searchInput = document.getElementById("searchInput");
    const userEmailElement = document.getElementById("userEmail");
    const today = new Date().toISOString().split('T')[0];
    const lastLoginDate = localStorage.getItem("lastLoginDate");

    if (lastLoginDate && lastLoginDate !== today) {
        signOut(auth).then(() => {
            localStorage.removeItem("lastLoginDate");
            location.reload();
        }).catch((error) => {
            console.error("自動ログアウトエラー: ", error);
            alert("自動ログアウトエラー");
        });
    }

    onAuthStateChanged(auth, user => {
        if (user) {
            userEmailElement.textContent = `${user.email}`;
            showBlogManagement();
            loadPosts();

            localStorage.setItem("lastLoginDate", today);
        } else {
            showLoginForm();
        }
    });

    setInterval(() => {
        const savedDate = localStorage.getItem("lastLoginDate");
        const currentDate = new Date().toISOString().split('T')[0];

        if (savedDate && savedDate !== currentDate) {
            signOut(auth).then(() => {
                localStorage.removeItem("lastLoginDate");
                location.reload();
            }).catch((error) => {
                console.error("自動ログアウトエラー:", error);
                alert("自動ログアウトエラー");
            });
        }
    }, 60000);

    function loadPosts() {
        postList.innerHTML = "読み込み中…";

        const q = query(collection(db, "posts"), orderBy("date", "desc"));

        onSnapshot(q, (querySnapshot) => {
            postList.innerHTML = "";

            let posts = [];

            querySnapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                if (post.date > today) return;
                posts.push(post);
            });

            function displayPosts(postsToShow) {
                postList.innerHTML = "";
                postsToShow.forEach(post => {
                    const postItem = document.createElement("div");
                    postItem.classList.add("box");
                    postItem.style.cursor = "pointer";
                    postItem.innerHTML = `
            <p class="subtitle is-6 is-spaced">${post.date}</p>
            <p class="title is-4 is-spaced">${post.title}</p>
            <p class="subtitle is-5">${post.subtitle}</p>
            `;
                    postItem.addEventListener("click", () => showPostDetail(post));
                    postList.appendChild(postItem);
                });
            }

            displayPosts(posts);

            searchInput.addEventListener("input", () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredPosts = posts.filter(post =>
                    post.title.toLowerCase().includes(searchTerm) ||
                    post.subtitle.toLowerCase().includes(searchTerm) ||
                    post.content.toLowerCase().includes(searchTerm) ||
                    post.date.includes(searchTerm) ||
                    (post.attachment && post.attachment.toLowerCase().includes(searchTerm))
                );
                displayPosts(filteredPosts);
            });
        }, (error) => {
            postList.innerHTML = "<p>投稿を取得できませんでした。</p>";
        });
    }

    function showPostDetail(post) {
        const modal = document.getElementById("postModal");
        const modalContent = document.getElementById("modalContent");
        let urlButton = "";
        if (post.attachment && post.attachment.trim() !== "") {
            urlButton = `<a class="button is-info is-outlined" href="${post.attachment}" target="_blank">移動する</a>`;
        }
        modalContent.innerHTML = `
    <header class="modal-card-head">
        <p class="title is-4">${post.title}</p>
    </header>
    <section class="modal-card-body">
        <p class="subtitle is-6 is-spaced">${post.date}</p>
        <p class="title is-5">${post.subtitle}</p>
        <hr>
        <p class="subtitle is-6">${post.content}</p>
        ${urlButton}
    </section>
    `;
        modal.classList.add("is-active");
    }

    document.querySelector(".Modal-close").addEventListener("click", () => {
        document.getElementById("postModal").classList.remove("is-active");
    });

    function showBlogManagement() {
        loginFormContainer.style.display = "none";
        blogManagementContainer.style.display = "block";
    }

    function showLoginForm() {
        loginFormContainer.style.display = "block";
        blogManagementContainer.style.display = "none";
    }
});

const modal = document.getElementById('myModal');
const openModalButton = document.getElementById('openModal');
const closeModalButtons = document.querySelectorAll('#closeModal');

openModalButton.addEventListener('click', () => {
    modal.classList.add('is-active');
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        modal.classList.remove('is-active');
    });
});