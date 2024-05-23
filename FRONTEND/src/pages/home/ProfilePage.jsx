import useAuth from "@/hooks/useAuth";
import { Card } from "@material-tailwind/react";

import React, { useEffect, useState } from "react";
 import 'bootstrap/dist/css/bootstrap.min.css';
// import "/@/pages/home/profile.css";

import Post from "@/features/post/Post";
import './UpdateProfile';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Facebook,
  GraduationCap,
  Home,
  Instagram,
  MapPin,
  Twitter,
  ThumbsUp ,
  MessageCircle ,
  Repeat2 
} from "lucide-react";

const ProfilePage = () => {
  const { user, posts, getUserPosts, updateUserData } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    date_de_naissance: '',
    bio: '',
    statut: '',
    genre: '',
    adresse: '',
    ville_origine: '',
    ville_habituelle: '',
    situation_amoureuse: '',
    interets: '',
    education: '',
    liens_sociaux: '',
    cover_image: '',
    profile_image: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        date_de_naissance: user.date_de_naissance || '',
        bio: user.bio || '',
        statut: user.statut || '',
        genre: user.genre || '',
        adresse: user.adresse || '',
        ville_origine: user.ville_origine || '',
        ville_habituelle: user.ville_habituelle || '',
        situation_amoureuse: user.situation_amoureuse || '',
        interets: user.interets || '',
        education: user.education || '',
        liens_sociaux: user.liens_sociaux || '',
        cover_image: '',
        avatar: '',
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

  const jsonObject = user?.liens_sociaux;
  console.log(jsonObject);

  return (
    <div>
   
  <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Update info profile
              <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" value={formData.username} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input type="text" className="form-control" id="first_name" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input type="text" className="form-control" id="last_name" value={formData.last_name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="date_de_naissance" className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" id="date_de_naissance" value={formData.date_de_naissance} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea className="form-control" id="bio" rows="3" value={formData.bio} onChange={handleChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="statut" className="form-label">Status</label>
                  <select className="form-control" id="statut" value={formData.statut} onChange={handleChange}>
                    <option value="en ligne">Online</option>
                    <option value="hors ligne">Offline</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="genre" className="form-label">Gender</label>
                  <select className="form-control" id="genre" value={formData.genre} onChange={handleChange}>
                    <option value="masculin">Male</option>
                    <option value="féminin">Female</option>
                    <option value="autre">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="adresse" className="form-label">Address</label>
                  <input type="text" className="form-control" id="adresse" value={formData.adresse} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="ville_origine" className="form-label">Home Town</label>
                  <input type="text" className="form-control" id="ville_origine" value={formData.ville_origine} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="ville_habituelle" className="form-label">Current City</label>
                  <input type="text" className="form-control" id="ville_habituelle" value={formData.ville_habituelle} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="situation_amoureuse" className="form-label">Relationship Status</label>
                  <input type="text" className="form-control" id="situation_amoureuse" value={formData.situation_amoureuse} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="interets" className="form-label">Interests</label>
                  <textarea className="form-control" id="interets" rows="3" value={formData.interets} onChange={handleChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="education" className="form-label">Education</label>
                  <input type="text" className="form-control" id="education" value={formData.education} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="liens_sociaux" className="form-label">Social Links</label>
                  <input type="text" className="form-control" id="liens_sociaux" value={formData.liens_sociaux} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="cover_image" className="form-label">Cover image</label>
                  <input type="file" className="form-control" id="cover_image" onChange={handleFileChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="profile_image" className="form-label">Profile image</label>
                  <input type="file" className="form-control" id="profile_image" onChange={handleFileChange} />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {user?.cover_image && (
  <img
    src={user.cover_image}
    alt="Cover Image"
    className="w-full h-48 object-cover"
  />
)}
<div className="mt-4">
  <div className="flex items-center space-x-4">
    {user && (
      <>
        {user.avatar && (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          {user.age && (
            <p className="text-white">
              Age: {user.age} ans
            </p>
          )}
          {user.date_de_naissance && (
            <p className="text-white">
              Né le: {user.date_de_naissance}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <Home className="text-white" size={24} />
            {user.ville_habituelle && (
              <span className="text-white-600">
                {user.ville_habituelle}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="text-white-600" size={24} />
            {user.ville_origine && (
              <span className="text-white-600">
                {user.ville_origine}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="text-white-600" size={34} />
            {user.education && (
              <div className="text-white-600">
                {user.education}
              </div>
            )}
          </div>
          {jsonObject && (
            <div className="flex items-center space-x-4">
              <a
                href={jsonObject.instagram}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="text-white-600" size={24} />
              </a>
              <a
                href={jsonObject.facebook}
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="text-white-600" size={24} />
              </a>
              <a
                href={jsonObject.twitter}
                target="_blank"
                rel="noreferrer"
              >
                <Twitter className="text-white-600" size={24} />
              </a>
            </div>
          )}
        </div>
      </>
    )}
  </div>
</div>
<div className="mt-8">
  <div>
    <h2 className="text-lg font-bold">Posts</h2>
    {posts && posts?.map((post) => (
      <Post
        {...post}
        key={post.post_id}
        className="mt-4"
      />
    ))}
  </div>
</div>

    </div>
  );
};

export default ProfilePage;