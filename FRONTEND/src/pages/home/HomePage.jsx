import { useSelector } from "react-redux";

function HomePage() {
  const { user, isLoading } = useSelector((store) => store.auth);

  return <div>HomePage</div>;
}

export default HomePage;
