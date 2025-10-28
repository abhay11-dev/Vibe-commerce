# 🛍️ Vibe Commerce — Modern Shopping Experience

A minimal **full-stack e-commerce application** built using **React, Node.js, Express, and MongoDB**, designed for product exploration, cart management, and checkout flow simulation.

---

## 🚀 Features

- 🧠 Dynamic Product Management (seeded into MongoDB)
- 🛒 Persistent Cart (session-based)
- 💳 Mock Checkout Workflow
- 🎨 Responsive UI (React + Tailwind CSS)
- 🔗 RESTful API with Express.js
- 🧾 MongoDB + Mongoose Schema Integration

---

## 🏗️ Project Structure

vibe-commerce/
│
├── backend/                  # Express.js + MongoDB server
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route controllers
│   ├── middleware/           # Error handling, logging
│   ├── config/               # MongoDB connection
│   ├── seedData.js           # Seed script for product data
│   ├── server.js             # Main server entry
│   └── .env.example          # Sample environment variables
│
├── frontend/                 # React + Tailwind client
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page-level layouts
│   │   ├── services/         # API calls (Axios)
│   │   ├── index.css         # Tailwind styles
│   │   └── App.jsx           # Root application
│   └── package.json
│
└── README.md

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/vibe-commerce.git
cd vibe-commerce


2️⃣ Backend Setup
cd backend
npm install

Create a .env file in the backend root:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vibeCommerce
CORS_ORIGIN=http://localhost:3001

Seed your MongoDB with sample data:
node seedData.js

Then start your server:
npm start


3️⃣ Frontend Setup
cd ../frontend
npm install

If Tailwind CSS isn’t initialized, re-run:
npx tailwindcss init -p

Then ensure your postcss.config.js looks like:
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

Finally, run the app:
npm start

Open 👉 http://localhost:3001

🧠 API Endpoints
EndpointMethodDescription/api/productsGETGet all products/api/products/:idGETGet product by ID/api/cartGET/POST/PUT/DELETEManage cart/api/checkoutPOSTProcess checkout/healthGETAPI health status

🧩 Tech Stack


Frontend: React + Axios + TailwindCSS


Backend: Node.js + Express.js


Database: MongoDB (via Mongoose)


Tools: dotenv, CORS, Nodemon, ESLint



🧾 Example Output
Products API Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "name": "Wireless Headphones",
      "price": 79.99,
      "category": "Electronics",
      "image": "🎧"
    }
  ]
}


💡 Deployment (Optional)


Host backend on Render / Vercel / Railway


Deploy frontend on Vercel / Netlify


Set your live API URL in frontend .env as:
REACT_APP_API_URL=https://your-backend-url.com




🧰 Developer Notes


Each frontend session is assigned a unique X-Session-ID.


Cart is stored per session, ensuring isolated user experiences.


Backend includes graceful error handling and CORS middleware.



👨‍💻 Author
Abhayraj Singh Mandloi
📧 abhayrajsinghmandloi@gmail.com


🏁 License
This project is part of a Screening Assignment.
Feel free to use or extend with credit.


---

## 🧭 GitHub Setup Steps

1. Initialize Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vibe Commerce full-stack"



Create a new repo on GitHub named vibe-commerce.


Link it:
git remote add origin https://github.com/<your-username>/vibe-commerce.git
git branch -M main
git push -u origin main

