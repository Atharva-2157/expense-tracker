# Expense Tracker Application

The Expense Tracker is a secure, full-stack application designed to help users manage their personal finances by tracking and visualizing their expenses. It offers robust CRUD functionality, advanced data filtering, and insightful visual summaries of spending habits.

---

## Key Features

### User Management & Security
* **Secure Authentication:** Users can **create an account** (registration) and **log in** to manage their personal expenses.
* **Security:** Implements **JWT (JSON Web Token) authentication** using **Spring Security** for secure, stateless session management.
* **Safe JWT Handling:** The JWT is securely transmitted and stored using an **HttpOnly cookie** to mitigate common cross-site scripting (XSS) attacks.

### Expense Management
* **Full CRUD Operations:** Users can **Add, Update, and Delete** their expense records.
* **Advanced Data Filtering & Sorting:** Expenses can be efficiently filtered based on criteria like **title, category, and amount** using the **RSQL** (Resource Query Language) library.
* **Pagination Support:** The expense list is displayed in a paginated table for easy navigation and performance with large datasets.

### Financial Visualization (Dashboard)
The dashboard provides a visual summary of expenses over the **last 30 days** using professional charts:
* **Line Graph:** Displays **daily expenses** to track spending trends over time.
* **Pie Chart:** Shows the **category-wise distribution** of expenses, highlighting where money is being spent.
* **Bar Graph:** Illustrates **weekly expense totals** for a high-level view of spending cycles.

---

## Technical Stack

### 1. Backend
The robust backend is built with enterprise-grade Java technologies.

| Technology | Purpose |
| :--- | :--- |
| **Spring Boot** | Core framework for building a stand-alone, production-ready application. |
| **Spring Data JPA** | Used for efficient and simplified **CRUD** (Create, Read, Update, Delete) database operations. |
| **Spring Security** | Handles all authentication, authorization, and secure JWT management. |
| **RSQL** | Implements powerful **data filtering and sorting** capabilities in the API. |
| **Liquibase** | Manages database schema changes reliably across different environments. |

### 2. Frontend
The responsive and intuitive user interface is powered by modern JavaScript libraries.

| Technology | Purpose |
| :--- | :--- |
| **React** | Core library for building the user interface. |
| **Material UI (MUI)** | Provides a professional, responsive component library for the application's basic framework, including forms and tables. |
| **Chart.js** & **react-chartjs-2** | Used to render the interactive and informative **line, pie, and bar graphs** on the dashboard. |

---

## Application Structure

The user interface is composed of two main sections post-login:

1.  **Dashboard:** The landing page displaying the summary graphs of the last 30 days' expenses.
2.  **Expenses Tab:** The management area where users can view expenses in a table, apply filters, use pagination, and perform expense CRUD operations.