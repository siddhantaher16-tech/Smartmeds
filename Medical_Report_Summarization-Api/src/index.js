import "dotenv/config";
import app from "./app.js";
import supabase from "./config/supabase.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection - lightweight check
    console.log("Verifying Supabase connection...");
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    // It's normal if there are no profiles yet, but an error means connection failed
    if (error && error.code !== "PGRST116") {
      console.warn(
        "Database error during warmup check (proceeding anyway):",
        error.message,
      );
    } else {
      console.log("Successfully connected to Supabase.");
    }

    // After database connection check, start listening
    app.listen(PORT, () => {
      console.log(`SmartMeds API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
