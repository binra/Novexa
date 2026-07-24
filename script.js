// ======================
// Imports
// ======================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    increment,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// ======================
// DOM Elements
// ======================

const productsContainer = document.getElementById("products");
const featuredContainer = document.getElementById("featuredProducts");
const bestDealsContainer = document.getElementById("bestDeals");
const newArrivalsContainer = document.getElementById("newArrivals");
const trendingContainer = document.getElementById("trendingProducts");
const popularContainer = document.getElementById("popularProducts");
const recentlyViewedContainer = document.getElementById("recentlyViewedProducts");

const dynamicCategories = document.getElementById("dynamicCategories");
const dynamicMoreCategories = document.getElementById("dynamicMoreCategories");
const dynamicBanners = document.getElementById("dynamicBanners");

const searchInput = document.getElementById("searchInput");

const sortProducts = document.getElementById("sortProducts");

const pageNumber = document.getElementById("pageNumber");
const nextPageBtn = document.getElementById("nextPage");
const prevPageBtn = document.getElementById("prevPage");

const wishlistCount = document.getElementById("wishlistCount");

// ======================
// Global Variables
// ======================

let currentPage = 1;
const productsPerPage = 20;

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

let recentlyViewed =
    JSON.parse(localStorage.getItem("recentlyViewed")) || [];

let banners = [];

let categories = [];

let allProducts = [];

// ======================
// AliExpress Worker URL
// ======================

const API_URL =
    "https://quiet-haze-9edd.benarkalarey.workers.dev/";

// ======================
// API Helper
// ======================

