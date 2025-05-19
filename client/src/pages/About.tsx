const features = [
    { title: "Find Nearby Hospitals", description: "Quickly locate hospitals and clinics based on your location." },
    { title: "Doctor Appointments", description: "Easily book appointments with healthcare professionals." },
    { title: "Emergency Assistance", description: "Get urgent medical help with one click during emergencies." },
    { title: "Enhanced patient care", description: "Directing patients to the most appropriate facility helps in quicker treatments and better outcomes." }
];

const teamMembers = [
    { name: "Harshit Singla", image: "/People/singla.png" },
    { name: "Karan Kapoor", image: "/People/kapoor.png" },
    { name: "Harshit Behal", image: "/People/behal.png" },
    { name: "Sameer Kumar", image: "/People/sameer.jpg" }
];

const About = () => {
    return (
        <div style={{
            fontFamily: "RaleWay, sans-serif"
        }} className="min-h-screen bg-gradient-to-br to-[#A9E2E3] from-[#00979D] px-6 py-12">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center text-white">
                <h1 className="text-2xl md:text-4xl font-bold mb-4">About CareConnect</h1>
                <p className="text-sm md:text-lg">
                    CareConnect is a healthcare platform designed to bridge the gap between patients and professionals.
                    Our goal is to provide seamless access to medical care through technology.
                </p>
            </div>

            {/* Features Section */}
            <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-6 text-center border-t-4 border-[#00979D]">
                        <h3 className="md:text-xl font-semibold text-gray-800">{feature.title}</h3>
                        <p className="md:text-lg text-sm text-gray-600 mt-2">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Team Section */}
            <div className="mt-16 max-w-6xl mx-auto text-center text-white">
                <h2 className="text-3xl font-semibold">Meet Our Team</h2>
                <p className="text-lg text-gray-200">The minds behind CareConnect</p>
            </div>

            <div className="mt-8 max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, index) => (
                    <div key={index} className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-[#00979D]">
                        <img
                            src={member.image}
                            alt={member.name}
                            className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-[#00979D]"
                        />
                        <h2 className="text-md md:text-xl font-semibold text-gray-800 mt-4">{member.name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default About;
