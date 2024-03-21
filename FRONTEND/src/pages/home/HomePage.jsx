import { useSelector } from "react-redux";
import PostBox from "../../features/posts/PostBox";
import Post from "../../features/posts/Post";
import PostSection from "../../features/posts/PostSection";

function HomePage() {
  return (
    <main>
      <PostSection>
        <PostBox />
        
      </PostSection>
    </main>
  );
}

export default HomePage;
