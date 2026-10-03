import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./shared/components/Layout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { ExplorePage } from "./features/explore/ExplorePage";
import { HotelDetailPage } from "./features/hotels/HotelDetailPage";
import { CarRentalDetailPage } from "./features/carrentals/CarRentalDetailPage";
import { AttractionDetailPage } from "./features/attractions/AttractionDetailPage";
import { NewListingChoicePage } from "./features/provider/NewListingChoicePage";
import { NewHotelListingPage } from "./features/hotels/NewHotelListingPage";
import { NewCarRentalListingPage } from "./features/carrentals/NewCarRentalListingPage";
import { NewAttractionListingPage } from "./features/attractions/NewAttractionListingPage";
import { MyListingsPage } from "./features/provider/MyListingsPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { MyBookingsPage } from "./features/bookings/MyBookingsPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { AdminUsersPage } from "./features/admin/AdminUsersPage";
import { AdminListingsPage } from "./features/admin/AdminListingsPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/car-rentals/:id" element={<CarRentalDetailPage />} />
            <Route path="/attractions/:id" element={<AttractionDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/provider/listings"
              element={<ProtectedRoute allowedRoles={["PROVIDER"]}><MyListingsPage /></ProtectedRoute>}
            />
            <Route
              path="/provider/listings/new"
              element={<ProtectedRoute allowedRoles={["PROVIDER"]}><NewListingChoicePage /></ProtectedRoute>}
            />
            <Route
              path="/provider/listings/new/hotel"
              element={<ProtectedRoute allowedRoles={["PROVIDER"]}><NewHotelListingPage /></ProtectedRoute>}
            />
            <Route
              path="/provider/listings/new/car-rental"
              element={<ProtectedRoute allowedRoles={["PROVIDER"]}><NewCarRentalListingPage /></ProtectedRoute>}
            />
            <Route
              path="/provider/listings/new/attraction"
              element={<ProtectedRoute allowedRoles={["PROVIDER"]}><NewAttractionListingPage /></ProtectedRoute>}
            />

            <Route
              path="/bookings"
              element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><MyBookingsPage /></ProtectedRoute>}
            />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route
              path="/admin"
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/admin/users"
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminUsersPage /></ProtectedRoute>}
            />
            <Route
              path="/admin/listings"
              element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminListingsPage /></ProtectedRoute>}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
