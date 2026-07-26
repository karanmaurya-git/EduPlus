import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="topbar">
      <div className="topbar-user">
        <div className="name">{user?.name || "User"}</div>
        <div className="role">{(user?.role || "").toUpperCase()} ACCOUNT</div>
      </div>
      <div className="avatar">
        {user?.profileImage ? <img src={user.profileImage} alt="avatar" /> : initials}
      </div>
    </div>
  );
};

export default Topbar;
