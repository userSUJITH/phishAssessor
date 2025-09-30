import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="bg-white shadow-md border-b-4 border-indigo-500 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">Phish Assessor</h1>
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-indigo-600">
          Home
        </Link>
        <Link to="/list" className="text-gray-700 hover:text-indigo-600">
          List
        </Link>
      </div>
    </nav>
  );
}
