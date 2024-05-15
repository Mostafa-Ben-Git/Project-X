import useAuth from "@/hooks/useAuth";
import { Card } from "@material-tailwind/react";
import {
  Facebook,
  GraduationCap,
  Home,
  Instagram,
  MapPin,
  Twitter,
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  console.log(user.cover_image)

  // const jsonObject = user.liens_sociaux && JSON.parse(user.liens_sociaux);
  // console.log(jsonObject )


  const jsonObject = user?.liens_sociaux === undefined ? null : JSON.parse(
    user.liens_sociaux
  );
  console.log(jsonObject);


  return (
    <div>
      <div className="w-64">
        <Card>

          {user && (
            <>
              {/* {user.cover_image && (
                <img
                  src={user.cover_image}
                  alt="Cover Image"
                  className="w-full rounded-t-md"
                />
              )} */}
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="mx-auto mb-4 h-24 w-24 rounded-full"
                />
              )}
              <div className="text-l ml-6 font-bold text-black">
                {user.age && (
                  <p>
                    Age :{" "}
                    <span className="text-l font-normal text-black ">
                      {user.age} ans
                    </span>
                  </p>
                )}
                {user.date_de_naissance && (
                  <p>
                    Né le :{" "}
                    <span className="text-l font-normal text-black">
                      {user.date_de_naissance}
                    </span>
                  </p>
                )}
                <div className="flex items-center">
                  <Home color="black" size={24} />
                  {user.ville_habituelle && (
                    <span className="ml-2 font-normal">
                      {user.ville_habituelle}
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <MapPin color="black" size={24} />
                  {user.ville_origine && (
                    <span className="ml-2 font-normal">
                      {user.ville_origine}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <GraduationCap color="black" size={34} />
                  {user.education && (
                    <div className="ml-2 font-normal">{user.education}</div>
                  )}
                </div>

                {/* Afficher les liens sociaux */}


                {/* <div className="text-l  font-normal text-black">
                  <a
                    href={jsonObject.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-l  font-normal text-black"
                    style={{ color: "black" }}
                  >
                    <Instagram color="black" size={24} />
                  </a>
                  <a
                    href={jsonObject.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-l  font-normal text-black"
                    style={{ color: "black" }}
                  >
                    <Facebook color="black" size={24} />
                  </a>
                  <a
                    href={jsonObject.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-l  font-normal text-black"
                    style={{ color: "black" }}
                  >
                    <Twitter color="black" size={24} />
                  </a>
                </div> */}
=======
                {jsonObject && (
                  <div className="text-l  font-normal text-black">
                    <a
                      href={jsonObject.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-l  font-normal text-black"
                      style={{ color: "black" }}
                    >
                      <Instagram color="black" size={24} />
                    </a>
                    <a
                      href={jsonObject.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="text-l  font-normal text-black"
                      style={{ color: "black" }}
                    >
                      <Facebook color="black" size={24} />
                    </a>
                    <a
                      href={jsonObject.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="text-l  font-normal text-black"
                      style={{ color: "black" }}
                    >
                      <Twitter color="black" size={24} />
                    </a>
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
