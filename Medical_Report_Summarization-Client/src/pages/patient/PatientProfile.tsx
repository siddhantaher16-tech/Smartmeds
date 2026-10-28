import ProfilePage from "../shared/ProfilePage";
import { ROLES } from "../../constants";

export default function PatientProfile() {
  return <ProfilePage role={ROLES.PATIENT as "patient"} />;
}
