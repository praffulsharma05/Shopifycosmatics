# ⭐️ Simple Guide: Customer Reviews & Moderation

This is a simple guide to explain how your **Customer Review & Rating System** works and how to approve or reject reviews easily.

---

## 🎯 1. What does this system do?

- Allows customers to write reviews & upload photos on your product pages.
- Keeps new reviews **Pending** until you approve them.
- Allows you to **Approve** or **Reject** reviews so only good, real reviews show on your website.
- **100% Free** (No monthly app subscriptions needed).

---

## ✍️ 2. How Customers Submit a Review

1. Customer clicks **"Write a review"** on any product page.
2. They select stars (1 to 5), type their name, email, title, review, and optionally attach photos.
3. They click **"Submit Review"**.
4. A message shows: *"Thank you! Your review has been submitted for admin approval."*

---

## 🛡️ 3. How to Approve or Reject Reviews (2 Easy Ways)

### 🔹 Way 1: On Your Website (Fastest Way)

1. Open your product link and add `?admin=true` at the end.
   - **Example**: `https://5akrh7-xh.myshopify.com/products/shaving-cream?admin=true`
2. You will now see the black **🛡️ Admin Moderation** button next to *Write a review*.
3. Click **🛡️ Admin Moderation**.
4. A popup window opens showing:
   - ⏳ **Pending Approval**: Click **✅ Approve** to show the review live, or **❌ Reject** to hide it.
   - ✅ **Approved**: Shows all reviews currently live on your website.
   - ❌ **Rejected**: Shows all hidden reviews.

---

### 🔹 Way 2: From Shopify Admin Dashboard

1. Log into **Shopify Admin** (`admin.shopify.com`).
2. Click **Products** in the left menu.
3. Click on the product you want (e.g., *Shaving Cream*).
4. Scroll to the very bottom of the page to **Metafields**.
5. Click **Reviews List** (`custom.reviews_list`).
6. Add/edit the review details and click **Save**.

---

## 📂 4. Important Files in Codebase

- 📄 **Review Section Code**: `sections/custom-review-form.liquid`
- 🎨 **CSS & Scrollbar Cleanup**: `assets/base.css`
- 🌐 **GitHub Link**: [https://github.com/praffulsharma05/Shopifycosmatics.git](https://github.com/praffulsharma05/Shopifycosmatics.git)
