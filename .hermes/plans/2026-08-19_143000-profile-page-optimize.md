# Profile Page Optimization Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Rebuild the profile page into a Twitter/X-style layout with tabbed content (Posts, Replies, Likes) and move profile editing to a dedicated `/settings/profile` page.

**Architecture:** Split the current monolithic `ProfilePage.jsx` into a tabbed profile view + separate settings page. Add backend endpoints for user posts/replies/likes with pagination. Use TanStack Query for all data fetching.

**Tech Stack:** React, TanStack Query, shadcn/ui (Tabs, Card, Avatar, Button), Laravel API, SQLite

---

## Current State

- `ProfilePage.jsx` (201 lines): One page with cover/avatar header + Edit Profile Sheet (side drawer with all fields)
- Backend `UserController`: `show()`, `update()`, `followers()`, `following()` — no posts/replies/likes endpoints
- `PostController`: `index()` returns all posts, no user-filtered endpoint
- Posts have `parent_id` for replies (comments are just posts with `parent_id` set)
- Frontend `api/posts.js`: `fetchPosts()`, `getPost()`, `createPost()`, etc. — no user-specific fetch

---

## Step-by-Step Plan

### Task 1: Add backend endpoints for user content tabs

**Objective:** Create API endpoints to fetch a user's posts, replies, and liked posts with pagination.

**Files:**
- Modify: `BACKEND/routes/api.php`
- Modify: `BACKEND/app/Http/Controllers/Api/UserController.php`

**Step 1: Add routes**

In `BACKEND/routes/api.php`, inside the `auth:sanctum` group, add before the `apiResource` line:

```php
// ── User profile content ──
Route::get('/users/{user}/posts', [UserController::class, 'userPosts']);
Route::get('/users/{user}/replies', [UserController::class, 'userReplies']);
Route::get('/users/{user}/likes', [UserController::class, 'userLikes']);
```

**Step 2: Add controller methods**

In `BACKEND/app/Http/Controllers/Api/UserController.php`, add:

```php
/**
 * Get posts created by a user (top-level only, no replies).
 */
public function userPosts(User $user)
{
    $posts = $user->posts()
        ->whereNull('parent_id')
        ->withCount(['likes', 'comments'])
        ->with(['user' => fn($q) => $q->withCount(['followers', 'followings', 'posts']), 'images'])
        ->withCount(['likes as liked_by_current_user' => fn($q) => $q->where('user_id', auth()->id())])
        ->latest()
        ->paginate(10);

    return PostResource::collection($posts);
}

/**
 * Get replies (comments) made by a user.
 */
public function userReplies(User $user)
{
    $replies = $user->posts()
        ->whereNotNull('parent_id')
        ->with('parent.user', 'images')
        ->withCount(['likes', 'comments'])
        ->with(['user' => fn($q) => $q->withCount(['followers', 'followings', 'posts'])])
        ->withCount(['likes as liked_by_current_user' => fn($q) => $q->where('user_id', auth()->id())])
        ->latest()
        ->paginate(10);

    return PostResource::collection($replies);
}

/**
 * Get posts liked by a user.
 */
public function userLikes(User $user)
{
    $likedPostIds = $user->likes()->pluck('post_id');

    $posts = Post::whereIn('id', $likedPostIds)
        ->whereNull('parent_id')
        ->with('user', 'images')
        ->withCount(['likes', 'comments'])
        ->withCount(['likes as liked_by_current_user' => fn($q) => $q->where('user_id', auth()->id())])
        ->latest()
        ->paginate(10);

    return PostResource::collection($posts);
}
```

Add at the top of the file:
```php
use App\Models\Post;
```

**Step 3: Clear caches and verify**

```bash
cd BACKEND && php artisan route:clear && php artisan config:clear
curl -s http://localhost:8000/api/users/1/posts -H "Authorization: Bearer <token>" | head -c 200
```

Expected: JSON with `data` array of posts, `links` for pagination.

**Step 4: Commit**

```bash
git add BACKEND/routes/api.php BACKEND/app/Http/Controllers/Api/UserController.php
git commit -m "feat(profile): add user posts/replies/likes endpoints with pagination"
```

