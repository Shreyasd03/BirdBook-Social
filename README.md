# BirdBook

BirdBook is a lightweight social networking application inspired by platforms like Twitter/X. It implements core social features such as registration, login, posting, commenting, and dynamic user profiles, while maintaining clean authentication and session management.  

This project was built to demonstrate **full-stack development skills** using modern web technologies. It covers frontend design, backend logic, authentication, and database integration, making it a strong portfolio piece.

---

## 🚀 Tech Stack

### **Frontend**
- **Next.js (React framework)**  
  Provides file-based routing, server-side rendering (SSR), and dynamic routing. Profile pages are implemented with `[id].tsx` routes, making user profiles dynamic and scalable.
- **Tailwind CSS + DaisyUI**  
  Utility-first CSS classes with DaisyUI components for fast, consistent, and customizable UI development.
- **TypeScript**  
  Adds static typing for safer, more maintainable code and smoother developer experience.
- **Axios**  
  Handles API requests between the frontend and backend in a clean, promise-based way, simplifying data fetching and error handling.

### **Backend**
- **Next.js API Routes**  
  Handles backend logic directly within the app (`/pages/api/...`), keeping frontend and backend integrated.
- **Node.js**  
  Provides the runtime environment for executing server-side logic and handling API requests.
- **Bcrypt**  
  Ensures secure password storage with hashing.
- **JSON Web Tokens (JWTs)**  
  Used for authentication and session management. Tokens are issued upon login/registration and are validated with each protected request.

### **Database**
- **PostgreSQL**  
  Stores users, posts, comments, and profile data.  
- **Prisma ORM**  
  Simplifies database interactions with a type-safe schema and query builder.

### **Authentication**
- **JWT-based Authentication**  
  On login, the backend generates a signed JWT containing user session details.  
  - Stored securely in HTTP-only cookies (or headers, depending on config).  
  - Middleware validates JWTs for protected routes.  
- **Axios + JWTs**  
  Frontend requests include JWTs for authenticated API calls (posting, commenting, profile updates).  

---

## ✨ Features Implemented

- **User Accounts**
  - Registration and login  
  - Secure password handling  
  - JWT-based authentication  

- **Profiles**
  - Dynamic routing for profile pages (`/profile/[id]`)  
  - Editable user bio  

- **Feed**
  - Main feed displaying posts  
  - Commenting system  

- **Authentication**
  - JWT tokens for session validation  
  - Protected routes for content creation and profile editing  
  - Axios-powered API requests with authentication headers  

---

## 🖼 Screenshots / Demo

> *(Replace placeholders with actual screenshots once available)*  

- **Login Page**  
  ![Login Page](./screenshots/login.PNG)  

- **Main Feed**  
  ![Main Feed](./screenshots/feed.PNG)  

- **User Profile**  
  ![Profile Page](./screenshots/profile.PNG)  

- **Post Creation**  
  ![Post Creation](./screenshots/post_creation.PNG)  

---

## 🛣 Roadmap

Planned improvements and next steps:

- "Load More" buttons for posts and comments  
- Infinite scrolling for the feed  
- Responsive design improvements  
- Uploading custom profile pictures  
- Like/reaction system  
- Deployment on cloud platforms (Vercel, AWS, etc.)  
- Pagination and caching strategies for posts  
- Rate limiting on posts/comments  
- Better error handling and logging  

---

## ☁️ Deployment Options

### **1. AWS Deployment**
BirdBook can be deployed using **AWS managed services** for scalability and reliability:  
- **Frontend/Backend (Next.js)** → Deploy on **AWS Elastic Beanstalk** or containerize with **Amazon ECS/Fargate**.  
- **Database** → Use **Amazon RDS (PostgreSQL)** for managed database hosting.  
- **Authentication Secrets** → Store JWT secrets and database credentials in **AWS Secrets Manager** or **SSM Parameter Store**.  
- **Storage** → Use **Amazon S3** for static assets (e.g., profile pictures).  
- **Load Balancing** → **AWS Application Load Balancer (ALB)** to distribute traffic.  
- **CI/CD** → GitHub Actions → Deploy to AWS via **CodePipeline** or **Amplify**.  

---

### **2. Kubernetes Deployment**
BirdBook can also be deployed with **Kubernetes** for greater flexibility:  
- **Containerization** → Build Docker images for the Next.js app and run them as **Kubernetes Deployments**.  
- **Service Management** → Expose APIs and frontend with **Kubernetes Services** and optionally an **Ingress Controller (NGINX)**.  
- **Database** → Use a managed **PostgreSQL** (e.g., AWS RDS, Google Cloud SQL) or run PostgreSQL as a **StatefulSet** inside the cluster.  
- **Secrets** → Store JWT secrets and DB credentials as **Kubernetes Secrets**.  
- **Scaling** → Enable **Horizontal Pod Autoscaler (HPA)** to handle traffic spikes.  
- **CI/CD** → Automate deployments with **ArgoCD** or **Flux** connected to GitHub.  

---

## 📦 Getting Started

Follow these steps to run BirdBook locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/birdbook.git
cd birdbook
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory with the following variables (adjust values as needed):  
```env
DATABASE_URL=postgresql://username:password@localhost:5432/birdbook
JWT_SECRET=your_secret
```

### 4. Set Up the Database
Run Prisma migrations to create the database schema:
```bash
npx prisma migrate dev
```

*(Optional)* If you have a seed file for test data:
```bash
npx prisma db seed
```

### 5. Run the Development Server
```bash
npm run dev
```

BirdBook will be running at [http://localhost:3000](http://localhost:3000).  

---

## 📌 Portfolio Value

This project highlights:
- **Frontend expertise** with React/Next.js, Axios, and modern styling (Tailwind + DaisyUI).  
- **Backend/API development** with Node.js, API routes, JWT handling, and secure password storage.  
- **Authentication & security** using JWT tokens and middleware-protected endpoints.  
- **Database integration** using PostgreSQL + Prisma.  
- **Cloud deployment knowledge** with AWS and Kubernetes.  

It demonstrates end-to-end full-stack development of a social platform, from **UI design** to **database modeling**, **secure authentication**, and **cloud deployment strategies**.
