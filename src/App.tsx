import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { RequireAdmin } from "@/components/RequireAdmin";
import { FloatingContact } from "@/components/FloatingContact";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProductsPage from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import CategoriesPage from "./pages/CategoriesPage.tsx";
import Workflow from "./pages/Workflow.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Admin from "./pages/Admin.tsx";
import TermsAndConditions from "./pages/TermsAndConditions.tsx";
import BangaloreStoneServices from "./pages/BangaloreStoneServices.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/granite-paving-stone-bangalore" element={<BangaloreStoneServices />} />
            <Route path="/paving-stone-bangalore" element={<BangaloreStoneServices />} />
            <Route path="/cobblestone-bangalore" element={<BangaloreStoneServices />} />
            <Route path="/floor-stone-bangalore" element={<BangaloreStoneServices />} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingContact />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