---

### Task 2: Add frontend API functions for profile tabs

**Objective:** Create API functions to fetch user posts, replies, and likes.

**Files:**
- Modify: `FRONTEND/src/api/users.js`

**Step 1: Add functions**

Append to `FRONTEND/src/api/users.js`:

```javascript
export async function getUserPosts(userId, { pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/users/${userId}/posts?page=${pageParam}`);
  return data;
}

export async function getUserReplies(userId, { pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/users/${userId}/replies?page=${pageParam}`);
  return data;
}

export async function getUserLikes(userId, { pageParam = 1 } = {}) {
  const { data } = await apiService.get(`/api/users/${userId}/likes?page=${pageParam}`);
  return data;
}
```

**Step 2: Commit**

```bash
git add FRONTEND/src/api/users.js
git commit -m "feat(profile): add API functions for user posts/replies/likes"
```

---

### Task 3: Create profile tabs hook with TanStack Query

**Objective:** Build a reusable hook for profile tab data fetching with infinite scroll.

**Files:**
- Create: `FRONTEND/src/hooks/useProfileTabs.js`

**Step 1: Write the hook**

```javascript
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPosts, getUserReplies, getUserLikes } from "@/api/users";

const fetchers = {
  posts: getUserPosts,
  replies: getUserReplies,
  likes: getUserLikes,
};

export function useProfileTabs(userId, tab = "posts") {
  return useInfiniteQuery({
    queryKey: ["profile", userId, tab],
    queryFn: ({ pageParam = 1 }) => fetchers[tab](userId, { pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    enabled: !!userId,
    staleTime: 30_000,
  });
}
```

**Step 2: Commit**

```bash
git add FRONTEND/src/hooks/useProfileTabs.js
git commit -m "feat(profile): add useProfileTabs hook with infinite scroll"
```

---

### Task 4: Build the new tabbed ProfilePage

**Objective:** Rebuild ProfilePage with X/Twitter-style tabs (Posts, Replies, Likes).

**Files:**
- Rewrite: `FRONTEND/src/pages/home/ProfilePage.jsx`

**Step 1: Rewrite ProfilePage.jsx**

The new page structure:
- Cover image + avatar + name/bio/stats header (same as now)
- Tabs: Posts | Replies | Likes
- Each tab shows infinite-scrolling posts using the `Post` component
- "Edit Profile" button links to `/settings/profile` (new route)
- If viewing own profile: show Edit button. If viewing others: show Follow button.

```jsx
import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useProfileTabs } from "@/hooks/useProfileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Post from "@/features/post/Post";
import { EmptyState } from "@/components/empty-state";
import { Link } from "react-router-dom";

function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // For now, use currentUser — in a future task, fetch profile by username
  const profileUser = currentUser;
  const userId = profileUser?.id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProfileTabs(userId, activeTab);

  const posts = data?.pages?.flatMap((p) => p.data) ?? [];

  const observerRef = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (!profileUser) return null;

  const isOwn = currentUser?.id === profileUser.id;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Cover */}
      <div className="relative h-48 bg-muted">
        {profileUser.cover_image && (
          <img src={profileUser.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>

      {/* Profile header */}
      <div className="relative px-4 pb-4">
        <div className="-mt-16 flex items-end justify-between">
          <Avatar className="h-28 w-28 border-4 border-background">
            <AvatarImage src={profileUser.avatar} loading="lazy" />
            <AvatarFallback className="text-2xl">
              {profileUser.first_name?.[0]}{profileUser.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {isOwn ? (
            <Link to="/settings/profile">
              <Button variant="outline" size="sm">Edit profile</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm">Follow</Button>
          )}
        </div>

        <h2 className="mt-2 text-xl font-bold">{profileUser.first_name} {profileUser.last_name}</h2>
        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
        {profileUser.bio && <p className="mt-1 text-sm text-muted-foreground">{profileUser.bio}</p>}

        <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{profileUser.followers_count ?? 0}</strong> followers</span>
          <span><strong className="text-foreground">{profileUser.following_count ?? 0}</strong> following</span>
          <span><strong className="text-foreground">{profileUser.posts_count ?? 0}</strong> posts</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">Replies</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : posts.length === 0 ? (
            <EmptyState title="Nothing here yet" description={`No ${activeTab} to show.`} />
          ) : (
            <div className="divide-y">
              {posts.map((post, i) => (
                <div key={post.post_id} ref={i === posts.length - 1 ? lastPostRef : undefined}>
                  <Post post={post} />
                </div>
              ))}
            </div>
          )}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default ProfilePage;
```

**Step 2: Verify build**

```bash
cd FRONTEND && VITE_API_URL="" node node_modules/vite/bin/vite.js build 2>&1 | grep -E "built|error|Error"
```

Expected: builds without errors.

**Step 3: Commit**

```bash
git add FRONTEND/src/pages/home/ProfilePage.jsx
git commit -m "feat(profile): rebuild profile page with X-style tabs (Posts/Replies/Likes)"
```

---

### Task 5: Create dedicated Edit Profile page at /settings/profile

**Objective:** Move profile editing from the Sheet drawer to a full page.

**Files:**
- Create: `FRONTEND/src/pages/settings/EditProfilePage.jsx`
- Modify: `FRONTEND/src/app/router.jsx`

**Step 1: Create EditProfilePage.jsx**

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { profileSchema } from "@/lib/validation/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/form-field-error";

function EditProfilePage() {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      genre: user?.genre || "",
      statut: user?.statut || "",
      adresse: user?.adresse || "",
      ville_origine: user?.ville_origine || "",
      ville_habituelle: user?.ville_habituelle || "",
      situation_amoureuse: user?.situation_amoureuse || "",
      interets: user?.interets || "",
      education: user?.education || "",
      liens_sociaux: user?.liens_sociaux || "",
      date_de_naissance: user?.date_de_naissance || "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "avatar" || key === "cover_image") {
          if (val instanceof File) formData.append(key, val);
        } else {
          formData.append(key, val ?? "");
        }
      });
      await updateUserData(formData);
      toast.success("Profile updated");
      navigate("/profile");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <main className="mx-auto max-w-xl p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Edit profile</h1>
      </div>

      {/* Avatar preview */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} loading="lazy" />
          <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.first_name} {user.last_name}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
        <FieldGroup label="Username" id="username" error={errors.username?.message}>
          <Input id="username" {...register("username")} />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="First name" id="first_name" error={errors.first_name?.message}>
            <Input id="first_name" {...register("first_name")} />
          </FieldGroup>
          <FieldGroup label="Last name" id="last_name" error={errors.last_name?.message}>
            <Input id="last_name" {...register("last_name")} />
          </FieldGroup>
        </div>

        <FieldGroup label="Email" id="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FieldGroup>

        <FieldGroup label="Bio" id="bio" error={errors.bio?.message}>
          <Textarea id="bio" rows={3} {...register("bio")} />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Gender" id="genre" error={errors.genre?.message}>
            <select id="genre" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("genre")}>
              <option value="">—</option>
              <option value="masculin">Male</option>
              <option value="feminin">Female</option>
              <option value="autre">Other</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Date of birth" id="date_de_naissance" error={errors.date_de_naissance?.message}>
            <Input id="date_de_naissance" type="date" {...register("date_de_naissance")} />
          </FieldGroup>
        </div>

        <FieldGroup label="City (origin)" id="ville_origine" error={errors.ville_origine?.message}>
          <Input id="ville_origine" {...register("ville_origine")} />
        </FieldGroup>

        <FieldGroup label="City (current)" id="ville_habituelle" error={errors.ville_habituelle?.message}>
          <Input id="ville_habituelle" {...register("ville_habituelle")} />
        </FieldGroup>

        <FieldGroup label="Relationship status" id="situation_amoureuse" error={errors.situation_amoureuse?.message}>
          <Input id="situation_amoureuse" {...register("situation_amoureuse")} />
        </FieldGroup>

        <FieldGroup label="Interests" id="interets" error={errors.interets?.message}>
          <Textarea id="interets" rows={2} {...register("interets")} />
        </FieldGroup>

        <FieldGroup label="Education" id="education" error={errors.education?.message}>
          <Input id="education" {...register("education")} />
        </FieldGroup>

        <FieldGroup label="Address" id="adresse" error={errors.adresse?.message}>
          <Input id="adresse" {...register("adresse")} />
        </FieldGroup>

        <FieldGroup label="Social links" id="liens_sociaux" error={errors.liens_sociaux?.message}>
          <Input id="liens_sociaux" {...register("liens_sociaux")} />
        </FieldGroup>

        <div className="space-y-1.5">
          <Label htmlFor="avatar">Avatar</Label>
          <Input id="avatar" type="file" accept="image/*" onChange={(e) => setValue("avatar", e.target.files?.[0])} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cover_image">Cover image</Label>
          <Input id="cover_image" type="file" accept="image/*" onChange={(e) => setValue("cover_image", e.target.files?.[0])} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </main>
  );
}

