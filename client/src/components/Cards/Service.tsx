import { Link } from "react-router-dom";

const ServiceCard = ({ title, description, image, link }: { title: string, description: string, image: string, link: string }) => {
  return (
    <Link to={link} style={{
      fontFamily: "RaleWay, sans-serif",
      boxShadow: "0 0 30px rgba(71, 205, 191, 0.25)"
    }} className="cursor-pointer rounded-lg max-w-sm">
      <div className="overflow-hidden rounded-xl shadow-lg bg-white">
        <div className="py-6 px-4">
          <h2 className="text-3xl text-center font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        <div className="relative overflow-hidden">
          <img
            src={`${image}`}
            alt="Medical Lab"
            className="w-full h-64 object-cover transition-transform duration-300 ease-in-out hover:scale-120 hover:rotate-10"
          />
        </div>
        <div className="py-6 px-4">

          <p className="text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;