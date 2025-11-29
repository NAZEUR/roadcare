# Lapor Mas!

**"Foto, Tandai, Beres!"**

**Lapor Mas!** is a comprehensive public infrastructure reporting platform designed to bridge the gap between citizens and authorities. It allows users to easily report infrastructure issues (such as damaged roads, broken buildings, or faulty streetlights) by capturing photos and pinning precise locations. Administrators can track, verify, and manage these reports with integrated routing and visualization tools.

## Features

### For Citizens (Users)
* **Easy Reporting:** Upload photos and provide descriptions of infrastructure damage.
* **Geolocation:** Automatically detect current location or manually pin the issue on a map (powered by Leaflet).
* **Report Tracking:** Monitor the status of submitted reports (New, In Process, Completed).
* **Profile History:** View a history of all personal submissions.

### For Administrators
* **Interactive Dashboard:** Visual statistics of incoming, processing, and completed reports.
* **Admin Map:** A Google Maps integration to visualize all reports in a specific area.
* **Route Optimization:** Calculate distance and estimated travel time from the Admin's location to the report site (using OpenRouteService & Google Directions).
* **Status Management:** Update report statuses (e.g., Reject, Process, Complete) to keep users informed.

## Tech Stack

* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Language:** JavaScript / React
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Framer Motion (Animations)
* **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
* **Storage:** [Cloudinary](https://cloudinary.com/) (Image hosting)
* **Maps & Routing:**
    * @react-google-maps/api (Admin Visualization)
    * React Leaflet (User Input)
    * OpenRouteService API (Distance/Duration calculation)

## Project Structure

```bash
/src
  /app          # Next.js App Router pages (Admin, Dashboard, Login, etc.)
  /components   # Reusable UI components (Navbar, MapView, Charts)
  /context      # Global state management (AuthContext)
  /lib          # Configuration files (Firebase, Firebase Admin)
```

## Getting Started

See the [Deployment Guide](https://www.google.com/search?q=%23deployment-guide) below for instructions on how to run this project locally or deploy it to the web.