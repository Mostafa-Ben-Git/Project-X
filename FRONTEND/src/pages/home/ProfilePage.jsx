import apiService from "../../api/apiService";
import { useEffect, useState } from "react";
import { Card ,Post } from "@material-tailwind/react";
import { MapPin, Home } from 'lucide-react';
import { Instagram, Facebook,Twitter , GraduationCap} from 'lucide-react';


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(null);
  const [posts, setPosts] = useState([]);
  // console.log(posts)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.get("/api/user/posts");
        setPosts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.get("/api/user");
        setUser(response.data);

        // Calculate age
        if (response.data.date_de_naissance) {
          const birthDate = new Date(response.data.date_de_naissance);
          const today = new Date();
          const diff = today - birthDate;
          const ageInYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
          setAge(ageInYears);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);
// const jsonObject = JSON.parse(user.liens_sociaux);
// console.log(jsonObject )



  return (
    <div>
     
      <div className="w-64">
        <Card >
       
          {user && (
            <>
              {user.avatar && (
                <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4" />
              )}
              <div className="text-l font-bold text-black ml-6">
              {age && (
                  <p>
                    
                    Age : <span className="text-l font-normal text-black ">{age} ans</span>
                  </p>
                )}
                {/* {user.date_de_naissance && (
                  <p>
                    Né le : <span className="text-l font-normal text-black">{user.date_de_naissance}</span>
                  </p>
                )} */}
                <div className="flex items-center">
                  <Home color="black" size={24} />
                  {user.ville_habituelle && (
                    <span className="font-normal ml-2">{user.ville_habituelle}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <MapPin color="black" size={24} />
                  {user.ville_origine && (
                    <span className="font-normal ml-2">{user.ville_origine}</span>
                  )}
                </div >
                <div className="flex items-center">
                  <GraduationCap color="black" size={34} />
                  {user.education && (
                    <div className="font-normal ml-2">{user.education}</div>
                  )}
                </div>
                
                {/* Afficher les liens sociaux */}
                 {user.liens_sociaux && ( 
                 <div className="text-l  text-black font-normal">
                  
                  {/* <a href={jsonObject.instagram} target="_blank" rel="noreferrer" className="text-l  text-black font-normal" style={{ color: 'black' }}>
  <Instagram color="black" size={24} />
</a>
<a href={jsonObject.facebook} target="_blank" rel="noreferrer" className="text-l  text-black font-normal" style={{ color:'black' }}>
  <Facebook color="black" size={24} />
</a>
<a href={jsonObject.twitter} target="_blank" rel="noreferrer" className="text-l  text-black font-normal" style={{ color:'black' }}>
  <Twitter color="black" size={24} />
</a> */}

                 </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>



     {/* <div>
      {posts.title}
     </div> */}
       
    </div>
  );
};

export default ProfilePage;