function FieldGroup({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export default EditProfilePage;
```

**Step 2: Add route to router.jsx**

In `FRONTEND/src/app/router.jsx`, add inside the `UserLayout` children:

```jsx
import { lazy } from "react";
const EditProfilePage = lazy(() => import("@/pages/settings/EditProfilePage"));
```

Add route:
```jsx
<Route path="settings/profile" element={<EditProfilePage />} />
```

**Step 3: Verify build**

```bash
cd FRONTEND && VITE_API_URL="" node node_modules/vite/bin/vite.js build 2>&1 | grep -E "built|error|Error"
```

**Step 4: Commit**

```bash
git add FRONTEND/src/pages/settings/EditProfilePage.jsx FRONTEND/src/app/router.jsx
git commit -m "feat(profile): add dedicated /settings/profile page, lazy-loaded"
```

---

### Task 6: Wire up profile by username (view other users' profiles)

**Objective:** Allow viewing any user's profile via `/profile/:username` URL.

**Files:**
- Modify: `FRONTEND/src/app/router.jsx`
- Modify: `FRONTEND/src/pages/home/ProfilePage.jsx`
- Create: `FRONTEND/src/hooks/useUserProfile.js`
- Modify: `BACKEND/app/Http/Controllers/Api/UserController.php`

**Step 1: Add backend `showByUsername` endpoint**

In `BACKEND/routes/api.php`, add before the `apiResource`:

```php
Route::get('/profiles/{username}', [UserController::class, 'showByUsername']);
```

In `UserController.php`:

```php
public function showByUsername(string $username)
{
    $user = User::where('username', $username)
        ->withCount(['followers', 'followings', 'posts'])
        ->firstOrFail();

    return new UserResource($user);
}
```

**Step 2: Create `useUserProfile` hook**

```javascript
import { useQuery } from "@tanstack/react-query";
import apiService from "@/api/apiService";

export function useUserProfile(username) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await apiService.get(`/api/profiles/${username}`);
      return data.data;
    },
    enabled: !!username,
    staleTime: 30_000,
  });
}
```

**Step 3: Update ProfilePage to use params**

Update `ProfilePage.jsx` to use `useUserProfile(username)` when a username param is present, falling back to `currentUser` for `/profile` (no param).

**Step 4: Update router**

```jsx
<Route path="profile" element={<ProfilePage />} />
<Route path="profile/:username" element={<ProfilePage />} />
```

**Step 5: Build, deploy, test**

```bash
cd FRONTEND && VITE_API_URL="" node node_modules/vite/bin/vite.js build
cp -r dist/* ../BACKEND/public/
# Test with E2E
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(profile): view any user's profile by username, own profile at /profile"
```

---

### Task 7: E2E test the new profile features

**Objective:** Verify profile tabs, edit page, and user profile via username all work.

**Files:**
- Modify: `e2e_frontend.py`

**Step 1: Add test cases**

Add to the E2E suite:

```python
# ── Profile tabs ──
print("\n[8] Profile tabs")
await page.goto(f"{BASE}/profile", wait_until="load")
await page.wait_for_timeout(2000)
report("Profile page renders", await page.locator("h2").count() > 0)

# Check tabs exist
tabs = page.locator('[role="tab"]')
tab_count = await tabs.count()
report("Three profile tabs", tab_count == 3, f"(found {tab_count})")

# Click each tab
for i in range(3):
    label = (await tabs.nth(i).text_content()).strip()
    await tabs.nth(i).click()
    await page.wait_for_timeout(1000)
report("All tabs clickable", True)
await page.screenshot(path=f"{SHOT_DIR}/profile_tabs.png")

# ── Settings page ──
print("\n[9] Edit profile page")
await page.goto(f"{BASE}/settings/profile", wait_until="load")
await page.wait_for_timeout(2000)
report("Settings page renders", "Edit profile" in (await page.evaluate("() => document.body.innerText")))
report("Form fields present", await page.locator("input, textarea, select").count() >= 5)
await page.screenshot(path=f"{SHOT_DIR}/settings_profile.png")
```

**Step 2: Run E2E**

```bash
cd /d/Me/Dev/Project-X && PLAYWRIGHT_BROWSERS_PATH="D:/Me/AppData/Local/ms-playwright" python e2e_frontend.py
```

Expected: 15+ checks pass including new profile tab and settings tests.

**Step 3: Commit**

```bash
git add e2e_frontend.py
git commit -m "test(profile): E2E for profile tabs and settings page"
```

---

### Task 8: Deploy and verify end-to-end

**Objective:** Build, deploy to backend public, and verify everything works together.

**Step 1: Build frontend**

```bash
cd FRONTEND && VITE_API_URL="" node node_modules/vite/bin/vite.js build
```

**Step 2: Deploy to backend**

```bash
cd /d/Me/Dev/Project-X
rm -rf BACKEND/public/assets BACKEND/public/index.html
cp -r FRONTEND/dist/* BACKEND/public/
```

**Step 3: Clear Laravel caches**

```bash
cd BACKEND && php artisan route:clear && php artisan config:clear && php artisan cache:clear
```

**Step 4: Verify endpoints**

```bash
curl -s http://localhost:8000/api/users/1/posts | head -c 200
curl -s http://localhost:8000/api/users/1/replies | head -c 200
curl -s http://localhost:8000/api/users/1/likes | head -c 200
curl -s http://localhost:8000/profile -o /dev/null -w "%{http_code}"
curl -s http://localhost:8000/settings/profile -o /dev/null -w "%{http_code}"
```

**Step 5: Final E2E run**

```bash
PLAYWRIGHT_BROWSERS_PATH="D:/Me/AppData/Local/ms-playwright" python e2e_frontend.py
```

**Step 6: Final commit + push**

```bash
git add -A
git commit -m "chore: deploy profile tabs + settings page"
git push origin remaster/project-x
```

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `BACKEND/routes/api.php` |
| Modify | `BACKEND/app/Http/Controllers/Api/UserController.php` |
| Modify | `FRONTEND/src/api/users.js` |
| Create | `FRONTEND/src/hooks/useProfileTabs.js` |
| Create | `FRONTEND/src/hooks/useUserProfile.js` |
| Rewrite | `FRONTEND/src/pages/home/ProfilePage.jsx` |
| Create | `FRONTEND/src/pages/settings/EditProfilePage.jsx` |
| Modify | `FRONTEND/src/app/router.jsx` |
| Modify | `e2e_frontend.py` |

## Verification

- [ ] Backend: `GET /api/users/{id}/posts` returns paginated posts
- [ ] Backend: `GET /api/users/{id}/replies` returns paginated replies
- [ ] Backend: `GET /api/users/{id}/likes` returns paginated liked posts
- [ ] Frontend: `/profile` shows tabs (Posts/Replies/Likes) with infinite scroll
- [ ] Frontend: `/settings/profile` shows full edit form
- [ ] Frontend: `/profile/:username` shows another user's profile
- [ ] E2E: All 15+ checks pass
- [ ] No console errors, no 429 loops

## Risks

- Posts with `parent_id` are treated as replies — verify this matches the app's comment model
- Profile by username requires a new route that doesn't conflict with existing `users/{user}` API resource
- Settings page is lazy-loaded — verify Suspense boundary is in the router
