import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./shared/components/Layout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { ExplorePage } from "./features/explore/ExplorePage";
import { ListingPage } from "./features/listing/ListingPage";
import { LoginPage, RegisterPage } from "./features/auth/AuthPages";
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from "./features/auth/AccountLinkPages";
import { MyBookingsPage } from "./features/bookings/MyBookingsPage";
import { BookingPage } from "./features/bookings/BookingPage";
import { FavoritesPage } from "./features/favorites/FavoritesPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { ProHomePage } from "./features/pro/ProHomePage";
import { ProviderPage } from "./features/pro/ProviderPage";
import { ManageListingPage } from "./features/pro/ManageListingPage";
import { AdminPage } from "./features/admin/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/listings/:id" element={<ListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/pro" element={<ProtectedRoute><ProHomePage /></ProtectedRoute>} />
            <Route path="/pro/:providerId" element={<ProtectedRoute><ProviderPage /></ProtectedRoute>} />
            <Route path="/pro/listings/:listingId" element={<ProtectedRoute><ManageListingPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
