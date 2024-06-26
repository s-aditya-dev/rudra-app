import { Link } from "react-router-dom";
import "./Home.css";
import Maintenance from "../../Components/Maintenance/Maintenance";

export default function Home() {
  return (
    <div className="center-container">
      <Link to="/login"><Maintenance/></Link>
    </div>
  );
}
