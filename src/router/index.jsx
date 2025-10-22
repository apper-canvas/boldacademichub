import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"
import Layout from "@/components/organisms/Layout"

const Dashboard = lazy(() => import("@/components/pages/Dashboard"))
const Courses = lazy(() => import("@/components/pages/Courses"))
const Assignments = lazy(() => import("@/components/pages/Assignments"))
const Grades = lazy(() => import("@/components/pages/Grades"))
const Schedule = lazy(() => import("@/components/pages/Schedule"))
const NotFound = lazy(() => import("@/components/pages/NotFound"))

const mainRoutes = [
  {
    path: "",
    index: true,
    element: <Suspense fallback={<div>Loading.....</div>}><Dashboard /></Suspense>
  },
  {
    path: "courses",
    element: <Suspense fallback={<div>Loading.....</div>}><Courses /></Suspense>
  },
  {
    path: "assignments",
    element: <Suspense fallback={<div>Loading.....</div>}><Assignments /></Suspense>
  },
  {
    path: "grades",
    element: <Suspense fallback={<div>Loading.....</div>}><Grades /></Suspense>
  },
  {
    path: "schedule",
    element: <Suspense fallback={<div>Loading.....</div>}><Schedule /></Suspense>
  },
  {
    path: "*",
    element: <Suspense fallback={<div>Loading.....</div>}><NotFound /></Suspense>
  }
]

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
]

export const router = createBrowserRouter(routes)