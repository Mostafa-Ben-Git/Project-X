import useAuth from "@/hooks/useAuth";

import { useEffect, useState } from "react";

import LoaderCircle from "@/components/LoaderCircle";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ProfilePage = () => {
  const { user, posts, isLoading, getUserPosts, updateUserData } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    date_de_naissance: "",
    bio: "",
    statut: "",
    genre: "",
    adresse: "",
    ville_origine: "",
    ville_habituelle: "",
    situation_amoureuse: "",
    interets: "",
    education: "",
    liens_sociaux: "",
    cover_image: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        date_de_naissance: user.date_de_naissance || "",
        bio: user.bio || "",
        statut: user.statut || "",
        genre: user.genre || "",
        adresse: user.adresse || "",
        ville_origine: user.ville_origine || "",
        ville_habituelle: user.ville_habituelle || "",
        situation_amoureuse: user.situation_amoureuse || "",
        interets: user.interets || "",
        education: user.education || "",
        liens_sociaux: user.liens_sociaux || "",
        cover_image: "",
        avatar: "",
      });
    }
    getUserPosts();
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserData(formData);
      // Handle successful update
    } catch (error) {
      // Handle error
    }
  };

  return isLoading || !user ? (
    <LoaderCircle />
  ) : (
    <Sheet>
      <div className=" ">
        <div className="relative h-60 overflow-hidden bg-slate-600">
          <SheetTrigger className="absolute bottom-2 right-2">
            <Button>Open</Button>
          </SheetTrigger>
        </div>
        <div className="relative mx-auto -mt-16 h-32 w-32 overflow-hidden rounded-full border-4 border-white">
          <UserAvatar user={user} />
        </div>
        <div className="mt-2 text-center">
          <h2 className=" text-2xl font-black">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-secondary">{user.username}</p>
        </div>
        <ul className="mt-2 flex items-center justify-around py-4 text-gray-700">
          <li className="flex flex-col items-center justify-around">
            <div>2k</div>
          </li>
          <li className="flex flex-col items-center justify-between">
            <div>10k</div>
          </li>
          <li className="flex flex-col items-center justify-around">
            <div>15</div>
          </li>
        </ul>
        <div className="mx-8 mt-2 border-t p-4">
          <button className="mx-auto block w-1/2 rounded-full bg-gray-900 px-6 py-2 font-semibold text-white hover:shadow-lg">
            Follow
          </button>
        </div>
      </div>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update info profile
            <form
              onSubmit={handleSubmit}
              className="max-h-[80vh] overflow-y-auto"
              encType="multipart/form-data"
            >
              <div className="mb-3">
                <label
                  htmlFor="username"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="first_name"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="last_name"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="date_de_naissance"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="date_de_naissance"
                  value={formData.date_de_naissance}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="bio"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="genre"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="genre"
                  value={formData.genre}
                  onChange={handleChange}
                >
                  <option value="masculin">Male</option>
                  <option value="féminin">Female</option>
                  <option value="autre">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label
                  htmlFor="adresse"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="ville_origine"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Home Town
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="ville_origine"
                  value={formData.ville_origine}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="ville_habituelle"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Current City
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="ville_habituelle"
                  value={formData.ville_habituelle}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="situation_amoureuse"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Relationship Status
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="situation_amoureuse"
                  value={formData.situation_amoureuse}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="interets"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Interests
                </label>
                <textarea
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="interets"
                  rows="3"
                  value={formData.interets}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="mb-3">
                <label
                  htmlFor="education"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Education
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="education"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="liens_sociaux"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Social Links
                </label>
                <input
                  type="text"
                  className="form-control mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  id="liens_sociaux"
                  value={formData.liens_sociaux}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="cover_image"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Cover image
                </label>
                <input
                  type="file"
                  className="form-control mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                  id="cover_image"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="avatar"
                  className="form-label block text-sm font-medium text-gray-700"
                >
                  Profile image
                </label>
                <input
                  type="file"
                  className="form-control mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                  id="avatar"
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </form>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ProfilePage;
