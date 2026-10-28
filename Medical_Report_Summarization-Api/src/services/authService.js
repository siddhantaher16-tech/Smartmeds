import supabase from "../config/supabase.js";

const MEDICAL_FIELDS = `
  date_of_birth, biological_sex, blood_group, height_cm, weight_kg,
  known_conditions, current_medications, known_allergies,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation
`.trim();

class AuthService {
  async signup(full_name, email, password, role) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      const error = new Error(authError.message);
      error.statusCode = 400;
      throw error;
    }

    const user = authData.user;
    const session = authData.session;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: user.id, full_name, role: role || "patient" }])
      .select("*")
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return { user, session, profile };
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const authError = new Error(error.message);
      authError.statusCode = 401;
      throw authError;
    }

    // Fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    return { user: data.user, session: data.session, profile };
  }

  async getProfile(userId) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      const notFoundError = new Error("Profile not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    return profile;
  }

  async saveMedicalProfile(userId, data) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select(MEDICAL_FIELDS)
      .single();

    if (error) {
      throw new Error(`Failed to save medical profile: ${error.message}`);
    }

    return profile;
  }

  async saveDoctorProfile(userId, data) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select("id, full_name, role, specialisation, bio")
      .single();

    if (error) {
      throw new Error(`Failed to save doctor profile: ${error.message}`);
    }

    return profile;
  }

  async getMedicalProfile(userId) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(MEDICAL_FIELDS)
      .eq("id", userId)
      .single();

    if (error) {
      const err = new Error("Profile not found");
      err.statusCode = 404;
      throw err;
    }

    return profile;
  }
}

export default new AuthService();
