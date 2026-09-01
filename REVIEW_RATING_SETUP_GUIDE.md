# ⭐️ Simple Guide: Customer Reviews & Admin Moderation

This guide explains how customer reviews work on your store (**Shopifycosmatics**) and how the admin approves or rejects them before they show on product pages.

---

## 🎯 How Review Moderation Works (Example: Face Wash)

### 1️⃣ Customer Submits a Review
- A customer opens a product page (e.g. **Face Wash**).
- They click **Write a review**, select **5 Stars**, write *"Good product"*, and submit.
- 🔒 **Important**: The review does **NOT** show on the website right away. It is saved as **PENDING** so regular visitors cannot see it.

---

### 2️⃣ Admin Inspects the Review
- You (the store admin) open the product link with `?admin=true` added to the URL:
  ```text
  https://5akrh7-xh.myshopify.com/products/face-wash?admin=true
  ```
- Click the black **🛡️ Admin Moderation** button.
- Click the **⏳ Pending Approval** tab.
- You will see the new review:
  - **Product**: Face Wash
  - **Rating**: ★★★★★ (5 Stars)
  - **Comment**: *"Good product"*

---

### 3️⃣ Admin Approves or Rejects
- **If Approved (Click ✅ Approve)**:
  - The 5-star rating and *"Good product"* review immediately show live on the Face Wash product page for all customers!
- **If Rejected (Click ❌ Reject)**:
  - The review is blocked and will **never** be shown to public visitors.

---

## 🏬 Alternative: Manage from Shopify Admin Dashboard

You can also manage reviews natively inside your Shopify Admin panel:

1. Log into **Shopify Admin** (`admin.shopify.com`).
2. Go to **Products** → Select **Face Wash**.
3. Scroll down to **Metafields** at the bottom.
4. Click **Reviews List** (`custom.reviews_list`).
5. Add/edit approved entries and click **Save**.

---

## 📂 Key Files & Repository

- 📄 **Review Logic & Moderation Code**: `sections/custom-review-form.liquid`
- 🎨 **Styling & Scrollbar Fix**: `assets/base.css`
- 🌐 **GitHub Link**: [https://github.com/praffulsharma05/Shopifycosmatics.git](https://github.com/praffulsharma05/Shopifycosmatics.git)
