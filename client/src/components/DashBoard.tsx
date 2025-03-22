const specialties = [
  "dentist",
  "dermatologist",
  "cardiologist",
  "pediatrician",
  "psychologist",
  "orthopedic",
  "neurologist",
  "general_physician"
];

const steps = [
  { id: 1, text: "Search for a Professional", image: "search.webp" },
  { id: 2, text: "Book an Appointment", image: "book.webp" },
  { id: 3, text: "Get Quality Care", image: "care.webp" }
];

const Dashboard = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-500 to-blue-300 text-center py-16 px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Find the Right Professional for Your Needs
          </h1>
          <p className="text-lg text-gray-200">
            Easily book appointments with top-rated professionals in your area.
          </p>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search doctors, specialists, or services..."
            className="w-full max-w-2xl text-white px-6 py-3 border-2 border-white rounded-l-full focus:outline-none text-lg"
          />
          <button className="bg-white text-[#4fadb1] px-6 py-3 rounded-r-full text-lg hover:bg-gray-100 cursor-pointer transition">
            Search
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* Browse by Specialty */}
        <h2 className="text-5xl font-bold text-center">Browse by Specialty</h2>
        <h6 className="text-center text-lg text-gray-600 mt-4">
          Find the right professional for your needs by browsing through our
          specialties.
        </h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-12 py-8">
          {specialties.map((specialty) => (
            <div
              key={specialty}
              className="bg-white hover:bg-[#20b2b7] hover:text-white hover:scale-110 transition duration-150 cursor-pointer p-6 rounded-xl shadow-md flex flex-col items-center transition hover:shadow-lg"
            >
              <img
                src={`/src/images/${specialty}.webp`}
                alt={specialty}
                className="w-32 h-32 object-cover rounded-full mb-6"
              />
              <p className="text-xl font-semibold">
                {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-gray-100 mt-16 py-12 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16">
            {steps.map((step) => (
              <div
                key={step.id}
                className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center transition hover:shadow-lg"
              >
                <img
                  src={`/src/images/${step.image}`}
                  alt={step.text}
                  className="w-32 h-32 object-cover mb-6"
                />
                <p className="text-xl font-semibold text-blue-600">
                  {step.id}. {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
