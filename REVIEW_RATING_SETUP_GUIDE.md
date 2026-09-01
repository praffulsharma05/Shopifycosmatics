# ⭐️ Step-by-Step Testing & Setup Guide: Customer Reviews & Admin Moderation

Follow this simple 4-step walkthrough to test and use your custom Review & Moderation system.

---

## 🧪 Step 1: Submit a Test Review (As a Customer)

1. Open any product link on your store (e.g. Shaving Cream or Face Wash):
   ```text
   http://127.0.0.1:9292/products/shaving-cream
   ```
2. Scroll down to the **Customer Reviews** section.
3. Click the **Write a review** button.
4. Fill in the popup form:
   - **Rating**: Click 5 Stars (★★★★★)
   - **Your Name**: `Prafful Sharma`
   - **Email**: `prafful@example.com`
   - **Review Title**: `Great product!`
   - **Your Review**: `Best product ever I see.`
5. Click **Submit Review**.
6. You will see: *"✨ Thank you! Your review has been submitted for admin approval."*
7. 🔒 **Notice**: Look at the reviews list on the page — your review is **NOT** visible yet to regular store visitors!

---

## 🛡️ Step 2: Open Admin Moderation Mode (As Store Owner)

1. In your browser address bar, add `?admin=true` to the end of the URL:
   ```text
   http://127.0.0.1:9292/products/shaving-cream?admin=true
   ```
2. Press **Enter**.
3. Look next to *Write a review* — the black **🛡️ Admin Moderation** button appears!
4. Click **🛡️ Admin Moderation**.

---

## ✅ Step 3: Approve the Review

1. In the popup window, click the **⏳ Pending Approval** tab.
2. You will see your submitted test review listed with a yellow status tag:
   - **Name**: Prafful Sharma
   - **Rating**: ★★★★★
   - **Review**: *Best product ever I see.*
3. Click the green **✅ Approve** button next to the review.
4. Close the moderation popup.

---

## 🌟 Step 4: Verify It Is Live!

1. Refresh the normal product URL (without `?admin=true`):
   ```text
   http://127.0.0.1:9292/products/shaving-cream
   ```
2. Look at the **Customer Reviews** section.
3. **Result**: Your 5-star review and rating score are now published live for all store visitors!

---

## 🏬 Alternative: Manage from Shopify Admin Dashboard

You can also manage reviews natively inside your Shopify Admin panel:

1. Log into **Shopify Admin** (`admin.shopify.com`).
2. Go to **Products** → Select **Shaving Cream**.
3. Scroll down to **Metafields** at the bottom.
4. Click **Reviews List** (`custom.reviews_list`).
5. Click **Add new entry**, fill in the details, and click **Save**.

---

## 📂 Key Files & Repository

- 📄 **Review Logic & Moderation Code**: [sections/custom-review-form.liquid](file:///d:/theme_export__5akrh7-xh-myshopify-com-ecommerce-9__21AUG2026-0221pm/sections/custom-review-form.liquid)
- 🎨 **Styling & Scrollbar Fix**: [assets/base.css](file:///d:/theme_export__5akrh7-xh-myshopify-com-ecommerce-9__21AUG2026-0221pm/assets/base.css)
- 🌐 **GitHub Link**: [https://github.com/praffulsharma05/Shopifycosmatics.git](https://github.com/praffulsharma05/Shopifycosmatics.git)
