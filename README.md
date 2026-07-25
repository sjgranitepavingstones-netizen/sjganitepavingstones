# Granite Paving Stone

Ei project ta ekhon React.js frontend, Node.js + Express.js backend, aar MongoDB database diye cholbe. Design style, layout, color, image, admin panel-er look same rakha hoyeche; sudhu data source Supabase theke MongoDB API-te niye jawa hoyeche.

## Ki Ki Change Kora Hoyechhe

- React frontend ager moto Vite + Tailwind + shadcn UI style-e ache.
- Notun Express.js server add kora hoyeche: `server/index.js`.
- MongoDB connection add kora hoyeche.
- Product, category, variant, hero image, workflow, reviews, inquiries, settings shob MongoDB collection-e save hobe.
- Admin panel theke create, edit, delete, image upload kora jabe.
- Login/signup ekhon backend JWT auth diye kaj kore.
- Prothom signup kora user automatic admin hobe
- README ta easy Bangla style-e sajano hoyeche.

## Folder Structure

```text
src/                 React frontend
src/lib/api.ts       Frontend theke backend API call korar helper
server/index.js      Express + MongoDB backend
server/db.js         Single cached MongoDB/Mongoose connection
uploads/             Admin panel theke upload kora image ekhane save hobe
.env                 Local environment settings
```

## Proyojoniyo Software

- Node.js
- npm
- MongoDB local machine-e, ba MongoDB Atlas connection string

## Setup

1. Dependencies install:

```bash
npm install
```

2. `.env` file check korun:

```env
VITE_API_URL="/api"
MONGODB_URI="mongodb://127.0.0.1:27017/granite-paving-stone"
MONGODB_MAX_POOL_SIZE="5"
MONGODB_MIN_POOL_SIZE="0"
PORT="5000"
CLIENT_URL="http://localhost:8080"
JWT_SECRET="replace-this-with-a-long-random-secret"
ADMIN_EMAILS=""
```

MongoDB Atlas use korle `MONGODB_URI` value ta Atlas connection string diye replace korben.

`JWT_SECRET` live korar age lomba random secret kore deben.

## Run Korar Niyom

Frontend aar backend ek shathe run:

```bash
npm run dev
```

Alada kore run korte chaile:

```bash
npm run server
npm run dev:client
```

Frontend usually ekhane open hobe:

```text
http://localhost:8080
```

Backend API:

```text
http://localhost:5000/api
```

## Admin Panel

Admin panel:

```text
/admin
```

Admin access `.env` file-er `ADMIN_EMAILS` e email diye set korte paren:

```env
ADMIN_EMAILS="your@email.com,another@email.com"
```

Admin panel theke manage kora jabe:

- Products
- Product variants
- Categories
- Hero images
- Workflow steps
- Reviews
- Inquiries
- Google Maps location settings

## Indian Currency

Project-er pricing Indian currency-er jonno ready:

- Base Price field: number value
- Price Label field: readable text, example `₹2,500 / sq ft`
- Variant price show hobe `₹` sign diye

Admin panel-e product ba variant edit korar somoy rupee value/label update korlei site-e same show hobe.

## Image Upload

Admin panel theke image upload korle file local `uploads/` folder-e save hoy. Browser-e image serve hoy `/uploads/file-name` path diye.

Image upload limit ekhon 25MB. JPG, PNG, WebP moto normal image file upload korben.

Production-e deploy korle uploads folder persistent rakhar jonno server storage ba cloud storage setup kora bhalo.

## Build

Build check:

```bash
npm run build
```

## Note

Project ekhon MongoDB backend-er shathe `src/lib/api.ts` diye kaj kore. Old Supabase leftover remove kora hoyeche.
MongoDB connection `server/db.js` theke single cached Mongoose connection hisebe manage hoy, Atlas M0 free tier-er jonno small connection pool use kore.
