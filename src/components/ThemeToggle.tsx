import { Moon, Sun } from "lucide-react";
    import { useTheme } from "./ThemeProvider";

    export function ThemeToggle() {
      const { theme, setTheme } = useTheme();

      return (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      );
    }
