# 🛒 E-Commerce Product Dashboard

A full-featured **E-Commerce Product Dashboard** built with **React 18**, **TailwindCSS**, and **Lucide Icons**.  
It comes with analytics cards, virtualized product lists for 1000+ products, search and filter, edit/delete, notifications, and context-based state management.

## ✨ Features
- **Error Boundary**: Handles runtime errors gracefully
- **Authentication Context**: Manages user info and login/logout
- **Product Management**:
  - Add, edit, delete products
  - 1000+ mock products generated automatically
  - Search and category filter
- **Analytics Dashboard**: Shows total products, total sales, average rating, and out-of-stock count
- **Virtualized List**: Fast rendering of large product datasets
- **Notifications**: Success and error alerts with auto-dismiss
- **Responsive UI**: TailwindCSS styling and Lucide icons

## 📂 Project Structure
my-ecommerce-dashboard/
├─ public/
│ └─ index.html
├─ src/
│ ├─ App.jsx // Main app entry
│ ├─ components/ // Add your components here
│ ├─ contexts/ // Auth, Product, Notification contexts
│ └─ ...
├─ package.json
└─ README.md


## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

npm install
# or
yarn install

npm start
# or
yarn start
