import { useState } from "react";
    import { useQuery } from "convex/react";
    import { api } from "../convex/_generated/api";
    import { ReceiptForm } from "./components/ReceiptForm";
    import { ReceiptList } from "./components/ReceiptList";
    import { SearchBar } from "./components/SearchBar";
    import { SignInForm } from "./SignInForm";
    import { Toaster } from "sonner";
    import { ThemeProvider } from "./components/ThemeProvider";
    import { ThemeToggle } from "./components/ThemeToggle";
    import { ThemedSignOutButton } from "./components/ThemedSignOutButton";
    import { Analytics } from "@vercel/analytics/react"
    import { SpeedInsights } from "@vercel/speed-insights/react"

    export default function App() {
      return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AppContent />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      );
    }

    function AppContent() {
      const [searchQuery, setSearchQuery] = useState("");
      const [showForm, setShowForm] = useState(false);

      const user = useQuery(api.auth.loggedInUser);

      // Show loading state while checking authentication
      if (user === undefined) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      // Show login form if not authenticated
      if (!user) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Receipt Tracker</h1>
                  <p className="text-gray-600 dark:text-gray-400">Sign in to access your receipts</p>
                </div>
                <SignInForm />
              </div>
            </div>
            <Toaster />
          </div>
        );
      }

      // Show main app if authenticated
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Receipt Tracker</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.name || user.email || "User"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showForm ? "Cancel" : "Add Receipt"}
                  </button>
                  <ThemedSignOutButton />
                </div>
              </div>
              <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {showForm && (
              <div className="mb-8">
                <ReceiptForm onSuccess={() => setShowForm(false)} />
              </div>
            )}
            <ReceiptList searchQuery={searchQuery} />
          </main>
          
          <Toaster />
        </div>
      );
    }
