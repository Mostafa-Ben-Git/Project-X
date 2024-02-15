import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Inscription from "./pages/Inscription";
import ModeratorMenu from "./pages/ModeratorMenu";
import MemberMenu from "./pages/MemberMenu";
import AdminMenu from "./pages/AdminMenu";
import ListComments from "./features/moderator/ListComments";
import CommentsBlocked from "./features/moderator/CommentsBlocked";
import UsersList from "./features/admin/UsersList";
import InitialisationPWD from "./features/admin/InitialisationPWD";
import MembreComments from "./features/admin/MembreComments";
import ShearchDocParTheme from "./features/member/ShearchDocParTheme";
import ShearchParCri from "./features/member/ShearchParCri";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename="/Mostafa_Project/test">
        <Routes>
          <Route index element={<Navigate replace to="login" />} />

          <Route path="mod" element={<ModeratorMenu />}>
            <Route index element={<Navigate replace to="comments" />} />
            <Route path="comments" element={<ListComments />} />
            <Route path="blocked" element={<CommentsBlocked />} />
          </Route>
          <Route path="admin" element={<AdminMenu />}>
            <Route index element={<Navigate replace to="users" />} />
            <Route path="users" element={<UsersList />} />
            <Route path="pwds" element={<InitialisationPWD />} />
            <Route path="comsuser" element={<MembreComments />} />
          </Route>
          <Route path="mbr" element={<MemberMenu />}>
            <Route index element={<Navigate replace to="doc" />} />
            <Route path="doc" element={<ShearchDocParTheme />} />
            <Route path="userpost" element={<ShearchParCri />} />
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="insc" element={<Inscription />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
