import { useSelector } from "react-redux";
import PostBox from "../../features/posts/PostBox";

function HomePage() {
  return (
    <main>
      <PostBox />
    </main>
  );
}

export default HomePage;
