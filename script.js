import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featuredProducts");
const bestDealsContainer = document.getElementById("bestDeals");
const newArrivalsContainer = document.getElementById("newArrivals");
const searchInput = document.getElementById("searchInput");

// ======================
// Card template (used everywhere so every section looks the same)
// ======================

function productCard(id, data) {

    return `
        <div class="product" data-category="${data.category}" data-id="${id}">

            <div class="badge">
                🔥 HOT DEAL
            </div>

            <div class="discount">
                -30%
            </div>

            <div class="wishlist">
                ❤️
            </div>
            <div class="favorite">♡</div>

            <a href="product.html?id=${id}">
                <img src="${data.image}" alt="${data.title}">
            </a>

            <h2>${data.title}</h2>

            <div class="rating">
                ⭐ ${data.rating || 0}
                <span>(${data.reviews || 0} Reviews)</span>
            </div>

            ${data.description ? `<p class="product-desc">${data.description}</p>` : ""}

            <p class="price">$${data.price}</p>

            <p class="shipping">🚚 Free Shipping</p>

            <a href="${data.link}" target="_blank" rel="noopener noreferrer" class="buy-btn">
                🔥 Get Best Price
            </a>

        </div>
    `;

}

// ======================
// Load + sort every product into exactly ONE section
// Priority: Featured > Best Deal > New Arrival > main list
// ======================

async function loadAllProducts() {

    productsContainer.innerHTML = "";
    if (featuredContainer) featuredContainer.innerHTML = "";
    if (bestDealsContainer) bestDealsContainer.innerHTML = "";
    if (newArrivalsContainer) newArrivalsContainer.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((product) => {

        const data = product.data();
        const card = productCard(product.id, data);

        // Every product always shows in the main list
        productsContainer.innerHTML += card;

        // Independently, it can also show in any of the special sections
        if (data.featured && featuredContainer) {
            featuredContainer.innerHTML += card;
        }

        if (data.bestDeal && bestDealsContainer) {
            bestDealsContainer.innerHTML += card;
        }

        if (data.newArrival && newArrivalsContainer) {
            newArrivalsContainer.innerHTML += card;
        }

    });

    activateCategoryFilter();

}

// ======================
// Search
// ======================

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase();

        document.querySelectorAll(".product").forEach(product => {

            const title = product.querySelector("h2").textContent.toLowerCase();

            product.style.display = title.includes(value) ? "block" : "none";

        });

    });

}

// ======================
// Category Filter (only applies to the main product grid)
// ======================



function activateCategoryFilter() {

    const filters = document.querySelectorAll(".menu a");

    filters.forEach(filter => {

        filter.onclick = (e) => {

            e.preventDefault();

            const category = filter.dataset.filter;

            document.querySelectorAll("#products .product").forEach(product => {

                if (category === "all" || product.dataset.category === category) {
                    product.style.display = "block";

                } else {

                    product.style.display = "none";

                }

            });

        };

    });

}

// ======================
// Hero Slider
// ======================

const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentSlide = 0;

function showSlide(index) {

    slides.forEach(slide => slide.classList.remove("active"));

    slides[index].classList.add("active");

}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);

}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);

}

if (nextBtn && prevBtn && slides.length > 0) {

    nextBtn.onclick = nextSlide;

    prevBtn.onclick = prevSlide;

    setInterval(nextSlide, 4000);

}

// ======================
// Init
// ======================

loadAllProducts();