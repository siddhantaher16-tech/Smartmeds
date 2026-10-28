import ProfilePage from "../shared/ProfilePage";
import { ROLES } from "../../constants";

export default function DoctorProfile() {
  return <ProfilePage role={ROLES.DOCTOR as "doctor"} />;
}

