import { translateValue } from "../../i18n";
import Sidebar from "../../components/Sidebar";
import { TeacherPage } from "./TeacherUI";

export default function TeacherLayout({ children }) {
  return (
    <Sidebar>
      <TeacherPage>{translateValue(children)}</TeacherPage>
    </Sidebar>
  );
}
