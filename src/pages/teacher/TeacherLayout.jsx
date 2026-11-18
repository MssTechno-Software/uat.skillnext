import Sidebar from "../../components/Sidebar";
import { TeacherPage } from "./TeacherUI";

export default function TeacherLayout({ children }) {
  return (
    <Sidebar>
      <TeacherPage>{children}</TeacherPage>
    </Sidebar>
  );
}
