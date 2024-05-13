import apiService from "../../api/apiService";
import { useEffect, useState } from "react";
import { Card } from "@material-tailwind/react";
import { Map } from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.get("/api/user");
        console.log(response);
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <div>
        <Card>
          {user && <img src={user.avatar} alt="Avatar" className="w-16" />}
          <div>
            <h1>{user && <p>{user.adresse} </p>}</h1>
            <Map size={24} color="blue" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;