async function fetchAliExpressProducts(keyword = "phone") {

    const response = await fetch(
        `${API_URL}?keywords=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {

        const errorText = await response.text();
        throw new Error(errorText);

    }

    return await response.json();

}

// ======================
// Helpers
// ======================

function clearSections() {

    if (productsContainer) productsContainer.innerHTML = "";

    if (featuredContainer) featuredContainer.innerHTML = "";

    if (bestDealsContainer) bestDealsContainer.innerHTML = "";

    if (newArrivalsContainer) newArrivalsContainer.innerHTML = "";

    if (trendingContainer) trendingContainer.innerHTML = "";

    if (popularContainer) popularContainer.innerHTML = "";

}

function updateWishlistCount() {

    if (wishlistCount) {

        wishlistCount.textContent = wishlist.length;

    }

}

function saveWishlist() {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

}

function initWishlist() {

    document.querySelectorAll(".favorite").forEach(btn => {

        const id = btn.dataset.id;

        if (wishlist.includes(id)) {

            btn.textContent = "♥";

        } else {

            btn.textContent = "♡";

        }

        btn.onclick = () => {

            if (wishlist.includes(id)) {

                wishlist = wishlist.filter(x => x !== id);

                btn.textContent = "♡";

            } else {

                wishlist.push(id);

                btn.textContent = "♥";

            }

            saveWishlist();

        };

    });

}

// ======================
// Recently Viewed
// ======================

function saveRecentlyViewed(product) {

    recentlyViewed = recentlyViewed.filter(

        item => item.id !== product.id

    );

    recentlyViewed.unshift(product);

    recentlyViewed = recentlyViewed.slice(0, 10);

    localStorage.setItem(

        "recentlyViewed",

        JSON.stringify(recentlyViewed)

    );

}

function loadRecentlyViewed() {

    if (!recentlyViewedContainer) return;

    recentlyViewedContainer.innerHTML = "";

    recentlyViewed.forEach(product => {

        recentlyViewedContainer.innerHTML += productCard(

            product.id,

            product

        );

    });

}
// ======================
// Categories
// ======================

async function loadCategoriesMenu() {

    if (!dynamicCategories) return;

    dynamicCategories.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "categories"));

        categories = [];

        snapshot.forEach(doc => {

            categories.push(doc.data());

        });

        categories.slice(0, 6).forEach(category => {

            dynamicCategories.innerHTML += `
                <a href="#"
                   data-filter="${category.name}">
                   ${category.icon || "📦"} ${category.name}
                </a>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

// ======================
// More Categories
// ======================

async function loadMoreCategoriesMenu() {

    if (!dynamicMoreCategories) return;

    dynamicMoreCategories.innerHTML = "";

    try {

        if (categories.length === 0) {

            const snapshot = await getDocs(
                collection(db, "categories")
            );

            categories = [];

            snapshot.forEach(doc => {

                categories.push(doc.data());

            });

        }

        categories.slice(6).forEach(category => {

            dynamicMoreCategories.innerHTML += `
                <a href="#"
                   data-filter="${category.name}">
                   ${category.icon || "📦"} ${category.name}
                </a>
            `;

        });

    } catch (err) {

        console.error(err);

    }

}

// ======================
// Category Filter
// ======================

function activateCategoryFilter() {

    document.querySelectorAll("[data-filter]")

    .forEach(btn => {

        btn.onclick = e => {

            e.preventDefault();

            const filter = btn.dataset.filter;

            filterProducts(filter);

        };

    });

}

function filterProducts(category) {

    if (!productsContainer) return;

    const cards = productsContainer.querySelectorAll(".product");

    cards.forEach(card => {

        if (

            category === "all" ||

            card.dataset.category === category

        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

// ======================
// Banners
// ======================

async function loadBanners() {

    if (!dynamicBanners) return;

    dynamicBanners.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "banners"));

        banners = [];

        snapshot.forEach(doc => {

            banners.push(doc.data());

        });

        banners.forEach((banner, index) => {

            dynamicBanners.innerHTML += `

            <div class="slide ${index === 0 ? "active" : ""}">

                <img src="${banner.image}" alt="${banner.title}">

                <div class="hero-content">

                    <h1>${banner.title}</h1>

                    <p>${banner.subtitle || ""}</p>

                    <a href="#products" class="hero-btn">

                        ${banner.button || "Shop Now"}

                    </a>

                </div>

            </div>

            `;

        });

        initSlider();

    } catch (err) {

        console.error(err);

    }

}

// ======================
// Hero Slider
// ======================

function initSlider() {

    const slides = document.querySelectorAll(".slide");

    const next = document.querySelector(".next");

    const prev = document.querySelector(".prev");

    if (!slides.length) return;

    let current = 0;

    function showSlide(index) {

        slides.forEach(slide =>

            slide.classList.remove("active")

        );

        slides[index].classList.add("active");

    }

    next?.addEventListener("click", () => {

        current++;

        if (current >= slides.length) current = 0;

        showSlide(current);

    });

    prev?.addEventListener("click", () => {

        current--;

        if (current < 0) current = slides.length - 1;

        showSlide(current);

    });

    setInterval(() => {

        current++;

        if (current >= slides.length) current = 0;

        showSlide(current);

    }, 5000);

}

// ======================
// Product Card
// ======================

function productCard(id, data) {

    return `

    <div class="product"
         data-id="${id}"
         data-category="${data.category || "All"}">

        <div class="badge">

            🛍️ AliExpress

        </div>

        ${data.discount ? `

        <div class="discount">

            ${data.discount}

        </div>

        ` : ""}

        <div class="favorite"

             data-id="${id}">

            ♡

        </div>

        <a href="product.html?id=${id}">

            <img
                src="${data.image}"
                alt="${data.title}"
                loading="lazy"
                decoding="async">

        </a>

        <h2>

            ${data.title}

        </h2>

        <div class="rating">

            ⭐ ${data.rating || "0"}

            <span>

                (${data.reviews || 0})

            </span>

        </div>

        <p class="price">

            <span class="new-price">

                $${data.price}

            </span>

            ${data.originalPrice ? `

            <span class="old-price">

                $${data.originalPrice}

            </span>

            ` : ""}

        </p>

        <p class="shipping">

            🚚 Free Shipping

        </p>

        <a
            href="${data.link}"
            target="_blank"
            rel="noopener"
            class="buy-btn">

            🔥 Get Best Price

        </a>

    </div>

    `;

}

// ======================
// Load All Products
// ======================

async function loadAllProducts() {

    clearSections();

    const keyword = searchInput?.value?.trim() || "phone";

        try {

        const snapshot = await getDocs(collection(db, "products"));

        allProducts = [];

        snapshot.forEach(docItem => {

            const data = docItem.data();

            allProducts.push({
                id: docItem.id,
                ...data
            });

        });

        // Filter by search keyword
        if (keyword) {
            allProducts = allProducts.filter(item =>
                item.title?.toLowerCase().includes(keyword.toLowerCase())
            );
        }


        if (sortProducts) {

            switch (sortProducts.value) {

                case "price-low":
                    allProducts.sort((a, b) => a.price - b.price);
                    break;

                case "price-high":
                    allProducts.sort((a, b) => b.price - a.price);
                    break;

                case "name-asc":
                    allProducts.sort((a, b) =>
                        a.title.localeCompare(b.title)
                    );
                    break;

                case "name-desc":
                    allProducts.sort((a, b) =>
                        b.title.localeCompare(a.title)
                    );
                    break;

            }

        }

        const start = (currentPage - 1) * productsPerPage;

        const end = start + productsPerPage;

        const pageProducts = allProducts.slice(start, end);

               const popularProducts = allProducts.slice(0, 8);

        popularProducts.forEach(item => {

            if (popularContainer) {

                popularContainer.innerHTML += productCard(item.id, item);

            }

        });

        pageProducts.forEach(item => {

            const card = productCard(item.id, item);

            if (productsContainer) {

                productsContainer.innerHTML += card;

            }

            if (featuredContainer) {

                featuredContainer.innerHTML += card;

            }

            if (bestDealsContainer) {

                bestDealsContainer.innerHTML += card;

            }

            if (newArrivalsContainer) {

                newArrivalsContainer.innerHTML += card;

            }

        });

        activateCategoryFilter();

        loadRecentlyViewed();

        initWishlist();

        updateWishlistCount();

    } catch (error) {

        console.error("AliExpress Error:", error);

        if (productsContainer) {

            productsContainer.innerHTML = `

                <div style="padding:40px;text-align:center">

                    <h2>❌ Failed to load products</h2>

                    <p>${error.message}</p>

                </div>

            `;

        }

    }

}

// ======================
// Search
// ======================

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        currentPage = 1;

        loadAllProducts();

    });

}

// ======================
// Sort
// ======================

if (sortProducts) {

    sortProducts.addEventListener("change", () => {

        currentPage = 1;

        loadAllProducts();

    });

}





// ======================
// Pagination
// ======================

if (nextPageBtn) {

    nextPageBtn.addEventListener("click", () => {

        currentPage++;

        if (pageNumber) {

            pageNumber.textContent = currentPage;



        }

        loadAllProducts();

    });

}

if (prevPageBtn) {

    prevPageBtn.addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            if (pageNumber) {

                pageNumber.textContent = currentPage;

            }

            loadAllProducts();

        }

    });

}

// ======================
// More Menu
// ======================

const moreBtn = document.getElementById("moreBtn");

const dropdown = document.querySelector(".dropdown-content");

if (moreBtn && dropdown) {

    moreBtn.addEventListener("click", e => {

        e.stopPropagation();

        dropdown.classList.toggle("show");

    });

    document.addEventListener("click", e => {

        if (

            !dropdown.contains(e.target) &&

            e.target !== moreBtn

        ) {

            dropdown.classList.remove("show");

        }

    });

}

// ======================
// Init
// ======================

loadCategoriesMenu();

loadMoreCategoriesMenu();

loadBanners();

loadAllProducts();