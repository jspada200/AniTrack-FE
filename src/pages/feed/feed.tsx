import { PageWrapper } from "../../components/common/wrappers/PageWrapper";
import { PostsFeed } from "../../components/feed/PostsFeed";
import { CreatePost } from "../../components/feed/CreatePost";
const FeedPage = () => {
  return (
    <PageWrapper>
      <CreatePost />
      <PostsFeed />
    </PageWrapper>
  );
};

export default FeedPage;
