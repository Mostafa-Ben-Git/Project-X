import { useSelector } from "react-redux";

function Home() {
  const { user, isLoading } = useSelector((store) => store.auth);

  return isLoading ? <p>Laoding ...</p> : <div>Home , Hi {user?.name}</div>;
}

export default Home;
